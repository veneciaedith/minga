#![no_std]
//! Contrato de escrow de Minga.
//!
//! Idea central: cuando Rosa (comprador) le pide mercadería a un proveedor, en
//! vez de pagar por adelantado (y arriesgarse) o pagar después (y que no le
//! confíen), el dinero queda BLOQUEADO dentro de este contrato. El proveedor ve
//! que el pago está garantizado, entrega la mercadería, y cuando Rosa confirma
//! la entrega el contrato libera el pago automáticamente al proveedor.
//!
//! Todo el dinero se mueve con transferencias REALES de un token de Stellar
//! (en testnet usamos el XLM nativo). Buscá los comentarios "*** ON-CHAIN ***"
//! para ver exactamente dónde se toca la red.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

/// Estado de cada pedido con pago en escrow.
#[contracttype]
#[derive(Clone, Copy, PartialEq)]
pub enum Estado {
    Pendiente = 0, // fondos bloqueados, esperando la entrega
    Liberado = 1,  // entrega confirmada, fondos enviados al proveedor
    Cancelado = 2, // pedido cancelado, fondos devueltos al comprador
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
}

/// Claves de almacenamiento: a cada `id_pedido` le corresponde un `Escrow`.
#[contracttype]
pub enum DataKey {
    Escrow(u64),
}

/// Errores legibles que puede devolver el contrato.
#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum Error {
    YaExiste = 1,      // ya hay un escrow con ese id_pedido
    NoExiste = 2,      // no existe un escrow con ese id_pedido
    NoPendiente = 3,   // el escrow no está en estado Pendiente
    MontoInvalido = 4, // el monto debe ser mayor a cero
}

#[contract]
pub struct ContratoEscrow;

#[contractimpl]
impl ContratoEscrow {
    /// El comprador bloquea fondos asociados a un id de pedido.
    /// El dinero sale de la wallet del comprador y queda dentro del contrato.
    pub fn create_escrow(
        env: Env,
        comprador: Address,
        proveedor: Address,
        token: Address,
        monto: i128,
        id_pedido: u64,
    ) -> Result<(), Error> {
        // El comprador debe firmar esta operación con su wallet (Freighter).
        comprador.require_auth();

        if monto <= 0 {
            return Err(Error::MontoInvalido);
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
        };
        env.storage().persistent().set(&clave, &escrow);

        Ok(())
    }

    /// Solo el comprador puede confirmar la entrega: libera el pago al proveedor.
    pub fn confirm_delivery(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&clave)
            .ok_or(Error::NoExiste)?;

        // Solo quien creó el pedido (el comprador) puede liberar el pago.
        escrow.comprador.require_auth();

        if escrow.estado != Estado::Pendiente {
            return Err(Error::NoPendiente);
        }

        // *** ON-CHAIN ***  El contrato envía los fondos bloqueados al proveedor.
        let cliente_token = token::Client::new(&env, &escrow.token);
        cliente_token.transfer(
            &env.current_contract_address(),
            &escrow.proveedor,
            &escrow.monto,
        );

        escrow.estado = Estado::Liberado;
        env.storage().persistent().set(&clave, &escrow);

        Ok(())
    }

    /// Cancela el pedido y devuelve los fondos al comprador (solo si sigue Pendiente).
    pub fn cancel_escrow(env: Env, id_pedido: u64) -> Result<(), Error> {
        let clave = DataKey::Escrow(id_pedido);
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&clave)
            .ok_or(Error::NoExiste)?;

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
        env.storage().persistent().set(&clave, &escrow);

        Ok(())
    }

    /// Lectura (no cuesta gas): devuelve el estado actual del pedido como Symbol.
    /// El frontend lo usa para mostrar "pendiente / liberado / cancelado".
    pub fn get_escrow_status(env: Env, id_pedido: u64) -> Symbol {
        let clave = DataKey::Escrow(id_pedido);
        match env.storage().persistent().get::<DataKey, Escrow>(&clave) {
            Some(escrow) => match escrow.estado {
                Estado::Pendiente => symbol_short!("pendiente"),
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
}

mod test;
