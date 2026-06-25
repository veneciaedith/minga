# 🎬 Comandos exactos — de cero a demo

Esta es la **chuleta** para deployar y correr todo sin trabarte mientras grabás el
video. Copiá y pegá en orden. Cada bloque indica en qué carpeta pararte.

> Asumimos Windows con PowerShell, pero los comandos son iguales en Mac/Linux.
> Donde dice `rosa` podés usar el nombre de identidad que quieras.

---

## 0. Instalar herramientas (una sola vez)

> ✅ **En esta máquina ya está todo instalado y verificado** (Node 24, Rust 1.96,
> Stellar CLI 27). Como el disco **C: estaba lleno**, Rust se instaló en **D:**:
> las variables `RUSTUP_HOME=D:\rust\.rustup` y `CARGO_HOME=D:\rust\.cargo` ya quedaron
> fijadas, y `cargo`, `rustc`, `stellar` y `node` están en el PATH del usuario.
> **Solo tenés que abrir una terminal NUEVA** para que tome los cambios. El contrato
> ya compila a WASM y los 3 tests pasan. Podés saltar al paso 1.
> (Lo de abajo queda como referencia para reinstalar en otra máquina.)

```powershell
# 1) Rust
winget install Rustlang.Rustup        # o https://rustup.rs

# 2) Stellar CLI (incluye Soroban)
winget install Stellar.StellarCLI     # o: cargo install --locked stellar-cli

# 3) Node.js 18+ (para el frontend)
winget install OpenJS.NodeJS.LTS

# Verificá que quedaron instalados:
rustc --version
stellar --version
node --version
```

---

## 1. Crear una identidad (wallet) de testnet para deployar

```powershell
# Crea y fondea automáticamente una cuenta en testnet llamada "rosa"
stellar keys generate rosa --network testnet --fund

# Ver la public key (la vas a usar como comprador en el demo)
stellar keys address rosa
```

---

## 2. Compilar y deployar el contrato

> Pararte en la carpeta del contrato:

```powershell
cd "minga/contracts/escrow"

# (opcional) correr los tests del contrato
cargo test

# Compilar a WASM optimizado.
# Al terminar, el CLI imprime la RUTA exacta del .wasm generado: copiala.
stellar contract build

# Si no la viste, encontrá el .wasm con este comando (Windows PowerShell):
Get-ChildItem -Recurse -Filter minga_escrow.wasm target

# Deployar a testnet usando ESA ruta. GUARDÁ el CONTRACT_ID que imprime ("C...").
# Según tu versión del CLI/Rust, la carpeta puede ser
#   target/wasm32-unknown-unknown/release/   o   target/wasm32v1-none/release/
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/minga_escrow.wasm `
  --source rosa `
  --network testnet
```

El comando imprime algo como:

```
CONTRACT_ID: CABC123...XYZ
```

> 👉 Copiá ese `CONTRACT_ID`.

---

## 3. Configurar el frontend con el CONTRACT_ID

Abrí `minga/frontend/src/config.ts` y pegá el id en:

```ts
export const CONTRACT_ID = "CABC123...XYZ";   // <- el que te dio el deploy
```

El `TOKEN_ID` ya viene con el XLM nativo de testnet. Para verificarlo:

```powershell
stellar contract id asset --asset native --network testnet
# Debería coincidir con el TOKEN_ID que ya está en config.ts
```

---

## 4. Correr el frontend

```powershell
cd "minga/frontend"
npm install
npm run dev
```

Abrí el navegador en la URL que muestra Vite (normalmente http://localhost:5173).

---

## 5. Preparar la wallet del navegador (Freighter)

1. Instalá la extensión **Freighter** desde https://freighter.app
2. Importá la cuenta `rosa` con su secret key, o creá una nueva y fondeala:
   ```powershell
   # Para fondear una public key cualquiera en testnet (Friendbot):
   stellar keys fund <PUBLIC_KEY>     # si la generaste con la CLI
   ```
   O usá el Friendbot web: https://friendbot.stellar.org/?addr=<PUBLIC_KEY>
3. En Freighter, cambiá la red a **Testnet**.

> Necesitás también una **segunda** cuenta para el proveedor (solo su public key
> alcanza, porque el proveedor no firma nada):
> ```powershell
> stellar keys generate proveedor --network testnet --fund
> stellar keys address proveedor
> ```

---

## 6. Flujo del demo (lo que mostrás en el video)

1. En la app, pestaña **Comerciante (Rosa)** → "Conectar wallet" → se abre el modal
   del Stellar Wallets Kit; elegí **Freighter** (o la wallet que tengas).
2. Pegá la **public key del proveedor**, un **monto** (ej `10`) y una descripción.
   Anotá el **N° de pedido** que aparece.
3. Click en **"Crear pedido y bloquear pago"** → Freighter pide firmar → confirmás.
   - Mostrá el link **"Ver transacción en el explorador"** (esto es la prueba on-chain).
4. Cambiá a la pestaña **Proveedor**, pegá el N° de pedido → **"Consultar estado"**.
   - Aparece **⏳ Pendiente de entrega**.
5. Volvé a **Comerciante** → **"Confirmar entrega (liberar pago)"** → firmás.
6. En **Proveedor**, consultá de nuevo → **✅ Pago liberado**.
7. (Opcional) Mostrá en https://stellar.expert/explorer/testnet el balance del
   proveedor aumentando: esa es la transferencia real on-chain.

---

## Comandos de verificación on-chain (opcional, para el video)

```powershell
# Consultar el estado de un pedido directamente desde la CLI (sin frontend):
stellar contract invoke `
  --id <CONTRACT_ID> `
  --source rosa `
  --network testnet `
  -- get_escrow_status --id_pedido 12345

# Ver el balance del proveedor en XLM:
stellar contract invoke `
  --id <TOKEN_ID> `
  --source rosa `
  --network testnet `
  -- balance --id <PUBLIC_KEY_PROVEEDOR>
```

---

## Problemas comunes

- **"account not found" al firmar**: la cuenta no está fondeada. Usá Friendbot.
- **Freighter no aparece**: recargá la página y verificá que la red sea *Testnet*.
- **Error de `Buffer` en el navegador**: ya está cubierto por `define: { global }`
  en `vite.config.ts`. Si persiste: `npm install buffer` y agregá en `main.tsx`
  `import { Buffer } from "buffer"; window.Buffer = Buffer;`.
- **El nombre del .wasm no coincide**: fijate el archivo real en
  `target/wasm32-unknown-unknown/release/` (puede variar el guion bajo/medio).
