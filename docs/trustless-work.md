# Trustless Work: ¿lo usamos o seguimos con el escrow propio?

> Investigación del **26 de noviembre de 2026**.
> **Decisión vigente: seguimos con el escrow propio.** Este documento guarda por qué,
> para no tener que buscarlo de nuevo.

## Qué es

[Trustless Work](https://github.com/Trustless-Work) ofrece escrow (depósito en
garantía) como servicio sobre Stellar: contratos ya hechos, con una API para usarlos.
Se lo recomendaron a Cintia en una mentoría en septiembre de 2026.

**Minga no lo usa.** Su escrow es propio: está en `contracts/escrow/src/lib.rs`.

## Las 6 preguntas que nos habíamos anotado

Estas preguntas estaban en `ESTADO-Y-PROXIMOS-PASOS.md` desde el 16/09. Las tres
primeras son las más importantes, porque tocan decisiones que Minga tomó al revés a
propósito.

### 1. ¿Se puede usar sin su API, sin una empresa en el medio?

**En parte.**

- El código del contrato es público y cualquiera puede instalarlo con el programa de
  Stellar, igual que hicimos con Minga.
- Su forma habitual de trabajo pide una **clave de acceso** (API key) o una sesión de
  billetera para usar su servicio.
- **No encontramos** si se puede crear un pedido con su contrato sin pasar por ellos.

### 2. ¿Quién resuelve las disputas?

**Hay un árbitro con poder sobre la plata.**

- Cada pedido tiene un «resolvedor de disputas». Cuando alguien abre una disputa, es
  la única persona que puede decidir **a qué direcciones va la plata y cuánto a cada
  una**.
- No encontramos ninguna regla que limite esas direcciones a la compradora y al
  proveedor.
- **No encontramos** quién elige al árbitro, ni si puede ser la misma plataforma.

### 3. ¿Alguien puede pausar o congelar los pagos?

**Según lo que leímos, no.**

- Su lista de funciones no tiene pausa, congelamiento ni administrador.
- La plataforma puede modificar un pedido solo mientras todavía no tiene plata.
- No leímos el código completo, así que **no podemos asegurar** que no haya una forma
  de actualizarlo.

### 4. ¿Cobran comisión?

**Sí.**

- Trustless Work cobra **0,3%** de cada pago que se libera en la red real.
- Además, la plataforma puede sumar su propia comisión, de hasta 99%.
- Para Minga sería **0,3% + nuestro 1%** al proveedor.

### 5. ¿Qué licencia tiene el código?

**No tiene licencia publicada.** El repositorio del contrato no tiene archivo de
licencia y el README no dice nada. Sin licencia, legalmente no está claro si podemos
copiar o modificar su código.

### 6. ¿Está auditado?

**Sí.** La empresa Runtime Verification lo auditó entre agosto y septiembre de 2025.
Encontró **19 fallas críticas o altas y 4 medias**. **No pudimos confirmar si las
arreglaron.** Es habitual que se arreglen antes de publicar el informe, pero hay que
verificarlo.

### Dato extra: monedas

Su foco es **USDC**. En la red de prueba también lo probaron con XLM.

## Comparación

| | Minga hoy | Trustless Work |
|---|---|---|
| Empresa en el medio | No | Sí, en el uso habitual (con clave) |
| Árbitro con poder sobre la plata | No | **Sí** |
| Pausa o administrador | No | No, según lo que leímos |
| Comisión extra | No | 0,3% |
| Licencia clara | Es nuestro código | **No publicada** |
| Auditoría externa | No | Sí, 2025 |
| Disputa sin acuerdo | La plata queda frenada para siempre | La resuelve el árbitro |

## Conclusión

Trustless Work choca con dos decisiones de Minga: pone a una empresa en el medio y le
da a un árbitro poder sobre la plata. Además, tiene un punto legal sin resolver,
porque no publica licencia.

A su favor tiene dos cosas que a Minga le faltan: una auditoría externa y una forma de
destrabar una disputa. Este segundo punto importa. Hoy, si la compradora y el
proveedor no se ponen de acuerdo, la plata queda frenada para siempre. La revisión de
seguridad de Minga ya lo marcaba como decisión pendiente (hallazgo 3 de
[`revision-seguridad.md`](revision-seguridad.md)).

**Seguimos con el escrow propio**, y nos llevamos dos ideas para más adelante:

1. **Cómo resuelven las disputas.** Sirve para decidir si Minga necesita algo
   parecido y quién podría ser el árbitro sin traicionar la idea de que nadie tenga
   poder sobre la plata ajena.
2. **Auditoría externa antes de usar plata real.** El
   [Audit Bank](https://stellar.org/grants-and-funding/soroban-audit-bank) de Stellar
   subsidia auditorías para proyectos financiados por el SCF.

Si algún día se cambia el motor, el trabajo es acotado: toda la conversación entre la
app y el contrato está en un solo archivo, `frontend/src/escrow.ts`.

## Lo que quedó sin confirmar

Desde la sesión de IA no se pudieron abrir dos sitios: la documentación
(`docs.trustlesswork.com`) y el informe de auditoría (`runtimeverification.com`).
Hay que mirarlos a mano para cerrar:

- [ ] ¿Se puede crear un pedido sin su clave de acceso?
- [ ] ¿Quién elige al árbitro? ¿Puede ser la misma plataforma?
- [ ] ¿El árbitro puede mandar la plata a cualquier dirección, o solo a las partes?
- [ ] ¿El contrato se puede actualizar después de instalado?
- [ ] ¿Arreglaron las 19 fallas críticas o altas de la auditoría?
- [ ] ¿Tienen licencia en algún otro lado?

## Fuentes

- [Documentación: API REST](https://docs.trustlesswork.com/trustless-work/api-reference/smart-escrow-api)
- [Documentación: resolución de disputas](https://docs.trustlesswork.com/trustless-work/technology-overview/smart-escrow-design/escrow-lifecycle/dispute-resolution)
- [Referencia del contrato (GitHub)](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/blob/single-release-develop/docs/CONTRACT_REFERENCE.md)
- [Repositorio del contrato](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar)
- [Organización Trustless Work en GitHub](https://github.com/Trustless-Work)
- [Informe de auditoría de Runtime Verification](https://runtimeverification.com/public-report/trustless-work)
