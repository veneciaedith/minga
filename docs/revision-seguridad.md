# Revisión de seguridad del contrato

> **17 de septiembre de 2026** · sobre `contracts/escrow/src/lib.rs`
> (el contrato nuevo, con plazo, disputa y eventos — todavía sin deployar).

## Qué es esto, y sobre todo qué NO es

Esto es una **revisión interna** hecha contra la lista oficial de vulnerabilidades
de Soroban que publica Stellar, más herramientas automáticas.

**No reemplaza una auditoría.** Una auditoría la hace gente externa, que cobra por
romper lo que vos hiciste y que no tiene ningún interés en que el resultado sea
lindo. Esto es una revisión cuidadosa de quien escribió parte del código, que es
útil pero **no es lo mismo** y no hay que presentarlo como si lo fuera.

Sirve para dos cosas: encontrar problemas antes de que los encuentre otro, y llegar
a una auditoría con la tarea hecha, que es lo que la propia guía de Stellar
recomienda (*«el tiempo del auditor se aprovecha mejor en la lógica que en la
pelusa»*).

## Cómo se hizo

1. **Las 11 clases de vulnerabilidad** de `.claude/skills/smart-contracts/security.md`,
   una por una, contra cada función del contrato.
2. **La lista específica para contratos que reciben tokens** (escrows, bóvedas,
   préstamos) de esa misma guía.
3. **La lista del lado del cliente** (la app que firma).
4. **Clippy**, el analizador que viene con Rust: `cargo clippy --all-targets`.
5. Se intentó correr **Scout** (CoinFabrik), el analizador específico de Soroban.
   No se pudo en este entorno: pide una versión de Rust más nueva que la instalada.
   **Queda pendiente correrlo en la máquina de Cintia** (ver el final).

---

## Resultado general

**No se encontró ninguna forma de que alguien se lleve plata que no es suya.**

Las siete funciones que mueven dinero piden firma, y —esto es lo importante— la
dirección que tiene que firmar **se lee de lo que quedó guardado cuando se creó el
pedido**, no de lo que manda quien llama. La guía de Stellar marca ese punto como el
error número uno y el más común del mundo real. Acá no está.

Los hallazgos que siguen son **cosas a mejorar y decisiones a tomar**, no agujeros
por donde se escapa la plata.

---

## Hallazgos

### 1 · MEDIO — El contrato no comprueba cuánto recibió de verdad

**Qué pasa.** Cuando se crea un pedido, el contrato pide que se le transfieran, por
ejemplo, 500, y anota «este pedido vale 500». No comprueba que hayan entrado 500.

**Por qué importa.** El contrato guarda la plata de **todos** los pedidos junta, en
una sola bolsa, y lleva la cuenta de cuánto le toca a cada uno. Si alguna vez se
deployara con una moneda que cobra comisión al transferir —entran 495 pero se anotan
500—, la cuenta quedaría inflada, y al pagar un pedido se estaría usando plata de
otro. Se descubre recién cuando el último se queda sin cobrar.

**Por qué hoy no es un problema.** El token se fija en el deploy y se usa el XLM
oficial de Stellar, que transfiere el monto exacto. Lo mismo vale para USDC.

**Qué se puede hacer.**
- *Mínimo (gratis):* dejar escrito que este contrato **solo se deploya con un token
  estándar**, y verificar con `get_token()` antes de confiar en un contrato ajeno.
- *Defensivo:* medir el saldo del contrato antes y después de la transferencia y
  exigir que la diferencia sea exactamente el monto. Cuesta dos lecturas más por
  pedido, y deja de depender de que quien deploye haga las cosas bien.

---

### 2 · MEDIO — Los números de pedido son un espacio público

**Qué pasa.** El pedido se guarda por número, a secas. Cualquiera puede crear un
pedido con cualquier número, sin pasar por la app.

**Por qué importa.** Alguien podría ocupar números a propósito para que a Rosa le
aparezca *«ese número ya está usado»* una y otra vez. **No roba nada** —paga sus
propias comisiones y pone su propia plata—, pero molesta y desgasta la confianza.

**El arreglo de fondo.** Que el pedido se guarde por **comerciante + número**, en vez
de solo número. Así el pedido 42 de Rosa y el 42 de otra persona son dos pedidos
distintos, y nadie puede ocupar los tuyos. Es un cambio de contrato, o sea otro
deploy: **no antes del 27/09**.

---

### 3 · A DECIDIR — Una disputa sin acuerdo congela la plata para siempre

Esto ya estaba anotado como decisión tomada, y no es un error. Pero en una revisión
de seguridad hay que decirlo con todas las letras:

**Si Rosa objeta y el proveedor no cede, la plata queda frenada para siempre.** No
hay árbitro, no hay administrador, no hay plazo máximo. Con plata de prueba no pasa
nada. Con plata real, significa que **alguien pierde todo** y no hay a quién recurrir.

Va junto con la otra decisión tomada: **no hay pausa de emergencia ni forma de
actualizar el contrato**. La contracara honesta de esa decisión es que **si aparece un
error después del deploy, no hay manera de arreglarlo ni de frenarlo**. Se puede
deployar un contrato nuevo para los pedidos que vengan, pero los que ya estaban
adentro siguen con las reglas viejas.

**Las dos decisiones son defendibles** —un administrador que puede congelar la plata
de la gente contradice la premisa de Minga— pero tienen precio, y el precio hay que
poder nombrarlo ante un jurado o un auditor.

**Salidas posibles que no traicionan el principio, para pensar después:**
- Un **plazo máximo de disputa**: si a los X días nadie cedió, la plata vuelve al
  comprador (o se parte). Lo decide el reloj, no una persona.
- Un **árbitro opcional**, elegido **por las dos partes al crear el pedido**, que solo
  puede actuar si hay disputa. Si no se elige ninguno, no hay árbitro.

> Esto es una decisión de producto y la toma Cintia. Queda anotada, no resuelta.

---

### 4 · BAJO — El instante del vencimiento es una carrera

Justo en el borde del plazo, si Rosa objeta y el proveedor reclama casi al mismo
tiempo, gana quien entre primero a la red. **Las dos salidas son legítimas** y nadie
pierde plata: o se frena el pago, o se paga. Es inherente a cualquier plazo y no
tiene arreglo real. Se menciona para que nadie se asuste si pasa.

---

### 5 · BAJO — Si se pasa a USDC, hace falta la «línea de confianza»

Con XLM no hace falta nada. Pero los activos emitidos (USDC, o un peso digital)
necesitan que la billetera que va a recibir tenga abierta una **línea de confianza**
con ese activo. Si el proveedor no la tiene, **el pago le falla**.

**Antes de cambiar la moneda hay que:** comprobarlo antes de crear el pedido y avisar
en castellano, o explicarlo en la pantalla. Si no, el proveedor ve un error
incomprensible justo en el momento de cobrar.

---

### 6 · BAJO — Los números de error son ahora parte de la interfaz

La app traduce los errores del contrato **por número**. Si alguien reordena la lista
de errores en el contrato, los mensajes de la app empiezan a mentir: le dicen a la
persona algo que no pasó. Ya quedó una nota en los dos archivos. **Regla: los errores
se agregan al final, nunca se reordenan.**

---

## Lo que está bien

Esto importa tanto como los hallazgos, y sirve para el pitch:

| Punto de la lista oficial | Estado |
|---|---|
| Firma en todas las funciones que mueven plata | ✅ Las 7 la piden |
| La dirección que firma se lee del almacenamiento, no del parámetro | ✅ **El error más común del mundo real, y no está** |
| No se puede reinicializar el contrato | ✅ Usa `__constructor`, que corre una sola vez |
| El token no lo elige quien llama | ✅ Se fija en el deploy y no se puede cambiar |
| Sin llamadas a contratos arbitrarios | ✅ Solo habla con el token fijado |
| Aritmética protegida | ✅ `overflow-checks`, y `saturating_add` en el plazo |
| Montos negativos rechazados | ✅ `monto <= 0` da error |
| Claves de almacenamiento tipadas | ✅ Enum `DataKey` |
| Sin bucles ni datos sin límite | ✅ No hay un solo bucle: nadie puede ahogarlo |
| El vencimiento del almacenamiento NO se usa como seguridad | ✅ El plazo se guarda como dato y se compara con el reloj |
| Renovación del vencimiento en los caminos calientes | ✅ Desde el 16/09 |
| Eventos para todo cambio de estado | ✅ Desde el 16/09 |
| Sin administrador, sin pausa, sin actualización | ⚠️ Decisión tomada — ver hallazgo 3 |

**Clippy:** una sola sugerencia en el contrato, y es de estilo (`saturating_sub`), no
un error. Cuatro sugerencias de estilo en los tests.

### Del lado de la app

| Punto | Estado |
|---|---|
| Se le dice a la billetera en qué red firma | ✅ Se pasa testnet explícito |
| Se simula la transacción antes de mandarla | ✅ `prepareTransaction` |
| Se muestra con claridad qué se va a hacer, y se confirma | ✅ La pantalla de repaso |
| La dirección del contrato se puede verificar | ⚠️ Está fija en `config.ts`; se puede confirmar con `get_token()` |

---

## Lo que falta, en orden

1. **Correr Scout en la máquina de Cintia.** Es el analizador específico de Soroban,
   con más de 20 detectores. Acá no corre por la versión de Rust.
   ```bash
   cargo install cargo-scout-audit
   cd contracts/escrow && cargo scout-audit
   ```
2. ~~Tests de propiedades~~ ✅ **HECHO el 17/09** — ver la sección siguiente.
3. **Medir la concurrencia de verdad.** Queda una duda abierta: cada creación de
   pedido renueva también el vencimiento de la configuración global, que es **una
   entrada compartida por todos**. No sé con certeza si eso hace que las creaciones
   simultáneas se serialicen. Se mide con una prueba de carga en testnet.
4. **Auditoría externa, antes de cualquier peso real.**
   Stellar tiene el **[Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank)**:
   auditorías subsidiadas por la SDF para proyectos financiados por el SCF. Ese es el
   camino realista para Minga, y es una razón más para presentarse al SCF.

---

## Conclusión honesta

Para **testnet, con plata de mentira y siete personas probando: se puede avanzar
tranquila.** No hay nada que robar y no se encontró ningún agujero.

Para **plata real: no salir sin una auditoría externa.** No por desconfianza en este
código, sino porque es lo que corresponde cuando se custodia plata de otros, y porque
sin pausa ni actualización un error no se puede arreglar después.


---

## Tests de propiedades (hechos el 17/09)

Están en `contracts/escrow/src/propiedades.rs`. Son **cuatro reglas que no se pueden
romper**, y la computadora arma sola las combinaciones que intentan romperlas.

| Regla | Qué defiende |
|---|---|
| La plata ni se crea ni se destruye | Lo que hay al final es lo mismo que había al principio, repartido de otra manera |
| Lo guardado coincide con lo debido | **El pago de un pedido nunca usa la plata de otro** (es el hallazgo 1) |
| Nadie cobra dos veces | El proveedor tiene exactamente los pedidos que se le pagaron |
| Los límites se respetan siempre | Monto no positivo y plazo fuera de rango se rechazan, sea cual sea el número |

La prueba principal arma secuencias al azar de hasta 14 acciones sobre **tres pedidos
a la vez**, en cualquier orden, con saltos de tiempo en el medio, y revisa las cuatro
reglas **después de cada acción**.

### Cómo sabemos que estos tests sirven

Un test que nunca falló no prueba nada. Así que se rompió el contrato a propósito, dos
veces, para ver si las propiedades se daban cuenta:

**Sabotaje 1** — que el contrato reciba un peso menos del que anota (simula justo el
hallazgo 1: una moneda que cobra comisión al transferir).
→ **Detectado**: *«lo que el contrato tiene no coincide con lo que dice deber»*.

**Sabotaje 2** — sacarle el control de que el pedido siga abierto antes de pagar, o sea
permitir cobrar dos veces.
→ **Detectado**, y además **redujo el problema a la secuencia más corta posible**:

```
1. Crear el pedido 2
2. Crear el pedido 1
3. Cancelar el pedido 2   → la plata vuelve al comprador
4. Confirmar el pedido 2  → ¡cobra de nuevo!
                            y esa plata sale del pedido 1
```

Eso es lo que hace valiosa esta técnica: no solo avisa que algo está mal, sino que
entrega la receta exacta para reproducirlo. Ningún test escrito a mano habría probado
«cancelar y después confirmar el mismo pedido, con otro pedido al lado».

Después de los dos sabotajes el contrato se restauró y **las 29 pruebas pasan**.

Las semillas de los dos casos quedaron guardadas en
`contracts/escrow/proptest-regressions/`, así que **esos dos escenarios se vuelven a
probar en cada corrida**, para siempre. Si alguien reintroduce cualquiera de los dos
errores, salta enseguida.
