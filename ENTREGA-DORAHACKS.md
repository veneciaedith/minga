# 📨 Texto para la entrega en DoraHacks (Stellar Pulso)

Copiá y pegá las secciones según los campos que te pida el formulario.

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
- **Smart contract en Soroban (Rust)** que **custodia y transfiere XLM real**: `create_escrow`, `confirm_delivery`, `cancel_escrow`, `get_escrow_status`. Sin el contrato no hay garantía de pago — es el motor del producto.
- **Stellar Wallets Kit** (categoría Wallet Integration de la lista de integraciones) para que el comerciante firme cada operación con su billetera (Freighter, xBull, Albedo, Lobstr).
- Todo corre en **Stellar Testnet**, con transferencias reales del token XLM nativo.

## Demo en vivo en testnet (evidencia verificable)
- Contrato deployado: `CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N`
- Flujo completo ejecutado on-chain: crear escrow → confirmar entrega → **+10 XLM transferidos al proveedor**, con estado `pendiente → liberado`.
- Evidencia con links a cada transacción en el repo (`DESPLIEGUE-TESTNET.md`).

## Stack técnico
Soroban (Rust) · Stellar Wallets Kit · @stellar/stellar-sdk · React + TypeScript + Vite · Stellar Testnet. Frontend desplegado en Vercel.

## Validación con clientes
Realizamos entrevistas de descubrimiento con emprendedores reales de Salta de tres rubros distintos (comercio minorista, servicio/oficio y artesano) para validar el dolor de la confianza con proveedores y la exclusión financiera. *(Evidencia en el link de Drive.)*

## Visión / roadmap
El escrow es la puerta de entrada: cada pago genera el registro verificable que luego se convierte en **reputación on-chain → crédito sin banco → datos que vuelven a la comunidad (data-to-earn)**. Construimos en fases, priorizando la adopción.

## Equipo
Cintia Venecia · Mariela Caminos · Cristina Soto · Lourdes Gimenez Bravo — Salta, Argentina.

## Links
- Repositorio: https://github.com/veneciaedith/minga
- App en vivo: https://minga-r5ql.vercel.app
- Video demo: https://youtu.be/6X-0l_hIbqs
- Entrevistas (Drive): *(pegar link cuando estén las 3)*
- Contrato en el explorador: https://stellar.expert/explorer/testnet/contract/CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N
