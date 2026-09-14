import { useState } from "react";
import { estadoEscrow, detalleEscrow, stroopsAXlm } from "../escrow";

// Etiquetas legibles para cada estado que devuelve el contrato.
// El emoji va separado del texto: se marca como decorativo (aria-hidden) para
// que el lector de pantalla lea la frase y no el nombre del dibujito.
const ETIQUETAS: Record<string, { icono: string; texto: string }> = {
  pendiente: {
    icono: "⏳",
    texto: "Pendiente de entrega (el pago está bloqueado y garantizado)",
  },
  liberado: { icono: "✅", texto: "Pago liberado — ya recibiste el dinero" },
  cancelado: { icono: "↩️", texto: "Pedido cancelado — fondos devueltos al comprador" },
  noexiste: { icono: "❓", texto: "No existe un pedido con ese número" },
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

  const etiqueta = estado ? ETIQUETAS[estado] : null;

  return (
    <section className="card" aria-busy={cargando}>
      <h2>Estado de mi pedido</h2>
      <p className="sub">
        Consultá el estado del pago directamente en la blockchain (solo lectura).
      </p>

      <label htmlFor="pedido">Número de pedido</label>
      <input
        id="pedido"
        value={idPedido}
        onChange={(e) => setIdPedido(e.target.value)}
        placeholder="Ej: 12345"
        inputMode="numeric"
        aria-describedby="ayuda-pedido"
        autoComplete="off"
      />
      <p className="hint" id="ayuda-pedido">
        Es el número que te pasó el comerciante cuando armó el pedido.
      </p>

      <button type="button" onClick={consultar} disabled={cargando}>
        Consultar estado
      </button>

      {/* Regiones siempre presentes para que el resultado se anuncie en voz alta. */}
      <div aria-live="polite" role="status">
        {cargando && (
          <p className="cargando">
            <span aria-hidden="true">⏳</span> Consultando la red…
          </p>
        )}
        {estado && (
          <div className="estado">
            <p className={"badge estado-" + estado}>
              <span aria-hidden="true">{etiqueta ? etiqueta.icono + " " : ""}</span>
              {etiqueta ? etiqueta.texto : estado}
            </p>
            {monto && (
              <p>
                Monto del pedido: <strong>{monto} XLM</strong>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="error" role="alert">
        {error && <>No se pudo consultar: {error}</>}
      </div>
    </section>
  );
}
