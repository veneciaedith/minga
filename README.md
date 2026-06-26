# 🤝 Minga — Pagos en escrow para comerciantes, sobre Stellar

> Prototipo presentado a la **Stellar Pulso Hackathon** (DoraHacks).
> Creado por **Cintia Venecia**, **Mariela Caminos**, **Cristina Soto** y **Lourdes Gimenez Bravo**.

Minga es un sistema operativo económico para pequeños comerciantes e informales de
América Latina (caso de uso: Salta, Argentina). Este repositorio contiene **un flujo
end-to-end funcional**: el **pago en escrow a un proveedor**, resuelto con un smart
contract en **Soroban (Stellar)** y un frontend en **React + TypeScript**.

> ▶️ **Probá la app en vivo:** **https://minga-r5ql.vercel.app**
> — en la pestaña *Proveedor*, consultá el pedido **42** para ver una operación real
> on-chain (sin instalar nada).
>
> 🛰️ **Deployado y funcionando en Stellar Testnet.** Contract ID
> [`CCYCSIXO…GSL3MX2W5N`](https://stellar.expert/explorer/testnet/contract/CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N).
> El flujo completo (crear escrow → confirmar entrega → pago liberado) ya se ejecutó
> on-chain — ver la evidencia con links a cada transacción en
> [DESPLIEGUE-TESTNET.md](DESPLIEGUE-TESTNET.md).

---

## 🧩 Qué problema real resuelve esto

(Sección pensada para explicar en la presentación, sin tecnicismos.)

Rosa tiene un almacén de barrio. Cuando necesita mercadería, choca siempre con el
mismo problema de confianza con sus proveedores:

- Si **paga por adelantado**, se arriesga a que el pedido no llegue o llegue mal.
- Si **paga después**, muchos proveedores no le confían y no le venden.

Minga rompe ese nudo con un **escrow** (un "depósito en garantía"):

1. Rosa arma el pedido y **el dinero queda bloqueado** en un contrato, no en manos
   de nadie.
2. El proveedor ve que **el pago está garantizado** y entrega la mercadería tranquilo.
3. Cuando Rosa recibe el pedido, lo **confirma desde la app** y el dinero se libera
   automáticamente al proveedor.
4. Si el pedido no se concreta, Rosa **cancela** y recupera su plata.

Ni Rosa ni el proveedor necesitan saber qué es blockchain. Solo ven mensajes como
*"Pedido confirmado, pago enviado"*. Por debajo, **Stellar** garantiza que nadie
puede quedarse con el dinero indebidamente: las reglas las hace cumplir el contrato,
no una empresa intermediaria.

**Por qué importa:** da a los comerciantes informales acceso a una herramienta
financiera (pago garantizado entre partes que no se conocen) que hoy solo tienen las
empresas grandes con bancos y abogados de por medio. Y lo hace con comisiones
ínfimas, porque corre sobre Stellar.

---

## 🗺️ Dónde encaja este prototipo en la visión de Minga

Minga es un sistema operativo económico para las economías invisibles de América
Latina, que convierte la actividad real de un microemprendedor en **identidad,
crédito y poder colectivo** (ver el documento de visión de producto). Su hoja de
ruta tiene varias fases; la capa blockchain incluye reputación on-chain, microcrédito
e **inventario como garantía**.

Este repositorio implementa **una de esas piezas, funcionando de verdad sobre
Stellar**: los **pagos programables a proveedores con escrow** (funcionalidad 5.5 y
Fase 4 del roadmap). Es el componente donde la blockchain deja de ser invisible para
volverse imprescindible: sin el contrato no hay garantía de pago entre partes que no
se conocen, que es justo el problema. Elegimos demostrar este flujo porque es el que
mejor prueba que **la integración con Stellar es el motor, no un adorno**.

Fiel al principio rector de Minga ("la persona nunca toca la blockchain"), el usuario
solo ve *"Pedido creado"* / *"Pago liberado"*; las wallets, el contrato y las
transacciones quedan por detrás.

## 🔗 Cómo y dónde Minga toca la red de Stellar (integración real, no decorativa)

La integración con Stellar es **el corazón del producto**: sin el contrato no hay
garantía de pago, que es justamente lo que resuelve el problema. Hay **3 transacciones
on-chain reales** en el flujo:

| Acción en la app | Función del contrato | Qué pasa on-chain |
|---|---|---|
| "Crear pedido y bloquear pago" | `create_escrow` | El XLM **sale de la wallet de Rosa y queda bloqueado en el contrato**. |
| "Confirmar entrega" | `confirm_delivery` | El contrato **transfiere el XLM al proveedor**. |
| "Cancelar pedido" | `cancel_escrow` | El contrato **devuelve el XLM a Rosa**. |

Dónde verlo en el código:

- **Custodia y transferencia de fondos reales** — busca los comentarios
  `*** ON-CHAIN ***` en
  [`contracts/escrow/src/lib.rs`](contracts/escrow/src/lib.rs). Ahí se usa el cliente
  de token de Soroban (`token::Client`) para mover XLM de verdad entre la wallet de
  Rosa, el contrato y el proveedor.
- **Envío de la transacción a la red** — en
  [`frontend/src/stellar.ts`](frontend/src/stellar.ts), la función
  `escribirContrato()` arma la transacción, la prepara, la hace **firmar con la wallet
  del usuario (vía Stellar Wallets Kit)** y la **envía al RPC de Soroban testnet**
  (`sendTransaction`). El comentario
  `*** ESTO ES ON-CHAIN REAL ***` marca el punto exacto.
- **Consulta de estado** — `leerContrato()` en el mismo archivo simula la llamada a
  `get_escrow_status` para que el proveedor vea el estado sin gastar nada.

Cada transacción devuelve un **hash** que la app linkea al explorador
(`stellar.expert`), así se puede mostrar la prueba on-chain en vivo durante el video.

---

## 🏅 Integración del Integration Track (SCF)

Minga usa **Stellar Wallets Kit** (categoría *Wallet Integration* de la lista oficial
de integraciones autorizadas). Es el puente por el que el comerciante firma cada
transacción on-chain: sin esa firma no hay escrow ni liberación de pago, así que la
integración es **fundamental para el funcionamiento**, no decorativa.

- **Qué es**: una capa de conexión que soporta múltiples wallets de Stellar (Freighter,
  xBull, Albedo, Lobstr…) con una sola API.
- **Dónde está en el código**: [`frontend/src/wallet.ts`](frontend/src/wallet.ts)
  (instancia del Kit, selección de wallet, `getAddress` y `signTransaction`).
- **Por qué la elegimos**: alinea con el principio de Minga de no atar al usuario a una
  sola wallet, y deja la conexión lista para crecer.

## 🏗️ Arquitectura

```
minga/
├── contracts/escrow/        # Smart contract Soroban (Rust)
│   ├── src/lib.rs           #   lógica del escrow (create / confirm / cancel / status)
│   ├── src/test.rs          #   tests del flujo completo
│   └── Cargo.toml
├── frontend/                # App React + TypeScript (Vite)
│   ├── src/config.ts        #   ⚙️ acá se pega el CONTRACT_ID después de deployar
│   ├── src/wallet.ts        #   conexión y firma vía Stellar Wallets Kit (multi-wallet)
│   ├── src/stellar.ts       #   capa que habla con la red Stellar (lectura/escritura)
│   ├── src/escrow.ts        #   API tipada del contrato
│   └── src/screens/         #   pantallas Comerciante y Proveedor
├── README.md
└── COMANDOS.md              # 🎬 comandos exactos para deployar y grabar el demo
```

### El contrato (`lib.rs`) en una mirada

| Función | Quién puede llamarla | Qué hace |
|---|---|---|
| `create_escrow(comprador, proveedor, token, monto, id_pedido)` | el comprador (firma) | Bloquea los fondos del comprador en el contrato. |
| `confirm_delivery(id_pedido)` | **solo** el comprador | Libera el pago al proveedor. |
| `cancel_escrow(id_pedido)` | **solo** el comprador | Devuelve los fondos al comprador. |
| `get_escrow_status(id_pedido)` | cualquiera (lectura) | Devuelve `pendiente` / `liberado` / `cancelado` / `noexiste`. |
| `get_escrow(id_pedido)` | cualquiera (lectura) | Devuelve los datos completos del escrow. |

> Nota de alcance: este contrato hace **solo** el escrow. La reputación, el inventario
> y el "data-to-earn" del roadmap de Minga quedan fuera de este prototipo a propósito.

> Sobre los parámetros: el contrato recibe también la dirección del `token` (en testnet
> usamos el XLM nativo). La **descripción** del pedido es metadato del comerciante y no
> se guarda on-chain en este prototipo.

---

## 🚀 Instalación, deploy y uso

Los comandos **exactos** (con copy-paste) están en
[`COMANDOS.md`](COMANDOS.md). Resumen:

### Requisitos
- [Rust](https://rustup.rs) + [Stellar CLI](https://developers.stellar.org/docs/tools/cli)
- [Node.js 18+](https://nodejs.org)
- Una wallet de Stellar en el navegador (ej. [Freighter](https://freighter.app)),
  en red **Testnet** — se conecta vía Stellar Wallets Kit

### 1) Compilar y deployar el contrato
```bash
cd contracts/escrow
cargo test                 # corre los tests (opcional)
stellar contract build     # compila a WASM (imprime la ruta del .wasm: copiala)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/minga_escrow.wasm \
  --source rosa --network testnet
# -> copiá el CONTRACT_ID que imprime
# Nota: según la versión del CLI la carpeta puede ser wasm32v1-none/release/
```

### 2) Configurar el frontend
Pegá el `CONTRACT_ID` en [`frontend/src/config.ts`](frontend/src/config.ts).

### 3) Correr el frontend
```bash
cd frontend
npm install
npm run dev      # abre http://localhost:5173
```

### 4) Probar el flujo completo
1. **Comerciante (Rosa)**: conectar Freighter → crear pedido (proveedor, monto,
   descripción) → firmar. Se bloquea el pago.
2. **Proveedor**: pegar el N° de pedido → ver estado **Pendiente**.
3. **Comerciante**: "Confirmar entrega" → firmar. Se libera el pago.
4. **Proveedor**: consultar de nuevo → **Pago liberado**.
5. Abrir el link de la transacción en
   [stellar.expert](https://stellar.expert/explorer/testnet) para ver el movimiento
   real de fondos.

---

## 🌐 Red

Todo corre en **Stellar Testnet** (no se usa dinero real). RPC de Soroban:
`https://soroban-testnet.stellar.org`. El `CONTRACT_ID` se configura en
`frontend/src/config.ts` después de deployar.

---

## 📦 Entregables de la hackathon

- ✅ Repositorio open source con README detallado
- ✅ Integración Stellar fundamental (escrow Soroban + Stellar Wallets Kit)
- ✅ **Deploy en vivo en testnet** + flujo completo ejecutado on-chain
  ([DESPLIEGUE-TESTNET.md](DESPLIEGUE-TESTNET.md))
- ✅ Smart contract Soroban (`contracts/escrow/`) — compila + 3 tests pasan
- ✅ Frontend React + TS con pantallas Comerciante y Proveedor (`frontend/`)
- ✅ [`COMANDOS.md`](COMANDOS.md) con los pasos para reproducir y grabar el demo
- ✅ Guía para las 3 entrevistas de descubrimiento ([`entrevistas/`](entrevistas/))
- ⬜ Grabar las 3 entrevistas (link a Drive) — *lo hace el equipo*
- ⬜ Presentación (pitch deck) — *se arma sobre esta base*
- ⬜ Video demo de 1-2 min — *guion en COMANDOS.md, paso 6*
