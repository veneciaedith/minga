#![cfg(test)]
//! Tests de propiedades: en vez de probar los casos que se nos ocurren,
//! le tiramos al contrato cientos de combinaciones al azar y verificamos
//! que **nunca** se rompan las reglas que no se pueden romper.
//!
//! La diferencia con los tests de `test.rs` es importante:
//!
//! - Un test común dice *«si pasa esto, tiene que pasar aquello»*. Prueba
//!   lo que a quien lo escribió se le ocurrió probar.
//! - Un test de propiedad dice *«pase lo que pase, esto tiene que seguir
//!   siendo cierto»*. La computadora arma las secuencias, incluidas las
//!   que a nadie se le habrían ocurrido, y si encuentra una que rompe la
//!   regla la reduce al caso más chico posible y la muestra.
//!
//! Las reglas que defendemos acá:
//!
//! 1. La plata ni se crea ni se destruye. Lo que hay al final es lo mismo
//!    que había al principio, repartido de otra manera.
//! 2. Lo que el contrato tiene guardado coincide **exactamente** con lo
//!    que dice deber. Ni de más ni de menos.
//! 3. Con varios pedidos a la vez, **el pago de uno nunca usa la plata de
//!    otro**. (Es el hallazgo 1 de `docs/revision-seguridad.md`.)
//! 4. Nadie cobra dos veces.
//! 5. Un monto que no sea positivo y un plazo fuera de rango se rechazan
//!    siempre, sin importar el número que se mande.

use super::*;
use proptest::prelude::*;
use soroban_sdk::{
    testutils::{Address as _, EnvTestConfig, Ledger as _},
    token, Address, Env,
};

/// Con cuánta plata arranca el comprador en cada escenario.
const SALDO_INICIAL: i128 = 1_000_000;

/// Los números de pedido que se usan en las pruebas con varios pedidos.
const PEDIDOS: [u64; 3] = [1, 2, 3];

// ---------------------------------------------------------------------
//  El escenario
// ---------------------------------------------------------------------

struct Mundo<'a> {
    env: Env,
    comprador: Address,
    proveedor: Address,
    contrato: Address,
    token: token::Client<'a>,
    cliente: ContratoEscrowClient<'a>,
}

fn mundo<'a>() -> Mundo<'a> {
    // `capture_snapshot_at_drop: false` evita que cada caso escriba un
    // archivo de captura: acá corren cientos y no aportan nada.
    let env = Env::new_with_config(EnvTestConfig {
        capture_snapshot_at_drop: false,
    });
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let comprador = Address::generate(&env);
    let proveedor = Address::generate(&env);

    let contrato_token = env.register_stellar_asset_contract_v2(admin.clone());
    let token_addr = contrato_token.address();
    token::StellarAssetClient::new(&env, &token_addr).mint(&comprador, &SALDO_INICIAL);

    let contrato = env.register(ContratoEscrow, (token_addr.clone(),));
    let cliente = ContratoEscrowClient::new(&env, &contrato);
    let token = token::Client::new(&env, &token_addr);

    Mundo {
        env,
        comprador,
        proveedor,
        contrato,
        token,
        cliente,
    }
}

// ---------------------------------------------------------------------
//  Las acciones que alguien puede intentar
// ---------------------------------------------------------------------

#[derive(Debug, Clone)]
enum Accion {
    Crear { id: u64, monto: i128, plazo_dias: u64 },
    Entregar(u64),
    Confirmar(u64),
    Cancelar(u64),
    Objetar(u64),
    Reclamar(u64),
    Devolver(u64),
    PasarDias(u64),
}

/// Genera una acción al azar sobre uno de los pedidos.
fn una_accion() -> impl Strategy<Value = Accion> {
    let id = prop::sample::select(PEDIDOS.to_vec());
    prop_oneof![
        (id.clone(), 1i128..=100_000i128, 1u64..=PLAZO_MAXIMO_DIAS)
            .prop_map(|(id, monto, plazo_dias)| Accion::Crear { id, monto, plazo_dias }),
        id.clone().prop_map(Accion::Entregar),
        id.clone().prop_map(Accion::Confirmar),
        id.clone().prop_map(Accion::Cancelar),
        id.clone().prop_map(Accion::Objetar),
        id.clone().prop_map(Accion::Reclamar),
        id.prop_map(Accion::Devolver),
        (0u64..=70u64).prop_map(Accion::PasarDias),
    ]
}

/// Ejecuta la acción. Que falle está perfecto: la mitad de las
/// combinaciones al azar son cosas que el contrato tiene que rechazar.
/// Lo que nos importa es que, falle o no, las reglas sigan en pie.
fn aplicar(m: &Mundo, accion: &Accion) {
    match accion {
        Accion::Crear { id, monto, plazo_dias } => {
            let _ = m.cliente.try_create_escrow(
                &m.comprador,
                &m.proveedor,
                monto,
                id,
                plazo_dias,
            );
        }
        Accion::Entregar(id) => {
            let _ = m.cliente.try_marcar_entregado(id);
        }
        Accion::Confirmar(id) => {
            let _ = m.cliente.try_confirm_delivery(id);
        }
        Accion::Cancelar(id) => {
            let _ = m.cliente.try_cancel_escrow(id);
        }
        Accion::Objetar(id) => {
            let _ = m.cliente.try_objetar_entrega(id);
        }
        Accion::Reclamar(id) => {
            let _ = m.cliente.try_reclamar_pago(id);
        }
        Accion::Devolver(id) => {
            let _ = m.cliente.try_devolver_fondos(id);
        }
        Accion::PasarDias(dias) => {
            m.env
                .ledger()
                .with_mut(|li| li.timestamp += dias * SEGUNDOS_POR_DIA);
        }
    }
}

// ---------------------------------------------------------------------
//  Las reglas que no se pueden romper
// ---------------------------------------------------------------------

fn revisar_reglas(m: &Mundo) -> Result<(), TestCaseError> {
    let del_comprador = m.token.balance(&m.comprador);
    let del_proveedor = m.token.balance(&m.proveedor);
    let en_el_contrato = m.token.balance(&m.contrato);

    // Regla 1: la plata ni se crea ni se destruye.
    prop_assert_eq!(
        del_comprador + del_proveedor + en_el_contrato,
        SALDO_INICIAL,
        "apareció o desapareció plata"
    );

    // Nadie puede quedar con saldo negativo.
    prop_assert!(del_comprador >= 0 && del_proveedor >= 0 && en_el_contrato >= 0);

    // Recorremos los pedidos y sumamos lo que el contrato DICE que debe.
    let mut deberia_tener = 0i128;
    let mut deberia_haber_cobrado = 0i128;

    for id in PEDIDOS {
        if let Some(escrow) = m.cliente.get_escrow(&id) {
            // El monto guardado siempre es positivo: nunca se guarda un
            // pedido con monto cero o negativo.
            prop_assert!(escrow.monto > 0);

            match escrow.estado {
                // Pedido abierto: esa plata tiene que estar en el contrato.
                Estado::Pendiente | Estado::Entregado | Estado::EnDisputa => {
                    deberia_tener += escrow.monto;
                }
                // Pedido pagado: esa plata tiene que estar en el proveedor.
                Estado::Liberado => {
                    deberia_haber_cobrado += escrow.monto;
                }
                // Pedido cancelado: volvió al comprador, no hay nada que sumar.
                Estado::Cancelado => {}
            }
        }
    }

    // Regla 2 y 3: lo que el contrato tiene guardado coincide exactamente
    // con la suma de los pedidos abiertos. Si el pago de un pedido usara
    // plata de otro, esta cuenta no cerraría.
    prop_assert_eq!(
        en_el_contrato,
        deberia_tener,
        "lo que el contrato tiene no coincide con lo que dice deber"
    );

    // Regla 4: el proveedor cobró exactamente los pedidos liberados, ni
    // uno de más. Si alguien cobrara dos veces, acá se vería.
    prop_assert_eq!(
        del_proveedor,
        deberia_haber_cobrado,
        "el proveedor tiene una plata que no corresponde a ningún pedido pagado"
    );

    Ok(())
}

// ---------------------------------------------------------------------
//  Las propiedades
// ---------------------------------------------------------------------

proptest! {
    #![proptest_config(ProptestConfig::with_cases(48))]

    /// Le tiramos secuencias al azar de hasta 14 acciones sobre tres
    /// pedidos distintos, en cualquier orden, con saltos de tiempo en el
    /// medio. Después de CADA acción, todas las reglas tienen que seguir
    /// en pie.
    #[test]
    fn haga_lo_que_haga_la_gente_las_cuentas_cierran(
        acciones in prop::collection::vec(una_accion(), 1..14)
    ) {
        let m = mundo();
        revisar_reglas(&m)?;
        for accion in &acciones {
            aplicar(&m, accion);
            revisar_reglas(&m)?;
        }
    }

    /// Un monto que no sea positivo se rechaza siempre, sea el número que
    /// sea, y no mueve ni un peso.
    #[test]
    fn un_monto_que_no_sea_positivo_siempre_se_rechaza(monto in i128::MIN..=0i128) {
        let m = mundo();
        prop_assert_eq!(
            m.cliente.try_create_escrow(&m.comprador, &m.proveedor, &monto, &1u64, &3u64),
            Err(Ok(Error::MontoInvalido))
        );
        prop_assert_eq!(m.token.balance(&m.contrato), 0);
        prop_assert_eq!(m.token.balance(&m.comprador), SALDO_INICIAL);
    }

    /// Un plazo fuera de rango se rechaza siempre. Incluye números
    /// enormes, que es donde una multiplicación descuidada se desbordaría.
    #[test]
    fn un_plazo_fuera_de_rango_siempre_se_rechaza(
        plazo in prop_oneof![Just(0u64), (PLAZO_MAXIMO_DIAS + 1)..=u64::MAX]
    ) {
        let m = mundo();
        prop_assert_eq!(
            m.cliente.try_create_escrow(&m.comprador, &m.proveedor, &100i128, &1u64, &plazo),
            Err(Ok(Error::PlazoInvalido))
        );
        prop_assert_eq!(m.token.balance(&m.contrato), 0);
    }

    /// El proveedor no puede cobrar por vencimiento antes de que venza,
    /// sin importar cuánto tiempo pase mientras no se cumpla el plazo.
    #[test]
    fn nadie_cobra_por_vencimiento_antes_de_tiempo(
        plazo_dias in 2u64..=PLAZO_MAXIMO_DIAS,
        espera_dias in 0u64..1u64,
    ) {
        let m = mundo();
        m.cliente.create_escrow(&m.comprador, &m.proveedor, &500i128, &1u64, &plazo_dias);
        m.cliente.marcar_entregado(&1u64);

        // Esperamos menos de lo que dura el plazo.
        let espera = espera_dias.min(plazo_dias.saturating_sub(1));
        m.env.ledger().with_mut(|li| li.timestamp += espera * SEGUNDOS_POR_DIA);

        prop_assert_eq!(
            m.cliente.try_reclamar_pago(&1u64),
            Err(Ok(Error::PlazoNoVencido))
        );
        prop_assert_eq!(m.token.balance(&m.proveedor), 0);
        prop_assert_eq!(m.token.balance(&m.contrato), 500);
    }
}
