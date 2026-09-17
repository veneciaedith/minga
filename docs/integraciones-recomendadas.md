# Integraciones recomendadas en el workshop

> Anotado el **17/09/2026**, del Bloque 6 («Hacemos esto real») del Argentina
> Builder Challenge.
>
> Esta lista es **material del workshop**, no una verificación nuestra. Antes de
> adoptar cualquiera hay que mirar: si opera en Argentina, qué pide para
> registrarse, si tiene red de prueba, qué licencia tiene y si cobra comisión.

---

## 1. Cómo entra la gente a tu app

| Herramienta | Qué es | Cómo nos toca |
|---|---|---|
| **Freighter** | La billetera oficial de la Stellar Development Foundation. | ✅ **Ya la usamos.** Es la que instalamos para las pruebas. |
| **Stellar Wallets Kit** | Un toolkit para conectar cualquier billetera compatible. | ✅ **Ya lo usamos.** Está en `frontend/src/wallet.ts`. Por eso Minga no ata a nadie a una sola billetera. |
| **Privy** | Entrar con email o redes sociales, sin que la persona note la cripto. | ⭐ **La más interesante para Minga, y no la tenemos.** Ver abajo. |

### Por qué Privy merece una mirada seria

El principio rector de Minga es *«la persona nunca toca la blockchain»*. Hoy lo
cumplimos a medias: las pantallas hablan en castellano de mostrador, pero para
usar la app **hay que instalar Freighter y guardar una frase de recuperación**.
Para la población de Minga esa es la barrera más alta que hay, y está antes de
la primera pantalla.

También resolvería, de raíz, el problema anotado en `docs/diseno-accesible.md`:
el código de billetera de 56 caracteres que hay que copiar sin equivocarse.

**Lo que hay que averiguar antes de ilusionarse:** si Privy soporta Stellar (y
no solo redes EVM), si hace falta un servidor propio, si mete una empresa en el
medio con poder sobre los fondos —lo mismo que nos hizo descartar Cosmos Pay— y
qué licencia y costo tiene.

**Cuándo:** después de la hackathon. Cambiar la forma de entrar a la app a once
días de la entrega, sin haberla probado con nadie, sería tirar lo que funciona.

---

## 2. Convertir entre plata real y cripto

Esto es exactamente **el hueco grande de Minga**: la app mueve XLM y Rosa piensa
en pesos.

| Herramienta | Qué es | Cómo nos toca |
|---|---|---|
| **MoneyGram** | Efectivo dentro y fuera, con rieles de Stellar por detrás. | ⭐ **La más prometedora.** Efectivo, no cuenta bancaria. |
| **Bridge** | El caño por donde una empresa mueve valor entre cuentas, liquidando en Stellar. | Para una empresa que mueve plata, no para Rosa directamente. |
| **Mercuryo** | Pesos ↔ cripto con el cumplimiento regulatorio ya resuelto. | A mirar junto con los anchors. |

### Por qué MoneyGram importa tanto (ampliado el 17/09)

Todo lo demás en esta categoría termina pidiendo **cuenta bancaria a nombre
propio**. Eso deja afuera a buena parte de la gente para la que Minga se
construye, que es justamente la economía informal.

**El producto se llama MoneyGram Ramps** (antes «MoneyGram Access»). Es un puente
entre Stellar, **USDC** y la red física de mostradores de MoneyGram: permite sacar
efectivo **sin cuenta bancaria**, en más de 170 países.

#### Las tres piezas ya encajan, y Minga no tiene que integrar nada

Las billeteras que hoy tienen esa puerta son **Vibrant y LOBSTR**. Y **LOBSTR ya
está en Minga**: el Stellar Wallets Kit que integramos soporta Freighter, xBull,
Albedo y LOBSTR (ver `frontend/src/wallet.ts`).

Entonces el camino completo es:

```
El proveedor cobra USDC en Minga
        ↓
Lo tiene en su billetera LOBSTR
        ↓
Va a un mostrador de MoneyGram y saca efectivo
```

**Minga no toca ese último paso, y es mejor así:** no se convierte en intermediaria
financiera, no maneja la documentación de nadie y no asume esa responsabilidad
legal. La salida a efectivo ya existe; lo que hacemos es no estorbarla.

#### Esto decide lo del token: USDC

Si la salida a efectivo funciona con USDC, que el escrow mueva XLM obliga a un
cambio de moneda en el medio, con su pérdida y su complicación. Con USDC la cadena
queda derecha de punta a punta, y de paso se resuelve que el XLM sube y baja.

#### Lo que falta verificar

- **Que Argentina esté en el corredor con cripto.** Que MoneyGram opere acá para
  giros comunes no garantiza que el camino de USDC esté habilitado.
- **Qué piden en el mostrador.** Va a haber documento. Es mucho más liviano que una
  cuenta bancaria, pero no es cero.
- **Para la demo del 27/09 esto es una historia, no algo que se muestre**: funciona
  con USDC real en la red de producción, y la demo es en testnet. Ante un jurado
  conviene decirlo así: *«la salida a efectivo no la construimos nosotros, ya
  existe, y nuestra app ya soporta la billetera que la tiene»*.

**Dónde mirar:** la documentación para desarrolladores está en
`developer.moneygram.com` (sección «integrate MoneyGram Ramps») y la página del
producto en `stellar.org/products-and-tools/moneygram`.

---

## 3. Préstamos, swaps y liquidez

Esto es la **fase de microcrédito** del roadmap, no ahora.

| Herramienta | Qué es | Cómo nos toca |
|---|---|---|
| **Blend** | Pools de préstamos sobre Stellar. | Ya había aparecido en la investigación con Raven. Es infraestructura de préstamos; el criterio de a quién prestarle y con qué límites lo tendría que poner Minga. |
| **Soroswap** | Swaps, juntando la liquidez de toda la red. | Serviría para pasar de una moneda a otra dentro de la app. |
| **Aquarius** | La plomería de liquidez del mercado descentralizado. | Infraestructura, no algo que se use directo. |

> Recordatorio de la investigación del 16/09: si Minga llega a la capa de
> crédito, **un puntaje automático no puede ser la única decisión**. Sobre gente
> de la economía informal, un puntaje automático reproduce las mismas
> exclusiones que el sistema que queremos esquivar: quien menos historial tiene
> es justamente quien nunca pudo acceder a nada.

---

## Resumen para no perderse

- **Ya cumplimos** la primera categoría (Freighter + Stellar Wallets Kit).
- **Privy** y **MoneyGram** son las dos que podrían cambiar de verdad quién puede
  usar Minga. Las dos son para después de la entrega del 27/09.
- **MoneyGram ya no necesita trabajo de integración**: alcanza con pagar en USDC,
  porque la billetera que tiene esa puerta (LOBSTR) ya está soportada. Lo que sí
  hay que verificar es si el corredor está habilitado en Argentina.
- La tercera categoría es roadmap, no producto actual.
- **Nada de esto se toca antes del deploy.** Lo que destraba todo sigue siendo
  instalar el contrato nuevo en la red.
