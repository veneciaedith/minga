# 📍 Dónde estamos y qué sigue

> Última actualización: **23 de noviembre de 2026**
> Equipo hoy: **Cintia Venecia** y **Octavio Giménez Bravo**
> Rama principal: **`main`**. Cada sesión de IA trabaja en una rama propia y se une
> a `main` con un *pull request*. La rama vieja `claude/cool-fermi-6kp11h` ya no existe.

Este archivo es para retomar sin tener que recordar nada. Se actualiza al final de
cada jornada.

---

## 📋 Para pegar en una sesión nueva

Copiá este bloque tal cual y pegalo como primer mensaje:

```
Proyecto Minga (escrow en Stellar/Soroban). Retomamos trabajo anterior.

1. git checkout main && git pull origin main
2. Leé ESTADO-Y-PROXIMOS-PASOS.md — tiene todo el estado, los pendientes y las
   decisiones ya tomadas.
3. Confirmame que lo leíste y decime cuál es el próximo paso según ese archivo.

Importante: preguntame antes de construir. Lenguaje claro, no tengo formación técnica.
```

**Por qué así y no pegando todo el contexto:** son unas 80 palabras. La sesión lee
este archivo de una sola vez y ya sabe todo, en lugar de gastar tokens en que vos
le expliques de nuevo dónde quedamos.

Si la sesión NO tiene el repo a mano (un chat común, u otra IA), ahí sí hay que
pegarle el contexto en el mensaje: pedile a Claude Code "armame el bloque largo
para pegar en una sesión sin repo" y lo genera desde este archivo.

---

## ⚡ Los tres pasos, si preferís a mano

1. Abrí Claude Code en la carpeta `minga` y decí: **"leé ESTADO-Y-PROXIMOS-PASOS.md y seguimos"**.
2. Traé los cambios: `git checkout main && git pull origin main`
3. Comprobá que todo está sano: `cd contracts/escrow && cargo test` → **tienen que pasar 29 tests**.

> 📱 **Desde el celular** no se pueden correr comandos ni tests. Para solo leer este
> archivo formateado:
> https://github.com/veneciaedith/minga/blob/main/ESTADO-Y-PROXIMOS-PASOS.md
> (conviene guardarlo en favoritos)

---

## 🆕 Lo que pasó después del 24/09

### Entrega del Argentina Builder Challenge (27/09) — hecha

- **Pruebas con personas reales** (26/09), registradas en `entrevistas/`:
  - **Ruperto, CompraLinda** (electrónica, hermano de Cintia): prueba de uso desde el
    celular, sin ayuda. **No llegó a hacer el pedido** y le puso 3/5 de facilidad. Se
    trabó buscando la billetera xBull en Play Store. Detalle en
    `entrevistas/entrevista-compralinda.md`.
  - **Antonio y Nelly** (artículos de limpieza): entrevista, en
    `entrevistas/entrevista-antonio-y-nelly.md`.
  - El protocolo de prueba y la plantilla para registrar cada una están en
    `entrevistas/prueba-usuario.md` y `entrevistas/plantilla-evidencia-prueba.md`.
- **La app**: botón para cargar plata de prueba (Friendbot), aviso claro si se cierra
  la billetera, **ya no dice «XLM» en pantalla**, y el resumen del pedido se lee bien
  en el celular.
- **Guion del video** nuevo (2:30, narrado en inglés) y **video demo** en
  https://youtube.com/shorts/dZOcmdeODEs
- **Presentación** en el repo: `presentacion/Minga-Pitch-Deck.pdf` y `.pptx`.
- **README en inglés** (`README.md`), con la versión en castellano en `README.es.md`.
  Tiene los mapas del recorrido del pedido dibujados con Mermaid, y apunta al
  contrato nuevo y a los pedidos de demo.

### Octubre

- **02–03/10 — Video hecho con Remotion** (120 s, 1920×1080), con música y cortes al
  ritmo de la canción. Está en `video/`.
- **02/10 — README con estética nueva**: portada, índice, secciones numeradas y los
  enlaces arriba de todo.
- **21/10 — Seguridad de la app**: se actualizaron piezas del frontend que tenían
  fallas conocidas (`npm audit fix`).
- **21/10 — `SECURITY.md`**: explica cómo avisar de una falla en privado, sin
  publicarla.

Desde el 21/10 no hubo cambios.

---

## ✅ El deploy ya está hecho (22/09/2026)

**El código del contrato y el contrato que está en la red son el mismo.**

| | Qué hay |
|---|---|
| **En la red (testnet)** | El contrato **nuevo**: `CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G` |
| **En el código** | El mismo, con plazo, disputa, avisos y moneda fija |
| **La app en vivo** | https://minga-r5ql.vercel.app apunta al **nuevo** y carga sin el aviso de versiones |
| **Cuenta que lo instaló** | `GD5TCMAA3PHUFOCRVVJLSXVGW5QY3SZJ4UVXC6VNL6A3KXEVKB36Q7KI` (alias `rosa` en el CLI) |

Se verificó con `get_token`: devuelve el XLM nativo de testnet, así que la moneda quedó
bien fijada. Las transacciones están en `DESPLIEGUE-TESTNET.md`.

**Cómo se hizo, por si hay que repetirlo:** el contrato se compiló en la sesión de IA y
el `.wasm` se le pasó a Cintia, así que en su notebook **solo hizo falta instalar el
CLI de Stellar** (`winget install --id Stellar.StellarCLI`). No hizo falta Rust ni
clonar el repo. Los pasos completos están en `DEPLOY-AHORA.md`.

### ✅ Primer pedido real en el contrato nuevo (23/09/2026)

**Pedido 129183 — 10 XLM guardados, estado Pendiente.** Hecho desde el celular de
Cintia, con xBull. Queda así a propósito: es la demo de «la plata está guardada,
esperando la mercadería». **No confirmarlo ni cancelarlo.**

Cómo quedó armado el celular, por si hay que repetirlo:

- Billetera **xBull** (web, `wallet.xbull.app`), con la cuenta `rosa` importada por
  **clave secreta** (no por frase de palabras). Red: **Red de prueba**, se cambia en
  ☰ → Ajustes → *Cuenta y Horizonte* → *Nodo de red*.
- Abrir Minga en **Chrome**, no desde el link de WhatsApp: el navegador interno rompe
  las ventanas de las billeteras.

Lo que se encontró probando, y hay que contar en el pitch:

- **Albedo no funciona en el celular** (queda en blanco). xBull sí.
- **Crear una billetera es una pared**: frase de 24 palabras en inglés, un campo que
  pide una palabra por vez sin decirlo. Tres intentos fallidos.
- **La pantalla de firma es ilegible** para alguien sin formación técnica.
- xBull arranca en la **red real**; hay que cambiarla a mano.
- → Por eso la hoja de ruta propone **cuentas con huella (passkeys)**.

Tres errores de la app que aparecieron y quedaron arreglados:

- Los errores de la billetera se mostraban como `[object Object]`.
- Al recargar, la app volvía a elegir Freighter por su cuenta y no se podía firmar.
- Con la billetera «conectada» no había cómo volver a elegirla: ahora hay un botón
  **«Cambiar de billetera»**.

### ✅ Checkpoint del jueves 24/09 — cumplido

Recorrido de punta a punta probado dos veces más, desde el celular:

- **287573** y **125388**, los dos llegaron hasta «Pago liberado» (crear pedido →
  el proveedor avisa que entregó → confirmar → el proveedor cobra).
- **129183** queda en Pendiente, a propósito, como demo de «la plata está guardada».
- Comprobante público del pedido 125388 sumado a `DESPLIEGUE-TESTNET.md`.
- Pie de la app actualizado con el equipo actual (Cintia y Octavio).
- Primer borrador del guion de pitch, en PDF, listo para la llamada de las 11.

### Lo que sigue, en orden (actualizado el 23/11)

1. **El historial de pedidos leído desde la red**, usando los avisos que el contrato
   ya publica. Es el primer punto de la hoja de ruta del README.
2. **Hacer más fácil conseguir la billetera.** Fue lo que trabó a Ruperto. Va de la
   mano con las **cuentas con huella (passkeys)** de la hoja de ruta.
3. **Más pruebas con personas reales**, siguiendo `entrevistas/prueba-usuario.md`.
   Hasta ahora hay una prueba de uso registrada.

> ✅ Ya hecho de la lista anterior: pruebas con usuarios (26/09), video y deck
> (27/09), y la pantalla del resumen del pedido en el celular (27/09).

**Del 16/09, como registro.** El frontend habla el idioma del contrato nuevo:

```
Antes el frontend mandaba: (comprador, proveedor, TOKEN, monto, id_pedido)
Ahora manda, como pide el
contrato nuevo:            (comprador, proveedor, monto, id_pedido, plazo_dias)
```

El deploy se hizo el 22/09 y la app ya opera contra el contrato nuevo.

---

## ✅ Lo que se hizo hasta el 16/09 (registro)

| Commit | Qué |
|---|---|
| `7946357` | **Eventos y vencimiento de los datos (16/09).** El contrato ahora avisa cada cambio de estado en la red, y los pedidos se renuevan solos mientras se usen. 6 tests nuevos → **25 en total** |
| `9e912f4` | **Accesibilidad de la app.** Los avisos de pago se anuncian en voz alta (`aria-live`), foco visible con teclado, contraste del error arreglado, letra más grande, teclado numérico en el celular |
| `d0e8413` | **Plazo y disputa en el contrato.** El proveedor ya no queda rehén del silencio de Rosa |
| `4a8e675` | **`Cargo.lock` versionado.** Sin esto, una clonada nueva no compila |
| `df43ed0` | **Skill oficial de Stellar** en `.claude/skills/`. Conocimiento para la IA, no código de Minga |
| `c6712f5` | **Cierre del agujero del token falso.** El token se fija en el deploy |

---

## 🔒 Cómo funciona el escrow ahora

```
Rosa crea el pedido (elige plazo: 1 a 60 días)
        │  plata bloqueada en el contrato
        ▼
   PENDIENTE ──── Rosa confirma ────────────────────► LIBERADO (cobra el proveedor)
        │   └──── Rosa cancela ─────────────────────► CANCELADO (recupera Rosa)
        │
        │  el proveedor firma "ya entregué"
        ▼
   ENTREGADO  ← acá arranca el reloj de Rosa
        │
        ├── Rosa confirma ─────────────────────────► LIBERADO
        ├── se vence el plazo → el proveedor reclama ► LIBERADO
        ├── el proveedor se echa atrás ────────────► CANCELADO
        └── Rosa objeta (dentro del plazo)
                 ▼
            EN DISPUTA  ← plata frenada, nadie cobra
                 ├── Rosa cede y libera ───────────► LIBERADO
                 └── el proveedor cede y devuelve ─► CANCELADO
```

### Funciones del contrato (`contracts/escrow/src/lib.rs`)

**Escriben (necesitan firma):**

| Función | Quién firma | Cuándo se puede |
|---|---|---|
| `__constructor(token)` | quien deploya | una sola vez, al deployar |
| `create_escrow(comprador, proveedor, monto, id_pedido, plazo_dias)` | comprador | siempre |
| `marcar_entregado(id_pedido)` | **proveedor** | solo si está Pendiente |
| `confirm_delivery(id_pedido)` | comprador | Pendiente, Entregado o En disputa |
| `cancel_escrow(id_pedido)` | comprador | **solo si está Pendiente** |
| `objetar_entrega(id_pedido)` | comprador | solo Entregado y **dentro** del plazo |
| `reclamar_pago(id_pedido)` | **proveedor** | solo Entregado y **vencido** el plazo |
| `devolver_fondos(id_pedido)` | **proveedor** | Entregado o En disputa |

**Leen (gratis, sin firma):** `get_escrow_status`, `get_escrow`, `get_token`,
`segundos_restantes`, `puede_reclamar`

---

## 📋 Pendientes, en orden de prioridad

### 1. Etapa 2 — ✅ CERRADA (código el 16/09, deploy el 22/09)

Lo que quedó hecho y verificado:

- [x] **Billetera en la pantalla del Proveedor.** Ya puede avisar «ya entregué»,
      cobrar cuando se cumplió el plazo, y devolver la plata. Mirar cómo viene un
      pedido **sigue sin pedir billetera**, como antes.
- [x] **Campo de plazo** en la pantalla del comercio, en días (1 a 60, por defecto 3),
      con la explicación de para qué sirve.
- [x] **Botón de frenar el pago** (objetar) + cuenta regresiva con `segundos_restantes`.
- [x] **`escrow.ts` actualizado**: sin token, con `plazo_dias` y con las funciones
      nuevas (`marcar_entregado`, `objetar_entrega`, `reclamar_pago`,
      `devolver_fondos`, `segundos_restantes`, `puede_reclamar`, `get_token`).
- [x] **La pantalla del comercio le pregunta a la red** en qué anda el pedido, al
      entrar y una vez por minuto. Antes dependía de lo que recordaba el navegador,
      así que no se enteraba de que el proveedor había declarado la entrega.
- [x] **Los números de los errores del contrato**, que estaban mal traducidos. El
      error `#2` decía «este pedido ya se cerró» cuando significa «no existe».
- [x] **La espera de confirmación ya no es infinita** (era el pendiente 3 de esta
      lista). Corta a los 90 segundos y el mensaje NO dice «tu plata no se movió»,
      porque la firma ya salió: dice que no vuelva a firmar y que actualice.

**Lo que faltaba, ya hecho:**

- [x] 🔑 **Deployar el contrato nuevo a testnet** (22/09, desde la máquina de Cintia).
- [x] **Pegar el `CONTRACT_ID` nuevo** en `frontend/src/config.ts`.
- [x] **Actualizar** `README.md` y `DESPLIEGUE-TESTNET.md` (24 y 25/09).
- [x] **Grabar pedidos de demo nuevos** on-chain: 129183, 287573 y 125388.

### 2. Pendientes del contrato — ✅ CERRADOS el 16/09 (commit `7946357`)

- [x] **Renovar el TTL de los pedidos.** Hecho. Guardar un pedido y renovarle la
      fecha de vencimiento ahora son **una sola operación** (`Self::guardar`), para
      que nadie pueda agregar una función nueva y olvidarse de renovar.
- [x] **Emitir eventos.** Hecho. Cada cambio de estado publica un aviso en la red:
      `creado`, `entregado`, `objetado`, `liberado`, `cancelado`. Las direcciones
      del comprador y del proveedor van entre los **tópicos**, que es por lo que se
      filtra desde afuera: con eso la app puede pedirle a la red *"todos los pedidos
      de esta wallet"*. Los avisos de plata que se mueve llevan además un **motivo**
      (`confirmo` / `vencio` / `cancelo` / `devolvio`), porque no es lo mismo que
      Rosa confirme a que el proveedor cobre por vencimiento.

> El contrato no tiene pendientes y ya está en la red.

> ⚠️ Detalle técnico para la próxima sesión: se usó `env.events().publish(...)`,
> que es la API del **SDK 22**, el que usa Minga. La skill oficial de Stellar
> documenta `#[contractevent]`, que existe recién en versiones posteriores del SDK.
> Si alguien copia el ejemplo de la skill tal cual, no compila.

### 3. Pendientes del frontend — ✅ CERRADO el 16/09

- [x] **La espera sin límite en `stellar.ts`.** Resuelto junto con la Etapa 2.

### 4. Opcional, para la hackathon

- [x] **Documentar la accesibilidad en el README.** Hecho: sección «07 Accesibilidad»
      del README, y el detalle en `docs/diseno-accesible.md`.

---

## ❓ Decisiones que esperan a Cintia

1. ✅ **RESUELTO el 16/09 — las dos ramas ya están unidas.** Esta rama tiene ahora
   el contrato bueno **y** el rediseño completo de la app. Se tomó la versión del
   rediseño en los cuatro archivos que chocaban. El contrato no se tocó.

   Verificado sobre el resultado, no sobre las partes: `npm run build` sin errores,
   42/42 pares de contraste, 17/17 revisiones de accesibilidad en verde contra la
   app construida en un navegador real, y 25/25 tests del contrato.

   > La rama `claude/mockup-link-rd56g2` queda como registro histórico. **No hay que
   > seguir trabajando ahí**: todo lo suyo ya está acá.

2. ✅ **RESUELTO — los créditos del equipo.** El README y el pie de la app ya dicen
   **Cintia Venecia y Octavio Giménez Bravo**.
3. **WSL, sí o no.** Está la duda desde el 14/9. El entorno de Windows ya funciona
   (Node 24, Rust, Stellar CLI 27 — ver `COMANDOS.md`), así que WSL no hace falta
   para avanzar. Sirve si el grupo de la hackathon pasa comandos de Linux.
   ⚠️ Antes de instalarlo: **liberar espacio en C:** o instalarlo en D:.
4. **¿Cuántas personas reales más?** El objetivo era que la app la usen **7 personas
   reales**. Quedó resuelto *cómo* se registra (`entrevistas/prueba-usuario.md` y la
   plantilla), y hay una prueba de uso hecha (Ruperto) y una entrevista (Antonio y
   Nelly). Falta decidir **quién contacta a las próximas y para cuándo**.

> ✅ **Resuelta:** *"¿cerrar los pendientes del contrato antes de deployar?"* — sí,
> se cerraron el 16/09. Ya se puede deployar una sola vez.

---

## 🗂️ Decisiones ya tomadas (no hace falta volver a discutirlas)

- **Trustless Work queda para después de la hackathon (16/09).** Es infraestructura
  de escrow para Stellar: contratos Soroban ya hechos, con API, hitos, disputas y
  USDC. Se lo recomendaron a Cintia en una reunión de mentoría. Es un buen consejo
  *para quien está por empezar*; Minga ya tiene su escrow terminado y probado, y
  cambiar el motor a 11 días de la entrega significa tirar lo que funciona y rehacer
  la integración por tercera vez, sin haberlo probado todavía con una sola persona.

  **Antes de adoptarlo alguna vez hay que preguntar:** ¿se puede usar el contrato sin
  su API (si hace falta una clave, hay una empresa en el medio)? ¿quién resuelve las
  disputas, hay un árbitro con poder sobre los fondos? ¿hay un administrador que pueda
  pausar o congelar? ¿cobran comisión? ¿qué licencia tiene el código? ¿está auditado?
  Las tres primeras tocan decisiones que Minga ya tomó al revés a propósito.

  Lo que juega a favor: toda la conversación con el contrato vive en **un solo
  archivo** (`frontend/src/escrow.ts`). Cambiar el motor por debajo es tocar ese
  archivo, no rehacer la app.

- **Para el pitch, nunca decir "somos los únicos".** Decir *"no encontramos un
  proyecto que combine stock barrial, pagos y reputación para microcrédito en una
  sola solución"*. Lo primero te lo voltean con un contraejemplo; lo segundo es
  verificable y es lo que la investigación en Raven realmente muestra.

- **El plazo lo elige Rosa al crear el pedido**, en días (1 a 60). Techo de 60 para
  que un error de tipeo no trabe la plata años.
- **El proveedor declara la entrega y ahí arranca el reloj.** Se descartaron las dos
  alternativas más simples: "se vence y cobra el proveedor" (Rosa pierde por un olvido)
  y "se vence y Rosa recupera" (premia la mala fe de la compradora).
- **Una disputa donde ninguno cede queda frenada para siempre.** Resolverla necesita
  un árbitro y eso está fuera del alcance del prototipo. Está anotado en el código.
- **El token se fija en el deploy y no se puede cambiar.** Un token que se puede
  cambiar es un token que se puede falsificar.
- **Sin botón de pausa y sin camino de actualización.** El checklist de seguridad los
  pide, pero los dos significan lo mismo: un administrador que puede congelar la plata
  de la gente o cambiar las reglas. Eso contradice la premisa de Minga. **Es una
  decisión, no un olvido** — conviene decirlo así ante un jurado o un auditor.
- **`Cargo.lock` se versiona.** Un contrato es un ejecutable, no una librería.
- **No copiar código de `BootNodeDev/stellar-vault-demo-dapp`**: tiene licencia
  BUSL-1.1, que no es software libre. Se mira para aprender, se escribe propio.
- **Cosmos Pay queda afuera por ahora.** Necesita un servidor con clave secreta y mete
  una empresa intermediaria, lo que contradice el README de Minga. Y **no resuelve el
  salto a pesos**: hace pagos en Stellar (SEP-7) con una capa de administración.

---

## 🛠️ Comandos que funcionan (verificados)

```bash
# Tests del contrato — tienen que pasar 29
cd contracts/escrow && cargo test

# Compilar a WASM (el formato que se sube a la red)
rustup target add wasm32-unknown-unknown   # una sola vez
cargo build --release --target wasm32-unknown-unknown

# Frontend
cd frontend && npm install && npm run build   # tsc + vite, sin errores
npm run dev                                    # para verlo en el navegador

# Las dos revisiones de accesibilidad (quedaron del rediseno)
npm run contraste       # 42 pares de color contra WCAG 2.1 AA
npm run build && npm run preview &   # la de abajo necesita la app levantada
npm run accesibilidad   # 17 revisiones en un navegador real
```

El comando de **deploy** (con el `--token`) y el de verificación con `get_token`
están en **`COMANDOS.md`, sección 2**.

---

## 🧰 La skill de Stellar (cómo usarla)

Está en `.claude/skills/` y **se carga sola** en cualquier sesión de Claude Code
abierta en `minga`. Nadie tiene que instalar nada.

Para pedirle algo puntual: `/smart-contracts`, `/dapp`, `/standards`, `/assets`,
`/data`, `/agentic-payments`, `/cross-chain`, `/zk-proofs`.

Los archivos más útiles para lo que viene:

- `.claude/skills/smart-contracts/security.md` — clases de vulnerabilidad y checklist
- `.claude/skills/smart-contracts/development.md` — storage, TTL, **eventos**, auth
- `.claude/skills/dapp/SKILL.md` — Stellar Wallets Kit, firmar, simular (etapa 2)
- `.claude/skills/standards/SKILL.md` — SEPs: **anchors, depósitos/retiros, KYC**

Origen y cómo actualizarla: `.claude/skills/NOTICE-stellar-dev-skill.md`.

**Aviso:** Stellar dice que la skill fue **generada con IA y está en revisión manual**.
Es oficial y muy buena, pero si algo suena raro hay que verificarlo.

---

## ⚠️ Tropiezos ya resueltos (para no perder tiempo de nuevo)

- **`cargo test` no compilaba** por `ed25519-dalek 3.0`, que rompe el SDK de Soroban 22.
  Resuelto versionando `Cargo.lock` (commit `4a8e675`). Si vuelve a pasar en otra
  máquina: `cargo update -p ed25519-dalek@3.0.0 --precise 2.2.0`.
- **Falta el target de WASM** en una máquina nueva: `rustup target add wasm32-unknown-unknown`.
- **Nota para el futuro:** la skill de Stellar está escrita para el SDK 27 y usa el
  target `wasm32v1-none`. Minga usa **SDK 22** y `wasm32-unknown-unknown`, y funciona.
  Actualizar el SDK es un trabajo aparte, **no** para hacer junto con el deploy.

---

## 📖 Diccionario corto

| Palabra | Qué significa, en simple |
|---|---|
| **Escrow** | Depósito en garantía. La plata queda bloqueada en el contrato, no en manos de nadie |
| **Testnet** | La red de prueba de Stellar. La plata no vale nada, sirve para ensayar |
| **WASM** | El formato compilado al que se traduce el contrato para subirlo a la red |
| **TTL** | La fecha de vencimiento que tiene cada dato guardado en la blockchain |
| **SAC** | *Stellar Asset Contract*. La forma en que un activo de Stellar (el XLM) se usa desde un contrato |
| **SEP** | Un estándar de Stellar. Por ejemplo, los "anchors" (puente a pesos) usan SEP-6 y SEP-24 |
| **Anchor** | La empresa que convierte entre pesos y cripto. **Es la pieza que Minga todavía no tiene** |
| **Skill** | Un paquete de conocimiento que se le da a la IA. No es código de la app |

---

## 🔒 Seguridad: revisión hecha el 17/09

Está en **[`docs/revision-seguridad.md`](docs/revision-seguridad.md)**. Resumen: no se
encontró ninguna forma de que alguien se lleve plata que no es suya. Seis hallazgos,
ninguno crítico. Hay una **decisión de producto pendiente** (hallazgo 3): una disputa
sin acuerdo congela la plata para siempre, y sin pausa ni actualización un error
posterior al deploy no se puede arreglar.

Se agregaron **tests de propiedades** (`contracts/escrow/src/propiedades.rs`) y se
comprobó que sirven rompiendo el contrato a propósito dos veces: los detectó las dos.

Falta: correr **Scout** en la máquina de Cintia (acá pide una versión de Rust más
nueva), medir la concurrencia, y una **auditoría externa antes de cualquier peso
real** — el [Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank) de
la SDF subsidia auditorías para proyectos financiados por el SCF.

---

## 🧰 Integraciones que recomendaron en el workshop

Anotadas en **[`docs/integraciones-recomendadas.md`](docs/integraciones-recomendadas.md)**
(Bloque 6, 17/09). Resumen: de la primera categoría **ya cumplimos** (Freighter y
Stellar Wallets Kit). Las dos que podrían cambiar de verdad quién puede usar Minga
son **Privy** (entrar con email, sin instalar billetera ni guardar frase de
recuperación) y **MoneyGram** (entrar y salir en **efectivo**, sin cuenta bancaria).
Las dos son para después del 27/09.

---

## 💡 USDC: decidido el 17/09, todavía no aplicado

> **Cómo quedó de verdad:** el deploy del 22/09 se hizo con **XLM** (se verificó con
> `get_token`). La app ya no
> muestra «XLM» en pantalla, pero por debajo sigue moviendo XLM. **Pasar a USDC
> necesita un deploy nuevo** (el token se fija al instalar y no se cambia) y está en
> la hoja de ruta del README. Lo de abajo es el razonamiento, que sigue valiendo.

Dos razones, y la segunda es la que pesa:

1. El XLM sube y baja. Si Rosa aparta plata para un pedido, puede recibir mercadería
   por un valor distinto al que apartó. Un dólar digital no tiene ese problema.
2. **La salida a efectivo de MoneyGram funciona con USDC.** Si el escrow mueve XLM,
   hay que cambiar de moneda en el medio. Con USDC la cadena queda derecha:
   el proveedor cobra USDC → lo tiene en LOBSTR (que Minga ya soporta) → saca
   efectivo en un mostrador, sin cuenta bancaria. Ver
   [`docs/integraciones-recomendadas.md`](docs/integraciones-recomendadas.md).

**No hace falta tocar el contrato:** el token se fija al deployar. Es cambiar el
`--token` del comando de deploy y los textos que dicen «XLM» en pantalla.

> ⚠️ **Antes del deploy hay que conseguir el id del USDC de testnet.** El comando del
> `--token` que está hoy en `COMANDOS.md` es el del XLM nativo. Pedírselo a la sesión
> de IA antes de correr el deploy, o buscarlo con `stellar contract id asset`.

---

## 🎯 El hueco grande que sigue abierto

La app mueve **XLM**. Rosa piensa en **pesos**.

Ese salto —de XLM a pesos en el banco de Rosa— lo hacen los *anchors* (SEP-6 / SEP-24),
y **Minga todavía no tiene ninguno**. Es la pregunta que quedó dando vueltas en la
llamada del 14/9 y nadie contestó.

No bloquea la hackathon (la demo es en testnet), pero es lo que separa un prototipo
que funciona de algo que Rosa pueda usar de verdad.

**Dónde buscar:** https://anchors.stellar.org/?s=Argentina (ojo: las sesiones de IA
tienen ese sitio bloqueado, así que hay que mirarlo a mano y pegar lo que diga).

**Qué anotar de cada anchor que aparezca:**

1. Nombre y dominio.
2. Qué activos emite: ¿hay pesos argentinos? Hace falta el **código** (ej. `ARS`) y
   el **emisor** (una dirección que empieza con G).
3. Red: producción (*pubnet*) o prueba (*testnet*). Sin testnet no se puede ensayar.
4. Qué SEPs implementa: **6** y **24** son depósito y retiro, **31** pagos entre
   países, **12** es KYC.
5. Qué pide para operar: ¿DNI, domicilio, cuenta bancaria a nombre propio?
6. Si está activo de verdad o solo listado.

> ⚠️ **El punto 5 es el más importante y no es técnico.** Si el anchor exige DNI,
> domicilio y cuenta bancaria propia, **parte de la gente para la que Minga se
> construye queda afuera**: es justamente la economía informal. Hay que saberlo antes
> de prometer nada. No invalida el proyecto —el escrow sigue sirviendo— pero define
> hasta dónde llega.

> Si en la búsqueda aparece algo sobre **Wyre** y Argentina: es una nota de 2019 y
> esa empresa cerró en 2023. No usarla.
