"""Dibuja el logo de Minga como PNG, a partir del mismo SVG que usa la app."""
import struct, zlib

TEAL       = (0x0B, 0x4E, 0x46)
OCRE       = (0xD9, 0xA2, 0x27)
TERRACOTA  = (0xC0, 0x51, 0x2F)

# Contorno del path del SVG, en las unidades del viewBox (34x34).
POLIGONO = [(13,7),(21,7),(21,10),(24,10),(24,13),(27,13),(27,21),(24,21),
            (24,24),(21,24),(21,27),(13,27),(13,24),(10,24),(10,21),(7,21),
            (7,13),(10,13),(10,10),(13,10)]

def en_rect_redondeado(x, y, x0, y0, x1, y1, r):
    if not (x0 <= x <= x1 and y0 <= y <= y1):
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def en_poligono(x, y, pts):
    dentro = False
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xc = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < xc:
                dentro = not dentro
    return dentro

def color_en(x, y):
    """Devuelve el color en un punto del viewBox, o None si es transparente."""
    if en_rect_redondeado(x, y, 15, 15, 19, 19, 1):
        return TERRACOTA
    if en_poligono(x, y, POLIGONO):
        return OCRE
    if en_rect_redondeado(x, y, 0, 0, 34, 34, 9):
        return TEAL
    return None

def dibujar(lado, fondo=None, muestras=4):
    """fondo=None deja las esquinas transparentes; si no, las pinta de ese color."""
    escala = 34 / lado
    filas = []
    for py in range(lado):
        fila = bytearray()
        for px in range(lado):
            # Varias muestras por pixel para que los bordes no queden dentados.
            r = g = b = a = 0
            for sy in range(muestras):
                for sx in range(muestras):
                    x = (px + (sx + 0.5) / muestras) * escala
                    y = (py + (sy + 0.5) / muestras) * escala
                    c = color_en(x, y)
                    if c is None:
                        if fondo is not None:
                            c = fondo
                        else:
                            continue
                    r += c[0]; g += c[1]; b += c[2]; a += 255
            total = muestras * muestras
            if a == 0:
                fila += bytes((0, 0, 0, 0))
            else:
                # Promedio sobre las muestras que pintaron, para no oscurecer el borde.
                n = a // 255
                fila += bytes((r // n, g // n, b // n, a // total))
        filas.append(bytes(fila))
    return filas

def guardar_png(ruta, filas, lado):
    crudo = b"".join(b"\x00" + f for f in filas)
    def trozo(tipo, datos):
        c = tipo + datos
        return struct.pack(">I", len(datos)) + c + struct.pack(">I", zlib.crc32(c))
    png = (b"\x89PNG\r\n\x1a\n"
           + trozo(b"IHDR", struct.pack(">IIBBBBB", lado, lado, 8, 6, 0, 0, 0))
           + trozo(b"IDAT", zlib.compress(crudo, 9))
           + trozo(b"IEND", b""))
    with open(ruta, "wb") as f:
        f.write(png)

base = __import__("os").path.dirname(__file__) + "/"
for lado in (1000, 512):
    guardar_png(f"{base}minga-logo-{lado}.png", dibujar(lado), lado)
    print(f"minga-logo-{lado}.png")
guardar_png(f"{base}minga-logo-1000-fondo-blanco.png",
            dibujar(1000, fondo=(255, 255, 255)), 1000)
print("minga-logo-1000-fondo-blanco.png")
