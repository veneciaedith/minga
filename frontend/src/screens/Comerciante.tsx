import { useState } from "react";
import { crearEscrow, confirmarEntrega, cancelarEscrow } from "../escrow";
import { EXPLORER_TX } from "../config";

// Claves para recordar el pedido en curso entre recargas de la página.
const CLAVE_ID = "minga_pedido_id";
const CLAVE_CREADO = "minga_pedido_creado";

// Pantalla de Rosa (la comerciante): crea el pedido, confirma la entrega
// o cancela. Cada acción dispara una transacción on-chain firmada con Freighter.
export default function Comerciante({ wallet }: { wallet: string | null }) {
  const [proveedor, setProveedor] = useState("");
  const [monto, setMonto] = useState("");
  // La descripción es solo para Rosa (no se guarda on-chain en este prototipo).
  const [descripcion, setDescripcion] = useState("");
  // El N° de pedido se guarda en el navegador para que NO se pierda al refrescar.
  const [idPedido, setIdPedido] = useState<number>(() => {
    const guardado = localStorage.getItem(CLAVE_ID);
    if (guardado) return Number(guardado);
    const n = nuevoId();
    localStorage.setItem(CLAVE_ID, String(n));
    return n;
  });
  // "creado" indica si ESTE pedido ya fue creado on-chain (para habilitar confirmar).
  const [creado, setCreado] = useState<boolean>(
    () => localStorage.getItem(CLAVE_CREADO) === "true"
  );
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  function exigirWallet(): string {
    if (!wallet) throw new Error("Conectá tu wallet Freighter primero");
    return wallet;
  }

  function fijarCreado(v: boolean) {
    setCreado(v);
    localStorage.setItem(CLAVE_CREADO, String(v));
  }

  // Genera un nuevo N° de pedido y reinicia el estado (para arrancar otro pedido).
  function generarNuevo() {
    const n = nuevoId();
    setIdPedido(n);
    localStorage.setItem(CLAVE_ID, String(n));
    fijarCreado(false);
    setMensaje(null);
    setHash(null);
  }

  // Envuelve cada acción para manejar el estado de carga / error de forma uniforme.
  async function ejecutar(accion: () => Promise<string>) {
    setMensaje(null);
    setHash(null);
    setCargando(true);
    try {
      const h = await accion();
      setHash(h);
    } catch (e: any) {
      setMensaje("❌ " + e.message);
    } finally {
      setCargando(false);
    }
  }

  const onCrear = () =>
    ejecutar(async () => {
      const w = exigirWallet();
      const h = await crearEscrow(w, proveedor.trim(), monto, idPedido);
      fijarCreado(true); // ahora sí se puede confirmar/cancelar este pedido
      setMensaje(`✅ Pedido #${idPedido} creado. Pago bloqueado en el contrato.`);
      return h;
    });

  const onConfirmar = () =>
    ejecutar(async () => {
      const w = exigirWallet();
      const h = await confirmarEntrega(w, idPedido);
      fijarCreado(false);
      setMensaje(`✅ Entrega del pedido #${idPedido} confirmada. Pago liberado al proveedor.`);
      return h;
    });

  const onCancelar = () =>
    ejecutar(async () => {
      const w = exigirWallet();
      const h = await cancelarEscrow(w, idPedido);
      fijarCreado(false);
      setMensaje(`↩️ Pedido #${idPedido} cancelado. Fondos devueltos a tu wallet.`);
      return h;
    });

  return (
    <section className="card">
      <h2>Crear pedido a proveedor</h2>

      <label>
        Wallet del proveedor (G...)
        <input
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          placeholder="GA..."
        />
      </label>

      <label>
        Monto (XLM)
        <input value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="10" />
      </label>

      <label>
        Descripción del pedido
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: 2 cajones de gaseosa"
        />
      </label>

      <div className="idpedido">
        N° de pedido: <strong>#{idPedido}</strong>
        {!creado && (
          <button className="link" onClick={generarNuevo}>
            generar nuevo n°
          </button>
        )}
        <p className="hint">
          {creado
            ? "✅ Pedido creado. Compartí este número con tu proveedor; ya podés confirmar la entrega."
            : "Compartí este número con tu proveedor para que consulte el estado."}
        </p>
      </div>

      <div className="acciones">
        <button onClick={onCrear} disabled={cargando || creado}>
          1 · Crear pedido y bloquear pago
        </button>
        <button onClick={onConfirmar} disabled={cargando || !creado} className="ok">
          2 · Confirmar entrega (liberar pago)
        </button>
        <button onClick={onCancelar} disabled={cargando || !creado} className="warn">
          Cancelar pedido (devolver fondos)
        </button>
      </div>

      {cargando && <p className="cargando">⏳ Procesando en la red Stellar…</p>}
      {mensaje && <p className="resultado">{mensaje}</p>}
      {hash && (
        <p>
          <a href={`${EXPLORER_TX}/${hash}`} target="_blank" rel="noreferrer">
            Ver transacción en el explorador ↗
          </a>
        </p>
      )}
    </section>
  );
}

// Genera un número de pedido aleatorio para el demo.
function nuevoId(): number {
  return Math.floor(Math.random() * 1_000_000);
}
