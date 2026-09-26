// Capa de bajo nivel para hablar con el contrato Soroban en la red Stellar.
//
// Hay dos caminos:
//  - leerContrato():  SIMULA la llamada (no firma, no cuesta gas). Para consultas.
//  - escribirContrato(): firma con Freighter y MANDA la transacción a la red real.

import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";
import { firmarXdr } from "./wallet";

// Servidor RPC de Soroban (testnet). Es nuestra puerta de entrada a la red.
const servidor = new rpc.Server(RPC_URL);

function contrato(): Contract {
  return new Contract(CONTRACT_ID);
}

// ---------------------------------------------------------------------
//  LECTURA — simula la invocación y devuelve el valor de retorno.
//  No firma ni gasta nada; sirve para el proveedor que solo consulta.
// ---------------------------------------------------------------------
export async function leerContrato(metodo: string, args: xdr.ScVal[]): Promise<any> {
  // Para simular alcanza con una cuenta cualquiera; NO necesita tener fondos.
  const cuentaFicticia = new Account(Keypair.random().publicKey(), "0");

  const tx = new TransactionBuilder(cuentaFicticia, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contrato().call(metodo, ...args))
    .setTimeout(30)
    .build();

  const sim = await servidor.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error("Error al consultar el contrato: " + sim.error);
  }
  if (!sim.result) return null;
  // Convierte el ScVal (formato Soroban) a un valor JS normal.
  return scValToNative(sim.result.retval);
}

// ---------------------------------------------------------------------
//  ESCRITURA — arma, firma y envía la transacción a la red Stellar.
//  Devuelve el hash de la transacción on-chain.
// ---------------------------------------------------------------------
export async function escribirContrato(
  metodo: string,
  args: xdr.ScVal[],
  firmante: string
): Promise<string> {
  // 1) Traemos la cuenta real del firmante desde la red (necesita estar fondeada).
  //    Si todavía no tiene plata de prueba, la red contesta "Account not
  //    found". Lo traducimos acá, porque es NUESTRA billetera la que falta,
  //    no la del proveedor, y el mensaje tiene que decir eso.
  let cuenta;
  try {
    cuenta = await servidor.getAccount(firmante);
  } catch (e) {
    if (esCuentaInexistente(e)) throw new Error(BILLETERA_SIN_FONDOS);
    throw e;
  }

  // 2) Armamos la transacción que invoca el método del contrato.
  let tx = new TransactionBuilder(cuenta, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contrato().call(metodo, ...args))
    .setTimeout(300) // 5 min para que el usuario tenga tiempo de firmar en Freighter
    .build();

  // 3) prepareTransaction simula la operación y agrega los recursos/fees
  //    que Soroban necesita (footprint, gas, etc.).
  tx = await servidor.prepareTransaction(tx);

  // 4) El usuario firma con su wallet Freighter.
  const xdrFirmado = await firmarXdr(tx.toXDR(), firmante);
  const txFirmada = TransactionBuilder.fromXDR(xdrFirmado, NETWORK_PASSPHRASE);

  // 5) Enviamos la transacción a la red.  *** ESTO ES ON-CHAIN REAL ***
  const envio = await servidor.sendTransaction(txFirmada);
  if (envio.status === "ERROR") {
    throw new Error("La red rechazó la transacción: " + JSON.stringify(envio.errorResult));
  }

  // 6) Esperamos a que la red confirme (puede tardar unos segundos).
  //
  //    Con un límite: antes esta espera no terminaba nunca. Si la red se
  //    caía justo acá, la pantalla quedaba en "Estamos anotando esto en la
  //    red" para siempre, y quien está del otro lado no sabe si su plata se
  //    movió o no. Eso no es un detalle técnico: le pega justo a quien ya
  //    desconfía. Mejor cortar y decirle qué hacer.
  const LIMITE_ESPERA_MS = 90_000;
  const comienzo = Date.now();

  let resultado = await servidor.getTransaction(envio.hash);
  while (resultado.status === "NOT_FOUND") {
    if (Date.now() - comienzo > LIMITE_ESPERA_MS) {
      throw new Error(
        `La red tardó demasiado en confirmar (comprobante ${envio.hash}).`
      );
    }
    await new Promise((r) => setTimeout(r, 1500));
    resultado = await servidor.getTransaction(envio.hash);
  }
  if (resultado.status !== "SUCCESS") {
    throw new Error("La transacción falló on-chain (hash " + envio.hash + ")");
  }

  // Devolvemos el hash para mostrar el link al explorador.
  return envio.hash;
}

// ---------------------------------------------------------------------
//  PLATA DE PRUEBA — en la red de prueba, una billetera recién creada
//  "no existe" hasta que alguien le manda fondos. En la prueba con un
//  usuario real, ese paso fue justo donde se trabó: xBull le mostraba la
//  cuenta creada y Minga le decía que no existía. Acá lo resolvemos sin
//  mandarlo a otra página.
// ---------------------------------------------------------------------

/** Marca que usa escribirContrato() y que traduce textos.ts. */
export const BILLETERA_SIN_FONDOS = "billetera sin fondos de prueba";

function esCuentaInexistente(e: unknown): boolean {
  const texto = e instanceof Error ? e.message : String(e);
  return texto.toLowerCase().includes("account not found");
}

/**
 * ¿La billetera ya tiene plata de prueba?
 * Devuelve false solo cuando la red dice que no existe. Si la red no
 * contesta, tira el error: no queremos decirle a nadie que su billetera
 * está vacía por un problema de internet.
 */
export async function tienePlataDePrueba(direccion: string): Promise<boolean> {
  try {
    await servidor.getAccount(direccion);
    return true;
  } catch (e) {
    if (esCuentaInexistente(e)) return false;
    throw e;
  }
}

/** Le pide a la red de prueba (Friendbot) que cargue la billetera. Es gratis. */
export async function cargarPlataDePrueba(direccion: string): Promise<void> {
  await servidor.requestAirdrop(direccion);
}

// ---------------------------------------------------------------------
//  Helpers de conversión a ScVal (los tipos que entiende el contrato).
// ---------------------------------------------------------------------
export const aDireccion = (g: string): xdr.ScVal => Address.fromString(g).toScVal();
export const aU64 = (n: number): xdr.ScVal => nativeToScVal(BigInt(n), { type: "u64" });
export const aI128 = (stroops: bigint): xdr.ScVal => nativeToScVal(stroops, { type: "i128" });
