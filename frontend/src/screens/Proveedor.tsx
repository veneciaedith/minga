import { useRef, useState } from "react";
import {
  DatosEscrow,
  EstadoPedido,
  detalleEscrow,
  devolverFondos,
  estadoEscrow,
  marcarEntregado,
  puedeReclamar,
  reclamarPago,
  segundosRestantes,
  stroopsAXlm,
} from "../escrow";
import { Aviso, Estado, EnlaceTransaccion } from "../componentes/Estado";
import {
  conMiles,
  direccionCorta,
  mensajeClaro,
  revisarNumeroPedido,
  tiempoRestante,
} from "../textos";

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
  entregado: {
    signo: "◐",
    titulo: "Avisaste que entregaste",
    explicacion:
      "Ahora el comercio tiene un tiempo para revisar la mercadería. Si confirma, cobrás en el momento. Si deja pasar ese tiempo sin decir nada, podés cobrar igual: no quedás esperando para siempre.",
  },
  disputa: {
    signo: "!",
    titulo: "El comercio frenó el pago",
    explicacion:
      "Dice que la mercadería no está como la pidió. Hasta que se arregle, nadie cobra. Hablá con el comercio: si tiene razón, podés devolverle la plata; si la tenés vos, él puede pagarte igual.",
  },
  liberado: {
    signo: "✓",
    titulo: "Ya cobraste",
    explicacion: "La plata salió hacia tu billetera. Este pedido terminó.",
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
 * Mirar cómo viene un pedido no pide billetera ni cuesta nada: eso sigue
 * igual y es lo primero que ve cualquiera.
 *
 * Lo que sí pide billetera es ACTUAR: avisar que entregó, cobrar cuando
 * se cumplió el plazo, o devolver la plata. Son acciones que mueven
 * dinero, así que las tiene que firmar él y nadie más.
 */
export default function Proveedor({ billetera }: { billetera: string | null }) {
  const [numero, setNumero] = useState("");
  const [idConsultado, setIdConsultado] = useState<number | null>(null);
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const [datos, setDatos] = useState<DatosEscrow | null>(null);
  const [restante, setRestante] = useState(0);
  const [puedeCobrar, setPuedeCobrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const campo = useRef<HTMLInputElement>(null);
  const resultado = useRef<HTMLHeadingElement>(null);

  /** Trae de la red todo lo que hace falta para mostrar el pedido. */
  async function traer(id: number) {
    const st = await estadoEscrow(id);
    setEstado(st);
    setIdConsultado(id);

    if (st === "noexiste") {
      setDatos(null);
      setRestante(0);
      setPuedeCobrar(false);
      return;
    }

    setDatos(await detalleEscrow(id));
    setRestante(st === "entregado" ? await segundosRestantes(id) : 0);
    setPuedeCobrar(st === "entregado" ? await puedeReclamar(id) : false);
  }

  async function consultar() {
    const problema = revisarNumeroPedido(numero);
    setErrorCampo(problema);
    if (problema) {
      campo.current?.focus();
      return;
    }

    setEstado(null);
    setDatos(null);
    setAviso({ tono: "trabajando", texto: "Buscando el pedido en la red. Tarda unos segundos." });
    setCargando(true);

    try {
      await traer(Number(numero.trim()));
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

  /** Envuelve las acciones que mueven plata y piden firma. */
  async function actuar(accion: () => Promise<string>, exito: string) {
    setAviso({ tono: "trabajando", texto: "Estamos anotando esto en la red. Tarda unos segundos." });
    setCargando(true);
    try {
      const h = await accion();
      setHash(h);
      setAviso({ tono: "bien", texto: exito });
      if (idConsultado !== null) await traer(idConsultado);
    } catch (e) {
      setAviso({ tono: "mal", texto: mensajeClaro(e) });
    } finally {
      setCargando(false);
    }
  }

  const info = estado ? (ESTADOS[estado] ?? null) : null;

  // ¿La billetera conectada es la de este pedido? Si no lo es, no
  // mostramos botones que van a fallar: es mejor decirlo antes.
  const esMiPedido = Boolean(billetera && datos && billetera === datos.proveedor);

  return (
    <section className="tarjeta" aria-labelledby="titulo-proveedor">
      <h2 id="titulo-proveedor">¿Me van a pagar?</h2>
      <p className="bajada">
        Poné el número de pedido que te pasó el comercio y fijate cómo viene tu cobro. Para mirar no
        hace falta billetera ni contraseña, y consultar no cuesta nada.
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
      <EnlaceTransaccion hash={hash} />

      {info && (
        <div className={`resultado-estado ${estado}`} role="region" aria-labelledby="titulo-resultado">
          <h3 id="titulo-resultado" ref={resultado} tabIndex={-1}>
            <span aria-hidden="true">{info.signo}</span>
            {info.titulo}
          </h3>
          <p>{info.explicacion}</p>

          {datos && (
            <p>
              Monto del pedido:{" "}
              <span className="monto">{conMiles(stroopsAXlm(datos.monto))} XLM</span>
            </p>
          )}

          {estado === "entregado" && (
            <p className="plazo-restante">
              {puedeCobrar ? (
                <>
                  <strong>Se cumplió el plazo</strong> y el comercio no dijo nada. Ya podés cobrar.
                </>
              ) : (
                <>
                  Al comercio le quedan <strong>{tiempoRestante(restante)}</strong> para revisar la
                  mercadería.
                </>
              )}
            </p>
          )}

          {/* ---------- lo que puede hacer, si es su pedido ---------- */}
          {estado !== "liberado" && estado !== "cancelado" && estado !== "noexiste" && (
            <div className="acciones">
              {!billetera ? (
                <p className="nota">
                  Para avisar que entregaste o para cobrar, primero conectá tu billetera con el botón
                  de arriba de todo. Para mirar cómo viene el pedido no hace falta.
                </p>
              ) : !esMiPedido ? (
                <p className="nota">
                  Este pedido es para otra billetera
                  {datos ? ` (${direccionCorta(datos.proveedor)})` : ""}. Conectate con la billetera
                  a la que el comercio le hizo el pedido.
                </p>
              ) : (
                <>
                  {estado === "pendiente" && (
                    <button
                      type="button"
                      className="boton boton-principal"
                      onClick={() =>
                        actuar(
                          () => marcarEntregado(billetera!, idConsultado!),
                          "Avisaste que entregaste. Ahora el comercio tiene su plazo para revisar, y si no dice nada vas a poder cobrar igual."
                        )
                      }
                      disabled={cargando}
                    >
                      Ya entregué la mercadería
                    </button>
                  )}

                  {estado === "entregado" && puedeCobrar && (
                    <button
                      type="button"
                      className="boton boton-principal"
                      onClick={() =>
                        actuar(
                          () => reclamarPago(billetera!, idConsultado!),
                          "Cobraste. La plata salió hacia tu billetera."
                        )
                      }
                      disabled={cargando}
                    >
                      Cobrar ahora
                    </button>
                  )}

                  {(estado === "entregado" || estado === "disputa") && (
                    <button
                      type="button"
                      className="boton boton-secundario"
                      onClick={() =>
                        actuar(
                          () => devolverFondos(billetera!, idConsultado!),
                          "Devolviste la plata al comercio. El pedido quedó cerrado."
                        )
                      }
                      disabled={cargando}
                    >
                      Devolverle la plata al comercio
                    </button>
                  )}

                  <button
                    type="button"
                    className="boton boton-secundario"
                    onClick={() => idConsultado !== null && traer(idConsultado)}
                    disabled={cargando}
                  >
                    Actualizar cómo viene
                  </button>
                </>
              )}
            </div>
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
            Cuando entregás, avisás acá. Desde ese momento el comercio tiene un plazo para revisar.
            Si lo deja pasar sin decir nada, <strong>cobrás igual</strong>: su silencio ya no te
            deja esperando.
          </li>
          <li>
            Si el comercio dice que algo está mal, la plata queda frenada hasta que se arreglen. Vos
            también podés devolverla si preferís cortar por lo sano.
          </li>
          <li>Mirar cómo viene un pedido es gratis y no necesitás cuenta.</li>
        </ul>
      </details>
    </section>
  );
}
