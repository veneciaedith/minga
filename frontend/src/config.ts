import { Networks } from "@stellar/stellar-sdk";

// =====================================================================
//  ⚙️  CONFIGURACIÓN — completá estos valores DESPUÉS de deployar
// =====================================================================

// 1) CONTRACT_ID: lo obtenés al correr `stellar contract deploy ...`
//    (ver COMANDOS.md). Pegá acá el id que empieza con "C...".
export const CONTRACT_ID = "CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N";

// 2) TOKEN_ID: contrato del token usado como pago.
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
