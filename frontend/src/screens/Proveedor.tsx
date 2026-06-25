import { useState } from "react";
import { estadoEscrow, detalleEscrow, stroopsAXlm } from "../escrow";

// Etiquetas legibles para cada estado que devuelve el contrato.
const ETIQUETAS: Record<string, string> = {
  pendiente: "⏳ Pendiente de entrega (el pago está bloqueado y garantizado)",
  liberado: "✅ Pago liberado — ya recibiste el dinero",
  cancelado: "↩️ Pedido cancelado — fondos devueltos al comprador",
  noexiste: "❓ No existe un pedido con ese número",
};

// Pantalla del proveedor: solo lectura. Consulta el estado del pedido
// directamente en la blockchain, sin necesidad de wallet ni firma.
export default function Proveedor() {
  const [idPedido, setIdPedido] = useState("");
  const [estado, setEstado] = useState<string | null>(null);
  const [monto, setMonto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function consultar() {
    setError(null);
    setEstado(null);
    setMonto(null);
    setCargando(true);
    try {
      const id = Number(idPedido);
      if (!Number.isInteger(id) || id < 0) throw new Error("Número de pedido inválido");

      const st = await estadoEscrow(id);
      setEstado(st);

      if (st !== "noexiste") {
        const d = await detalleEscrow(id);
        if (d) setMonto(stroopsAXlm(d.monto));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="card">
      <h2>Estado de mi pedido</h2>
      <p className="sub">
        Consultá el estado del pago directamente en la blockchain (solo lectura).
      </p>

      <label>
        Número de pedido
        <input
          value={idPedido}
          onChange={(e) => setIdPedido(e.target.value)}
          placeholder="Ej: 12345"
        />
      </label>

      <button onClick={consultar} disabled={cargando}>
        Consultar estado
      </button>

      {cargando && <p className="cargando">⏳ Consultando la red…</p>}
      {error && <p className="error">❌ {error}</p>}
      {estado && (
        <div className="estado">
          <p className={"badge estado-" + estado}>{ETIQUETAS[estado] ?? estado}</p>
          {monto && (
            <p>
              Monto del pedido: <strong>{monto} XLM</strong>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
