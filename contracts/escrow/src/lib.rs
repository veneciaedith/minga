#![no_std]
//! Contrato de escrow de Minga.
//!
//! Idea central: cuando Rosa (comprador) le pide mercadería a un proveedor, en
//! vez de pagar por adelantado (y arriesgarse) o pagar después (y que no le
//! confíen), el dinero queda BLOQUEADO dentro de este contrato. El proveedor ve
//! que el pago está garantizado, entrega la mercadería, y cuando Rosa confirma
//! la entrega el contrato libera el pago automáticamente al proveedor.
//!
//! ## El problema del silencio, y cómo lo resuelve el plazo
//!
//! La primera versión de este contrato tenía un agujero: confirmar y cancelar
//! exigían la firma de Rosa. Si el proveedor entregaba y Rosa no confirmaba
//! nunca (por olvido, por perder el teléfono o de mala fe), la plata quedaba
//! trabada para siempre y el proveedor no tenía ninguna salida.
//!
//! Ahora el proveedor puede DECLARAR la entrega con su propia firma. Eso
//! arranca un reloj: Rosa tiene un plazo (que ella misma elige al crear el
//! pedido) para confirmar o para objetar. Si deja pasar el plazo sin decir
//! nada, el proveedor puede reclamar el pago. El silencio ya no lo perjudica.
//!
//! Si Rosa objeta dentro del plazo, los fondos quedan frenados: nadie los
//! cobra hasta que una de las dos partes ceda (Rosa libera el pago, o el
//! proveedor devuelve los fondos). Resolver una disputa en la que ninguno cede
//! necesita un árbitro, y eso está fuera del alcance de este prototipo.
//!
//! ## Por qué el token se fija en el deploy
//!
//! Antes, `create_escrow` recibía la dirección del token como argumento. El
//! contrato es público: cualquiera podía llamarlo sin pasar por la app y crear
//! un pedido con un token FALSO —uno que dice "transferí" pero no vale nada—.
//! El proveedor consultaba el pedido, veía "pago bloqueado y garantizado",
//! entregaba la mercadería y cobraba algo sin valor. Eso rompía la promesa
//! central de Minga.
//!
//! Ahora el token se fija UNA SOLA VEZ, en el momento de deployar el contrato
//! (`__constructor`), y no se puede cambiar nunca más. No hay ningún lugar
//! donde meter un token falso. Cualquiera puede verificar con `get_token()`
//! qué token acepta este contrato antes de confiar en él.
//!
//! ## Por qué el contrato avisa lo que hace (eventos)
//!
//! Hasta ahora el contrato cambiaba de estado en silencio. El número de pedido
//! vivía únicamente en el navegador de Rosa: si cambiaba de teléfono o borraba
//! los datos, perdía el rastro de su propio pedido y no había forma de
//! recuperarlo.
//!
//! Ahora cada cambio de estado publica un EVENTO en la red. Un evento es un
//! aviso que queda registrado junto a la transacción y que cualquiera puede
//! leer sin permiso ni firma. Con eso, la app puede reconstruir el historial de
//! pedidos de una wallet leyendo la blockchain, en vez de depender de la memoria
//! del navegador.
//!
//! Los eventos son públicos a propósito: el proveedor puede demostrar que
//! entregó, y Rosa que pagó, sin que ninguno dependa de la palabra del otro.
//!
//! Todo el dinero se mueve con transferencias REALES de un token de Stellar
//! (en testnet usamos el XLM nativo). Buscá los comentarios "*** ON-CHAIN ***"
//! para ver exactamente dónde se toca la red.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

/// Un día en segundos. La persona piensa en días; la blockchain cuenta segundos.
pub const SEGUNDOS_POR_DIA: u64 = 86_400;

/// Plazo máximo que se puede pedir, en días. Un techo evita que por un error de
/// tipeo (poner 3000 en lugar de 3) los fondos queden trabados años.
pub const PLAZO_MAXIMO_DIAS: u64 = 60;

/// Un ledger dura ~5 segundos, así que hay ~17.280 por día.
const LEDGERS_POR_DIA: u32 = 17_280;
/// Si a un dato le quedan menos de 120 días de vida, lo renovamos.
///
/// Todo lo que se guarda en Stellar tiene fecha de vencimiento y paga alquiler.
/// Si vence, el dato se archiva y deja de leerse hasta que alguien pague por
/// restaurarlo. La plata NO se pierde, pero para Rosa la diferencia es entre
/// "veo mi pedido" y "mi pedido desapareció", que es justo lo que no puede
/// pasarle a quien desconfía de la tecnología. Por eso renovamos en cada
/// escritura: mientras el pedido se use, nunca se acerca al vencimiento.
const UMBRAL_TTL: u32 = 120 * LEDGERS_POR_DIA;
/// Lo renovamos hasta 180 días, que es el máximo que permite la red.
const EXTENDER_TTL_A: u32 = 180 * LEDGERS_POR_DIA;

/// Estado de cada pedido con pago en escrow.
#[contracttype]
#[derive(Clone, Copy, PartialEq)]
pub enum Estado {
    Pendiente = 0, // fondos bloqueados, esperando que el proveedor entregue
    Entregado = 1, // el proveedor declaró la entrega: corre el plazo de Rosa
    EnDisputa = 2, // Rosa objetó la entrega: fondos frenados hasta que alguien ceda
    Liberado = 3,  // entrega confirmada, fondos enviados al proveedor
    Cancelado = 4, // pedido cancelado, fondos devueltos al comprador
}

/// Datos que guardamos on-chain por cada pedido.
#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub comprador: Address, // quien paga (Rosa)
    pub proveedor: Address, // quien recibe el pago al entregar
    pub token: Address,     // token usado para el pago (XLM nativo en testnet)
    pub monto: i128,        // monto en la unidad mínima del token (stroops para XLM)
    pub estado: Estado,
    /// Cuánto tiempo tiene Rosa para confirmar u objetar DESPUÉS de que el
    /// proveedor declara la entrega. Se guarda en segundos.
    pub plazo_confirmacion: u64,
    /// Momento en que el proveedor declaró la entrega (timestamp del ledger).
    /// Vale 0 mientras la entrega no se declaró.
    pub entregado_en: u64,
}

/// Claves de almacenamiento.
#[contracttype]
pub enum DataKey {
    /// El token que este contrato acepta. Se escribe una sola vez, en el deploy,
    /// y ninguna función lo modifica. Vive en storage de instancia porque es
    /// configuración global del contrato, no dato de un pedido.
    Token,
    /// A cada `id_pedido` le corresponde un `Escrow`.
    Escrow(u64),
}

/// Errores legibles que puede devolver el contrato.
#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum Error {
    YaExiste = 1,       // ya hay un escrow con ese id_pedido
    NoExiste = 2,       // no existe un escrow con ese id_pedido
    NoPendiente = 3,    // el escrow no está en estado Pendiente
    MontoInvalido = 4,  // el monto debe ser mayor a cero
    PlazoInvalido = 5,  // el plazo debe ser de 1 a PLAZO_MAXIMO_DIAS días
    EstadoInvalido = 6, // la acción no corresponde al estado actual del pedido
    PlazoNoVencido = 7, // el proveedor todavía no puede reclamar: Rosa tiene tiempo
    PlazoVencido = 8,   // se pasó el plazo para objetar
    SinToken = 9,       // el contrato se deployó sin token (no debería pasar nunca)
}

#[contract]
pub struct ContratoEscrow;

#[contractimpl]
impl ContratoEscrow {
    /// Se ejecuta UNA SOLA VEZ, al deployar el contrato, y fija el token con el
    /// que se van a pagar todos los pedidos.
    ///
    /// No existe ninguna función para cambiarlo después: si hiciera falta otro
    /// token, hay que deployar otro contrato. Eso es a propósito — un token que
    /// se puede cambiar es un token que se puede falsificar.
    pub fn __constructor(env: Env, token: Address) {
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().extend_ttl(UMBRAL_TTL, EXTENDER_TTL_A);
    }

    /// El comprador bloquea fondos asociados a un id de pedido.
    /// El dinero sale de la wallet del comprador y queda dentro del contrato.
    ///
    /// `plazo_dias` es el tiempo que Rosa se da a sí misma para revisar el
    /// pedido después de que el proveedor declare la entrega.
    ///
    /// Ya NO recibe el token: lo lee del que se fijó en el deploy.
    pub fn create_escrow(
        env: Env,
        comprador: Address,
        proveedor: Address,
        monto: i128,
        id_pedido: u64,
        plazo_dias: u64,
    ) -> Result<(), Error> {
        // El comprador debe firmar esta operación con su wallet (Freighter).
        comprador.require_auth();

        // El token NO lo elige quien llama: es el que se fijó al deployar.
        let token = Self::token_del_contrato(&env)?;

        if monto <= 0 {
            return Err(Error::MontoInvalido);
        }

        if plazo_dias == 0 || plazo_dias > PLAZO_MAXIMO_DIAS {
            return Err(Error::PlazoInvalido);
        }

        let clave = DataKey::Escrow(id_pedido);
        if env.storage().persistent().has(&clave) {
            return Err(Error::YaExiste);
        }

        // *** ON-CHAIN ***  Transferencia real: el comprador manda los fondos
        // AL CONTRATO. Quedan "bloqueados" (custodiados por el contrato) hasta
        // que se confirme la entrega o se cancele el pedido.
        let cliente_token = token::Client::new(&env, &token);
        cliente_token.transfer(&comprador, &env.current_contract_address(), &monto);

        let escrow = Escrow {
            comprador,
            proveedor,
            token,
            monto,
            estado: Estado::Pendiente,
            // Afuera se habla en días, adentro se guarda en segundos.
            plazo_confirmacion: plazo_dias * SEGUNDOS_POR_DIA,
            entregado_en: 0,
        };
        Self::guardar(&env, &clave, &escrow);

        // El token vive en storage de instancia, que también tiene vencimiento.
        // Lo renovamos acá para que la configuración del contrato no se archive
        // mientras el contrato se sigue usando.
        env.storage().instance().extend_ttl(UMBRAL_TTL, EXTENDER_TTL_A);

        // Aviso público: nació un pedido. Con este evento la app puede listar
        // los pedidos de una wallet sin guardarlos en el navegador.
        env.events().publish(
            (
                symbol_short!("creado"),
                id_pedido,
                escrow.comprador.clone(),
                escrow.proveedor.clone(),
            ),
            (escrow.monto, escrow.plazo_confirmacion),
        );

        Ok(())
    }

    /// El PROVEEDOR declara que entregó la mercadería. Firma él, no Rosa.
    ///
    /// Esto arranca el reloj: desde este momento Rosa tiene `plazo_confirmacion`
    /// para confirmar o para objetar. Es lo que evita que el proveedor quede
    /// rehén del silencio de Rosa, y al mismo tiempo deja registrado on-chain
    /// quién afirmó haber entregado (su firma queda en la transacción).
    pub fn marcar_entregado(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow = Self::leer(&env, &clave)?;

        // Solo el proveedor puede declarar su propia entrega.
        escrow.proveedor.require_auth();

        if escrow.estado != Estado::Pendiente {
            return Err(Error::NoPendiente);
        }

        escrow.estado = Estado::Entregado;
        escrow.entregado_en = env.ledger().timestamp();
        Self::guardar(&env, &clave, &escrow);

        // Avisamos cuándo se declaró la entrega y hasta cuándo puede responder
        // Rosa: así la app muestra la cuenta regresiva sin tener que calcularla.
        env.events().publish(
            (
                symbol_short!("entregado"),
                id_pedido,
                escrow.proveedor.clone(),
            ),
            Self::vence_en(&escrow),
        );

        Ok(())
    }

    /// El comprador confirma la entrega: libera el pago al proveedor.
    ///
    /// Se puede confirmar en cualquier momento antes de que se cierre el
    /// pedido: sin que el proveedor haya declarado nada (el camino rápido, que
    /// es el habitual cuando todo va bien), después de que lo declaró, o
    /// incluso durante una disputa si Rosa decide darle la razón.
    pub fn confirm_delivery(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow = Self::leer(&env, &clave)?;

        // Solo quien creó el pedido (el comprador) puede liberar el pago.
        escrow.comprador.require_auth();

        if !Self::sigue_abierto(&escrow) {
            return Err(Error::EstadoInvalido);
        }

        // *** ON-CHAIN ***  El contrato envía los fondos bloqueados al proveedor.
        let cliente_token = token::Client::new(&env, &escrow.token);
        cliente_token.transfer(
            &env.current_contract_address(),
            &escrow.proveedor,
            &escrow.monto,
        );

        escrow.estado = Estado::Liberado;
        Self::guardar(&env, &clave, &escrow);
        Self::avisar_liberado(&env, id_pedido, &escrow, symbol_short!("confirmo"));

        Ok(())
    }

    /// Cancela el pedido y devuelve los fondos al comprador.
    ///
    /// Solo sirve mientras el proveedor NO declaró la entrega. Después no, por
    /// una razón simple: si Rosa pudiera cancelar una vez entregada la
    /// mercadería, se quedaría con el pedido y con la plata. Si Rosa no está de
    /// acuerdo con una entrega ya declarada, lo que corresponde es objetar.
    pub fn cancel_escrow(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow = Self::leer(&env, &clave)?;

        // También exigimos la firma del comprador para devolverle su dinero.
        escrow.comprador.require_auth();

        if escrow.estado != Estado::Pendiente {
            return Err(Error::NoPendiente);
        }

        // *** ON-CHAIN ***  El contrato devuelve los fondos al comprador.
        let cliente_token = token::Client::new(&env, &escrow.token);
        cliente_token.transfer(
            &env.current_contract_address(),
            &escrow.comprador,
            &escrow.monto,
        );

        escrow.estado = Estado::Cancelado;
        Self::guardar(&env, &clave, &escrow);
        Self::avisar_cancelado(&env, id_pedido, &escrow, symbol_short!("cancelo"));

        Ok(())
    }

    /// El comprador objeta una entrega declarada: "esto no me llegó, o me llegó mal".
    ///
    /// Frena los fondos: ni el proveedor puede reclamarlos por vencimiento, ni
    /// Rosa puede cancelar unilateralmente. Se sale de la disputa solo si una de
    /// las partes cede (`confirm_delivery` de Rosa, o `devolver_fondos` del
    /// proveedor). Solo se puede objetar DENTRO del plazo: si Rosa deja vencer
    /// el plazo sin decir nada, ya no puede objetar después.
    pub fn objetar_entrega(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow = Self::leer(&env, &clave)?;

        escrow.comprador.require_auth();

        if escrow.estado != Estado::Entregado {
            return Err(Error::EstadoInvalido);
        }

        if env.ledger().timestamp() >= Self::vence_en(&escrow) {
            return Err(Error::PlazoVencido);
        }

        escrow.estado = Estado::EnDisputa;
        Self::guardar(&env, &clave, &escrow);

        // La objeción queda registrada en la red con la firma de Rosa: es la
        // prueba de que reclamó a tiempo, y no la palabra de una contra la otra.
        env.events().publish(
            (
                symbol_short!("objetado"),
                id_pedido,
                escrow.comprador.clone(),
            ),
            escrow.monto,
        );

        Ok(())
    }

    /// El PROVEEDOR reclama el pago porque venció el plazo y Rosa no dijo nada.
    ///
    /// Es el corazón del arreglo: el proveedor entregó, lo declaró, esperó el
    /// plazo completo, y Rosa ni confirmó ni objetó. El pago se libera sin
    /// necesitar la firma de Rosa.
    pub fn reclamar_pago(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow = Self::leer(&env, &clave)?;

        // Firma el proveedor: es él quien reclama lo suyo.
        escrow.proveedor.require_auth();

        // Si Rosa objetó, el vencimiento no habilita nada: hay disputa abierta.
        if escrow.estado != Estado::Entregado {
            return Err(Error::EstadoInvalido);
        }

        if env.ledger().timestamp() < Self::vence_en(&escrow) {
            return Err(Error::PlazoNoVencido);
        }

        // *** ON-CHAIN ***  El contrato paga al proveedor por vencimiento del plazo.
        let cliente_token = token::Client::new(&env, &escrow.token);
        cliente_token.transfer(
            &env.current_contract_address(),
            &escrow.proveedor,
            &escrow.monto,
        );

        escrow.estado = Estado::Liberado;
        Self::guardar(&env, &clave, &escrow);
        Self::avisar_liberado(&env, id_pedido, &escrow, symbol_short!("vencio"));

        Ok(())
    }

    /// El PROVEEDOR cede y devuelve los fondos al comprador.
    ///
    /// Sirve para dos cosas: cerrar una disputa dándole la razón a Rosa, y
    /// echarse atrás de una entrega declarada por error. Es la salida que hace
    /// que una disputa se pueda resolver sin árbitro, si alguna parte cede.
    pub fn devolver_fondos(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow = Self::leer(&env, &clave)?;

        escrow.proveedor.require_auth();

        if escrow.estado != Estado::Entregado && escrow.estado != Estado::EnDisputa {
            return Err(Error::EstadoInvalido);
        }

        // *** ON-CHAIN ***  El contrato devuelve los fondos al comprador.
        let cliente_token = token::Client::new(&env, &escrow.token);
        cliente_token.transfer(
            &env.current_contract_address(),
            &escrow.comprador,
            &escrow.monto,
        );

        escrow.estado = Estado::Cancelado;
        Self::guardar(&env, &clave, &escrow);
        Self::avisar_cancelado(&env, id_pedido, &escrow, symbol_short!("devolvio"));

        Ok(())
    }

    /// Lectura (no cuesta gas): devuelve el estado actual del pedido como Symbol.
    /// El frontend lo usa para mostrar el estado en palabras.
    pub fn get_escrow_status(env: Env, id_pedido: u64) -> Symbol {
        let clave = DataKey::Escrow(id_pedido);
        match env.storage().persistent().get::<DataKey, Escrow>(&clave) {
            Some(escrow) => match escrow.estado {
                Estado::Pendiente => symbol_short!("pendiente"),
                Estado::Entregado => symbol_short!("entregado"),
                Estado::EnDisputa => symbol_short!("disputa"),
                Estado::Liberado => symbol_short!("liberado"),
                Estado::Cancelado => symbol_short!("cancelado"),
            },
            None => symbol_short!("noexiste"),
        }
    }

    /// Lectura: devuelve los datos completos del escrow (para mostrar monto, etc.).
    pub fn get_escrow(env: Env, id_pedido: u64) -> Option<Escrow> {
        env.storage().persistent().get(&DataKey::Escrow(id_pedido))
    }

    /// Lectura: qué token acepta este contrato.
    ///
    /// Sirve para que el proveedor (o cualquiera) pueda verificar ANTES de
    /// confiar en un pedido que este contrato paga con el token que él espera,
    /// y no con uno inventado.
    pub fn get_token(env: Env) -> Result<Address, Error> {
        Self::token_del_contrato(&env)
    }

    /// Lectura: cuántos segundos le quedan a Rosa para confirmar u objetar.
    /// Devuelve 0 si el plazo ya venció o si todavía no empezó a correr.
    /// El frontend lo usa para mostrar la cuenta regresiva.
    pub fn segundos_restantes(env: Env, id_pedido: u64) -> u64 {
        match env
            .storage()
            .persistent()
            .get::<DataKey, Escrow>(&DataKey::Escrow(id_pedido))
        {
            Some(escrow) if escrow.estado == Estado::Entregado => {
                let vence = Self::vence_en(&escrow);
                let ahora = env.ledger().timestamp();
                if ahora >= vence {
                    0
                } else {
                    vence - ahora
                }
            }
            _ => 0,
        }
    }

    /// Lectura: ¿el proveedor ya puede reclamar el pago por vencimiento?
    /// El frontend lo usa para habilitar o no el botón de reclamar.
    pub fn puede_reclamar(env: Env, id_pedido: u64) -> bool {
        match env
            .storage()
            .persistent()
            .get::<DataKey, Escrow>(&DataKey::Escrow(id_pedido))
        {
            Some(escrow) => {
                escrow.estado == Estado::Entregado
                    && env.ledger().timestamp() >= Self::vence_en(&escrow)
            }
            None => false,
        }
    }

    // ---- Ayudas internas (no se exponen como funciones del contrato) ----

    /// Guarda el pedido y le corre la fecha de vencimiento.
    ///
    /// Las dos cosas van juntas siempre, a propósito: si alguien agrega mañana
    /// una función nueva y usa esta ayuda, se lleva la renovación puesta y no
    /// puede olvidarse de ella.
    fn guardar(env: &Env, clave: &DataKey, escrow: &Escrow) {
        env.storage().persistent().set(clave, escrow);
        env.storage()
            .persistent()
            .extend_ttl(clave, UMBRAL_TTL, EXTENDER_TTL_A);
    }

    /// Aviso de que el proveedor cobró. `motivo` dice por qué: `confirmo` si
    /// Rosa confirmó la entrega, `vencio` si cobró porque se agotó el plazo.
    fn avisar_liberado(env: &Env, id_pedido: u64, escrow: &Escrow, motivo: Symbol) {
        env.events().publish(
            (
                symbol_short!("liberado"),
                id_pedido,
                escrow.proveedor.clone(),
            ),
            (escrow.monto, motivo),
        );
    }

    /// Aviso de que el comprador recuperó su plata. `motivo` dice por qué:
    /// `cancelo` si Rosa canceló antes de la entrega, `devolvio` si el proveedor
    /// dio marcha atrás o cedió en una disputa.
    fn avisar_cancelado(env: &Env, id_pedido: u64, escrow: &Escrow, motivo: Symbol) {
        env.events().publish(
            (
                symbol_short!("cancelado"),
                id_pedido,
                escrow.comprador.clone(),
            ),
            (escrow.monto, motivo),
        );
    }

    /// El token fijado en el deploy. Si no está, el contrato se deployó mal
    /// (el constructor siempre lo escribe), así que devolvemos un error claro
    /// en lugar de entrar en pánico.
    fn token_del_contrato(env: &Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(Error::SinToken)
    }

    fn leer(env: &Env, clave: &DataKey) -> Result<Escrow, Error> {
        env.storage()
            .persistent()
            .get(clave)
            .ok_or(Error::NoExiste)
    }

    /// Momento exacto en que se agota el plazo de Rosa.
    /// `saturating_add` evita que un desborde de u64 haga entrar en pánico al contrato.
    fn vence_en(escrow: &Escrow) -> u64 {
        escrow.entregado_en.saturating_add(escrow.plazo_confirmacion)
    }

    /// Un pedido sigue abierto mientras no se pagó ni se devolvió la plata.
    fn sigue_abierto(escrow: &Escrow) -> bool {
        matches!(
            escrow.estado,
            Estado::Pendiente | Estado::Entregado | Estado::EnDisputa
        )
    }
}

mod test;
