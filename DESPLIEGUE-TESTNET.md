# 🛰️ Despliegue en vivo — Stellar Testnet

> Evidencia de que el contrato de escrow de Minga está **deployado y funcionando en la
> red de prueba de Stellar**, con el flujo completo ejecutado on-chain (no simulado).
> Todos los links abren en el explorador público stellar.expert.

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
