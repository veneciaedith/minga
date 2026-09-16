// =====================================================================
//  Lenguaje claro y prevención de errores
//
//  Este archivo concentra dos cosas que antes estaban dispersas:
//
//  1. Las validaciones que se hacen ANTES de tocar la red, para que
//     nadie descubra que se equivocó recién cuando le aparece el
//     cartel de la billetera. (Heurística 5 — prevención de errores)
//
//  2. La traducción de los errores técnicos a algo que Rosa pueda
//     leer y resolver sola. Un mensaje útil dice qué pasó, por qué y
//     qué hacer ahora. (Heurística 9 — reconocer y recuperarse)
//
//  Regla de escritura de este proyecto: si una palabra no se usa en el
//  mostrador de un almacén, no va en la pantalla.
// =====================================================================

/** Alfabeto que usan las direcciones de Stellar (base32, sin 0 1 8 9). */
const BASE32 = /^[A-Z2-7]+$/;

/**
 * Revisa la billetera del proveedor.
 * Devuelve el problema en castellano, o null si está bien.
 */
export function revisarDireccion(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Falta el código de la billetera de tu proveedor.";
  if (!v.startsWith("G"))
    return "El código tiene que empezar con la letra G. Pedile a tu proveedor que te lo mande de nuevo.";
  if (v.length !== 56)
    return `El código tiene que tener 56 letras y números. Este tiene ${v.length}. Fijate que no te haya quedado cortado al copiarlo.`;
  if (!BASE32.test(v))
    return "El código tiene un carácter que no corresponde. Copialo de nuevo, sin espacios ni signos.";
  return null;
}

/**
 * Revisa el monto que se va a guardar.
 * Acepta coma o punto, porque acá se escribe "10,50".
 */
export function revisarMonto(valor: string): string | null {
  const v = valor.trim().replace(",", ".");
  if (!v) return "Falta poner cuánto vas a pagar.";
  if (!/^\d+(\.\d+)?$/.test(v))
    return "Escribí solo números. Por ejemplo: 10 o 10,50.";
  const n = Number(v);
  if (!isFinite(n) || n <= 0) return "El monto tiene que ser mayor que cero.";
  if (n > 1_000_000) return "Ese monto es demasiado grande para la prueba. Probá con uno menor.";
  const decimales = v.includes(".") ? v.split(".")[1].length : 0;
  if (decimales > 7) return "Como mucho podés poner 7 números después de la coma.";
  return null;
}

/**
 * Revisa el plazo que se da el comercio para revisar la mercadería.
 * El techo de 60 días lo pone el contrato: evita que un error de tipeo
 * (poner 300 en lugar de 3) deje la plata trabada casi un año.
 */
export function revisarPlazo(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Falta decir cuántos días te vas a tomar para revisar el pedido.";
  if (!/^\d+$/.test(v)) return "Poné solo números de días. Por ejemplo: 3.";
  const n = Number(v);
  if (n < 1) return "Tiene que ser por lo menos 1 día.";
  if (n > 60) return "Como mucho podés tomarte 60 días.";
  return null;
}

/**
 * Convierte segundos en algo que se lea de un vistazo.
 * Redondea para arriba: si faltan 3 horas y media, decimos 4 horas, para
 * que nadie crea que tiene menos tiempo del que tiene.
 */
export function tiempoRestante(segundos: number): string {
  if (segundos <= 0) return "se terminó el tiempo";
  if (segundos < 60) return "menos de un minuto";
  const minutos = Math.ceil(segundos / 60);
  if (minutos < 60) return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
  const horas = Math.ceil(minutos / 60);
  if (horas < 24) return horas === 1 ? "1 hora" : `${horas} horas`;
  const dias = Math.ceil(horas / 24);
  return dias === 1 ? "1 día" : `${dias} días`;
}

/** Revisa el número de pedido que tipea el proveedor. */
export function revisarNumeroPedido(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Falta el número de pedido. Te lo pasa el comercio que te compró.";
  if (!/^\d+$/.test(v)) return "El número de pedido son solo números, sin letras ni signos.";
  return null;
}

/** Muestra una billetera larga de forma corta, sin perder el final. */
export function direccionCorta(v: string): string {
  return v.length > 14 ? `${v.slice(0, 6)}…${v.slice(-6)}` : v;
}

/**
 * Deletrea el final de una billetera para el lector de pantalla.
 * Leer 56 caracteres de corrido no sirve; los últimos cuatro, sí.
 */
export function finalDeletreado(v: string): string {
  return v.slice(-4).split("").join(" ");
}

/** Separa los miles para que un número largo se lea de un vistazo. */
export function conMiles(v: string | number): string {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n)) return String(v);
  return n.toLocaleString("es-AR", { maximumFractionDigits: 7 });
}

// ---------------------------------------------------------------------
//  Traducción de errores
// ---------------------------------------------------------------------

interface Traduccion {
  /** Trozos de texto que aparecen en el error original. */
  busca: string[];
  /** Lo que lee la persona: qué pasó y qué hacer. */
  dice: string;
}

const TRADUCCIONES: Traduccion[] = [
  {
    busca: ["user declined", "user rejected", "denied", "rechaz", "declined access"],
    dice: "Cerraste el cartel de tu billetera sin firmar, así que no se movió ni un peso. Si querés seguir, tocá el botón de nuevo y elegí «Firmar».",
  },
  {
    busca: ["insufficient", "underfunded", "not enough", "txinsufficientbalance"],
    dice: "No te alcanza el saldo de la billetera para este pedido. Fijate el monto o cargá más fondos antes de seguir.",
  },
  {
    busca: ["account not found", "accountnotfound", "notfound", "404"],
    dice: "Esa billetera todavía no existe en la red de prueba. Revisá el código del proveedor: puede tener una letra cambiada.",
  },
  {
    busca: ["failed to fetch", "networkerror", "network request", "err_internet", "load failed"],
    dice: "No se pudo hablar con la red. Fijate si tenés internet y volvé a tocar el botón. Tu pedido no se perdió.",
  },
  {
    // Este caso es distinto de los demás: la firma YA se mandó. Decir
    // "tu plata no se movió" sería mentirle a la persona.
    busca: ["tardó demasiado en confirmar"],
    dice: "Tu firma ya salió, pero la red está tardando más de lo normal en confirmar. No vuelvas a firmar: esperá un minuto y tocá «Actualizar cómo viene» para ver si se completó.",
  },
  {
    busca: ["timeout", "timed out", "deadline"],
    dice: "La red tardó demasiado en contestar. Esperá unos segundos y probá otra vez.",
  },
  {
    busca: ["no wallet", "not connected", "no se encontr", "freighter is not"],
    dice: "No encontramos tu billetera. Tocá «Conectar mi billetera» arriba y elegí la que usás.",
  },
  // --------------------------------------------------------------
  //  Los errores que devuelve el contrato, por número.
  //
  //  El orden lo fija `Error` en contracts/escrow/src/lib.rs. Si allá
  //  se agrega o se mueve un error, ACÁ hay que cambiarlo también: un
  //  número mal traducido le dice a la persona algo que no pasó.
  // --------------------------------------------------------------
  {
    busca: ["error(contract, #1)", "already exists", "ya existe"],
    dice: "Ese número de pedido ya está usado. Tocá «Usar otro número» y creá el pedido de nuevo.",
  },
  {
    busca: ["error(contract, #2)"],
    dice: "No encontramos ningún pedido con ese número. Fijate que esté bien copiado y probá de nuevo.",
  },
  {
    busca: ["error(contract, #3)"],
    dice: "Este pedido ya no está esperando la entrega, así que esto no se puede hacer ahora. Volvé a mirar cómo viene.",
  },
  {
    busca: ["error(contract, #4)"],
    dice: "El monto tiene que ser mayor que cero.",
  },
  {
    busca: ["error(contract, #5)"],
    dice: "El plazo para revisar tiene que ser de 1 a 60 días.",
  },
  {
    busca: ["error(contract, #6)"],
    dice: "Este pedido ya se cerró antes: o se pagó o se canceló. Creá uno nuevo para seguir.",
  },
  {
    busca: ["error(contract, #7)"],
    dice: "Todavía no podés cobrar por vencimiento: al comercio le queda tiempo para revisar el pedido. En pantalla dice cuánto falta.",
  },
  {
    busca: ["error(contract, #8)"],
    dice: "Se pasó el plazo que te habías dado para objetar esta entrega. Si hay un problema con la mercadería, hablalo con tu proveedor.",
  },
  {
    busca: ["error(contract, #9)"],
    dice: "Este contrato quedó mal instalado: no sabe con qué moneda pagar. Avisale a quien lo instaló antes de usarlo.",
  },
  {
    busca: ["unauthorized", "not authorized", "invalid auth", "authentication"],
    dice: "Esta billetera no es la que corresponde para esta acción. Fijate de estar conectada con la billetera correcta: el comercio firma sus pasos y el proveedor los suyos.",
  },
  {
    busca: ["monto inválido", "monto invalido"],
    dice: "El monto no es válido. Escribí solo números, por ejemplo 10 o 10,50.",
  },
];

/**
 * Convierte cualquier error en una frase que se pueda leer y resolver.
 * Si no reconocemos el error, damos un mensaje honesto y dejamos el
 * texto original a mano para quien nos acompañe a resolverlo.
 */
export function mensajeClaro(error: unknown): string {
  const crudo =
    error instanceof Error ? error.message : typeof error === "string" ? error : String(error);
  const busqueda = crudo.toLowerCase();

  for (const t of TRADUCCIONES) {
    if (t.busca.some((b) => busqueda.includes(b))) return t.dice;
  }

  return `No pudimos completar la operación y tu plata no se movió. Probá de nuevo en un minuto. Si sigue pasando, mostrale esto a quien te ayuda: «${crudo}».`;
}
