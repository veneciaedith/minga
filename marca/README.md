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
python3 marca/hacer-logo.py
```

No necesita instalar nada. Dibuja el logo pixel por pixel a partir de las mismas
medidas del SVG y guarda los tres PNG en esta carpeta. Para otro tamaño, cambiá los
números de la última parte del archivo.
