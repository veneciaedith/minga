# 📍 Dónde estamos y qué sigue

> Última actualización: **16 de septiembre de 2026** (jornada completa)
> Equipo hoy: **Cintia Venecia** y **Octavio Giménez Bravo**
> Rama de trabajo: **`claude/cool-fermi-6kp11h`**

Este archivo es para retomar sin tener que recordar nada. Se actualiza al final de
cada jornada.

---

## 📋 Para pegar en una sesión nueva

Copiá este bloque tal cual y pegalo como primer mensaje:

```
Proyecto Minga (escrow en Stellar/Soroban). Retomamos trabajo anterior.

1. git checkout claude/cool-fermi-6kp11h && git pull origin claude/cool-fermi-6kp11h
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
2. Traé los cambios: `git checkout claude/cool-fermi-6kp11h && git pull origin claude/cool-fermi-6kp11h`
3. Comprobá que todo está sano: `cd contracts/escrow && cargo test` → **tienen que pasar 29 tests**.

> 📱 **Desde el celular** no se pueden correr comandos ni tests. Para solo leer este
> archivo formateado:
> https://github.com/veneciaedith/minga/blob/claude/cool-fermi-6kp11h/ESTADO-Y-PROXIMOS-PASOS.md
> (conviene guardarlo en favoritos)

---

## 🚨 Lo más importante antes de tocar nada

**El código del contrato y el contrato que está en la red YA NO SON EL MISMO.**

| | Qué hay |
|---|---|
| **En la red (testnet)** | El contrato **viejo**: `CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N` |
| **En el código** | El contrato **nuevo**, con plazo, disputa y token fijo. **Sin deployar.** |
| **La app en vivo** | https://minga-r5ql.vercel.app apunta al **viejo** y funciona bien |

**Esto es a propósito.** La demo y el pedido 42 siguen andando para mostrarlos
cuando haga falta. No está roto.

**Esto ya se resolvió del lado del código (16/09).** El frontend ahora habla el
idioma del contrato nuevo:

```
Antes el frontend mandaba: (comprador, proveedor, TOKEN, monto, id_pedido)
Ahora manda, como pide el
contrato nuevo:            (comprador, proveedor, monto, id_pedido, plazo_dias)
```

Lo que queda es **el deploy**, y eso lo tiene que correr Cintia porque necesita
su billetera. Mientras tanto la app no puede operar contra la red, y lo dice con
todas las letras en vez de mostrar un error de tipos.

---

## ✅ Lo que se hizo (6 commits, todos pusheados)

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

### 1. Etapa 2 — ✅ el código está hecho (16/09). Falta el deploy, que lo corre Cintia

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

**Lo único que falta, y no lo puede hacer una sesión de IA:**

- [ ] 🔑 **Deployar el contrato nuevo a testnet.** Hace falta una billetera con
      fondos, así que **lo corre Cintia en su máquina**. El comando está en
      `COMANDOS.md` sección 2 — **ojo con el `-- --token` del final**.
- [ ] **Pegar el `CONTRACT_ID` nuevo** en `frontend/src/config.ts`. El archivo ya
      avisa, en el lugar donde se toca, que el id que está ahí es el viejo.
- [ ] **Actualizar** `README.md` y `DESPLIEGUE-TESTNET.md`, que hoy apuntan al viejo.
- [ ] **Grabar un pedido de demo nuevo** on-chain. El pedido 42 no existe en el
      contrato nuevo.

> ⚠️ **Hasta que se haga el deploy, la app no puede operar.** Habla el idioma del
> contrato nuevo y en la red está el viejo. No está rota: si alguien prueba, le va
> a aparecer *«Esta versión de Minga y el contrato instalado en la red no coinciden…
> no es nada que hayas hecho mal»*. Eso es a propósito, para que nadie se quede con
> un error incomprensible.

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

> Con esto, **el contrato ya está listo para deployar**. No quedan pendientes suyos.
> Lo que falta antes del deploy es la Etapa 2 del frontend (punto 1), porque frontend
> y deploy van juntos en el mismo paso.

> ⚠️ Detalle técnico para la próxima sesión: se usó `env.events().publish(...)`,
> que es la API del **SDK 22**, el que usa Minga. La skill oficial de Stellar
> documenta `#[contractevent]`, que existe recién en versiones posteriores del SDK.
> Si alguien copia el ejemplo de la skill tal cual, no compila.

### 3. Pendientes del frontend — ✅ CERRADO el 16/09

- [x] **La espera sin límite en `stellar.ts`.** Resuelto junto con la Etapa 2.

### 4. Opcional, para la hackathon

- [ ] **Documentar la accesibilidad en el README.** El trabajo del commit `9e912f4`
      no se ve en ningún lado, así que un jurado no se entera. Es un diferencial real
      de Minga y hoy es invisible.

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

2. **Los créditos del equipo.** El `README.md` (línea 4) y el pie de la app (`frontend/src/App.tsx:93`) dicen
   *"Cintia Venecia, Mariela Caminos, Cristina Soto y Lourdes Gimenez Bravo"*, pero el
   equipo hoy es **Cintia Venecia y Octavio Giménez Bravo**. Son nombres de personas
   reales: **decidí vos qué tiene que decir** y se cambia. No se toca por iniciativa propia.
3. **WSL, sí o no.** Está la duda desde el 14/9. El entorno de Windows ya funciona
   (Node 24, Rust, Stellar CLI 27 — ver `COMANDOS.md`), así que WSL no hace falta
   para avanzar. Sirve si el grupo de la hackathon pasa comandos de Linux.
   ⚠️ Antes de instalarlo: **liberar espacio en C:** o instalarlo en D:.
4. **¿Cuántas personas reales antes del 27/09?** Cintia puso como objetivo que la
   app la usen **7 personas reales**. Hoy hay un artefacto compartido con su
   hermano, que prueba como cliente. Falta decidir cómo se registra lo que cada
   persona dice y quién las contacta.

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

## 💡 Decidido el 17/09: el deploy va con USDC, no con XLM

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
