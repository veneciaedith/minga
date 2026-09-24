# 🛰️ Despliegue en vivo — Stellar Testnet

> Evidencia de que el contrato de escrow de Minga está **deployado y funcionando en la
> red de prueba de Stellar**, con el flujo completo ejecutado on-chain (no simulado).
> Todos los links abren en el explorador público stellar.expert.

---

# 🆕 Contrato actual — 22 de septiembre de 2026

Este es el contrato **que usa la app hoy**: el que tiene plazo, entrega declarada por
el proveedor, disputa, avisos en la red y la moneda fijada en el deploy.

| Qué | Valor |
|---|---|
| **Contract ID** | [`CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G`](https://stellar.expert/explorer/testnet/contract/CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G) |
| Cuenta que lo instaló | `GD5TCMAA3PHUFOCRVVJLSXVGW5QY3SZJ4UVXC6VNL6A3KXEVKB36Q7KI` |
| Moneda (XLM nativo, SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Red | Stellar Testnet |

| Acción | Transacción |
|---|---|
| **Subida del contrato** (WASM) | [`d2294121…`](https://stellar.expert/explorer/testnet/tx/d2294121de8b27be191062f56a3e8b27962c0b2b618c30dbe1a734e8995f9f68) |
| **Instalación** (con la moneda fijada) | [`8749ed98…`](https://stellar.expert/explorer/testnet/tx/8749ed988654769bbe44f4ff6f03825555c5ffcbfefacf249dba81785bb02352) |

### Comprobación de que la moneda quedó bien fijada

Cualquiera puede verificar, sin permiso ni firma, qué moneda acepta este contrato:

```bash
stellar contract invoke \
  --id CDUJYPSQOFAQOHNQLERLEG54USCED3MJIGNHLWTILAKUZ22PWLMAZ73G \
  --source <tu-identidad> --network testnet \
  -- get_token
# => "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
```

Ya se corrió y devuelve el XLM nativo de testnet, como corresponde. Esa es la garantía
de que nadie puede crear un pedido con una moneda falsa: la moneda se fijó en el deploy
y ninguna función la puede cambiar.

---

# 📱 Primeros pedidos reales, hechos desde el celular — 23 y 24 de septiembre de 2026

Contra el contrato nuevo. No son una demo grabada de antemano: son operaciones que
Cintia hizo en vivo, desde su celular, con la billetera **xBull** (web) y la cuenta
`GD5TCMAA3PHUFOCRVVJLSXVGW5QY3SZJ4UVXC6VNL6A3KXEVKB36Q7KI`. Sirven de referencia para
el checkpoint del Argentina Builder Challenge y quedan visibles en la app.

| Pedido | Qué muestra | Estado |
|---|---|---|
| **129183** | La plata recién guardada, esperando la mercadería. No se toca a propósito. | Pendiente |
| **287573** | El recorrido completo: guardada → el proveedor avisa que entregó → confirmada → pagada. | Pago liberado |
| **125388** | El mismo recorrido completo, repetido para confirmar que no fue casualidad. | Pago liberado |

Comprobante público de la confirmación del pedido 125388 (el pago liberándose al
proveedor):
[`9abaf38e…`](https://stellar.expert/explorer/testnet/tx/9abaf38e233dfe5e2f4e974a8a0fde444f7cb610a01c6b36b194845b1658be18)

---

# 📜 Contrato anterior — julio de 2026

Se deja como evidencia del **flujo completo ejecutado on-chain**, con plata moviéndose
de verdad entre billeteras. Era la versión sin plazo ni disputa.

## Contrato y cuentas

| Qué | Valor |
|---|---|
| **Contract ID** | [`CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N`](https://stellar.expert/explorer/testnet/contract/CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N) |
| Comprador (Rosa) | `GDAF3VWPLPXGI6VPBA4A5ULLNOXQI7DCWLRJGZFRQVC4G422DBNTBE56` |
| Proveedor | `GBJJK3S4FU7VCKDTPS4O4RKSFYF5EERKGIUSUY2AVZEF2CU4PMGBOXLD` |
| Token (XLM nativo, SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Red | Stellar Testnet |

## El flujo completo, transacción por transacción

| Acción | Qué pasó on-chain | Transacción |
|---|---|---|
| **Deploy del contrato** | Se subió el WASM y se instanció el contrato | [`c5a26eb2…`](https://stellar.expert/explorer/testnet/tx/c5a26eb2f11a9e6afc1cd1c3ac22db4aa7ecc73a37cecfc67b549a8c64e7671d) |
| **create_escrow** (pedido #42) | Transferencia de **10 XLM del comprador → contrato** (fondos bloqueados) | [`1f742ee9…`](https://stellar.expert/explorer/testnet/tx/1f742ee9709195fff5f302326026040451a41b8ed3af01a6e85fc42b1feae522) |
| **confirm_delivery** (pedido #42) | Transferencia de **10 XLM del contrato → proveedor** (pago liberado) | [`f20bf16a…`](https://stellar.expert/explorer/testnet/tx/f20bf16a1e5971d09ea90c85c02ba9529b1b5a8be11b67691d8384e803a7eef4) |

## Prueba de que el dinero se movió de verdad

Balance del proveedor en XLM (en stroops, 1 XLM = 10.000.000 stroops):

```
Antes de confirmar la entrega:  100000000000   (10.000 XLM)
Después de confirmar:           100100000000   (10.010 XLM)  → +10 XLM exactos
```

Y el estado del pedido #42 cambió de `pendiente` → `liberado`, consultable en cualquier
momento llamando a `get_escrow_status`:

```bash
stellar contract invoke \
  --id CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N \
  --source <tu-identidad> --network testnet \
  -- get_escrow_status --id_pedido 42
# => "liberado"
```

## Cómo reproducirlo

Los comandos exactos para deployar y correr este flujo están en
[`COMANDOS.md`](COMANDOS.md). El `CONTRACT_ID` de arriba ya está cargado en
[`frontend/src/config.ts`](frontend/src/config.ts), así que el frontend ya apunta a este
contrato en vivo.
