# 🎬 Guion del video demo (1:45 aprox.)

Recorrido del prototipo funcionando. No hace falta que aparezcas en cámara: alcanza con
grabar la pantalla + tu voz. Tené abierto: (1) la app en `localhost`, (2) una pestaña con
[stellar.expert testnet](https://stellar.expert/explorer/testnet/contract/CCYCSIXOT4XBMEGE2AQUMHZ2JKURZXRKB6MH7DFFQCDCZQGSL3MX2W5N),
(3) Freighter en **Testnet**.

> Consejo: hacé un ensayo en seco primero. Generá un **N° de pedido nuevo** antes de grabar
> (no reuses el #42, que ya está "liberado").

---

| Tiempo | Qué se ve en pantalla | Qué decís (narración) |
|---|---|---|
| **0:00–0:12** | Pantalla "Comerciante (Rosa)" de la app, quieta. | "Rosa tiene un almacén en Salta. Cuando le compra a un proveedor nuevo, choca con un problema: si paga por adelantado se arriesga a que no le llegue; si paga después, no le confían. Esto le pasa a millones de comerciantes en América Latina." |
| **0:12–0:25** | Click en **"Conectar wallet"** → elegís Freighter en el modal → conectada. | "Minga lo resuelve con un pago en garantía sobre Stellar. Rosa conecta su billetera —pero no necesita saber qué es blockchain." |
| **0:25–0:45** | Completás **proveedor**, **monto** (ej. 10) y **descripción**. Mostrás el **N° de pedido**. Click en **"Crear pedido y bloquear pago"** → firmás en Freighter. | "Arma el pedido y, en vez de pagarle directo al proveedor, el dinero queda bloqueado en un contrato. Ni Rosa ni el proveedor lo tienen: lo custodia el contrato." |
| **0:45–0:58** | Aparece el mensaje de éxito + link "Ver transacción". Vas a la pestaña **Proveedor**, pegás el N° de pedido → **"Consultar estado"** → muestra **⏳ Pendiente**. | "El proveedor entra, consulta el pedido directamente en la blockchain, y ve que el pago está garantizado. Recién ahí entrega la mercadería, tranquilo." |
| **0:58–1:15** | Volvés a **Comerciante** → click en **"Confirmar entrega (liberar pago)"** → firmás en Freighter. | "Rosa recibe el pedido y confirma la entrega con un botón. En ese momento, el contrato libera el pago automáticamente al proveedor." |
| **1:15–1:32** | Pestaña **Proveedor** → consultás de nuevo → **✅ Pago liberado**. | "Y listo: pago liberado. Para ellos fue 'pedido confirmado, pago enviado'. Por debajo, Stellar garantizó que nadie pudiera quedarse con el dinero indebidamente." |
| **1:32–1:45** | Pasás a **stellar.expert**: mostrás la transacción de `confirm_delivery` y el balance del proveedor con **+10 XLM**. | "Y esto no es una maqueta: es una transacción real en Stellar testnet. El dinero se movió de verdad. Minga convierte la economía invisible en algo que el sistema por fin puede ver." |

---

## Cierre opcional (si te sobra tiempo, +10 s)
> "La minga es el trabajo comunitario andino: muchas manos levantan lo que una sola no puede.
> Eso queremos ser, ahora con tecnología. Gracias."

## Checklist antes de grabar
- [ ] Freighter en **Testnet** y con saldo (Friendbot).
- [ ] N° de pedido nuevo (no el #42).
- [ ] Wallet del proveedor a mano para pegar.
- [ ] Pestaña de stellar.expert ya abierta en el contrato.
- [ ] Audio probado. Grabá en horizontal / pantalla completa.
