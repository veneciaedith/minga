// API tipada del contrato de escrow, pensada para que las pantallas la usen
// sin preocuparse por ScVals ni por la conversión de montos.

import { TOKEN_ID, DECIMALES } from "./config";
import {
  aDireccion,
  aI128,
  aU64,
  escribirContrato,
  leerContrato,
} from "./stellar";

// Convierte un monto en XLM (ej "12.5") a stroops (el entero que usa el contrato).
export function xlmAStroops(montoXlm: string): bigint {
  const limpio = montoXlm.trim().replace(",", ".");
  const numero = Number(limpio);
  if (!isFinite(numero) || numero <= 0) throw new Error("Monto inválido");
  return BigInt(Math.round(numero * 10 ** DECIMALES));
}

// Convierte stroops de vuelta a XLM legible.
export function stroopsAXlm(stroops: bigint): string {
  return (Number(stroops) / 10 ** DECIMALES).toString();
}

// Rosa crea el pedido y bloquea el pago en el contrato.
export async function crearEscrow(
  comprador: string,
  proveedor: string,
  montoXlm: string,
  idPedido: number
): Promise<string> {
  const stroops = xlmAStroops(montoXlm);
  return escribirContrato(
    "create_escrow",
    [
      aDireccion(comprador),
      aDireccion(proveedor),
      aDireccion(TOKEN_ID),
      aI128(stroops),
      aU64(idPedido),
    ],
    comprador
  );
}

// Rosa confirma la entrega -> el contrato libera el pago al proveedor.
export async function confirmarEntrega(comprador: string, idPedido: number): Promise<string> {
  return escribirContrato("confirm_delivery", [aU64(idPedido)], comprador);
}

// Rosa cancela el pedido -> el contrato le devuelve los fondos.
export async function cancelarEscrow(comprador: string, idPedido: number): Promise<string> {
  return escribirContrato("cancel_escrow", [aU64(idPedido)], comprador);
}

// Cualquiera puede consultar el estado (lectura, no cuesta gas).
// Devuelve: "pendiente" | "liberado" | "cancelado" | "noexiste"
export async function estadoEscrow(idPedido: number): Promise<string> {
  const symbol = await leerContrato("get_escrow_status", [aU64(idPedido)]);
  return String(symbol);
}

export interface DatosEscrow {
  comprador: string;
  proveedor: string;
  token: string;
  monto: bigint;
}

// Datos completos del escrow (para mostrar monto y partes).
export async function detalleEscrow(idPedido: number): Promise<DatosEscrow | null> {
  const d = await leerContrato("get_escrow", [aU64(idPedido)]);
  if (!d) return null;
  return {
    comprador: d.comprador,
    proveedor: d.proveedor,
    token: d.token,
    monto: BigInt(d.monto),
  };
}
