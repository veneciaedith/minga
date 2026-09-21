# Marca de Minga

Acá está el logo, para no tener que buscarlo ni volver a generarlo cada vez que un
formulario lo pide.

## Cuál mandar

| Archivo | Cuándo usarlo |
|---|---|
| **`minga-logo-1000.png`** | **El de siempre.** 1000×1000, cuadrado (1:1), esquinas transparentes. Sirve para casi todos los formularios. |
| `minga-logo-1000-fondo-blanco.png` | Si el formulario no acepta transparencia, o si el logo se va a ver sobre un fondo oscuro. |
| `minga-logo-512.png` | Si hay límite de peso. Pesa menos de 5 KB. |
| `minga-logo.svg` | Para imprenta, carteles o cualquier cosa que haya que agrandar. Es un dibujo, no una foto: se agranda todo lo que quieras sin que se vea borroso. |

## Con el nombre al lado

Cuando el lugar es ancho y chato —el encabezado de una web, una filmina, un
membrete— el símbolo solo se ve perdido. Para eso está esta versión.

| Archivo | Cuándo usarlo |
|---|---|
| **`minga-horizontal.png`** | **La de siempre.** Nombre en verde, fondo transparente. Para fondos claros. |
| `minga-horizontal-fondo-blanco.png` | Si no aceptan transparencia. |
| `minga-horizontal-blanco.png` | Nombre en blanco, para fondos oscuros. |

El nombre está escrito en **Liberation Sans Bold**. La app no usa una tipografía
propia (toma la del sistema), así que se eligió una limpia y neutra, que no le
compite al símbolo.

El tamaño del nombre no se eligió a ojo: la altura de la **M** es una proporción
fija del cuadrado del símbolo, y el nombre se centra midiendo de la base de las
letras a la punta de la M. Por eso las dos piezas se ven paradas a la misma altura.

## Qué es el dibujo

Un cuadrado verde con las esquinas redondeadas. Adentro, una forma escalonada en
ocre que se arma sumando pasos desde los cuatro lados, y un cuadradito terracota
en el centro.

La idea es la minga: muchas manos que aportan por separado y en el medio queda
algo que es de todos.

## Los colores

| | Color | Dónde |
|---|---|---|
| Verde | `#0B4E46` | el fondo del cuadrado |
| Ocre | `#D9A227` | la forma del medio |
| Terracota | `#C0512F` | el cuadradito del centro |

> **Ojo con esto si tocás la app:** dentro de la aplicación el mismo dibujo se pinta
> con los colores del tema (`--teal`, `--ocre`, `--terracota` en `frontend/src/index.css`),
> que son más oscuros en modo claro y más claros en modo oscuro. Eso es a propósito:
> ahí el logo tiene que convivir con el texto y cumplir el contraste. **Los colores de
> esta carpeta son los del logo suelto**, cuando va solo sobre un fondo cualquiera.
> No son un error ni hay que "emparejarlos".

## Rehacer los PNG

Si hace falta otro tamaño, o se cambia el dibujo:

```bash
python3 marca/hacer-logo.py             # el símbolo solo
python3 marca/hacer-logo-horizontal.py  # el símbolo con el nombre
```

Ninguno de los dos necesita instalar nada. Dibujan el logo punto por punto a partir
de las medidas del SVG, y el segundo además lee las letras del archivo de la
tipografía. Para cambiar tamaños o separaciones, están los números al final de cada
archivo.
