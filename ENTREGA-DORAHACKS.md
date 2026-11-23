# 📨 Texto para la entrega en DoraHacks (Stellar Pulso)

Copiá y pegá las secciones según los campos que te pida el formulario.

> **Actualizado el 23/11/2026.** Este texto se escribió para la Stellar Pulso Hackathon
> (julio 2026), con el contrato de ese momento. Ahora apunta al **contrato nuevo**
> (instalado el 22/09), al video nuevo y al equipo actual. El contrato de julio
> (`CCYCSIXO…MX2W5N`) sigue en la red y su evidencia queda en `DESPLIEGUE-TESTNET.md`.

---

## Nombre del proyecto
**Minga — Pagos en escrow para las economías invisibles de América Latina**

## Tagline (una línea)
Convertimos la actividad de los pequeños comercios informales en identidad, crédito y poder colectivo — sobre Stellar.

## Descripción corta
Minga es un sistema operativo económico para los microcomercios que el sistema financiero ignora. Para este hackathon construimos y deployamos su primera pieza funcional: **pagos en escrow a proveedores** con un smart contract en Soroban, donde el dinero queda garantizado por la blockchain hasta que se confirma la entrega.

---

## El problema
En América Latina, millones de pequeños comerciantes, emprendedores y trabajadores de oficio son invisibles para el sistema financiero: no tienen registro verificable de su actividad, no acceden a crédito, y negocian solos contra sus proveedores. Un nudo concreto de ese problema es la **confianza con proveedores**: si el comerciante paga por adelantado se arriesga a que el pedido no llegue; si quiere pagar después, muchos proveedores no le venden porque no lo conocen.

## La solución (lo que construimos)
Un flujo de **pago en escrow** end-to-end, funcionando sobre Stellar:
1. El comerciante crea el pedido y **el pago queda bloqueado** en un contrato (ni el comerciante ni el proveedor lo tienen).
2. El proveedor ve on-chain que el pago está garantizado y entrega la mercadería.
3. El comerciante confirma la entrega desde la app y **el contrato libera el pago automáticamente** al proveedor.
4. Si el pedido no se concreta, se cancela y los fondos vuelven al comerciante.

Fiel al principio de Minga: **la persona nunca toca la blockchain** — solo ve "pedido creado" / "pago liberado".

## Cómo usa Stellar (integración fundamental, no decorativa)
- **Smart contract en Soroban (Rust)** que **custodia y transfiere XLM real** de testnet. Sin el contrato no hay garantía de pago — es el motor del producto. Funciones: `create_escrow`, `marcar_entregado`, `confirm_delivery`, `cancel_escrow`, `objetar_entrega`, `reclamar_pago`, `devolver_fondos`, y las de lectura `get_escrow_status`, `get_escrow`, `get_token`, `segundos_restantes`, `puede_reclamar`.
- **Plazo y disputa**: el comprador elige de 1 a 60 días para revisar la mercadería. Si no responde, el proveedor cobra al vencer el plazo; si objeta, la plata queda frenada hasta que uno de los dos ceda.
- **Avisos públicos en la red** (eventos) en cada cambio de estado, y los pedidos renuevan su vencimiento (TTL) mientras se usan.
- **La moneda se fija al instalar el contrato** y no se puede cambiar, para que nadie pueda pagar con un token falso.
- **29 pruebas automáticas**, incluidas pruebas de propiedades (miles de casos al azar que verifican que las cuentas siempre cierren), y una revisión de seguridad escrita (`docs/revision-seguridad.md`).
- **Stellar Wallets Kit** (categoría Wallet Integration de la lista de integraciones) para que el comerciante firme cada operación con su billetera (Freighter, xBull, Albedo, Lobstr).
- Todo corre en **Stellar Testnet**, con transferencias reales del token XLM nativo.

## Demo en vivo en testnet (evidencia verificable)
- Contrato deployado (22/09/2026): `CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G`
- Pedidos reales hechos desde el celular:
  - **287573** y **125388**: recorrido completo, crear pedido → el proveedor avisa que entregó → confirmar → **el proveedor cobra** («Pago liberado»).
  - **129183**: queda **Pendiente** a propósito, para mostrar que la plata está guardada esperando la mercadería.
- Evidencia con links a cada transacción en el repo (`DESPLIEGUE-TESTNET.md`), incluido el despliegue de julio.

## Stack técnico
Soroban (Rust) · Stellar Wallets Kit · @stellar/stellar-sdk · React + TypeScript + Vite · Stellar Testnet. Frontend desplegado en Vercel.

## Validación con clientes
Realizamos entrevistas de descubrimiento con emprendedores reales de Salta de tres rubros distintos (comercio minorista, servicio/oficio y artesano) para validar el dolor de la confianza con proveedores y la exclusión financiera. *(Evidencia en el link de Drive.)*

En septiembre sumamos una **prueba de uso sin ayuda** desde el celular (Ruperto, CompraLinda, electrónica) y una entrevista a Antonio y Nelly (artículos de limpieza). Ruperto no llegó a completar el pedido: se trabó buscando la billetera. Eso nos confirmó que el próximo paso es entrar sin billetera, con huella (passkeys). Todo está en la carpeta `entrevistas/` del repo.

## Visión / roadmap
El escrow es la puerta de entrada: cada pago genera el registro verificable que luego se convierte en **reputación on-chain → crédito sin banco → datos que vuelven a la comunidad (data-to-earn)**. Construimos en fases, priorizando la adopción.

## Equipo
Cintia Venecia · Octavio Giménez Bravo — Salta, Argentina.

## Links
- Repositorio: https://github.com/veneciaedith/minga
- App en vivo: https://minga-r5ql.vercel.app
- Video demo: https://youtube.com/shorts/dZOcmdeODEs
- Presentación (PDF): https://github.com/veneciaedith/minga/blob/main/presentacion/Minga-Pitch-Deck.pdf
- Entrevistas (Drive): *(pegar link cuando estén las 3)*
- Contrato en el explorador: https://stellar.expert/explorer/testnet/contract/CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G
