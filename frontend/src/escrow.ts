// =====================================================================
//  API tipada del contrato de escrow.
//
//  Las pantallas usan estas funciones y no se enteran de ScVals ni de
//  stroops. Cada una lleva el nombre de lo que pasa en la vida real,
//  no el de la función del contrato.
//
//  Ojo con el orden de los argumentos de `crearEscrow`: el contrato ya
//  NO recibe el token (se fija al deployar, para que nadie pueda meter
//  uno falso) y en su lugar recibe el plazo en días.
// =====================================================================

import { DECIMALES } from "./config";
import { aDireccion, aI128, aU64, escribirContrato, leerContrato } from "./stellar";

/**
 * Los estados por los que pasa un pedido, con el nombre que devuelve el
 * contrato. En castellano de todos los días:
 *
 *   pendiente  la plata está guardada y el proveedor todavía no entregó
 *   entregado  el proveedor dijo "ya entregué": corre el plazo del comercio
 *   disputa    el comercio objetó la entrega: la plata queda frenada
 *   liberado   el proveedor cobró
 *   cancelado  la plata volvió al comercio
 *   noexiste   no hay ningún pedido con ese número
 */
export type EstadoPedido =
  | "pendiente"
  | "entregado"
  | "disputa"
  | "liberado"
  | "cancelado"
  | "noexiste";

/** Un pedido sigue vivo mientras nadie se llevó la plata todavía. */
export function sigueAbierto(estado: string): boolean {
  return estado === "pendiente" || estado === "entregado" || estado === "disputa";
}

/** Plazo máximo que acepta el contrato, en días. Si se cambia allá, se cambia acá. */
export const PLAZO_MAXIMO_DIAS = 60;

// ---------------------------------------------------------------------
//  Montos
// ---------------------------------------------------------------------

/** Convierte un monto escrito por una persona ("12,5") a la unidad del contrato. */
export function xlmAStroops(montoXlm: string): bigint {
  const limpio = montoXlm.trim().replace(",", ".");
  const numero = Number(limpio);
  if (!isFinite(numero) || numero <= 0) throw new Error("Monto inválido");
  return BigInt(Math.round(numero * 10 ** DECIMALES));
}

/** Convierte de vuelta a un número que se pueda mostrar. */
export function stroopsAXlm(stroops: bigint): string {
  return (Number(stroops) / 10 ** DECIMALES).toString();
}

// ---------------------------------------------------------------------
//  Lo que firma el comercio (quien compra)
// ---------------------------------------------------------------------

/**
 * El comercio hace el pedido: la plata sale de su billetera y queda
 * guardada en el contrato.
 *
 * `plazoDias` es el tiempo que el comercio se da a sí mismo para revisar
 * la mercadería DESPUÉS de que el proveedor avise que entregó.
 */
export async function crearEscrow(
  comprador: string,
  proveedor: string,
  montoXlm: string,
  idPedido: number,
  plazoDias: number
): Promise<string> {
  return escribirContrato(
    "create_escrow",
    [
      aDireccion(comprador),
      aDireccion(proveedor),
      aI128(xlmAStroops(montoXlm)),
      aU64(idPedido),
      aU64(plazoDias),
    ],
    comprador
  );
}

/** El comercio confirma que le llegó: el proveedor cobra. */
export async function confirmarEntrega(comprador: string, idPedido: number): Promise<string> {
  return escribirContrato("confirm_delivery", [aU64(idPedido)], comprador);
}

/** El comercio cancela. Solo se puede mientras el proveedor no declaró la entrega. */
export async function cancelarEscrow(comprador: string, idPedido: number): Promise<string> {
  return escribirContrato("cancel_escrow", [aU64(idPedido)], comprador);
}

/**
 * El comercio objeta una entrega declarada: "esto no me llegó, o me
 * llegó mal". Frena la plata: el proveedor ya no puede cobrar por
 * vencimiento. Solo vale DENTRO del plazo.
 */
export async function objetarEntrega(comprador: string, idPedido: number): Promise<string> {
  return escribirContrato("objetar_entrega", [aU64(idPedido)], comprador);
}

// ---------------------------------------------------------------------
//  Lo que firma el proveedor (quien vende)
// ---------------------------------------------------------------------

/**
 * El proveedor declara que entregó. Acá arranca el reloj del comercio.
 * Es lo que evita que el proveedor quede rehén de un silencio.
 */
export async function marcarEntregado(proveedor: string, idPedido: number): Promise<string> {
  return escribirContrato("marcar_entregado", [aU64(idPedido)], proveedor);
}

/** El proveedor cobra porque venció el plazo y el comercio no dijo nada. */
export async function reclamarPago(proveedor: string, idPedido: number): Promise<string> {
  return escribirContrato("reclamar_pago", [aU64(idPedido)], proveedor);
}

/** El proveedor devuelve la plata: se echa atrás, o cede en una disputa. */
export async function devolverFondos(proveedor: string, idPedido: number): Promise<string> {
  return escribirContrato("devolver_fondos", [aU64(idPedido)], proveedor);
}

// ---------------------------------------------------------------------
//  Consultas (no piden billetera y no cuestan nada)
// ---------------------------------------------------------------------

/** En qué anda el pedido. */
export async function estadoEscrow(idPedido: number): Promise<EstadoPedido> {
  const symbol = await leerContrato("get_escrow_status", [aU64(idPedido)]);
  return String(symbol) as EstadoPedido;
}

export interface DatosEscrow {
  comprador: string;
  proveedor: string;
  token: string;
  monto: bigint;
  /** Cuánto tiempo tiene el comercio para revisar, en segundos. */
  plazoConfirmacion: number;
  /** Cuándo declaró la entrega el proveedor. Vale 0 si todavía no pasó. */
  entregadoEn: number;
}

/** Los datos completos del pedido: monto, partes y plazo. */
export async function detalleEscrow(idPedido: number): Promise<DatosEscrow | null> {
  const d = await leerContrato("get_escrow", [aU64(idPedido)]);
  if (!d) return null;
  return {
    comprador: d.comprador,
    proveedor: d.proveedor,
    token: d.token,
    monto: BigInt(d.monto),
    plazoConfirmacion: Number(d.plazo_confirmacion ?? 0),
    entregadoEn: Number(d.entregado_en ?? 0),
  };
}

/**
 * Cuántos segundos le quedan al comercio para revisar. Devuelve 0 si el
 * plazo venció o si todavía no empezó a correr.
 */
export async function segundosRestantes(idPedido: number): Promise<number> {
  const v = await leerContrato("segundos_restantes", [aU64(idPedido)]);
  return Number(v ?? 0);
}

/** ¿El proveedor ya puede cobrar porque venció el plazo? */
export async function puedeReclamar(idPedido: number): Promise<boolean> {
  return Boolean(await leerContrato("puede_reclamar", [aU64(idPedido)]));
}

/**
 * Con qué moneda paga este contrato.
 *
 * Sirve para que el proveedor pueda verificar, antes de confiar, que le
 * van a pagar con lo que espera y no con algo inventado.
 */
export async function tokenDelContrato(): Promise<string> {
  return String(await leerContrato("get_token", []));
}
