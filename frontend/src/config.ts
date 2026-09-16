import { Networks } from "@stellar/stellar-sdk";

// =====================================================================
//  ⚙️  CONFIGURACIÓN — completá estos valores DESPUÉS de deployar
// =====================================================================

// 1) CONTRACT_ID: lo obtenés al correr `stellar contract deploy ...`
//    (ver COMANDOS.md). Pegá acá el id que empieza con "C...".
//
//    ⚠️  ESTE ID ES EL DEL CONTRATO VIEJO Y HAY QUE CAMBIARLO.
//
//    La app ya habla el idioma del contrato NUEVO (con plazo, entrega
//    declarada por el proveedor y disputa). El contrato que está en
//    testnet todavía es el viejo, así que mientras este id no se
//    cambie, cualquier operación va a fallar.
//
//    Qué hacer: deployar el contrato nuevo (COMANDOS.md, sección 2 —
//    ojo con el `-- --token` del final) y pegar acá el id que imprime.
//    Hace falta una billetera con fondos de testnet, por eso no se
//    puede hacer desde una sesión de IA: lo corre una persona.
export const CONTRACT_ID = "CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N";

// 2) TOKEN_ID: el token con el que se paga.
//    Ya NO lo usa la app: desde el contrato nuevo, el token se fija al
//    deployar y no se puede cambiar (para que nadie pueda meter uno
//    falso). Queda acá porque es el valor que se le pasa al comando de
//    deploy. Verificá cuál acepta el contrato con `get_token`.
//    Antes decía: contrato del token usado como pago.
//    Por defecto usamos el XLM nativo de TESTNET (Stellar Asset Contract).
//    Para verificar/regenerar el id corré:
//      stellar contract id asset --asset native --network testnet
export const TOKEN_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// 3) Red Stellar — TESTNET (no tocar para el prototipo).
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// Explorador para mostrar el link de la transacción on-chain.
export const EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx";

// El XLM usa 7 decimales: 1 XLM = 10.000.000 stroops (la unidad mínima).
export const DECIMALES = 7;
