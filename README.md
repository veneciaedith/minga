# 🤝 Minga — que el pago no dependa de la confianza

> ### *Muchas manos levantan lo que una sola no puede.*

Minga es una aplicación para que un comercio chico pueda comprarle mercadería a un
proveedor sin que ninguno de los dos tenga que arriesgar primero.

La plata queda **guardada y bloqueada** hasta que la mercadería llega. Ahí se libera
sola. Si el pedido no llega, vuelve a quien la puso.

Por debajo funciona con un contrato en la red **Stellar**, pero la persona que usa la
app nunca toca eso. Solo lee *"Pedido creado"* y *"Pago liberado"*.

---

## Por qué existe

Yo tenía una panadería y la terminé cerrando.

No escribo código. Construyo Minga con herramientas de inteligencia artificial,
preguntando y probando, porque no quiero esperar a que alguien con más estudios
decida que este problema vale la pena.

Lo que me mueve no es una idea de negocio. Es que conozco de primera mano lo que es
poner toda tu plata en un comercio chico. Cada decisión de este proyecto está tomada
pensando en esa persona: la que no tiene un banco atrás, la que no tiene un abogado,
la que si pierde un pedido pierde la semana.

Por eso el proyecto tiene dos reglas que no se negocian:

1. **Que se entienda.** Todo, desde la app hasta este archivo, escrito en lenguaje
   claro. Si hace falta saber qué es una blockchain para usarlo, está mal hecho.
2. **Que entre cualquiera.** Diseño universal: la aplicación tiene que servir sin
   importar cómo ve, oye, se mueve o lee cada persona.

---

## El problema, con nombre y apellido

Rosa tiene un almacén de barrio. Cuando necesita mercadería choca siempre con lo mismo:

- Si **paga por adelantado**, se arriesga a que el pedido no llegue o llegue mal.
- Si **paga después**, muchos proveedores no le creen y no le venden.

Alguno de los dos tiene que arriesgar primero. Y como ninguno quiere, la compra
muchas veces no se hace.

Las empresas grandes resuelven esto hace años: tienen bancos, contratos y abogados
que garantizan el pago entre dos que no se conocen. Un almacén de barrio no tiene
nada de eso.

**Minga le da esa misma herramienta a Rosa.**

---

## Cómo funciona

A lo que queda guardado en el medio se le dice **escrow**, que es un depósito en
garantía: la plata está, pero nadie la puede tocar todavía.

1. **Rosa arma el pedido** y elige cuántos días se da para revisar la mercadería
   cuando llegue (de 1 a 60; normalmente 3). Firma, y la plata sale de su billetera
   y queda bloqueada en el contrato. **Ni Rosa ni el proveedor la tienen.**
2. **El proveedor consulta el número de pedido** y ve que el pago está garantizado.
   Entrega tranquilo.
3. **Rosa confirma que recibió** y el contrato le manda la plata al proveedor.
4. **Si el pedido no se concreta**, Rosa cancela y recupera todo.

### Y si algo sale mal

Esta parte es la que más trabajo costó, porque es donde se juega si el proveedor
también puede confiar.

La primera versión tenía un agujero: confirmar dependía solo de Rosa. Si el proveedor
entregaba y Rosa no confirmaba nunca —por olvido, porque perdió el teléfono, o de
mala fe— la plata quedaba trabada para siempre y el proveedor no tenía salida.

Ahora **el proveedor puede avisar "ya entregué"** con su propia firma. Eso arranca el
reloj del plazo que Rosa eligió:

- Si Rosa **confirma**, cobra el proveedor.
- Si Rosa **no dice nada** y el plazo se vence, el proveedor cobra igual. El silencio
  ya no lo perjudica.
- Si Rosa **objeta** dentro del plazo ("esto no me llegó, o me llegó mal"), la plata
  se **frena**. No cobra nadie hasta que una de las dos partes ceda: o Rosa libera el
  pago, o el proveedor devuelve la plata.

Los caminos posibles, completos:

```
Rosa crea el pedido y elige el plazo
        │  plata bloqueada en el contrato
        ▼
   PENDIENTE ──── Rosa confirma ─────────────────────► LIBERADO (cobra el proveedor)
        │    └─── Rosa cancela ──────────────────────► CANCELADO (recupera Rosa)
        │
        │  el proveedor firma "ya entregué"
        ▼
   ENTREGADO  ← acá arranca el reloj de Rosa
        │
        ├── Rosa confirma ──────────────────────────► LIBERADO
        ├── se vence el plazo → el proveedor reclama ► LIBERADO
        ├── el proveedor se echa atrás ─────────────► CANCELADO
        └── Rosa objeta (dentro del plazo)
                 ▼
            EN DISPUTA  ← plata frenada, no cobra nadie
                 ├── Rosa cede y libera ────────────► LIBERADO
                 └── el proveedor cede y devuelve ──► CANCELADO
```

**Lo que este prototipo todavía no resuelve:** una disputa en la que ninguna de las
dos partes cede. Eso necesita un árbitro, y está fuera de alcance por ahora. Lo
decimos acá y no en una nota al pie, porque esconderlo sería vender algo que no es.

---

## Una falla que encontramos y cerramos

Vale la pena contarla, porque es el tipo de cosa que decide si este producto sirve o
es peligroso.

**El problema.** El contrato es público: cualquiera puede llamarlo sin pasar por la
app. Antes, al crear un pedido se le indicaba con qué moneda se iba a pagar. Alguien
podía crear un pedido con una **moneda falsa** —una que dice "transferí" pero no vale
nada—. El proveedor consultaba, veía "pago bloqueado y garantizado", entregaba la
mercadería de verdad y cobraba algo que no valía nada.

Eso rompía exactamente la promesa de Minga.

**El arreglo.** Ahora la moneda se fija **una sola vez**, en el momento de instalar el
contrato en la red, y no hay ninguna función que la cambie. No queda ningún lugar
donde meter una moneda falsa. Cualquiera puede preguntarle al contrato qué moneda
acepta (`get_token`) antes de confiar en él.

La revisión completa está en [`docs/revision-seguridad.md`](docs/revision-seguridad.md).
**No es una auditoría** y no la presentamos como tal: una auditoría la hace gente de
afuera que cobra por romperte el código. Esto es una revisión interna, hecha contra la
lista oficial de vulnerabilidades que publica Stellar.

---

## En qué estado está hoy

| | Qué hay |
|---|---|
| **El código del contrato** | La versión nueva: plazo, disputa, moneda fija, avisos en la red. **Todavía no instalada en la red.** |
| **En la red (testnet)** | La versión vieja, de julio: [`CCYCSIXO…GSL3MX2W5N`](https://stellar.expert/explorer/testnet/contract/CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N) |
| **La app en vivo** | [minga-r5ql.vercel.app](https://minga-r5ql.vercel.app) — apunta a la versión vieja y funciona |
| **Los tests** | **29 pruebas automáticas, todas en verde** |

**Es a propósito, no es un descuido.** El flujo completo ya se ejecutó de verdad en la
red en julio, con plata moviéndose entre billeteras: la evidencia, con el enlace a cada
transacción, está en [`DESPLIEGUE-TESTNET.md`](DESPLIEGUE-TESTNET.md). Esa demo sigue
en pie.

Instalar la versión nueva necesita una billetera con fondos, así que lo tengo que
correr yo a mano. Lo dejo para después de esta ronda de devoluciones, para no tener que
hacerlo dos veces si de la revisión sale algo para cambiar.

Mientras tanto la app no puede operar contra la red, y **lo dice con todas las letras**
en vez de tirar un error incomprensible: *"Esta versión de Minga y el contrato instalado
en la red no coinciden… no es nada que hayas hecho mal"*.

---

## Qué se construyó esta semana

Septiembre 2026, durante el **Argentina Builder Challenge**:

- **Se cerró la falla de la moneda falsa** (la que está contada más arriba).
- **Plazo y disputa**, para que el proveedor no quede rehén del silencio de Rosa.
- **Avisos públicos en la red.** Cada cambio de estado deja un aviso que cualquiera
  puede leer. Sirve para dos cosas: que la app pueda mostrar el historial de pedidos
  leyendo la red en vez de depender de la memoria del celular, y que tanto Rosa como
  el proveedor puedan demostrar lo que hicieron sin depender de la palabra del otro.
- **Que los pedidos no se archiven.** En Stellar los datos guardados vencen. Ahora cada
  pedido renueva su fecha mientras se use, para que a nadie le "desaparezca" un pedido.
- **La app al día con el contrato nuevo**: billetera en la pantalla del proveedor,
  campo de plazo, botón para frenar el pago, cuenta regresiva, y consulta a la red cada
  minuto.
- **Accesibilidad**: los avisos de pago se anuncian en voz alta para lectores de
  pantalla, foco visible al navegar con teclado, contraste corregido, letra más grande
  y teclado numérico en el celular.
- **Revisión de seguridad** completa del contrato, escrita.
- **Pruebas de propiedades**: además de probar casos uno por uno, la computadora inventa
  miles de combinaciones al azar y verifica que las cuentas siempre cierren. Las
  comprobamos rompiendo el contrato a propósito, para asegurarnos de que avisan.
- **Prototipo navegable** de las tres pantallas del comerciante, en
  [`mockups/minga-app.html`](mockups/minga-app.html): se abre con doble clic, sin
  instalar nada.
- **Decisión de moneda: USDC.** Buscando cómo haría Rosa para sacar la plata,
  apareció MoneyGram Ramps: permite retirar efectivo en mostrador **sin cuenta
  bancaria**, en más de 170 países, y funciona con USDC sobre Stellar. Para alguien
  excluido del sistema financiero, eso no es un detalle técnico: es la diferencia
  entre que la plata le sirva o no.

---

## Diseño universal: por qué la app está hecha así

La accesibilidad no es un agregado del final. Está en
[`docs/diseno-accesible.md`](docs/diseno-accesible.md), y se apoya en tres marcos:

- **Las 10 heurísticas de usabilidad de Jakob Nielsen**, para que se entienda.
- **La Convención sobre los Derechos de las Personas con Discapacidad** (artículos 2, 9
  y 21) y el diseño universal, para que se entienda sin importar cómo ve, oye, se mueve
  o lee cada persona.
- **WCAG 2.1 nivel AA** como referencia técnica concreta.

Algunas decisiones que salen de ahí:

- **El color nunca informa solo.** Cada estado lleva ícono, palabra y trama propia, así
  también se entiende en blanco y negro o con daltonismo.
- **Los mensajes dicen qué pasó y qué hacer**, no un código de error.
- **Ninguna palabra del mundo cripto aparece en la pantalla.** No se lee "escrow", ni
  "wallet", ni "transacción".

---

## Cómo está hecho

```
minga/
├── contracts/escrow/        # El contrato (Rust, Soroban)
│   ├── src/lib.rs           #   la lógica: crear, entregar, confirmar, objetar, cobrar
│   ├── src/test.rs          #   las pruebas del flujo completo
│   └── src/propiedades.rs   #   las pruebas al azar
├── frontend/                # La app (React + TypeScript)
│   ├── src/wallet.ts        #   conexión con la billetera (Stellar Wallets Kit)
│   ├── src/stellar.ts       #   la capa que habla con la red
│   ├── src/escrow.ts        #   las funciones del contrato, tipadas
│   └── src/screens/         #   pantallas Comerciante y Proveedor
├── mockups/minga-app.html   # Prototipo navegable, se abre con doble clic
├── marca/                   # El logo, en varios tamaños y formatos
├── docs/                    # Revisión de seguridad, diseño accesible, integraciones
├── entrevistas/             # Guías de entrevista por rubro + consentimiento
└── COMANDOS.md              # Los comandos exactos, para copiar y pegar
```

### Lo que hace el contrato

**Funciones que mueven plata** (hay que firmar con la billetera):

| Función | Quién firma | Cuándo se puede |
|---|---|---|
| `create_escrow(comprador, proveedor, monto, id_pedido, plazo_dias)` | el comerciante | siempre |
| `marcar_entregado(id_pedido)` | **el proveedor** | solo si está Pendiente |
| `confirm_delivery(id_pedido)` | el comerciante | Pendiente, Entregado o En disputa |
| `cancel_escrow(id_pedido)` | el comerciante | **solo si está Pendiente** |
| `objetar_entrega(id_pedido)` | el comerciante | solo Entregado y **dentro** del plazo |
| `reclamar_pago(id_pedido)` | **el proveedor** | solo Entregado y **vencido** el plazo |
| `devolver_fondos(id_pedido)` | **el proveedor** | Entregado o En disputa |

**Funciones que solo miran** (gratis, sin firma): `get_escrow_status`, `get_escrow`,
`get_token`, `segundos_restantes`, `puede_reclamar`.

La moneda se fija al instalar el contrato (`__constructor`) y no se puede cambiar nunca.

### Dónde toca la red de verdad

Buscá los comentarios `*** ON-CHAIN ***` en
[`contracts/escrow/src/lib.rs`](contracts/escrow/src/lib.rs): ahí es donde la plata se
mueve de verdad entre la billetera del comerciante, el contrato y el proveedor.

En [`frontend/src/stellar.ts`](frontend/src/stellar.ts), el comentario
`*** ESTO ES ON-CHAIN REAL ***` marca el punto exacto donde la operación se firma y se
manda a la red.

Para conectar la billetera usamos **Stellar Wallets Kit**, que soporta varias
(Freighter, xBull, Albedo, LOBSTR) con una sola conexión. Elegimos eso para no atar a
nadie a una billetera sola.

---

## Probarlo

**Lo más rápido, sin instalar nada:** abrí
[`mockups/minga-app.html`](mockups/minga-app.html) con doble clic, o entrá a
[minga-r5ql.vercel.app](https://minga-r5ql.vercel.app) y consultá el pedido **42** en
la pestaña *Proveedor* (esa es la versión de julio, la que está en la red).

**Correr las pruebas** (lo que verifica que el contrato hace lo que dice):

```bash
cd contracts/escrow
cargo test        # tienen que pasar 29
```

**Levantar la app:**

```bash
cd frontend
npm install
npm run dev       # abre http://localhost:5173
```

Los comandos completos para instalar el contrato en la red están en
[`COMANDOS.md`](COMANDOS.md).

Todo corre en **Stellar Testnet**, la red de prueba: **no se usa plata real.**

---

## Qué sigue

1. **Instalar el contrato nuevo en la red** y grabar un pedido de demostración.
   (Lo corro yo, necesita billetera con fondos.)
2. **Pasar a USDC**, por lo de MoneyGram Ramps.
3. **El historial de pedidos** leído desde la red, usando los avisos que el contrato
   ya publica.
4. **Resolver disputas trabadas**, que hoy necesitan que alguien ceda.

Más adelante, el escrow es la puerta de entrada a lo que Minga quiere ser: cada pago
deja un registro verificable, y ese registro se convierte en **reputación, y la
reputación en crédito sin banco**. Un comercio que hoy es invisible para el sistema
financiero pasa a tener historia propia.

El estado detallado y los pendientes del día a día están en
[`ESTADO-Y-PROXIMOS-PASOS.md`](ESTADO-Y-PROXIMOS-PASOS.md).

---

## Quiénes

**Cintia Venecia** · **Octavio Giménez Bravo** — Salta, Argentina.

Las entrevistas de descubrimiento se hicieron con emprendedoras y emprendedores reales
de Salta, de tres rubros distintos, para validar que el problema de la confianza con
los proveedores existe de verdad y no es una suposición nuestra. Las guías y el
consentimiento están en [`entrevistas/`](entrevistas/).

El proyecto nació en la **Stellar Pulso Hackathon** (julio 2026) y sigue creciendo en
el **Argentina Builder Challenge** (septiembre 2026).

## Enlaces

- Repositorio: https://github.com/veneciaedith/minga
- App en vivo (versión de julio): https://minga-r5ql.vercel.app
- Video demo: https://youtu.be/6X-0l_hIbqs
- El contrato en el explorador: [stellar.expert](https://stellar.expert/explorer/testnet/contract/CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N)
