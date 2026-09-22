# Mockups de la app Minga

`minga-app.html` es el prototipo navegable de las tres pantallas del comerciante.
Es un solo archivo HTML: se abre con doble clic, sin instalar nada y sin internet
(salvo las tipografías, que si no cargan caen en una alternativa del sistema).

## Las tres pantallas

| Pantalla | Qué muestra |
|---|---|
| **Cargar** | Botón grande de voz y botón de foto de factura. Minga muestra lo que entendió y la persona confirma o corrige. Debajo, lo que se cargó hoy. |
| **Reporte** | En qué se gana y en qué se pierde, producto por producto, con el precio sugerido y el motivo en lenguaje claro. |
| **La Feria** | Precios anónimos de otros comercios de la zona, cuánto se puede ahorrar, y el pedido protegido (escrow). |

## El recorrido del pedido protegido

Al final de La Feria se puede recorrer **el pedido entero**, con los mismos estados
que tiene el contrato de verdad, pero contados como los ve el comerciante:

```
Tu plata está guardada
   ├── "Ya me llegó"            → el proveedor cobró
   ├── "Cancelar"               → la plata vuelve
   └── el proveedor avisa que entregó
          ├── "Sí, llegó bien"        → el proveedor cobró
          ├── "No me llegó / llegó mal" → plata frenada
          │        ├── "Al final estaba bien" → el proveedor cobró
          │        └── el proveedor devuelve   → la plata vuelve
          └── pasan los 3 días sin que digas nada → el proveedor cobra
```

Los botones que dicen **"esto lo hace el proveedor, no vos"** están separados abajo,
con una línea de puntos. Son para poder recorrer todos los caminos en una demo: en la
app real esas acciones las hace el proveedor desde su propia pantalla.

En ninguna pantalla aparece la palabra blockchain, ni escrow, ni billetera.

> La palabra "semáforo" no se usa en la interfaz. La pantalla se llama **Reporte**.

## Decisiones de accesibilidad (diseño universal / CDPD)

- **El color nunca informa solo.** Cada estado lleva ícono, palabra y trama propia
  (lisa, rayada, punteada), así también se entiende en blanco y negro o con daltonismo.
- **Control de tamaño de texto** (A− / A+) siempre visible, con la preferencia guardada.
  Toda la interfaz escala junto con el texto, hasta un 150 %.
- **Objetivos táctiles grandes**: mínimo 44 px, y 56 px en los botones principales.
- **Todo se opera con teclado**, con foco visible, y la navegación responde a las flechas.
- **Estado del sistema siempre a la vista** y anunciado a los lectores de pantalla
  (`role="status"`), para que se sepa si Minga está escuchando, leyendo o esperando.
- **Siempre se puede deshacer**: nada se guarda sin confirmación y toda acción
  ofrece volver atrás.
- **Se adapta al tema claro y oscuro** del teléfono, y a `prefers-reduced-motion`
  para quien prefiere menos animación.
- **Lenguaje claro**: pesos y unidades, sin jerga, sin porcentajes solos y sin
  una sola mención de blockchain.

## Datos

Todos los productos, precios, proveedores y localidades son de ejemplo, elegidos para
que un comerciante de Salta los reconozca. La voz y la foto están simuladas para poder
mostrar el flujo completo sin depender de servicios externos.
