import { EXPLORER_TX } from "../config";
import { esCancelacion, mensajeClaro } from "../textos";

/**
 * Piezas que comparten las dos pantallas.
 *
 * Están acá para que el comercio y el proveedor vean exactamente el
 * mismo cartel ante la misma situación. Que dos pantallas de la misma
 * app digan lo mismo de dos maneras distintas confunde.
 * (Heurística 4 — consistencia y estándares)
 */

export type Tono = "trabajando" | "bien" | "mal" | "neutro";

export interface Aviso {
  tono: Tono;
  texto: string;
}

/**
 * Arma el aviso para un error. Si la persona cerró su billetera, no es
 * una falla: va sin rojo y sin alarma, para que no crea que perdió plata.
 */
export function avisoDeError(error: unknown): Aviso {
  return { tono: esCancelacion(error) ? "neutro" : "mal", texto: mensajeClaro(error) };
}

/**
 * Qué está pasando, siempre a la vista y siempre anunciado en voz alta
 * por el lector de pantalla. (Heurística 1 — visibilidad del estado)
 *
 * Los errores usan `role="alert"` porque no pueden esperar; el resto
 * usa `role="status"`, que avisa sin interrumpir lo que se está leyendo.
 */
export function Estado({ aviso, cargando = false }: { aviso: Aviso | null; cargando?: boolean }) {
  return (
    <div role={aviso?.tono === "mal" ? "alert" : "status"} aria-live="polite">
      {aviso && (
        <div className={`estado-sistema ${aviso.tono === "neutro" ? "" : aviso.tono}`}>
          {cargando ? (
            <span className="latido" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : (
            <span className="signo" aria-hidden="true">
              {aviso.tono === "bien" ? "✓" : aviso.tono === "mal" ? "✕" : "·"}
            </span>
          )}
          <p>{aviso.texto}</p>
        </div>
      )}
    </div>
  );
}

/** El comprobante en la red, para quien quiera verificarlo por su cuenta. */
export function EnlaceTransaccion({ hash }: { hash: string | null }) {
  if (!hash) return null;
  return (
    <p className="enlace-transaccion">
      <a href={`${EXPLORER_TX}/${hash}`} target="_blank" rel="noreferrer">
        Ver el comprobante en la red
      </a>
      <span className="solo-lectores"> (se abre en una pestaña nueva)</span>
      <span aria-hidden="true"> ↗</span>
    </p>
  );
}
