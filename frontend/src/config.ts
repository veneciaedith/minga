import { Networks } from "@stellar/stellar-sdk";

// =====================================================================
//  ⚙️  CONFIGURACIÓN — completá estos valores DESPUÉS de deployar
// =====================================================================

// 1) CONTRACT_ID: el contrato instalado en testnet.
//
//    Este es el contrato NUEVO, con plazo, entrega declarada por el
//    proveedor, disputa, avisos en la red y el token fijado en el
//    deploy. Deployado el 22 de septiembre de 2026.
//
//    Si alguna vez hay que deployar de nuevo, los pasos están en
//    DEPLOY-AHORA.md — ojo con el `-- --token` del final, que es
//    donde se fija la moneda y no se puede cambiar después.
export const CONTRACT_ID = "CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G";

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
