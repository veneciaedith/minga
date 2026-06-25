#![cfg(test)]
//! Test del flujo completo del escrow usando un token de prueba en memoria.
//! Corré con: `cargo test`

use super::*;
use soroban_sdk::{symbol_short, testutils::Address as _, token, Address, Env};

// Crea un token de prueba (Stellar Asset Contract) y devuelve su dirección
// junto con el cliente "admin" que permite mintear saldo en los tests.
fn crear_token<'a>(env: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'a>) {
    let contrato = env.register_stellar_asset_contract_v2(admin.clone());
    let direccion = contrato.address();
    let admin_client = token::StellarAssetClient::new(env, &direccion);
    (direccion, admin_client)
}

#[test]
fn flujo_crear_y_confirmar() {
    let env = Env::default();
    // Para el test simulamos que todas las firmas (auth) están aprobadas.
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let comprador = Address::generate(&env);
    let proveedor = Address::generate(&env);

    // Token de prueba + saldo inicial para el comprador.
    let (token_addr, token_admin) = crear_token(&env, &admin);
    token_admin.mint(&comprador, &1000);

    // Desplegamos el contrato de escrow en el entorno de test.
    let id_contrato = env.register(ContratoEscrow, ());
    let cliente = ContratoEscrowClient::new(&env, &id_contrato);

    // 1) Rosa crea el pedido y bloquea 500.
    cliente.create_escrow(&comprador, &proveedor, &token_addr, &500, &1u64);

    let token_cliente = token::Client::new(&env, &token_addr);
    assert_eq!(token_cliente.balance(&comprador), 500); // le quedaron 500
    assert_eq!(token_cliente.balance(&id_contrato), 500); // 500 bloqueados en el contrato
    assert_eq!(cliente.get_escrow_status(&1u64), symbol_short!("pendiente"));

    // 2) Rosa confirma la entrega -> el contrato paga al proveedor.
    cliente.confirm_delivery(&1u64);
    assert_eq!(token_cliente.balance(&proveedor), 500);
    assert_eq!(token_cliente.balance(&id_contrato), 0);
    assert_eq!(cliente.get_escrow_status(&1u64), symbol_short!("liberado"));
}

#[test]
fn flujo_cancelar_devuelve_fondos() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let comprador = Address::generate(&env);
    let proveedor = Address::generate(&env);

    let (token_addr, token_admin) = crear_token(&env, &admin);
    token_admin.mint(&comprador, &1000);

    let id_contrato = env.register(ContratoEscrow, ());
    let cliente = ContratoEscrowClient::new(&env, &id_contrato);

    cliente.create_escrow(&comprador, &proveedor, &token_addr, &300, &7u64);
    cliente.cancel_escrow(&7u64);

    let token_cliente = token::Client::new(&env, &token_addr);
    assert_eq!(token_cliente.balance(&comprador), 1000); // recuperó todo
    assert_eq!(cliente.get_escrow_status(&7u64), symbol_short!("cancelado"));
}

#[test]
fn estado_de_pedido_inexistente() {
    let env = Env::default();
    let id_contrato = env.register(ContratoEscrow, ());
    let cliente = ContratoEscrowClient::new(&env, &id_contrato);
    assert_eq!(cliente.get_escrow_status(&999u64), symbol_short!("noexiste"));
}
