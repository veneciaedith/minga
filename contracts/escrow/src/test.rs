#![cfg(test)]
//! Test del flujo completo del escrow usando un token de prueba en memoria.
//! Corré con: `cargo test`

use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{storage::Persistent as _, Address as _, Events as _, Ledger as _},
    token, Address, Env, IntoVal, Val,
};

/// Plazo que usamos en los tests: 3 días.
const PLAZO_DIAS: u64 = 3;

// Crea un token de prueba (Stellar Asset Contract) y devuelve su dirección
// junto con el cliente "admin" que permite mintear saldo en los tests.
fn crear_token<'a>(env: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'a>) {
    let contrato = env.register_stellar_asset_contract_v2(admin.clone());
    let direccion = contrato.address();
    let admin_client = token::StellarAssetClient::new(env, &direccion);
    (direccion, admin_client)
}

/// Prepara un escenario completo: token con saldo para Rosa, contrato desplegado
/// y las direcciones de las dos partes. Evita repetir esto en cada test.
struct Escenario<'a> {
    env: Env,
    comprador: Address,
    proveedor: Address,
    token_addr: Address,
    id_contrato: Address,
    cliente: ContratoEscrowClient<'a>,
}

fn escenario<'a>() -> Escenario<'a> {
    let env = Env::default();
    // Para el test simulamos que todas las firmas (auth) están aprobadas.
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let comprador = Address::generate(&env);
    let proveedor = Address::generate(&env);

    let (token_addr, token_admin) = crear_token(&env, &admin);
    token_admin.mint(&comprador, &1000);

    // El token se fija en el DEPLOY, via constructor: por eso va acá y no en
    // cada llamada a create_escrow.
    let id_contrato = env.register(ContratoEscrow, (token_addr.clone(),));
    let cliente = ContratoEscrowClient::new(&env, &id_contrato);

    Escenario {
        env,
        comprador,
        proveedor,
        token_addr,
        id_contrato,
        cliente,
    }
}

/// Adelanta el reloj del ledger la cantidad de días indicada.
fn pasar_dias(env: &Env, dias: u64) {
    env.ledger()
        .with_mut(|li| li.timestamp += dias * SEGUNDOS_POR_DIA);
}

// =====================================================================
//  Camino feliz: Rosa confirma ella misma
// =====================================================================

#[test]
fn flujo_crear_y_confirmar() {
    let e = escenario();

    // 1) Rosa crea el pedido y bloquea 500, con 3 días de plazo.
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );

    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.comprador), 500); // le quedaron 500
    assert_eq!(token_cliente.balance(&e.id_contrato), 500); // 500 bloqueados en el contrato
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("pendiente"));

    // 2) Rosa confirma la entrega -> el contrato paga al proveedor.
    e.cliente.confirm_delivery(&1u64);
    assert_eq!(token_cliente.balance(&e.proveedor), 500);
    assert_eq!(token_cliente.balance(&e.id_contrato), 0);
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("liberado"));
}

#[test]
fn flujo_cancelar_devuelve_fondos() {
    let e = escenario();

    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &300,
        &7u64,
        &PLAZO_DIAS,
    );
    e.cliente.cancel_escrow(&7u64);

    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.comprador), 1000); // recuperó todo
    assert_eq!(e.cliente.get_escrow_status(&7u64), symbol_short!("cancelado"));
}

#[test]
fn estado_de_pedido_inexistente() {
    let e = escenario();
    assert_eq!(e.cliente.get_escrow_status(&999u64), symbol_short!("noexiste"));
    assert_eq!(e.cliente.puede_reclamar(&999u64), false);
    assert_eq!(e.cliente.segundos_restantes(&999u64), 0);
}

// =====================================================================
//  El arreglo: el silencio de Rosa ya no deja al proveedor sin cobrar
// =====================================================================

#[test]
fn proveedor_cobra_si_rosa_no_dice_nada_en_el_plazo() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );

    // El proveedor declara la entrega: arranca el reloj de Rosa.
    e.cliente.marcar_entregado(&1u64);
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("entregado"));
    assert_eq!(
        e.cliente.segundos_restantes(&1u64),
        PLAZO_DIAS * SEGUNDOS_POR_DIA
    );
    assert_eq!(e.cliente.puede_reclamar(&1u64), false);

    // Rosa no dice nada y pasan los 3 días.
    pasar_dias(&e.env, PLAZO_DIAS);
    assert_eq!(e.cliente.segundos_restantes(&1u64), 0);
    assert_eq!(e.cliente.puede_reclamar(&1u64), true);

    // El proveedor reclama SIN la firma de Rosa y cobra.
    e.cliente.reclamar_pago(&1u64);
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.proveedor), 500);
    assert_eq!(token_cliente.balance(&e.id_contrato), 0);
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("liberado"));
}

#[test]
fn proveedor_no_puede_cobrar_antes_de_que_venza_el_plazo() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);

    // Pasa un solo día de los tres: todavía es tiempo de Rosa.
    pasar_dias(&e.env, 1);
    assert_eq!(
        e.cliente.try_reclamar_pago(&1u64),
        Err(Ok(Error::PlazoNoVencido))
    );

    // La plata sigue bloqueada en el contrato, no se movió a ningún lado.
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.id_contrato), 500);
    assert_eq!(token_cliente.balance(&e.proveedor), 0);
}

#[test]
fn proveedor_no_puede_reclamar_sin_declarar_la_entrega() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );

    // Sin marcar_entregado no hay reloj corriendo, así que no hay nada que reclamar
    // ni siquiera dejando pasar mucho tiempo.
    pasar_dias(&e.env, 365);
    assert_eq!(
        e.cliente.try_reclamar_pago(&1u64),
        Err(Ok(Error::EstadoInvalido))
    );
}

// =====================================================================
//  Disputa: Rosa objeta dentro del plazo
// =====================================================================

#[test]
fn rosa_objeta_y_el_proveedor_ya_no_puede_cobrar_por_vencimiento() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);

    // Rosa objeta al día siguiente, dentro del plazo.
    pasar_dias(&e.env, 1);
    e.cliente.objetar_entrega(&1u64);
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("disputa"));

    // Aunque pase el plazo, el vencimiento ya no habilita el cobro.
    pasar_dias(&e.env, 30);
    assert_eq!(e.cliente.puede_reclamar(&1u64), false);
    assert_eq!(
        e.cliente.try_reclamar_pago(&1u64),
        Err(Ok(Error::EstadoInvalido))
    );

    // Y la plata sigue en el contrato: nadie se la llevó.
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.id_contrato), 500);
}

#[test]
fn rosa_no_puede_objetar_despues_del_plazo() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);

    pasar_dias(&e.env, PLAZO_DIAS);
    assert_eq!(
        e.cliente.try_objetar_entrega(&1u64),
        Err(Ok(Error::PlazoVencido))
    );
}

#[test]
fn en_disputa_rosa_puede_ceder_y_liberar_el_pago() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);
    e.cliente.objetar_entrega(&1u64);

    // Hablaron, Rosa se convenció y libera el pago.
    e.cliente.confirm_delivery(&1u64);
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.proveedor), 500);
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("liberado"));
}

#[test]
fn en_disputa_el_proveedor_puede_ceder_y_devolver_la_plata() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);
    e.cliente.objetar_entrega(&1u64);

    // El proveedor reconoce el problema y devuelve los fondos.
    e.cliente.devolver_fondos(&1u64);
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.comprador), 1000); // recuperó todo
    assert_eq!(token_cliente.balance(&e.id_contrato), 0);
    assert_eq!(e.cliente.get_escrow_status(&1u64), symbol_short!("cancelado"));
}

// =====================================================================
//  Reglas que protegen a cada parte
// =====================================================================

#[test]
fn rosa_no_puede_cancelar_una_entrega_ya_declarada() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);

    // Si pudiera cancelar acá, se quedaría con la mercadería Y con la plata.
    assert_eq!(
        e.cliente.try_cancel_escrow(&1u64),
        Err(Ok(Error::NoPendiente))
    );

    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.id_contrato), 500);
}

#[test]
fn no_se_puede_declarar_la_entrega_dos_veces() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.marcar_entregado(&1u64);

    // Reintentar reiniciaría el reloj y le robaría tiempo a Rosa.
    assert_eq!(
        e.cliente.try_marcar_entregado(&1u64),
        Err(Ok(Error::NoPendiente))
    );
}

#[test]
fn un_pedido_cerrado_no_se_puede_volver_a_tocar() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &1u64,
        &PLAZO_DIAS,
    );
    e.cliente.confirm_delivery(&1u64);

    // Ya se pagó: no se puede pagar de nuevo ni cancelar (doble gasto).
    assert_eq!(
        e.cliente.try_confirm_delivery(&1u64),
        Err(Ok(Error::EstadoInvalido))
    );
    assert_eq!(
        e.cliente.try_cancel_escrow(&1u64),
        Err(Ok(Error::NoPendiente))
    );
    assert_eq!(
        e.cliente.try_devolver_fondos(&1u64),
        Err(Ok(Error::EstadoInvalido))
    );

    // El contrato quedó vacío: pagó una sola vez.
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.id_contrato), 0);
    assert_eq!(token_cliente.balance(&e.proveedor), 500);
}

// =====================================================================
//  Validaciones de entrada
// =====================================================================

#[test]
fn el_plazo_tiene_que_ser_razonable() {
    let e = escenario();

    // Cero días dejaría a Rosa sin tiempo para revisar nada.
    assert_eq!(
        e.cliente.try_create_escrow(
            &e.comprador,
            &e.proveedor,
            &500,
            &1u64,
            &0u64
        ),
        Err(Ok(Error::PlazoInvalido))
    );

    // Un error de tipeo (3000 en lugar de 3) trabaría la plata años.
    assert_eq!(
        e.cliente.try_create_escrow(
            &e.comprador,
            &e.proveedor,
            &500,
            &2u64,
            &3000u64
        ),
        Err(Ok(Error::PlazoInvalido))
    );

    // Ninguno de los dos intentos movió plata.
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.comprador), 1000);
    assert_eq!(token_cliente.balance(&e.id_contrato), 0);

    // El máximo permitido sí funciona.
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &500,
        &3u64,
        &PLAZO_MAXIMO_DIAS,
    );
    assert_eq!(e.cliente.get_escrow_status(&3u64), symbol_short!("pendiente"));
}

#[test]
fn el_monto_tiene_que_ser_mayor_a_cero() {
    let e = escenario();
    assert_eq!(
        e.cliente.try_create_escrow(
            &e.comprador,
            &e.proveedor,
            &0,
            &1u64,
            &PLAZO_DIAS
        ),
        Err(Ok(Error::MontoInvalido))
    );
}

#[test]
fn no_se_puede_crear_dos_veces_el_mismo_numero_de_pedido() {
    let e = escenario();
    e.cliente.create_escrow(
        &e.comprador,
        &e.proveedor,
        &100,
        &5u64,
        &PLAZO_DIAS,
    );
    assert_eq!(
        e.cliente.try_create_escrow(
            &e.comprador,
            &e.proveedor,
            &100,
            &5u64,
            &PLAZO_DIAS
        ),
        Err(Ok(Error::YaExiste))
    );

    // Se cobró una sola vez, no dos.
    let token_cliente = token::Client::new(&e.env, &e.token_addr);
    assert_eq!(token_cliente.balance(&e.id_contrato), 100);
    assert_eq!(token_cliente.balance(&e.comprador), 900);
}

// =====================================================================
//  El token no se puede falsificar (regresión del agujero que cerramos)
// =====================================================================

#[test]
fn el_contrato_solo_mueve_el_token_fijado_en_el_deploy() {
    let e = escenario();

    // Alguien crea OTRO token —el "falso"— y se mintea saldo de sobra.
    // Antes, este token podía pasarse a create_escrow y el contrato lo aceptaba:
    // el proveedor veía "pago bloqueado y garantizado" y cobraba algo sin valor.
    let admin_falso = Address::generate(&e.env);
    let (token_falso, minter_falso) = crear_token(&e.env, &admin_falso);
    minter_falso.mint(&e.comprador, &1_000_000);

    // Hoy no hay dónde meterlo: create_escrow ya no recibe token.
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);

    let real = token::Client::new(&e.env, &e.token_addr);
    let falso = token::Client::new(&e.env, &token_falso);

    // Lo que se bloqueó es el token de verdad.
    assert_eq!(real.balance(&e.id_contrato), 500);
    assert_eq!(real.balance(&e.comprador), 500);

    // Y el token falso no se tocó: el contrato no lo conoce.
    assert_eq!(falso.balance(&e.id_contrato), 0);
    assert_eq!(falso.balance(&e.comprador), 1_000_000);
}

#[test]
fn cualquiera_puede_verificar_que_token_acepta_el_contrato() {
    let e = escenario();

    // Esta lectura es la que le permite al proveedor confiar: antes de entregar
    // la mercadería puede comprobar que el contrato paga con el token que espera.
    assert_eq!(e.cliente.get_token(), e.token_addr);

    // Y el escrow guarda el mismo token, no otro.
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);
    let datos = e.cliente.get_escrow(&1u64).unwrap();
    assert_eq!(datos.token, e.token_addr);
}

#[test]
fn el_pago_se_libera_en_el_token_correcto() {
    let e = escenario();
    let admin_falso = Address::generate(&e.env);
    let (token_falso, _) = crear_token(&e.env, &admin_falso);

    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);
    e.cliente.marcar_entregado(&1u64);
    pasar_dias(&e.env, PLAZO_DIAS);
    e.cliente.reclamar_pago(&1u64);

    // El proveedor cobró en el token de verdad, no en uno inventado.
    let real = token::Client::new(&e.env, &e.token_addr);
    let falso = token::Client::new(&e.env, &token_falso);
    assert_eq!(real.balance(&e.proveedor), 500);
    assert_eq!(falso.balance(&e.proveedor), 0);
}

// =====================================================================
//  Los avisos que el contrato publica en la red (eventos)
//
//  Importan porque son lo que permite que la app reconstruya el historial
//  de pedidos leyendo la blockchain. Sin estos avisos, el N° de pedido
//  vive solo en el navegador de Rosa y se pierde si cambia de teléfono.
// =====================================================================

/// Devuelve solo los avisos que publicó el contrato de Minga.
/// El token de prueba también publica los suyos en cada transferencia, y acá
/// no nos interesan.
fn avisos_de_minga(e: &Escenario) -> soroban_sdk::Vec<(soroban_sdk::Vec<Val>, Val)> {
    let mut propios = soroban_sdk::Vec::new(&e.env);
    for (contrato, topicos, datos) in e.env.events().all().iter() {
        if contrato == e.id_contrato {
            propios.push_back((topicos, datos));
        }
    }
    propios
}

/// Cuántos ledgers le quedan de vida al pedido antes de archivarse.
fn vida_restante_del_pedido(e: &Escenario, id_pedido: u64) -> u32 {
    e.env.as_contract(&e.id_contrato, || {
        e.env
            .storage()
            .persistent()
            .get_ttl(&DataKey::Escrow(id_pedido))
    })
}

#[test]
fn crear_un_pedido_queda_avisado_en_la_red() {
    let e = escenario();
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &7u64, &PLAZO_DIAS);

    let avisos = avisos_de_minga(&e);
    assert_eq!(avisos.len(), 1, "crear un pedido tiene que publicar un aviso");

    let (topicos, datos) = avisos.get(0).unwrap();
    // Los tópicos son por lo que se filtra desde afuera: qué pasó, con qué
    // pedido y quiénes son las dos partes. Con las direcciones acá, la app
    // puede pedirle a la red "todos los pedidos de esta wallet".
    assert_eq!(
        topicos,
        (
            symbol_short!("creado"),
            7u64,
            e.comprador.clone(),
            e.proveedor.clone()
        )
            .into_val(&e.env)
    );
    // Los datos del aviso viajan como un par (monto, plazo en segundos).
    let (monto, plazo): (i128, u64) = datos.into_val(&e.env);
    assert_eq!(monto, 500);
    assert_eq!(plazo, PLAZO_DIAS * SEGUNDOS_POR_DIA);
}

#[test]
fn confirmar_avisa_que_el_proveedor_cobro_porque_rosa_dijo_que_si() {
    let e = escenario();
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);
    e.cliente.confirm_delivery(&1u64);

    let (topicos, datos) = avisos_de_minga(&e).last().unwrap();
    assert_eq!(
        topicos,
        (symbol_short!("liberado"), 1u64, e.proveedor.clone()).into_val(&e.env)
    );
    // El motivo distingue "Rosa confirmó" de "se venció el plazo". Son dos
    // historias muy distintas para contarle después a cada parte.
    let (monto, motivo): (i128, soroban_sdk::Symbol) = datos.into_val(&e.env);
    assert_eq!(monto, 500);
    assert_eq!(motivo, symbol_short!("confirmo"));
}

#[test]
fn cobrar_por_vencimiento_avisa_que_fue_por_vencimiento() {
    let e = escenario();
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);
    e.cliente.marcar_entregado(&1u64);
    pasar_dias(&e.env, PLAZO_DIAS + 1);
    e.cliente.reclamar_pago(&1u64);

    let (topicos, datos) = avisos_de_minga(&e).last().unwrap();
    assert_eq!(
        topicos,
        (symbol_short!("liberado"), 1u64, e.proveedor.clone()).into_val(&e.env)
    );
    let (monto, motivo): (i128, soroban_sdk::Symbol) = datos.into_val(&e.env);
    assert_eq!(monto, 500);
    assert_eq!(motivo, symbol_short!("vencio"));
}

#[test]
fn que_el_proveedor_devuelva_la_plata_tambien_queda_registrado() {
    let e = escenario();
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);
    e.cliente.marcar_entregado(&1u64);
    e.cliente.devolver_fondos(&1u64);

    let (topicos, datos) = avisos_de_minga(&e).last().unwrap();
    assert_eq!(
        topicos,
        (symbol_short!("cancelado"), 1u64, e.comprador.clone()).into_val(&e.env)
    );
    let (monto, motivo): (i128, soroban_sdk::Symbol) = datos.into_val(&e.env);
    assert_eq!(monto, 500);
    assert_eq!(motivo, symbol_short!("devolvio"));
}

#[test]
fn la_objecion_de_rosa_queda_como_prueba_en_la_red() {
    let e = escenario();
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);
    e.cliente.marcar_entregado(&1u64);
    e.cliente.objetar_entrega(&1u64);

    let (topicos, _) = avisos_de_minga(&e).last().unwrap();
    assert_eq!(
        topicos,
        (symbol_short!("objetado"), 1u64, e.comprador.clone()).into_val(&e.env)
    );
}

// =====================================================================
//  El vencimiento de los datos guardados
// =====================================================================

#[test]
fn un_pedido_en_uso_nunca_se_acerca_al_vencimiento() {
    let e = escenario();
    e.cliente
        .create_escrow(&e.comprador, &e.proveedor, &500, &1u64, &PLAZO_DIAS);

    // Al crearlo, el pedido nace con la vida máxima que permite la red.
    assert!(
        vida_restante_del_pedido(&e, 1) >= 179 * LEDGERS_POR_DIA,
        "un pedido recién creado tiene que nacer con ~180 días de vida"
    );

    // Pasan 100 días sin que nadie lo toque: le quedan ~80 días.
    e.env
        .ledger()
        .with_mut(|li| li.sequence_number += 100 * LEDGERS_POR_DIA);
    assert!(
        vida_restante_del_pedido(&e, 1) < 120 * LEDGERS_POR_DIA,
        "después de 100 días tendría que estar por debajo del umbral"
    );

    // Pero apenas alguien opera sobre el pedido, se renueva solo.
    // Esto es lo que evita que a Rosa le "desaparezca" un pedido viejo.
    e.cliente.marcar_entregado(&1u64);
    assert!(
        vida_restante_del_pedido(&e, 1) >= 179 * LEDGERS_POR_DIA,
        "usar el pedido tiene que devolverle la vida completa"
    );
}
