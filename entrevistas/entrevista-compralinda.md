# Entrevista y prueba de uso: Ruperto, CompraLinda (electrónica)

- **Fecha**: 26 de septiembre de 2026, durante el Argentina Builder Challenge
- **Negocio**: CompraLinda, venta de productos electrónicos
- **Proveedores**: en Bolivia
- **Relación con el proyecto**: es hermano de Cintia Venecia. Lo decimos para ser transparentes.
- **Permiso**: dio permiso para usar sus respuestas, sus frases y su logo en la entrega y en la presentación.

Este archivo tiene dos partes: la **prueba de uso** (usó Minga solo, desde su celular) y la
**entrevista** sobre cómo le compra a sus proveedores. Las respuestas están copiadas tal
como las dio, sin corregirlas.

---

## Parte 1: Prueba de uso

Siguió el protocolo de [`prueba-usuario.md`](prueba-usuario.md): el link abierto en Chrome,
la billetera xBull y nadie que lo guiara.

| | |
|---|---|
| **Tiempo** | Unos 10 minutos, intentándolo solo |
| **Intervenciones** | 1. xBull no aparecía en Play Store, así que se la ayudó a abrir desde Google |
| **¿Hizo el pedido?** | **No** |
| **Puntaje** | **3 / 5** de facilidad sin ayuda |

### Dónde se trabó

1. **Buscar la billetera.** Al buscar «xbull wallet» en Play Store le aparecieron otras apps de
   nombre parecido (BULL, Bull Wallet). Preguntó cuál era.
2. **La billetera estaba vacía en la red de prueba.** xBull le mostraba la cuenta creada, en la
   red real («Main Network») y con saldo 0. Minga le decía que la billetera «no existía en la
   red de prueba». Él había hecho todo lo que creía que había que hacer.
3. **Cerró la ventana de firma** y apareció un error en rojo, en inglés: «The user closed the
   modal. (código -1)».

### Lo que dijo

Respuestas a las preguntas del final:

1. **¿Pudiste conectar la billetera vos solo? ¿Dónde te trabaste?**
   No pude del todo. Me trabé en la parte de guardar la plata: el sistema me informaba que la
   billetera no existía en la red de prueba.
2. **¿Entendiste qué pasó con tu plata? ¿Dónde quedó guardada?**
   Cuando hice el pedido, mi plata quedó retenida en alguna parte.
   *(No es así: el pedido no se creó y la plata no se movió. Que lo haya entendido así es un
   hallazgo.)*
3. **¿Hubo alguna palabra o mensaje que no se entendió?**
   Sí, no entendí el mensaje de error que me apareció al último.
4. **Del 1 al 5, ¿qué tan fácil fue sin ayuda?**
   3.
5. **¿Confiarías tu plata a esto en vez del boca a boca de siempre?**
   Sin dudas, porque entiendo que la tecnología blockchain es segura.

Frases de sus audios de WhatsApp, transcriptos:

> «Ahí está bueno que el cuadrito rojo te informe la situación en la que te encontrás, […]
> pero te tira "user closed the modal" y te tira el código menos uno, como que no se entiende.»

> «Se me complicó porque dice que no estaba conectada, y yo sí creé la cuenta en xBull desde
> Chrome y la tengo activa.»

> «No sé qué pasó, qué paso faltó ahí en el medio.»

### Qué arreglamos por esta prueba

Los dos arreglos quedaron publicados el mismo día (pull request #6):

- **Botón «Cargar plata de prueba».** La app detecta la billetera vacía apenas se conecta, dice
  qué falta y la carga en un toque.
- **Mensaje claro al cerrar la billetera.** Ya no aparece en rojo ni en inglés: dice que no se
  hizo nada y que la plata no se movió.

---

## Parte 2: Entrevista, cómo le compra a Bolivia

1. **¿Cómo le pagaste al proveedor de Bolivia la última vez?**
   Por transferencia.
2. **¿Antes o después de recibir la mercadería?**
   Antes. Transfiere primero y después llega la mercadería.
3. **¿Cómo te llega la mercadería?**
   Me la busca un pasero, se la entrega al remisero.
4. **¿Quién se hace cargo si se pierde o llega fallada?**
   La trae a domicilio el remisero, y él se hace cargo si le pasa algo a la mercadería.
5. **¿Alguna vez un proveedor de allá te falló?**
   No.

---

## Conclusión

**Las 3 cosas más importantes:**

1. **Paga por adelantado** a un proveedor de otro país, antes de ver la mercadería.
2. Entre el proveedor y él hay **dos personas más**: el pasero, que cruza la frontera, y el
   remisero, que la lleva hasta su casa y responde si pasa algo.
3. **Nunca le falló nadie**, pero no tiene ninguna garantía: todo depende de que cada persona
   cumpla su palabra.

**Señales para Minga:**

| Idea de Minga | ¿Lo confirma? | Por qué |
|---|---|---|
| Plata guardada hasta que llega el pedido (escrow) | **Sí, fuerte** | Paga por adelantado a alguien que no ve, y la mercadería pasa por dos manos más antes de llegar. |
| La barrera de entrada es la billetera | **Sí** | No pudo hacer el pedido porque le faltaba un paso con la billetera, no por la idea de la plata en garantía. |
| Mensajes claros, sin palabras técnicas | **Sí** | El error en inglés y con código no se entendió. |

**Qué aprendemos:** el comercio informal funciona con **cadenas de confianza entre personas**
(el proveedor, el pasero, el remisero) que andan bien hasta que se rompe un eslabón. Cuando se
rompe, no hay nada que lo respalde. Hoy a Ruperto le funciona, pero nada garantiza que mañana
siga funcionando. Minga pone la garantía en el pago, no en las personas.
