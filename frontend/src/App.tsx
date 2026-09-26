import { useEffect, useRef, useState } from "react";
import { conectarWallet, direccionActual } from "./wallet";
import Comerciante from "./screens/Comerciante";
import Proveedor from "./screens/Proveedor";
import { CONTRACT_ID } from "./config";
import { direccionCorta, finalDeletreado } from "./textos";
import { cargarPlataDePrueba, tienePlataDePrueba } from "./stellar";
import { Aviso, Estado, avisoDeError } from "./componentes/Estado";

type Pantalla = "comerciante" | "proveedor";
type Tema = "claro" | "oscuro" | "sistema";

/** Escalones de tamaño de texto: del 90 % al 150 %. */
const ESCALAS = [0.9, 1, 1.15, 1.3, 1.5];
const CLAVE_ESCALA = "minga_escala_texto";
const CLAVE_TEMA = "minga_tema";

const PESTANAS: { id: Pantalla; titulo: string; ayuda: string }[] = [
  { id: "comerciante", titulo: "Soy del comercio", ayuda: "Hacer un pedido y pagarlo" },
  { id: "proveedor", titulo: "Soy proveedor", ayuda: "Ver cómo viene mi cobro" },
];

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("comerciante");
  const [billetera, setBilletera] = useState<string | null>(null);
  const [avisoBilletera, setAvisoBilletera] = useState<Aviso | null>(null);
  const [conectando, setConectando] = useState(false);
  // null = todavía no sabemos. false = la billetera existe en xBull o
  // Freighter, pero en la red de prueba no tiene plata y no se puede usar.
  const [tienePlata, setTienePlata] = useState<boolean | null>(null);
  const [cargandoPlata, setCargandoPlata] = useState(false);

  // Preferencias de lectura. Se guardan para no volver a configurarlas
  // en cada visita: quien necesita el texto grande lo necesita siempre.
  const [escala, setEscala] = useState<number>(() => leerGuardado(CLAVE_ESCALA, 1, ESCALAS.length - 1));
  const [tema, setTema] = useState<Tema>(() => {
    const t = seguro(() => localStorage.getItem(CLAVE_TEMA));
    return t === "claro" || t === "oscuro" ? t : "sistema";
  });

  const botonesPestana = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    document.documentElement.style.setProperty("--escala", String(ESCALAS[escala]));
    seguro(() => localStorage.setItem(CLAVE_ESCALA, String(escala)));
  }, [escala]);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === "sistema") raiz.removeAttribute("data-tema");
    else raiz.setAttribute("data-tema", tema);
    seguro(() => localStorage.setItem(CLAVE_TEMA, tema));
  }, [tema]);

  // Al abrir, vemos si la billetera ya estaba conectada de antes.
  useEffect(() => {
    direccionActual().then(setBilletera).catch(() => setBilletera(null));
  }, []);

  // Apenas hay billetera, miramos si tiene plata de prueba. Mejor
  // avisarlo ahora que cuando la persona ya cargó todo el pedido.
  // (Heurística 5 — prevención de errores)
  useEffect(() => {
    setTienePlata(null);
    if (!billetera) return;
    let vigente = true;
    tienePlataDePrueba(billetera)
      .then((si) => vigente && setTienePlata(si))
      .catch(() => {
        // Sin internet no sabemos: mejor no mostrar nada que asustar.
      });
    return () => {
      vigente = false;
    };
  }, [billetera]);

  async function conectar() {
    setAvisoBilletera(null);
    setConectando(true);
    try {
      setBilletera(await conectarWallet());
    } catch (e) {
      setAvisoBilletera(avisoDeError(e));
    } finally {
      setConectando(false);
    }
  }

  async function cargarPlata() {
    if (!billetera) return;
    setAvisoBilletera({ tono: "trabajando", texto: "Estamos cargando tu plata de prueba. Tarda unos segundos." });
    setCargandoPlata(true);
    try {
      await cargarPlataDePrueba(billetera);
      setTienePlata(true);
      setAvisoBilletera({
        tono: "bien",
        texto: "Listo, tu billetera ya tiene plata de prueba. Ahora podés hacer tu pedido.",
      });
    } catch (e) {
      setAvisoBilletera(avisoDeError(e));
    } finally {
      setCargandoPlata(false);
    }
  }

  /** Flechas izquierda y derecha para moverse entre pestañas, como
   *  espera cualquier lector de pantalla. (WAI-ARIA: patrón tabs) */
  function teclasPestana(ev: React.KeyboardEvent, indice: number) {
    const paso = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
    if (!paso) return;
    ev.preventDefault();
    const siguiente = (indice + paso + PESTANAS.length) % PESTANAS.length;
    setPantalla(PESTANAS[siguiente].id);
    botonesPestana.current[siguiente]?.focus();
  }

  const faltaConfigurar = CONTRACT_ID.startsWith("PEGA_AQUI");

  return (
    <div className="app">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>

      <div className="barra-superior">
        <div className="marca">
          <svg
            className="marca-logo"
            width="40"
            height="40"
            viewBox="0 0 34 34"
            role="img"
            aria-label="Minga"
          >
            <rect width="34" height="34" rx="9" fill="var(--teal)" />
            <path d="M13 7h8v3h3v3h3v8h-3v3h-3v3h-8v-3h-3v-3H7v-8h3v-3h3z" fill="var(--ocre)" />
            <rect x="15" y="15" width="4" height="4" rx="1" fill="var(--terracota)" />
          </svg>
          <div>
            <h1>Minga</h1>
            <p>Tu plata queda guardada hasta que llega el pedido</p>
          </div>
        </div>

        <div className="ajustes">
          <span className="solo-lectores" id="rotulo-ajustes">
            Cómo se ve la pantalla
          </span>
          <button
            type="button"
            className="chico"
            onClick={() => setEscala((n) => Math.max(0, n - 1))}
            disabled={escala === 0}
            aria-describedby="rotulo-ajustes"
          >
            A−<span className="solo-lectores"> achicar el texto</span>
          </button>
          <button
            type="button"
            className="grande"
            onClick={() => setEscala((n) => Math.min(ESCALAS.length - 1, n + 1))}
            disabled={escala === ESCALAS.length - 1}
            aria-describedby="rotulo-ajustes"
          >
            A+<span className="solo-lectores"> agrandar el texto</span>
          </button>
          <button
            type="button"
            onClick={() => setTema((t) => (t === "oscuro" ? "claro" : "oscuro"))}
            aria-describedby="rotulo-ajustes"
          >
            <span aria-hidden="true">{tema === "oscuro" ? "☀" : "☾"}</span>
            <span className="solo-lectores">
              {tema === "oscuro" ? "Cambiar a fondo claro" : "Cambiar a fondo oscuro"}
            </span>
          </button>
        </div>
      </div>

      {/* Este aviso es para quien instala la app, no para Rosa. */}
      {faltaConfigurar && (
        <div className="aviso-config" role="alert">
          <span className="signo" aria-hidden="true">
            !
          </span>
          <p>
            <strong>Falta configurar la app.</strong> Poné el <code>CONTRACT_ID</code> del contrato
            en <code>src/config.ts</code> antes de usarla.
          </p>
        </div>
      )}

      <section className="billetera" aria-labelledby="titulo-billetera">
        <p className="titulo" id="titulo-billetera">
          <span aria-hidden="true">{billetera ? "✓" : "○"}</span>
          {billetera ? "Tu billetera está conectada" : "Todavía no conectaste tu billetera"}
        </p>

        {billetera ? (
          <>
            <p className="detalle">
              Es la que termina en{" "}
              <code>{direccionCorta(billetera)}</code>
              <span className="solo-lectores">, termina en {finalDeletreado(billetera)}</span>. Desde
              ahí sale la plata de los pedidos.
            </p>
            {/* Sin este botón, si la billetera dejaba de responder no había cómo
                volver a elegirla: la app decía «conectada» y no ofrecía salida. */}
            {/* En la prueba con un usuario real, este fue el paso que faltaba:
                xBull le mostraba la cuenta creada, y Minga decía que no existía.
                Ahora se dice qué falta y se resuelve con un toque. */}
            {tienePlata === false && (
              <div className="falta-plata">
                <p>
                  <strong>Tu billetera está creada, pero todavía no tiene plata de prueba.</strong>{" "}
                  Sin eso no se puede hacer un pedido. La plata de prueba es gratis y no es plata
                  real.
                </p>
                <button
                  type="button"
                  className="boton boton-principal boton-chico"
                  onClick={cargarPlata}
                  disabled={cargandoPlata}
                >
                  {cargandoPlata ? "Cargando…" : "Cargar plata de prueba"}
                </button>
                <p className="detalle">
                  Si usás xBull y ahí te sigue apareciendo 0, es porque xBull muestra la red real.
                  Para verla, cambiá la red a «Testnet»: menú ☰, Ajustes, Cuenta y Horizonte, Nodo de
                  red.
                </p>
              </div>
            )}
            <button
              type="button"
              className="boton boton-secundario boton-chico"
              onClick={conectar}
              disabled={conectando}
            >
              {conectando ? "Abriendo tu billetera…" : "Cambiar de billetera"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="boton boton-principal boton-chico"
              onClick={conectar}
              disabled={conectando}
            >
              {conectando ? "Abriendo tu billetera…" : "Conectar mi billetera"}
            </button>
            <p className="detalle">
              La billetera es la aplicación donde tenés tu plata digital. Minga no la guarda ni la
              puede tocar: solo te pide permiso cada vez que hay que mover algo.
            </p>
          </>
        )}
      </section>

      {/* Los avisos que cambian solos se anuncian al lector de pantalla. */}
      <Estado aviso={avisoBilletera} cargando={cargandoPlata} />

      <nav className="pestanas" role="tablist" aria-label="Elegí quién sos">
        {PESTANAS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`pestana-${p.id}`}
            aria-controls={`panel-${p.id}`}
            aria-selected={pantalla === p.id}
            tabIndex={pantalla === p.id ? 0 : -1}
            ref={(el) => {
              botonesPestana.current[i] = el;
            }}
            onClick={() => setPantalla(p.id)}
            onKeyDown={(ev) => teclasPestana(ev, i)}
          >
            {p.titulo}
            {pantalla === p.id && <span className="solo-lectores"> (estás acá)</span>}
            <span className="solo-lectores">. {p.ayuda}</span>
          </button>
        ))}
      </nav>

      <main id="contenido">
        <div
          role="tabpanel"
          id="panel-comerciante"
          aria-labelledby="pestana-comerciante"
          hidden={pantalla !== "comerciante"}
        >
          {pantalla === "comerciante" && <Comerciante billetera={billetera} />}
        </div>
        <div
          role="tabpanel"
          id="panel-proveedor"
          aria-labelledby="pestana-proveedor"
          hidden={pantalla !== "proveedor"}
        >
          {pantalla === "proveedor" && <Proveedor billetera={billetera} />}
        </div>
      </main>

      <footer className="pie">
        <p>
          Prueba abierta de Minga sobre la red de ensayo de Stellar. La plata que se mueve acá es de
          práctica.
        </p>
        <p>
          Hecho por Cintia Venecia y Octavio Giménez Bravo.
        </p>
      </footer>
    </div>
  );
}

/** Lee un número guardado en el navegador sin romperse si no se puede. */
function leerGuardado(clave: string, porDefecto: number, maximo: number): number {
  const crudo = seguro(() => localStorage.getItem(clave));
  if (crudo === null || crudo === undefined) return porDefecto;
  const n = parseInt(crudo, 10);
  if (Number.isNaN(n)) return porDefecto;
  return Math.min(maximo, Math.max(0, n));
}

/** Algunos navegadores bloquean el almacenamiento: no es motivo para fallar. */
function seguro<T>(accion: () => T): T | undefined {
  try {
    return accion();
  } catch {
    return undefined;
  }
}
