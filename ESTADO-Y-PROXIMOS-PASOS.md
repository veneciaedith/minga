# 📍 Dónde estamos y qué sigue

> Última actualización: **15 de septiembre de 2026**
> Equipo hoy: **Cintia Venecia** y **Octavio Giménez Bravo**
> Rama de trabajo: **`claude/cool-fermi-6kp11h`**

Este archivo es para retomar sin tener que recordar nada. Se actualiza al final de
cada jornada.

---

## ⚡ Para arrancar en 30 segundos

1. Abrí Claude Code en la carpeta `minga` y decí: **"leé ESTADO-Y-PROXIMOS-PASOS.md y seguimos"**.
2. Traé los cambios: `git checkout claude/cool-fermi-6kp11h && git pull origin claude/cool-fermi-6kp11h`
3. Comprobá que todo está sano: `cd contracts/escrow && cargo test` → **tienen que pasar 19 tests**.

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

Lo que sí hay que saber: `frontend/src/escrow.ts` todavía llama al contrato viejo
y **no se puede mezclar**. Fijate la trampa:

```
Hoy el frontend manda:  (comprador, proveedor, TOKEN, monto, id_pedido)
El contrato nuevo pide: (comprador, proveedor, monto, id_pedido, plazo_dias)
```

**Son 5 argumentos en los dos casos, pero significan cosas distintas.** Si se
deploya el contrato nuevo sin tocar el frontend, la app va a fallar con un error
de tipos que no se entiende. Frontend y deploy van juntos, en el mismo paso.

---

## ✅ Lo que se hizo (5 commits, todos pusheados)

| Commit | Qué |
|---|---|
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

### 1. Etapa 2: frontend + re-deploy (el paso grande)

Va todo junto, en este orden, porque cada paso depende del anterior:

- [ ] **Wallet en la pantalla del Proveedor.** Hoy `frontend/src/screens/Proveedor.tsx`
      es solo lectura y no tiene wallet. Pero `marcar_entregado` y `reclamar_pago`
      necesitan la firma del proveedor. Sin esto, la mitad del arreglo no se puede usar.
- [ ] **Campo de plazo** en la pantalla de Rosa (`Comerciante.tsx`), en **días**.
- [ ] **Botón de objetar** + cuenta regresiva, usando `segundos_restantes`.
- [ ] **Actualizar `frontend/src/escrow.ts`**: sacar el token de `crearEscrow`,
      agregar `plazo_dias`, y agregar las cuatro funciones nuevas.
- [ ] **Re-deploy a testnet.** ⚠️ **Esto lo tiene que correr Cintia en su máquina**,
      porque necesita su wallet. El comando está en `COMANDOS.md` sección 2 —
      **ojo con el `-- --token` del final**.
- [ ] **Pegar el `CONTRACT_ID` nuevo** en `frontend/src/config.ts`.
- [ ] **Actualizar** `README.md` y `DESPLIEGUE-TESTNET.md`, que hoy apuntan al viejo.
- [ ] **Grabar un pedido de demo nuevo** on-chain. El pedido 42 no existe en el
      contrato nuevo.

### 2. Pendientes del contrato (conviene cerrarlos ANTES del deploy, para deployar una sola vez)

- [ ] **Renovar el TTL de los pedidos.** El contrato escribe 13 veces con
      `persistent()` y nunca llama a `extend_ttl`. Los datos vencen a los ~120 días
      y se archivan. **La plata no se pierde** (desde el protocolo 23 se restauran
      solos pagando el alquiler), pero suma fricción y costo. El patrón oficial es
      renovar en cada escritura. Ya se hizo para el storage de instancia (el token);
      falta para los pedidos.
- [ ] **Emitir eventos.** El contrato no emite ni uno. Sin eventos, ningún explorador
      ni indexador puede ver el flujo del escrow, y la app **no puede mostrar un
      historial** leído de la blockchain. Hoy el número de pedido vive en el navegador
      de Rosa: si cambia de teléfono, lo pierde.

### 3. Pendientes del frontend

- [ ] **`frontend/src/stellar.ts:91`** — el `while (resultado.status === "NOT_FOUND")`
      no tiene límite de intentos ni tiempo máximo. Si la red nunca devuelve la
      transacción, la app queda en *"⏳ Procesando en la red Stellar…"* para siempre.
      No es seguridad, es usabilidad: le pega justo a quien no sabe si su plata se movió.

### 4. Opcional, para la hackathon

- [ ] **Documentar la accesibilidad en el README.** El trabajo del commit `9e912f4`
      no se ve en ningún lado, así que un jurado no se entera. Es un diferencial real
      de Minga y hoy es invisible.

---

## ❓ Decisiones que esperan a Cintia

1. **Los créditos del equipo.** El `README.md` (línea 4) y el pie de la app (`frontend/src/App.tsx:93`) dicen
   *"Cintia Venecia, Mariela Caminos, Cristina Soto y Lourdes Gimenez Bravo"*, pero el
   equipo hoy es **Cintia Venecia y Octavio Giménez Bravo**. Son nombres de personas
   reales: **decidí vos qué tiene que decir** y se cambia. No se toca por iniciativa propia.
2. **WSL, sí o no.** Está la duda desde el 14/9. El entorno de Windows ya funciona
   (Node 24, Rust, Stellar CLI 27 — ver `COMANDOS.md`), así que WSL no hace falta
   para avanzar. Sirve si el grupo de la hackathon pasa comandos de Linux.
   ⚠️ Antes de instalarlo: **liberar espacio en C:** o instalarlo en D:.
3. **¿Cerrar los pendientes del contrato antes de deployar?** Si se deploya ahora y
   después se agregan eventos o TTL, hay que deployar dos veces y actualizar el
   `CONTRACT_ID` dos veces.

---

## 🗂️ Decisiones ya tomadas (no hace falta volver a discutirlas)

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
# Tests del contrato — tienen que pasar 19
cd contracts/escrow && cargo test

# Compilar a WASM (el formato que se sube a la red)
rustup target add wasm32-unknown-unknown   # una sola vez
cargo build --release --target wasm32-unknown-unknown

# Frontend
cd frontend && npm install && npm run build   # tsc + vite, sin errores
npm run dev                                    # para verlo en el navegador
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

## 🎯 El hueco grande que sigue abierto

La app mueve **XLM**. Rosa piensa en **pesos**.

Ese salto —de XLM a pesos en el banco de Rosa— lo hacen los *anchors* (SEP-6 / SEP-24),
y **Minga todavía no tiene ninguno**. Es la pregunta que quedó dando vueltas en la
llamada del 14/9 y nadie contestó.

No bloquea la hackathon (la demo es en testnet), pero es lo que separa un prototipo
que funciona de algo que Rosa pueda usar de verdad. Vale la pena seguir preguntando
en la comunidad de Stellar si hay un anchor que opere en Argentina.
