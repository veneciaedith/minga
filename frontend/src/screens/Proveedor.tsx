import { useRef, useState } from "react";
import { estadoEscrow, detalleEscrow, stroopsAXlm } from "../escrow";
import { Aviso, Estado } from "../componentes/Estado";
import { conMiles, mensajeClaro, revisarNumeroPedido } from "../textos";

/**
 * Qué significa cada estado del contrato, contado como se lo contaría
 * una persona a otra. El título lleva siempre un signo además del
 * color, para que se entienda en blanco y negro, con poca luz o con
 * daltonismo. (Heurística 2 y criterio 1.4.1 de las WCAG)
 */
const ESTADOS: Record<string, { signo: string; titulo: string; explicacion: string }> = {
  pendiente: {
    signo: "●",
    titulo: "Tu pago está firme y guardado",
    explicacion:
      "El comercio ya apartó la plata y no la puede usar para otra cosa. La vas a cobrar en cuanto confirme que le llegó la mercadería. Podés preparar el envío tranquilo.",
  },
  liberado: {
    signo: "✓",
    titulo: "Ya cobraste",
    explicacion: "El comercio confirmó que le llegó el pedido y la plata salió hacia tu billetera.",
  },
  cancelado: {
    signo: "↩",
    titulo: "El pedido se canceló",
    explicacion:
      "La plata volvió al comercio y este pedido quedó cerrado. Si van a intentarlo de nuevo, te tienen que pasar un número nuevo.",
  },
  noexiste: {
    signo: "?",
    titulo: "No encontramos ese pedido",
    explicacion:
      "Puede ser que el número esté mal copiado, o que el comercio todavía no haya hecho el pedido. Fijate el número y preguntale.",
  },
};

/**
 * Pantalla de quien vende (el proveedor).
 *
 * Es solo de lectura: no pide billetera, no firma nada y no cuesta
 * plata consultar. Sirve para que el proveedor deje de depender de un
 * llamado o un mensaje para saber si le van a pagar.
 */
export default function Proveedor() {
  const [numero, setNumero] = useState("");
  const [estado, setEstado] = useState<string | null>(null);
  const [monto, setMonto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCampo, setErrorCampo] = useState<string | null>(null);

  const campo = useRef<HTMLInputElement>(null);
  const resultado = useRef<HTMLHeadingElement>(null);

  async function consultar() {
    const problema = revisarNumeroPedido(numero);
    setErrorCampo(problema);
    if (problema) {
      campo.current?.focus();
      return;
    }

    setEstado(null);
    setMonto(null);
    setAviso({ tono: "trabajando", texto: "Buscando el pedido en la red. Tarda unos segundos." });
    setCargando(true);

    try {
      const id = Number(numero.trim());
      const st = await estadoEscrow(id);
      setEstado(st);

      if (st !== "noexiste") {
        const d = await detalleEscrow(id);
        if (d) setMonto(stroopsAXlm(d.monto));
      }
      setAviso(null);
      // El foco va al resultado: sin esto, quien usa lector de pantalla
      // no se entera de que apareció algo nuevo más abajo.
      requestAnimationFrame(() => resultado.current?.focus());
    } catch (e) {
      setAviso({ tono: "mal", texto: mensajeClaro(e) });
    } finally {
      setCargando(false);
    }
  }

  const info = estado ? (ESTADOS[estado] ?? null) : null;

  return (
    <section className="tarjeta" aria-labelledby="titulo-proveedor">
      <h2 id="titulo-proveedor">¿Me van a pagar?</h2>
      <p className="bajada">
        Poné el número de pedido que te pasó el comercio y fijate cómo viene tu cobro. No hace falta
        billetera ni contraseña, y consultar no cuesta nada.
      </p>

      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          consultar();
        }}
        noValidate
      >
        <div className="campo">
          <label htmlFor="campo-numero">Número de pedido</label>
          <p className="ayuda-campo" id="ayuda-numero">
            Son solo números. Te lo pasa el comercio cuando hace el pedido.
          </p>
          <input
            id="campo-numero"
            ref={campo}
            value={numero}
            onChange={(e) => {
              setNumero(e.target.value);
              if (errorCampo) setErrorCampo(null);
            }}
            inputMode="numeric"
            placeholder="12345"
            autoComplete="off"
            aria-invalid={errorCampo ? true : undefined}
            aria-describedby={errorCampo ? "ayuda-numero error-numero" : "ayuda-numero"}
          />
          {errorCampo && (
            <p className="error-campo" id="error-numero">
              <span aria-hidden="true">✕</span>
              <span>{errorCampo}</span>
            </p>
          )}
        </div>

        <div className="acciones">
          <button type="submit" className="boton boton-principal" disabled={cargando}>
            {cargando ? "Buscando…" : "Ver cómo viene mi cobro"}
          </button>
        </div>
      </form>

      <Estado aviso={aviso} cargando={cargando} />

      {info && (
        <div className={`resultado-estado ${estado}`} role="region" aria-labelledby="titulo-resultado">
          <h3 id="titulo-resultado" ref={resultado} tabIndex={-1}>
            <span aria-hidden="true">{info.signo}</span>
            {info.titulo}
          </h3>
          <p>{info.explicacion}</p>
          {monto && (
            <p>
              Monto del pedido: <span className="monto">{conMiles(monto)} XLM</span>
            </p>
          )}
        </div>
      )}

      <details className="ayuda">
        <summary>¿Para qué me sirve esto?</summary>
        <ul>
          <li>
            Antes de cargar el camión sabés si la plata está apartada de verdad, sin depender de una
            promesa.
          </li>
          <li>
            Mientras el pedido está <strong>firme y guardado</strong>, el comercio no puede usar esa
            plata para otra cosa.
          </li>
          <li>
            Vos cobrás cuando el comercio confirma que recibió la mercadería. Si el pedido se
            cancela, la plata vuelve a él y no te queda ninguna deuda.
          </li>
          <li>Podés consultar las veces que quieras: es gratis y no necesitás cuenta.</li>
        </ul>
      </details>
    </section>
  );
}
