"""Dibuja el logo de Minga con el nombre al lado, en PNG.

No necesita instalar nada: lee las letras del archivo de la tipografia y las
dibuja punto por punto, igual que hacer-logo.py hace con el simbolo.
"""
import os, struct, zlib

RUTA_FUENTE = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

TEAL      = (0x0B, 0x4E, 0x46)
OCRE      = (0xD9, 0xA2, 0x27)
TERRACOTA = (0xC0, 0x51, 0x2F)
BLANCO    = (0xFF, 0xFF, 0xFF)

POLIGONO = [(13,7),(21,7),(21,10),(24,10),(24,13),(27,13),(27,21),(24,21),
            (24,24),(21,24),(21,27),(13,27),(13,24),(10,24),(10,21),(7,21),
            (7,13),(10,13),(10,10),(13,10)]


# ---------------------------------------------------------------- tipografia

class Fuente:
    """Lo minimo para sacar el contorno de unas pocas letras de un .ttf"""

    def __init__(self, ruta):
        self.d = open(ruta, "rb").read()
        n = struct.unpack_from(">H", self.d, 4)[0]
        self.tablas = {}
        for i in range(n):
            o = 12 + 16 * i
            tag = self.d[o:o + 4].decode("latin1")
            self.tablas[tag] = struct.unpack_from(">II", self.d, o + 8)
        head = self.tablas["head"][0]
        self.upem = struct.unpack_from(">H", self.d, head + 18)[0]
        formato_loca = struct.unpack_from(">h", self.d, head + 50)[0]
        self.n_glifos = struct.unpack_from(">H", self.d, self.tablas["maxp"][0] + 4)[0]
        self.n_metricas = struct.unpack_from(">H", self.d, self.tablas["hhea"][0] + 34)[0]
        off = self.tablas["loca"][0]
        c = self.n_glifos + 1
        if formato_loca == 0:
            self.loca = [2 * v for v in struct.unpack_from(">%dH" % c, self.d, off)]
        else:
            self.loca = list(struct.unpack_from(">%dI" % c, self.d, off))
        self._leer_cmap()

    def _leer_cmap(self):
        d, off = self.d, self.tablas["cmap"][0]
        sub = None
        for i in range(struct.unpack_from(">H", d, off + 2)[0]):
            pid, eid, so = struct.unpack_from(">HHI", d, off + 4 + 8 * i)
            if (pid, eid) in ((3, 1), (0, 3), (0, 4), (0, 6)):
                sub = off + so
                break
        if sub is None or struct.unpack_from(">H", d, sub)[0] != 4:
            raise SystemExit("La tipografia no trae el mapa de caracteres esperado.")
        seg2 = struct.unpack_from(">H", d, sub + 6)[0]
        s = seg2 // 2
        self._cmap = (
            s,
            struct.unpack_from(">%dH" % s, d, sub + 14),
            struct.unpack_from(">%dH" % s, d, sub + 16 + seg2),
            struct.unpack_from(">%dh" % s, d, sub + 16 + 2 * seg2),
            struct.unpack_from(">%dH" % s, d, sub + 16 + 3 * seg2),
            sub + 16 + 3 * seg2,
        )

    def glifo(self, ch):
        c = ord(ch)
        s, fines, inicios, deltas, rangos, pos_rangos = self._cmap
        for i in range(s):
            if c <= fines[i]:
                if c < inicios[i]:
                    return 0
                if rangos[i] == 0:
                    return (c + deltas[i]) & 0xFFFF
                p = pos_rangos + 2 * i + rangos[i] + 2 * (c - inicios[i])
                g = struct.unpack_from(">H", self.d, p)[0]
                return 0 if g == 0 else (g + deltas[i]) & 0xFFFF
        return 0

    def avance(self, g):
        o = self.tablas["hmtx"][0]
        return struct.unpack_from(">H", self.d, o + 4 * min(g, self.n_metricas - 1))[0]

    def contornos(self, g):
        """Devuelve el contorno de la letra como listas de puntos."""
        ini, fin = self.loca[g], self.loca[g + 1]
        if ini == fin:
            return []
        d = self.d
        o = self.tablas["glyf"][0] + ini
        nc = struct.unpack_from(">h", d, o)[0]
        if nc < 0:
            raise SystemExit("Letra compuesta, no contemplada: glifo %d" % g)
        finales = struct.unpack_from(">%dH" % nc, d, o + 10)
        n = finales[-1] + 1
        p = o + 10 + 2 * nc
        p += 2 + struct.unpack_from(">H", d, p)[0]
        banderas = []
        while len(banderas) < n:
            f = d[p]; p += 1
            banderas.append(f)
            if f & 8:
                r = d[p]; p += 1
                banderas.extend([f] * r)
        def coords(bit_corto, bit_signo):
            vals, v = [], 0
            nonlocal p
            for f in banderas:
                if f & bit_corto:
                    delta = d[p]; p += 1
                    v += delta if f & bit_signo else -delta
                elif not f & bit_signo:
                    v += struct.unpack_from(">h", d, p)[0]; p += 2
                vals.append(v)
            return vals
        xs = coords(2, 16)
        ys = coords(4, 32)
        contornos, ini_c = [], 0
        for e in finales:
            contornos.append([(xs[i], ys[i], bool(banderas[i] & 1))
                              for i in range(ini_c, e + 1)])
            ini_c = e + 1
        return contornos


def aplanar(pts, pasos=16):
    """Convierte las curvas de la letra en una lista de puntos rectos."""
    if not pts:
        return []
    if not pts[0][2]:
        if pts[-1][2]:
            pts = [pts[-1]] + pts[:-1]
        else:
            m = ((pts[0][0] + pts[-1][0]) / 2, (pts[0][1] + pts[-1][1]) / 2, True)
            pts = [m] + pts
    n = len(pts)
    salida = [(pts[0][0], pts[0][1])]
    i = 1
    while i <= n:
        x, y, on = pts[i % n]
        if on:
            salida.append((x, y)); i += 1
            continue
        sx, sy, son = pts[(i + 1) % n]
        if son:
            fin = (sx, sy); i += 2
        else:
            fin = ((x + sx) / 2, (y + sy) / 2); i += 1
        x0, y0 = salida[-1]
        for k in range(1, pasos + 1):
            t = k / pasos; u = 1 - t
            salida.append((u * u * x0 + 2 * u * t * x + t * t * fin[0],
                           u * u * y0 + 2 * u * t * y + t * t * fin[1]))
    return salida


def contornos_palabra(fuente, texto):
    """Contornos de toda la palabra, en unidades de la tipografia."""
    formas, pluma = [], 0
    for ch in texto:
        g = fuente.glifo(ch)
        for c in fuente.contornos(g):
            plano = aplanar(c)
            formas.append([(x + pluma, y) for x, y in plano])
        pluma += fuente.avance(g)
    return formas, pluma


# ------------------------------------------------------------------ dibujo

def en_rect_redondeado(x, y, x0, y0, x1, y1, r):
    if not (x0 <= x <= x1 and y0 <= y <= y1):
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def en_poligono(x, y, pts):
    dentro, n = False, len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            if x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
                dentro = not dentro
    return dentro


def mascara_texto(formas, ancho, alto, muestras):
    """Cobertura del texto por pixel, de 0 a 1, rellenando por lineas."""
    acumulado = [[0] * ancho for _ in range(alto)]
    aristas = []
    for f in formas:
        for i in range(len(f)):
            x1, y1 = f[i]
            x2, y2 = f[(i + 1) % len(f)]
            if y1 != y2:
                aristas.append((x1, y1, x2, y2))
    for sub in range(alto * muestras):
        y = (sub + 0.5) / muestras
        cortes = []
        for x1, y1, x2, y2 in aristas:
            if (y1 <= y < y2) or (y2 <= y < y1):
                cortes.append((x1 + (y - y1) * (x2 - x1) / (y2 - y1),
                               1 if y2 > y1 else -1))
        if not cortes:
            continue
        cortes.sort()
        fila = acumulado[sub // muestras]
        giro = 0
        for i in range(len(cortes) - 1):
            giro += cortes[i][1]
            if giro == 0:
                continue
            # Relleno con regla "distinto de cero", como manda la tipografia.
            xa, xb = cortes[i][0], cortes[i + 1][0]
            pa, pb = int(xa), min(int(xb), ancho - 1)
            for px in range(max(pa, 0), pb + 1):
                cubierto = min(px + 1.0, xb) - max(float(px), xa)
                if cubierto > 0:
                    fila[px] += cubierto
    tope = muestras
    return [[min(v / tope, 1.0) for v in fila] for fila in acumulado]


def componer(lado_logo, margen, hueco, color_texto, fondo, alto_versal):
    fuente = Fuente(RUTA_FUENTE)
    formas, avance = contornos_palabra(fuente, "Minga")
    # La altura de la "M" marca la escala: asi el nombre acompana al simbolo.
    m = fuente.contornos(fuente.glifo("M"))
    tope_m = max(y for c in m for _, y, _ in c)
    escala = alto_versal / tope_m
    ancho_texto = int(avance * escala)
    x_texto = margen + lado_logo + hueco
    ancho = x_texto + ancho_texto + margen
    alto = lado_logo + 2 * margen
    # El nombre queda centrado con el cuadrado, midiendo de la base a la versal.
    base = margen + (lado_logo + alto_versal) / 2

    ubicadas = [[(x_texto + x * escala, base - y * escala) for x, y in f]
                for f in formas]
    cobertura = mascara_texto(ubicadas, ancho, alto, muestras=4)

    filas = []
    esc_logo = 34 / lado_logo
    for py in range(alto):
        fila = bytearray()
        for px in range(ancho):
            c, a = fondo, (255 if fondo else 0)
            # 1) el simbolo
            if margen <= px < margen + lado_logo and margen <= py < margen + lado_logo:
                sr = sg = sb = sa = 0
                for sy in range(4):
                    for sx in range(4):
                        x = (px - margen + (sx + .5) / 4) * esc_logo
                        y = (py - margen + (sy + .5) / 4) * esc_logo
                        if en_rect_redondeado(x, y, 15, 15, 19, 19, 1):
                            p = TERRACOTA
                        elif en_poligono(x, y, POLIGONO):
                            p = OCRE
                        elif en_rect_redondeado(x, y, 0, 0, 34, 34, 9):
                            p = TEAL
                        else:
                            p = fondo
                        if p is None:
                            continue
                        sr += p[0]; sg += p[1]; sb += p[2]; sa += 255
                if sa:
                    n = sa // 255
                    c, a = (sr // n, sg // n, sb // n), sa // 16
                else:
                    c, a = None, 0
            # 2) el nombre, encima
            cob = cobertura[py][px]
            if cob > 0:
                if c is None:
                    c, a = color_texto, int(255 * cob)
                else:
                    c = tuple(int(c[i] * (1 - cob) + color_texto[i] * cob) for i in range(3))
                    a = max(a, int(255 * cob))
            if c is None:
                fila += bytes((0, 0, 0, 0))
            else:
                fila += bytes((c[0], c[1], c[2], a))
        filas.append(bytes(fila))
    return filas, ancho, alto


def guardar_png(ruta, filas, ancho, alto):
    crudo = b"".join(b"\x00" + f for f in filas)
    def trozo(tipo, datos):
        c = tipo + datos
        return struct.pack(">I", len(datos)) + c + struct.pack(">I", zlib.crc32(c))
    with open(ruta, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n"
                + trozo(b"IHDR", struct.pack(">IIBBBBB", ancho, alto, 8, 6, 0, 0, 0))
                + trozo(b"IDAT", zlib.compress(crudo, 9))
                + trozo(b"IEND", b""))


if __name__ == "__main__":
    carpeta = os.path.dirname(os.path.abspath(__file__))
    medidas = dict(lado_logo=300, margen=40, hueco=56, alto_versal=176)
    versiones = [
        ("minga-horizontal.png",               TEAL,   None),
        ("minga-horizontal-fondo-blanco.png",  TEAL,   BLANCO),
        ("minga-horizontal-blanco.png",        BLANCO, None),
    ]
    for nombre, color, fondo in versiones:
        filas, ancho, alto = componer(color_texto=color, fondo=fondo, **medidas)
        guardar_png(os.path.join(carpeta, nombre), filas, ancho, alto)
        print("%s  (%dx%d)" % (nombre, ancho, alto))
