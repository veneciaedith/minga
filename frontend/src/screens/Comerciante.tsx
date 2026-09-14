import { useState } from "react";
import { crearEscrow, confirmarEntrega, cancelarEscrow, estadoEscrow } from "../escrow";
import { EXPLORER_TX } from "../config";

// Claves para recordar el pedido en curso entre recargas de la página.
const CLAVE_ID = "minga_pedido_id";
const CLAVE_CREADO = "minga_pedido_creado";

// Pantalla de Rosa (la comerciante): crea el pedido, confirma la entrega
// o cancela. Cada acción dispara una transacción on-chain firmada con Freighter.
// Dirección del proveedor de demo, precargada para agilizar la grabación.
// (En un producto real se elegiría de una agenda de contactos.)
const PROVEEDOR_DEMO = "GBJJK3S4FU7VCKDTPS4O4RKSFYF5EERKGIUSUY2AVZEF2CU4PMGBOXLD";

export default function Comerciante({ wallet }: { wallet: string | null }) {
  const [proveedor, setProveedor] = useState(PROVEEDOR_DEMO);
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
  // El error va aparte del mensaje de éxito: se anuncia con más prioridad
  // al lector de pantalla (role="alert") y se ve con su propio estilo.
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  function exigirWallet(): string {
    if (!wallet) throw new Error("Conectá tu wallet Freighter primero");
    return wallet;
  }

  function fijarCreado(v: boolean) {
    setCreado(v);
    localStorage.setItem(CLAVE_CREADO, String(v));
  }

  // Prepara el siguiente pedido (nuevo N°, sin "creado") SIN borrar el mensaje de éxito.
  // Se llama solo después de confirmar/cancelar, para que el próximo "Crear" use un N° fresco.
  function prepararSiguiente() {
    const n = nuevoId();
    setIdPedido(n);
    localStorage.setItem(CLAVE_ID, String(n));
    fijarCreado(false);
  }

  // Botón "generar nuevo n°": como prepararSiguiente pero además limpia los mensajes.
  function generarNuevo() {
    prepararSiguiente();
    setMensaje(null);
    setError(null);
    setHash(null);
  }

  // Envuelve cada acción para manejar el estado de carga / error de forma uniforme.
  async function ejecutar(accion: () => Promise<string>) {
    setMensaje(null);
    setError(null);
    setHash(null);
    setCargando(true);
    try {
      const h = await accion();
      setHash(h);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  const onCrear = () =>
    ejecutar(async () => {
      const w = exigirWallet();
      // Chequeo previo: evita el error "ya existe" si el N° ya fue usado.
      const estadoPrevio = await estadoEscrow(idPedido);
      if (estadoPrevio !== "noexiste") {
        throw new Error(
          `El pedido #${idPedido} ya existe (estado: ${estadoPrevio}). Tocá "generar nuevo n°" y probá de nuevo.`
        );
      }
      const h = await crearEscrow(w, proveedor.trim(), monto, idPedido);
      fijarCreado(true); // ahora sí se puede confirmar/cancelar este pedido
      setMensaje(`✅ Pedido #${idPedido} creado. Pago bloqueado en el contrato.`);
      return h;
    });

  const onConfirmar = () =>
    ejecutar(async () => {
      const w = exigirWallet();
      // Chequeo previo on-chain: evita el error críptico si el pedido no existe.
      const estado = await estadoEscrow(idPedido);
      if (estado !== "pendiente") {
        fijarCreado(false);
        throw new Error(
          `El pedido #${idPedido} no está pendiente (estado: ${estado}). Tocá "generar nuevo n°" y creá uno antes de confirmar.`
        );
      }
      const h = await confirmarEntrega(w, idPedido);
      setMensaje(`✅ Entrega del pedido #${idPedido} confirmada. Pago liberado al proveedor.`);
      prepararSiguiente(); // deja listo un N° nuevo para el próximo pedido
      return h;
    });

  const onCancelar = () =>
    ejecutar(async () => {
      const w = exigirWallet();
      const estado = await estadoEscrow(idPedido);
      if (estado !== "pendiente") {
        fijarCreado(false);
        throw new Error(
          `El pedido #${idPedido} no está pendiente (estado: ${estado}). No hay nada para cancelar.`
        );
      }
      const h = await cancelarEscrow(w, idPedido);
      setMensaje(`↩️ Pedido #${idPedido} cancelado. Fondos devueltos a tu wallet.`);
      prepararSiguiente(); // deja listo un N° nuevo para el próximo pedido
      return h;
    });

  // Por qué los pasos 2 y 3 pueden estar bloqueados. Se muestra en pantalla Y se
  // lee al enfocar el botón (aria-describedby), así nadie queda sin saber por qué
  // "no pasa nada" al tocarlo.
  const motivoBloqueo = !wallet
    ? "Para operar, primero conectá tu wallet arriba."
    : !creado
      ? "Para confirmar o cancelar, primero creá el pedido con el paso 1."
      : cargando
        ? "Esperá a que termine la operación anterior."
        : null;

  return (
    <section className="card" aria-busy={cargando}>
      <h2>Crear pedido a proveedor</h2>

      <label htmlFor="proveedor">Wallet del proveedor (G...)</label>
      <input
        id="proveedor"
        value={proveedor}
        onChange={(e) => setProveedor(e.target.value)}
        placeholder="GA..."
        aria-describedby="ayuda-proveedor"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      <p className="hint" id="ayuda-proveedor">
        Es la dirección de la wallet de tu proveedor. Empieza con la letra G.
      </p>

      <label htmlFor="monto">Monto (XLM)</label>
      <input
        id="monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="10"
        inputMode="decimal"
        aria-describedby="ayuda-monto"
        autoComplete="off"
      />
      <p className="hint" id="ayuda-monto">
        Cuánto vas a bloquear en garantía, en XLM. Podés usar decimales.
      </p>

      <label htmlFor="descripcion">Descripción del pedido</label>
      <input
        id="descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Ej: 2 cajones de gaseosa"
        aria-describedby="ayuda-descripcion"
      />
      <p className="hint" id="ayuda-descripcion">
        Es una nota para vos: no se guarda en la blockchain.
      </p>

      <div className="idpedido">
        N° de pedido: <strong>#{idPedido}</strong>
        <button type="button" className="link" onClick={generarNuevo}>
          generar nuevo n°
        </button>
        <p className="hint">
          {creado
            ? "✅ Pedido creado. Compartí este número con tu proveedor; ya podés confirmar la entrega."
            : "Compartí este número con tu proveedor para que consulte el estado."}
        </p>
      </div>

      <div className="acciones">
        <button type="button" onClick={onCrear} disabled={cargando || creado}>
          1 · Crear pedido y bloquear pago
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={cargando || !creado}
          className="ok"
          aria-describedby={motivoBloqueo ? "motivo-bloqueo" : undefined}
        >
          2 · Confirmar entrega (liberar pago)
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={cargando || !creado}
          className="warn"
          aria-describedby={motivoBloqueo ? "motivo-bloqueo" : undefined}
        >
          Cancelar pedido (devolver fondos)
        </button>
      </div>

      {motivoBloqueo && (
        <p className="hint" id="motivo-bloqueo">
          {motivoBloqueo}
        </p>
      )}

      {/* Regiones siempre presentes: el lector de pantalla avisa en voz alta
          cuando cambia el estado del pago, que es la información crítica. */}
      <div aria-live="polite" role="status">
        {cargando && (
          <p className="cargando">
            <span aria-hidden="true">⏳</span> Procesando en la red Stellar…
          </p>
        )}
        {mensaje && <p className="resultado">{mensaje}</p>}
        {hash && (
          <p>
            <a href={`${EXPLORER_TX}/${hash}`} target="_blank" rel="noreferrer">
              Ver transacción en el explorador (se abre en otra pestaña)
              <span aria-hidden="true"> ↗</span>
            </a>
          </p>
        )}
      </div>

      <div className="error" role="alert">
        {error && <>No se pudo completar la operación: {error}</>}
      </div>
    </section>
  );
}

// Genera un número de pedido aleatorio para el demo.
function nuevoId(): number {
  return Math.floor(Math.random() * 1_000_000);
}
