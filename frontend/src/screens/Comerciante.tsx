import { useCallback, useEffect, useRef, useState } from "react";
import {
  EstadoPedido,
  cancelarEscrow,
  confirmarEntrega,
  crearEscrow,
  estadoEscrow,
  objetarEntrega,
  segundosRestantes,
  sigueAbierto,
} from "../escrow";
import { Aviso, Estado, EnlaceTransaccion } from "../componentes/Estado";
import {
  conMiles,
  direccionCorta,
  finalDeletreado,
  mensajeClaro,
  revisarDireccion,
  revisarMonto,
  revisarPlazo,
  tiempoRestante,
} from "../textos";

// Lo que se recuerda entre recargas, para que nadie pierda un pedido
// por cerrar la pestaña sin querer. (Heurística 5 y 6)
const CLAVE_ID = "minga_pedido_id";
const CLAVE_CREADO = "minga_pedido_creado";
const CLAVE_DATOS = "minga_pedido_datos";

// Proveedor de ejemplo, precargado para que la prueba con comerciantes
// arranque sin tener que copiar un código de 56 letras.
const PROVEEDOR_DEMO = "GBJJK3S4FU7VCKDTPS4O4RKSFYF5EERKGIUSUY2AVZEF2CU4PMGBOXLD";

// Cada cuánto volvemos a mirar el reloj del plazo, en milisegundos.
// Un minuto alcanza: el plazo se mide en días, no en segundos.
const CADA_MINUTO = 60_000;

/**
 * Pantalla de quien compra (Rosa, la almacenera).
 *
 * El recorrido tiene tres momentos bien separados, porque acá se mueve
 * plata de verdad y nadie debería enterarse después de lo que hizo:
 *
 *   1. Cargar los datos del pedido.
 *   2. Repasar en una pantalla aparte qué se va a guardar y a quién.
 *   3. Seguir el pedido hasta el final.
 *
 * El momento 3 cambia según en qué anda el pedido, y eso lo dice la red,
 * no el navegador: el proveedor puede avisar que entregó desde su
 * teléfono, y acá hay que enterarse.
 */
export default function Comerciante({ billetera }: { billetera: string | null }) {
  const guardado = leerDatos();

  const [proveedor, setProveedor] = useState(guardado.proveedor ?? PROVEEDOR_DEMO);
  const [monto, setMonto] = useState(guardado.monto ?? "");
  // La descripción no viaja a la red: es una nota para acordarse.
  const [descripcion, setDescripcion] = useState(guardado.descripcion ?? "");
  // Cuántos días se da el comercio para revisar la mercadería.
  const [plazo, setPlazo] = useState(guardado.plazo ?? "3");

  const [idPedido, setIdPedido] = useState<number>(() => {
    const previo = seguro(() => localStorage.getItem(CLAVE_ID));
    if (previo) return Number(previo);
    const n = nuevoNumero();
    seguro(() => localStorage.setItem(CLAVE_ID, String(n)));
    return n;
  });

  const [creado, setCreado] = useState<boolean>(
    () => seguro(() => localStorage.getItem(CLAVE_CREADO)) === "true"
  );

  // En qué anda el pedido según la red. null = todavía no preguntamos.
  const [estadoRed, setEstadoRed] = useState<EstadoPedido | null>(null);
  const [restante, setRestante] = useState<number>(0);

  const [repasando, setRepasando] = useState(false);
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [errores, setErrores] = useState<{ proveedor?: string; monto?: string; plazo?: string }>({});

  const tituloEnCurso = useRef<HTMLHeadingElement>(null);
  const tituloRepaso = useRef<HTMLHeadingElement>(null);
  const campoProveedor = useRef<HTMLInputElement>(null);
  const campoMonto = useRef<HTMLInputElement>(null);
  const campoPlazo = useRef<HTMLInputElement>(null);

  // Guardamos lo cargado para que una recarga no borre el trabajo hecho.
  useEffect(() => {
    seguro(() =>
      localStorage.setItem(CLAVE_DATOS, JSON.stringify({ proveedor, monto, descripcion, plazo }))
    );
  }, [proveedor, monto, descripcion, plazo]);

  // Cuando cambia el momento del recorrido, el foco acompaña. Si no,
  // quien usa lector de pantalla se queda leyendo la pantalla anterior.
  useEffect(() => {
    if (repasando) tituloRepaso.current?.focus();
  }, [repasando]);

  useEffect(() => {
    if (creado) tituloEnCurso.current?.focus();
  }, [creado]);

  /** Le pregunta a la red en qué anda el pedido y cuánto tiempo queda. */
  const mirarLaRed = useCallback(async () => {
    try {
      const st = await estadoEscrow(idPedido);
      setEstadoRed(st);
      setRestante(st === "entregado" ? await segundosRestantes(idPedido) : 0);
    } catch {
      // Si la red no contesta no rompemos la pantalla: se sigue viendo
      // lo último que supimos y el botón de actualizar queda a mano.
    }
  }, [idPedido]);

  // Mientras hay un pedido en curso, miramos la red al entrar y una vez
  // por minuto. Así el comercio se entera de que el proveedor declaró la
  // entrega sin tener que recargar la página.
  useEffect(() => {
    if (!creado) return;
    mirarLaRed();
    const reloj = setInterval(mirarLaRed, CADA_MINUTO);
    return () => clearInterval(reloj);
  }, [creado, mirarLaRed]);

  function fijarCreado(v: boolean) {
    setCreado(v);
    seguro(() => localStorage.setItem(CLAVE_CREADO, String(v)));
  }

  /** Deja listo un número nuevo para el próximo pedido. */
  function prepararSiguiente() {
    const n = nuevoNumero();
    setIdPedido(n);
    seguro(() => localStorage.setItem(CLAVE_ID, String(n)));
    fijarCreado(false);
    setRepasando(false);
    setConfirmandoCancelacion(false);
    setEstadoRed(null);
    setRestante(0);
  }

  function usarOtroNumero() {
    prepararSiguiente();
    setAviso({ tono: "neutro", texto: `Listo, ahora tu pedido es el número ${nuevoVisible()}.` });
    setHash(null);
  }

  // El número ya está en el estado cuando se muestra el aviso.
  function nuevoVisible() {
    return seguro(() => localStorage.getItem(CLAVE_ID)) ?? "";
  }

  /** Envuelve cada acción que toca la red: un solo lugar para el
   *  "estoy trabajando" y para traducir el error. */
  async function ejecutar(accion: () => Promise<string>) {
    setAviso({ tono: "trabajando", texto: "Estamos anotando esto en la red. Tarda unos segundos." });
    setHash(null);
    setCargando(true);
    try {
      setHash(await accion());
    } catch (e) {
      setAviso({ tono: "mal", texto: mensajeClaro(e) });
      // Después de un error conviene volver a mirar la red: casi siempre
      // el error es que el pedido ya está en otro momento.
      if (creado) mirarLaRed();
    } finally {
      setCargando(false);
    }
  }

  /** Revisa todo antes de pasar al repaso. Nada de esto toca la red. */
  function irAlRepaso() {
    const nuevos = {
      proveedor: revisarDireccion(proveedor) ?? undefined,
      monto: revisarMonto(monto) ?? undefined,
      plazo: revisarPlazo(plazo) ?? undefined,
    };
    setErrores(nuevos);

    if (nuevos.proveedor) {
      campoProveedor.current?.focus();
      return;
    }
    if (nuevos.monto) {
      campoMonto.current?.focus();
      return;
    }
    if (nuevos.plazo) {
      campoPlazo.current?.focus();
      return;
    }
    if (!billetera) {
      setAviso({
        tono: "mal",
        texto:
          "Antes de guardar la plata tenés que conectar tu billetera. El botón está arriba de todo.",
      });
      return;
    }
    setAviso(null);
    setRepasando(true);
  }

  const alCrear = () =>
    ejecutar(async () => {
      const previo = await estadoEscrow(idPedido);
      if (previo !== "noexiste") {
        throw new Error(
          `El pedido número ${idPedido} ya está usado. Tocá «Usar otro número» y probá de nuevo.`
        );
      }
      const h = await crearEscrow(billetera!, proveedor.trim(), monto, idPedido, Number(plazo));
      fijarCreado(true);
      setRepasando(false);
      setEstadoRed("pendiente");
      setAviso({
        tono: "bien",
        texto: `Listo. Guardamos ${conMiles(monto.replace(",", "."))} XLM para el pedido número ${idPedido}. El proveedor todavía no cobró.`,
      });
      return h;
    });

  const alConfirmar = () =>
    ejecutar(async () => {
      const estado = await estadoEscrow(idPedido);
      if (!sigueAbierto(estado)) {
        setEstadoRed(estado);
        throw new Error(
          `El pedido número ${idPedido} ya se cerró antes. Creá uno nuevo para seguir.`
        );
      }
      const h = await confirmarEntrega(billetera!, idPedido);
      setEstadoRed("liberado");
      setAviso({
        tono: "bien",
        texto: `Confirmaste que llegó el pedido número ${idPedido}. El proveedor ya cobró.`,
      });
      return h;
    });

  const alCancelar = () =>
    ejecutar(async () => {
      const estado = await estadoEscrow(idPedido);
      if (estado !== "pendiente") {
        setEstadoRed(estado);
        throw new Error(
          estado === "entregado" || estado === "disputa"
            ? `Tu proveedor ya avisó que entregó el pedido número ${idPedido}, así que no se puede cancelar. Si la mercadería no está bien, usá «Frenar el pago».`
            : `El pedido número ${idPedido} ya se cerró antes. No hay nada que cancelar.`
        );
      }
      const h = await cancelarEscrow(billetera!, idPedido);
      setEstadoRed("cancelado");
      setAviso({
        tono: "bien",
        texto: `Cancelaste el pedido número ${idPedido}. La plata volvió a tu billetera.`,
      });
      return h;
    });

  const alObjetar = () =>
    ejecutar(async () => {
      const h = await objetarEntrega(billetera!, idPedido);
      setEstadoRed("disputa");
      setRestante(0);
      setAviso({
        tono: "bien",
        texto:
          "Frenamos el pago. Tu proveedor no puede cobrar hasta que se arregle. Hablá con él: si tiene razón, podés pagarle igual; si la tenés vos, él puede devolverte la plata.",
      });
      return h;
    });

  async function copiarNumero() {
    try {
      await navigator.clipboard.writeText(String(idPedido));
      setAviso({ tono: "bien", texto: `Copiamos el número ${idPedido}. Pegalo donde lo necesites.` });
    } catch {
      setAviso({
        tono: "neutro",
        texto: `Tu teléfono no nos dejó copiar. Anotá el número a mano: ${idPedido}.`,
      });
    }
  }

  const cerrado = estadoRed !== null && !sigueAbierto(estadoRed) && estadoRed !== "noexiste";

  return (
    <section className="tarjeta" aria-labelledby="titulo-comerciante">
      {/* ---------- momento 3: el pedido ya está en curso ---------- */}
      {creado ? (
        <>
          <h2 id="titulo-comerciante" ref={tituloEnCurso} tabIndex={-1}>
            {tituloSegunEstado(estadoRed)}
          </h2>
          <p className="bajada">{bajadaSegunEstado(estadoRed)}</p>

          <NumeroDePedido id={idPedido} alCopiar={copiarNumero} />

          <ul className="pasos">
            <li className="hecho">
              <span className="signo" aria-hidden="true">
                ✓
              </span>
              <span>
                <strong>Hiciste el pedido.</strong>
                <span className="texto">
                  Número {idPedido}
                  {descripcion ? ` · ${descripcion}` : ""}
                </span>
              </span>
            </li>
            <li className="hecho">
              <span className="signo" aria-hidden="true">
                ✓
              </span>
              <span>
                <strong>Tu plata quedó guardada.</strong>
                <span className="texto">
                  {cerrado ? "Ya se resolvió: mirá el cartel de abajo." : "No se la llevó nadie todavía."}
                </span>
              </span>
            </li>
            <li className={estadoRed === "pendiente" || estadoRed === null ? "pendiente" : "hecho"}>
              <span className="signo" aria-hidden="true">
                {estadoRed === "pendiente" || estadoRed === null ? "○" : "✓"}
              </span>
              <span>
                <strong>
                  {estadoRed === "pendiente" || estadoRed === null
                    ? "Falta que llegue la mercadería."
                    : "Tu proveedor avisó que entregó."}
                </strong>
                <span className="texto">
                  {estadoRed === "pendiente" || estadoRed === null
                    ? "Cuando llegue, tocá el botón verde y el proveedor cobra. Si no llega, cancelás y la plata vuelve a tu billetera."
                    : "Ahora te toca a vos decir si está todo bien."}
                </span>
              </span>
            </li>
          </ul>

          {/* El reloj del plazo. Va fuera del cartel que se anuncia en voz
              alta: repetir "te quedan 3 días" cada minuto sería una tortura
              para quien usa lector de pantalla. */}
          {estadoRed === "entregado" && (
            <p className="plazo-restante">
              <strong>Te quedan {tiempoRestante(restante)}</strong> para decir si la mercadería está
              bien. Si no decís nada, tu proveedor va a poder cobrar igual.
            </p>
          )}

          {estadoRed === "disputa" && (
            <p className="plazo-restante">
              El pago está <strong>frenado</strong>. Nadie puede cobrar hasta que alguno de los dos
              dé el brazo a torcer.
            </p>
          )}

          <Estado aviso={aviso} cargando={cargando} />
          <EnlaceTransaccion hash={hash} />

          {cerrado ? (
            /* El pedido terminó: la única salida es empezar otro. */
            <div className="acciones">
              <button
                type="button"
                className="boton boton-principal"
                onClick={prepararSiguiente}
                disabled={cargando}
              >
                Hacer otro pedido
              </button>
            </div>
          ) : confirmandoCancelacion ? (
            /* Cancelar mueve plata: se pregunta antes, en dos pasos. */
            <div className="repaso" role="group" aria-labelledby="titulo-cancelar">
              <h3 id="titulo-cancelar">¿Cancelamos el pedido número {idPedido}?</h3>
              <p className="aclaracion">
                La plata vuelve a tu billetera y el proveedor no cobra nada. Después de esto el
                pedido se cierra y hay que hacer uno nuevo.
              </p>
              <div className="acciones">
                <button
                  type="button"
                  className="boton boton-peligro"
                  onClick={() => {
                    setConfirmandoCancelacion(false);
                    alCancelar();
                  }}
                  disabled={cargando}
                >
                  Sí, cancelar y que vuelva mi plata
                </button>
                <button
                  type="button"
                  className="boton boton-secundario"
                  onClick={() => setConfirmandoCancelacion(false)}
                  disabled={cargando}
                >
                  No, dejar el pedido como está
                </button>
              </div>
            </div>
          ) : (
            <div className="acciones">
              <button
                type="button"
                className="boton boton-principal"
                onClick={alConfirmar}
                disabled={cargando}
              >
                {estadoRed === "disputa"
                  ? "Arreglamos: pagarle al proveedor"
                  : "Ya me llegó el pedido: pagarle al proveedor"}
              </button>

              {/* Mientras el proveedor no declaró la entrega, cancelar es
                  la salida. Una vez que declaró, el contrato ya no la
                  permite: lo que corresponde es frenar el pago. */}
              {estadoRed === "entregado" && (
                <button
                  type="button"
                  className="boton boton-peligro"
                  onClick={alObjetar}
                  disabled={cargando}
                >
                  No es lo que pedí: frenar el pago
                </button>
              )}

              {(estadoRed === "pendiente" || estadoRed === null) && (
                <button
                  type="button"
                  className="boton boton-peligro"
                  onClick={() => setConfirmandoCancelacion(true)}
                  disabled={cargando}
                >
                  No llegó: cancelar y recuperar mi plata
                </button>
              )}

              <button
                type="button"
                className="boton boton-secundario"
                onClick={mirarLaRed}
                disabled={cargando}
              >
                Actualizar cómo viene
              </button>
            </div>
          )}
        </>
      ) : repasando ? (
        /* ---------- momento 2: repaso antes de mover plata ---------- */
        <>
          <h2 id="titulo-comerciante" ref={tituloRepaso} tabIndex={-1}>
            Repasá antes de guardar la plata
          </h2>
          <p className="bajada">
            Todavía no se movió nada. Mirá si está bien y recién después confirmá.
          </p>

          <div className="repaso">
            <h3>Esto es lo que va a pasar</h3>
            <p className="aclaracion">
              Se apartan <strong>{conMiles(monto.replace(",", "."))} XLM</strong> de tu billetera y
              quedan guardados. El proveedor los va a cobrar recién cuando vos confirmes que la
              mercadería llegó.
            </p>
            <dl>
              <dt>Le comprás a la billetera</dt>
              <dd>
                {direccionCorta(proveedor.trim())}
                <span className="solo-lectores">, termina en {finalDeletreado(proveedor.trim())}</span>
              </dd>
              <dt>Guardás</dt>
              <dd>{conMiles(monto.replace(",", "."))} XLM</dd>
              <dt>Para revisar la mercadería te tomás</dt>
              <dd>{Number(plazo) === 1 ? "1 día" : `${plazo} días`}</dd>
              <dt>Número de pedido</dt>
              <dd>{idPedido}</dd>
              {descripcion && (
                <>
                  <dt>Tu nota</dt>
                  <dd>{descripcion}</dd>
                </>
              )}
            </dl>
            <div className="acciones">
              <button
                type="button"
                className="boton boton-principal"
                onClick={alCrear}
                disabled={cargando}
              >
                Está bien: guardar la plata
              </button>
              <button
                type="button"
                className="boton boton-secundario"
                onClick={() => setRepasando(false)}
                disabled={cargando}
              >
                Volver y corregir
              </button>
            </div>
          </div>

          <Estado aviso={aviso} cargando={cargando} />
          <EnlaceTransaccion hash={hash} />
        </>
      ) : (
        /* ---------- momento 1: cargar el pedido ---------- */
        <>
          <h2 id="titulo-comerciante">Hacer un pedido</h2>
          <p className="bajada">
            Tu plata queda guardada y el proveedor cobra recién cuando la mercadería llega.
          </p>

          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              irAlRepaso();
            }}
            noValidate
          >
            <span className="rotulo-paso">Paso 1 de 3 · Cargar el pedido</span>

            <div className="campo">
              <label htmlFor="campo-proveedor">¿A qué proveedor le comprás?</label>
              <p className="ayuda-campo" id="ayuda-proveedor">
                Pegá el código de su billetera. Son 56 letras y números y empieza con G. Se lo pedís
                a tu proveedor una sola vez.
              </p>
              <input
                id="campo-proveedor"
                ref={campoProveedor}
                value={proveedor}
                onChange={(e) => {
                  setProveedor(e.target.value);
                  if (errores.proveedor) setErrores((x) => ({ ...x, proveedor: undefined }));
                }}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={errores.proveedor ? true : undefined}
                aria-describedby={
                  errores.proveedor ? "ayuda-proveedor error-proveedor" : "ayuda-proveedor"
                }
              />
              {errores.proveedor && (
                <p className="error-campo" id="error-proveedor">
                  <span aria-hidden="true">✕</span>
                  <span>{errores.proveedor}</span>
                </p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="campo-monto">¿Cuánto le vas a pagar?</label>
              <p className="ayuda-campo" id="ayuda-monto">
                En XLM, que es la moneda de prueba de esta demostración. Podés usar coma, por ejemplo
                10,50.
              </p>
              <input
                id="campo-monto"
                ref={campoMonto}
                value={monto}
                onChange={(e) => {
                  setMonto(e.target.value);
                  if (errores.monto) setErrores((x) => ({ ...x, monto: undefined }));
                }}
                inputMode="decimal"
                placeholder="10"
                autoComplete="off"
                aria-invalid={errores.monto ? true : undefined}
                aria-describedby={errores.monto ? "ayuda-monto error-monto" : "ayuda-monto"}
              />
              {errores.monto && (
                <p className="error-campo" id="error-monto">
                  <span aria-hidden="true">✕</span>
                  <span>{errores.monto}</span>
                </p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="campo-plazo">
                ¿Cuántos días te tomás para revisar la mercadería?
              </label>
              <p className="ayuda-campo" id="ayuda-plazo">
                Cuentan desde que tu proveedor avisa que entregó. Si en ese tiempo no decís nada, él
                va a poder cobrar igual. Es para que no quede esperando para siempre si te olvidás.
                De 1 a 60 días.
              </p>
              <input
                id="campo-plazo"
                ref={campoPlazo}
                value={plazo}
                onChange={(e) => {
                  setPlazo(e.target.value);
                  if (errores.plazo) setErrores((x) => ({ ...x, plazo: undefined }));
                }}
                inputMode="numeric"
                placeholder="3"
                autoComplete="off"
                aria-invalid={errores.plazo ? true : undefined}
                aria-describedby={errores.plazo ? "ayuda-plazo error-plazo" : "ayuda-plazo"}
              />
              {errores.plazo && (
                <p className="error-campo" id="error-plazo">
                  <span aria-hidden="true">✕</span>
                  <span>{errores.plazo}</span>
                </p>
              )}
            </div>

            <div className="campo">
              <label htmlFor="campo-descripcion">¿Qué le estás comprando?</label>
              <p className="ayuda-campo" id="ayuda-descripcion">
                Es una nota para vos, para reconocer el pedido después. Podés dejarla vacía.
              </p>
              <input
                id="campo-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="2 cajones de gaseosa"
                aria-describedby="ayuda-descripcion"
              />
            </div>

            <NumeroDePedido id={idPedido} alCopiar={copiarNumero} alCambiar={usarOtroNumero} />

            <div className="acciones">
              <button type="submit" className="boton boton-principal" disabled={cargando}>
                Seguir y repasar el pedido
              </button>
            </div>
          </form>

          <Estado aviso={aviso} cargando={cargando} />
          <EnlaceTransaccion hash={hash} />

          <details className="ayuda">
            <summary>¿Cómo funciona Minga?</summary>
            <ol>
              <li>Cargás a quién le comprás y cuánto le vas a pagar.</li>
              <li>Repasás en la pantalla siguiente y confirmás.</li>
              <li>
                Tu plata queda <strong>guardada</strong>: sale de tu billetera, pero el proveedor
                todavía no la puede tocar.
              </li>
              <li>Le pasás el número de pedido para que él vea que el pago está firme.</li>
              <li>
                Cuando la mercadería llega, tocás <strong>«Ya me llegó»</strong> y recién ahí cobra.
                Si no llega, cancelás y la plata vuelve a vos.
              </li>
              <li>
                Si tu proveedor avisa que entregó y vos no decís nada en los días que elegiste, él
                puede cobrar igual. Si la mercadería está mal, <strong>frenás el pago</strong> antes
                de que se cumpla ese plazo.
              </li>
            </ol>
          </details>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Textos que cambian según en qué anda el pedido                     */
/* ------------------------------------------------------------------ */

function tituloSegunEstado(estado: EstadoPedido | null): string {
  switch (estado) {
    case "entregado":
      return "Tu proveedor dice que ya entregó";
    case "disputa":
      return "Frenaste el pago";
    case "liberado":
      return "Tu proveedor ya cobró";
    case "cancelado":
      return "El pedido se canceló";
    case "noexiste":
      return "No encontramos este pedido";
    default:
      return "Tu plata está guardada";
  }
}

function bajadaSegunEstado(estado: EstadoPedido | null): string {
  switch (estado) {
    case "entregado":
      return "Fijate si la mercadería está como la pediste y decilo acá abajo.";
    case "disputa":
      return "Nadie puede cobrar hasta que se arregle. Hablá con tu proveedor.";
    case "liberado":
      return "La plata salió hacia la billetera de tu proveedor. Este pedido terminó.";
    case "cancelado":
      return "La plata volvió a tu billetera. Este pedido terminó.";
    case "noexiste":
      return "Puede que se haya hecho con otra billetera o en otro teléfono. Podés empezar uno nuevo.";
    default:
      return "El proveedor todavía no cobró. Va a cobrar recién cuando vos digas que la mercadería llegó.";
  }
}

/* ------------------------------------------------------------------ */
/*  Piezas chicas                                                      */
/* ------------------------------------------------------------------ */

/** El número de pedido, grande y fácil de pasar. */
function NumeroDePedido({
  id,
  alCopiar,
  alCambiar,
}: {
  id: number;
  alCopiar: () => void;
  alCambiar?: () => void;
}) {
  return (
    <div className="pedido">
      <p className="numero">
        <span>Número de pedido:</span> <strong>{id}</strong>
        <button type="button" className="boton boton-secundario boton-chico" onClick={alCopiar}>
          Copiar
          <span className="solo-lectores"> el número de pedido {id}</span>
        </button>
        {alCambiar && (
          <button type="button" className="boton boton-secundario boton-chico" onClick={alCambiar}>
            Usar otro número
          </button>
        )}
      </p>
      <p className="nota">
        Pasale este número a tu proveedor. Con eso él puede mirar si el pago está firme, sin llamarte
        ni esperar tu respuesta.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Ayudantes                                                          */
/* ------------------------------------------------------------------ */

function nuevoNumero(): number {
  return Math.floor(Math.random() * 1_000_000);
}

function leerDatos(): {
  proveedor?: string;
  monto?: string;
  descripcion?: string;
  plazo?: string;
} {
  const crudo = seguro(() => localStorage.getItem(CLAVE_DATOS));
  if (!crudo) return {};
  try {
    return JSON.parse(crudo);
  } catch {
    return {};
  }
}

function seguro<T>(accion: () => T): T | undefined {
  try {
    return accion();
  } catch {
    return undefined;
  }
}
