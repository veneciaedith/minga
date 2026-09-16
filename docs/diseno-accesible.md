# Diseño accesible de Minga

Este documento explica **por qué la aplicación está hecha así**. Sirve para
tres cosas: que el equipo no deshaga sin querer una decisión tomada, que
cualquier persona que se sume entienda el criterio, y que en una
presentación se pueda mostrar que la accesibilidad no fue un agregado del
final.

Se apoya en dos marcos:

- **Las 10 heurísticas de usabilidad de Jakob Nielsen**, para que la
  aplicación se entienda.
- **La Convención sobre los Derechos de las Personas con Discapacidad**
  (artículos 2, 9 y 21) y el **diseño universal**, para que se entienda
  sin importar cómo ve, oye, se mueve o lee cada persona. La referencia
  técnica concreta son las WCAG 2.1 nivel AA.

---

## 1. Qué se revisó y qué se arregló

La revisión se hizo sobre la aplicación real (`frontend/src/`), no sobre
el prototipo. Cada hallazgo dice qué pasaba antes y qué pasa ahora.

### Heurística 1 — Que se vea qué está pasando

**Antes.** Mientras la red trabajaba aparecía un texto suelto,
«Procesando en la red Stellar…». Quien usa lector de pantalla no se
enteraba: el texto aparecía sin avisar. Tampoco quedaba claro en qué
momento del recorrido estaba una.

**Ahora.** Hay un único cartel de estado (`componentes/Estado.tsx`) que
acompaña cada acción y que el lector de pantalla anuncia siempre:
`role="status"` para lo que puede esperar y `role="alert"` para los
errores, que no pueden. Mientras se espera hay tres puntitos que laten, y
se detienen si la persona configuró su sistema para ver menos movimiento.
Además el formulario dice «Paso 1 de 3» y el pedido en curso muestra los
tres pasos con cuál está hecho y cuál falta.

### Heurística 2 — Hablar como habla la gente

**Antes.** La pantalla decía *escrow*, *wallet*, *XLM*, *liberar pago*,
*N° de pedido*. Son palabras de quien programa, no de quien atiende un
almacén.

**Ahora.** El vocabulario de la aplicación es:

| Antes | Ahora |
|---|---|
| Conectar wallet | Conectar mi billetera |
| Crear pedido y bloquear pago | Guardar la plata |
| Confirmar entrega (liberar pago) | Ya me llegó el pedido: pagarle al proveedor |
| Cancelar pedido (devolver fondos) | No llegó: cancelar y recuperar mi plata |
| Pendiente de entrega | Tu pago está firme y guardado |
| Wallet del proveedor (G...) | ¿A qué proveedor le comprás? |

La palabra técnica no desapareció por vergüenza: desapareció porque no
ayudaba a decidir. Donde hace falta, se explica («XLM, que es la moneda
de prueba de esta demostración»).

### Heurística 3 — Poder salir, poder deshacer

**Antes.** «Cancelar pedido» ejecutaba la cancelación en el acto. Un
toque sin querer devolvía los fondos y cerraba el pedido, sin
preguntar.

**Ahora.** Cancelar abre una pregunta aparte que dice exactamente qué va
a pasar («la plata vuelve a tu billetera y el proveedor no cobra nada»),
con dos salidas claras. Lo mismo antes de guardar la plata: hay una
pantalla de repaso de la que se puede volver a corregir.

### Heurística 4 — Que todo funcione igual en todos lados

**Antes.** Las dos pantallas mostraban los estados de maneras distintas
y los botones se numeraban sin criterio («1 ·», «2 ·», y el tercero sin
número).

**Ahora.** El cartel de estado y el enlace al comprobante son un solo
componente compartido. Las pestañas siguen el patrón estándar de
WAI-ARIA, así que se manejan con las flechas como en cualquier otra
aplicación.

### Heurística 5 — Evitar que la persona se equivoque

**Antes.** El monto era texto libre: se podía escribir «diez» y recién
fallaba cuando la billetera pedía la firma. La dirección del proveedor
no se revisaba: una letra de menos se descubría tarde.

**Ahora.** Todo se revisa **antes** de tocar la red (`textos.ts`):

- El código del proveedor tiene que empezar con G, tener 56 caracteres y
  usar el alfabeto correcto. Si no, el mensaje dice qué falta: «Este
  tiene 16. Fijate que no te haya quedado cortado al copiarlo.»
- El monto acepta coma, porque acá se escribe «10,50», y rechaza letras.
- La ayuda de cada campo va **arriba** del campo, no debajo: se lee antes
  de escribir, no después de equivocarse.
- Lo que se carga se guarda en el teléfono, así que cerrar la pestaña
  sin querer no borra el trabajo.

### Heurística 6 — Reconocer en vez de acordarse

**Antes.** Había que memorizar o anotar a mano el número de pedido para
pasárselo al proveedor.

**Ahora.** El número se muestra grande, con un botón **Copiar** y otro
para pedir uno nuevo, y al lado dice para qué sirve. En el repaso se ve
todo junto —a quién, cuánto, qué número— antes de confirmar.

### Heurística 7 — Que se pueda adaptar a cada una

**Antes.** Tema oscuro obligatorio y tamaño de letra fijo.

**Ahora.** Hay control de tamaño de texto (del 90 % al 150 %) y cambio
entre fondo claro y oscuro. Las dos preferencias se guardan: quien
necesita el texto grande lo necesita siempre, no una sola vez. Por
defecto se respeta lo que la persona ya eligió en su teléfono.

### Heurística 8 — Mostrar lo que importa

**Antes.** El aviso sobre el `CONTRACT_ID` sin configurar —un mensaje
para quien instala— aparecía en la misma pantalla que usa Rosa.

**Ahora.** Ese aviso sigue existiendo porque es útil al instalar, pero
está marcado como lo que es. La pantalla principal tiene una sola acción
importante por vez.

### Heurística 9 — Errores que se puedan resolver

**Antes.** El error era el texto crudo de la librería de Stellar, con un
`❌` adelante. Por ejemplo: `txInsufficientBalance`.

**Ahora.** `mensajeClaro()` traduce los errores más frecuentes a una
frase que dice qué pasó, qué NO pasó con la plata y qué hacer:

> Cerraste el cartel de tu billetera sin firmar, así que no se movió ni
> un peso. Si querés seguir, tocá el botón de nuevo y elegí «Firmar».

Cuando el error no se reconoce, el mensaje lo dice con honestidad, aclara
que la plata no se movió y deja el texto original a mano para quien
acompañe.

### Heurística 10 — Ayuda a mano

**Antes.** No había ninguna.

**Ahora.** Cada pantalla tiene un «¿Cómo funciona Minga?» plegable, con
el recorrido completo en cinco pasos. Está cerrado por defecto para no
estorbar a quien ya sabe.

---

## 2. Diseño universal: qué se hizo para que sirva a más gente

| Barrera | Qué se hizo |
|---|---|
| Baja visión | Texto base de 17 px, ajustable hasta 150 %. Todo el color cumple WCAG AA (ver más abajo). |
| Ceguera | Estructura con encabezados y regiones; los cambios se anuncian solos; el foco acompaña el recorrido; el código de la billetera se deletrea en vez de leerse de corrido. |
| Daltonismo | El color nunca informa solo: cada estado lleva **palabra + signo** («✓ Ya cobraste», «● Tu pago está firme y guardado»). Se entiende en blanco y negro. |
| Sin usar mouse | Todo se maneja con teclado. El foco se ve siempre, con un contorno de 3 px. El primer tabulador salta al contenido. Las pestañas responden a las flechas. |
| Pulso o motricidad | Ningún botón mide menos de 48 px de alto (el mínimo recomendado es 44). |
| Mareos, migraña, epilepsia | Si el sistema pide menos movimiento, las animaciones se apagan. |
| Lectura difícil o poca escolaridad | Frases cortas, voz activa, una idea por oración, sin palabras técnicas sin explicar. |
| Teléfono chico o viejo | Una sola columna, entra en 320 px de ancho sin scroll horizontal. |

---

## 3. Cómo comprobar que sigue estando bien

Las dos revisiones se pueden correr en cualquier momento, desde
`frontend/`:

```bash
npm run contraste      # revisa los 42 pares de color contra WCAG 2.1 AA
npm run accesibilidad  # abre la app en un navegador y revisa el uso real
```

`npm run contraste` no necesita nada instalado y termina con error si
algún color queda por debajo del mínimo. Hoy los 42 pares pasan, en tema
claro y en tema oscuro.

`npm run accesibilidad` necesita la aplicación andando
(`npm run build && npm run preview`) y comprueba 17 cosas: que el foco se
vea, que el salto al contenido funcione, que las validaciones frenen
antes de tocar la red, que el tamaño de texto se recuerde, que las
pestañas anden con las flechas, que ningún botón sea chico, que no haya
scroll horizontal a 320 px y que no haya errores en la consola. Además
deja dos capturas, una por tema.

---

## 4. Lo que falta

Ser honestas con esto también es parte del diseño:

- **No se probó con lector de pantalla real.** Las marcas ARIA están
  puestas y verificadas por código, pero falta una prueba con NVDA o con
  TalkBack, y ojalá con alguien que los use todos los días.
- **La billetera queda afuera de nuestro control.** El cartel donde se
  firma es de la billetera, no de Minga: si ese paso no es accesible, no
  lo podemos arreglar desde acá. Conviene documentar cuál billetera
  resultó más fácil en las pruebas.
- **El código de 56 caracteres sigue siendo un problema real.** Lo
  amortiguamos con validación y mensajes claros, pero la solución de
  fondo es una agenda de proveedores o un código QR.
- **Falta probar con voz.** El prototipo muestra carga por voz y por
  foto; la aplicación todavía no las tiene.
