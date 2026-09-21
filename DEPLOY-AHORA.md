# 🔑 El deploy, paso a paso

> Para el **checkpoint 2 del jueves 24/09**, que pide el producto *"desplegado en
> testnet, accesible por un link"*.
>
> Esto lo corre **Cintia**, porque necesita su billetera. Son unos 20 minutos.
> `COMANDOS.md` tiene el detalle completo; esto es solo lo de este deploy, en orden,
> **incluido lo que pasa después** del deploy, que es lo que se olvida.

---

## Antes de empezar

Abrí una terminal **nueva** (para que tome el PATH) y comprobá que todo está sano:

```powershell
cd "minga/contracts/escrow"
cargo test
```

**Tienen que pasar 29.** Si pasan, el contrato está bien y lo que sigue es solo
ponerlo en la red.

> 💻 En Mac o Linux los comandos son iguales, pero donde ves una comilla invertida
> al final del renglón (`` ` ``) va una barra invertida (`\`).

---

## Paso 1 · Compilar

```powershell
stellar contract build
```

Al terminar imprime la **ruta del archivo `.wasm`**. Copiala: la necesitás en el
paso 3. Según la versión puede estar en `target/wasm32-unknown-unknown/release/`
o en `target/wasm32v1-none/release/`.

Si no la viste pasar:

```powershell
Get-ChildItem -Recurse -Filter minga_escrow.wasm target
```

---

## Paso 2 · Averiguar el id de la moneda

```powershell
stellar contract id asset --asset native --network testnet
```

Es el XLM de la red de prueba. **Copialo**, va en el paso siguiente.
Tiene que coincidir con el `TOKEN_ID` que ya está en `frontend/src/config.ts`.

---

## Paso 3 · Instalar el contrato en la red

⚠️ **Acá está la trampa.** Fijate en el `--` suelto y el `--token` del final: la
moneda se fija **una sola vez**, en este momento, y no se puede cambiar nunca más.
Si te lo olvidás, el comando falla. Si pegás la moneda equivocada, hay que volver a
empezar.

```powershell
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/minga_escrow.wasm `
  --source rosa `
  --network testnet `
  -- `
  --token PEGÁ_ACÁ_EL_ID_DEL_PASO_2
```

> Si `rosa` no existe en esta máquina, creala y fondeala primero:
> `stellar keys generate rosa --network testnet --fund`
> Si ya existe, comprobá que tenga fondos: `stellar keys address rosa`

**Guardá el `CONTRACT_ID` que imprime** (empieza con `C`). Sin eso no seguís.

---

## Paso 4 · Comprobar antes de avanzar

```powershell
stellar contract invoke `
  --id PEGÁ_ACÁ_EL_CONTRACT_ID `
  --source rosa `
  --network testnet `
  -- `
  get_token
```

**Tiene que devolver el mismo id del paso 2.** Si no coincide, volvé al paso 3:
todavía estás a tiempo, porque no hay ningún pedido creado.

---

## Paso 5 · Pegarlo en la app

En `frontend/src/config.ts`, cambiá el id viejo por el nuevo:

```ts
export const CONTRACT_ID = "EL_NUEVO_QUE_TE_DIO_EL_DEPLOY";
```

Y **borrá el aviso** que está arriba, el que dice *"ESTE ID ES EL DEL CONTRATO VIEJO
Y HAY QUE CAMBIARLO"*. Ya no es cierto.

Probá en tu máquina antes de subir nada:

```powershell
cd "minga/frontend"
npm install
npm run dev
```

Creá un pedido de prueba. Si ya **no** aparece el aviso de *"esta versión y el
contrato no coinciden"*, funcionó.

---

## Paso 6 · Que el link en vivo apunte al contrato nuevo

**Este paso es el checkpoint.** De nada sirve el deploy si el link público sigue
mostrando la versión vieja.

```powershell
git add frontend/src/config.ts
git commit -m "Apunta la app al contrato nuevo en testnet"
git push origin main
```

Si el proyecto de Vercel está conectado a GitHub, con el push se actualiza solo en
un par de minutos. **Entrá a https://minga-r5ql.vercel.app y comprobalo** — desde
otro navegador o el celular, no desde la pestaña que ya tenías abierta, que puede
mostrarte la versión guardada.

> No pude verificar desde acá cómo está configurado Vercel. Si no se actualiza
> solo, hay que entrar al panel de Vercel y publicar la versión nueva a mano.

---

## Paso 7 · Dejar un pedido de demostración

**El pedido 42 no existe en el contrato nuevo.** Si alguien lo consulta, no va a
ver nada.

Creá uno desde la app, con la billetera de Rosa, y **anotá el número**. Ese es el
que vas a mostrar en el video y el que puede consultar cualquiera sin instalar nada.

Para que se vea el recorrido completo, lo ideal es dejar uno en cada estado:

| Pedido | Estado | Para mostrar |
|---|---|---|
| uno | **Pendiente** | la plata bloqueada, esperando la entrega |
| otro | **Pago liberado** | el recorrido terminado, con la plata movida de verdad |

---

## Paso 8 · Avisame

Pasame el `CONTRACT_ID` nuevo y los números de pedido, y actualizo de una sola vez:

- `README.md` — la tabla de "En qué estado está hoy" y el enlace al explorador
- `DESPLIEGUE-TESTNET.md` — la evidencia, con el enlace a cada transacción
- `ESTADO-Y-PROXIMOS-PASOS.md` — marcar el pendiente como hecho

---

## Si algo sale mal

| Lo que ves | Qué es |
|---|---|
| `account not found` al firmar | La cuenta no tiene fondos. Fondeala con Friendbot. |
| El deploy falla y menciona `token` | Te faltó el `--` suelto o el `--token` del final (paso 3). |
| `get_token` devuelve otra cosa | Deployaste con la moneda equivocada. Repetí el paso 3. |
| El nombre del `.wasm` no coincide | Mirá el archivo real dentro de `target/…/release/`. |
| Freighter no aparece | Recargá y comprobá que la red sea **Testnet**. |

**Nada de esto rompe nada.** Mientras no haya pedidos con plata adentro, deployar de
nuevo no cuesta más que repetir los pasos.
