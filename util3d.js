// Paleta y utilidades 3D compartidas por las dos piezas

const PALETA = {
  deepRose: '#C2185B', dusty: '#E91E63', blush: '#F48FB1', amaranth: '#FFA2B9',
  cherry: '#FFB2C5', pink: '#FFC2D1', pastel: '#F8BBD0', mimi: '#FDD5DF',
  peachy: '#FCE4EC', lavender: '#FAE8ED',
};

// Grilla 3D: x, z en el plano de la piedra; h = altura sobre ella
const GX = 90, GZ = 90, GH = 72;
const S = 4;       // tamaño de celda en unidades de mundo
const RADIO = 44;  // radio de la piedra, en celdas

function dentro(x, z) {
  const dx = x - GX / 2, dz = z - GZ / 2;
  return dx * dx + dz * dz <= RADIO * RADIO;
}

function indice(x, h, z) {
  return (h * GZ + z) * GX + x;
}

// en p5 WEBGL la y crece hacia abajo: la altura va en -y
function mundo(x, h, z) {
  return { x: (x - GX / 2) * S, y: -(h + 0.5) * S, z: (z - GZ / 2) * S };
}

function rgbNorm(hex) {
  const c = color(hex);
  return [red(c) / 255, green(c) / 255, blue(c) / 255];
}

// interpola entre varios colores de la paleta (t de 0 a 1)
function gradiente(hexes, t) {
  const cols = hexes.map(rgbNorm);
  const f = constrain(t, 0, 1) * (cols.length - 1);
  const i = Math.min(Math.floor(f), cols.length - 2);
  const k = f - i;
  return [0, 1, 2].map(j => lerp(cols[i][j], cols[i + 1][j], k));
}

let siguienteId = 0;

// esfera unitaria de latitud/longitud con caras indexadas
function esferaBase(lon, lat) {
  const g = { vertices: [], vertexNormals: [], faces: [] };
  for (let i = 0; i <= lat; i++) {
    const th = i / lat * PI;
    for (let j = 0; j <= lon; j++) {
      const ph = j / lon * TWO_PI;
      const v = new p5.Vector(sin(th) * cos(ph), cos(th), sin(th) * sin(ph));
      g.vertices.push(v);
      g.vertexNormals.push(v);
    }
  }
  for (let i = 0; i < lat; i++) {
    for (let j = 0; j < lon; j++) {
      const a = i * (lon + 1) + j, b = a + lon + 1;
      g.faces.push([a, b, a + 1], [b, b + 1, a + 1]);
    }
  }
  return g;
}

const plantillas = {};

// Muchas esferas en una sola geometría: un solo draw call para cientos de partículas.
// puntos: [{x, y, z, r, c: [r, g, b]}] en coordenadas de mundo
// detalle 'alto' para lo que se ve de cerca, 'bajo' para las miniaturas (se arma 4 veces más rápido)
function mallaEsferas(puntos, detalle = 'alto') {
  if (!plantillas[detalle]) plantillas[detalle] = detalle === 'alto' ? esferaBase(6, 4) : esferaBase(4, 2);
  const t = plantillas[detalle];
  const g = new p5.Geometry();
  g.gid = 'esferas-' + siguienteId++; // p5 guarda los buffers por gid: cada malla necesita el suyo
  const nv = t.vertices.length;
  const vs = g.vertices, ns = g.vertexNormals, cs = g.vertexColors, fs = g.faces;
  for (let k = 0; k < puntos.length; k++) {
    const p = puntos[k];
    const base = k * nv;
    for (let i = 0; i < nv; i++) {
      const v = t.vertices[i];
      // objetos simples en vez de p5.Vector: p5 solo lee x, y, z al subirlos a la GPU
      vs.push({ x: v.x * p.r + p.x, y: v.y * p.r + p.y, z: v.z * p.r + p.z });
      ns.push(v);
      cs.push(p.c[0], p.c[1], p.c[2], 1);
    }
    for (const f of t.faces) fs.push([f[0] + base, f[1] + base, f[2] + base]);
  }
  return g;
}

// Dibuja una malla de esferas. No usa model() porque model(), la primera vez, arma líneas de
// contorno para cada triángulo (cientos de miles) aunque no se dibujen: eso era lo que demoraba.
function dibujarMalla(g) {
  if (!_renderer.geometryInHash(g.gid)) _renderer.createBuffers(g.gid, g);
  _renderer.drawBuffers(g.gid);
}

// polilíneas en celdas de grilla ([x, h, z, x, h, z, ...]) → una geometría de líneas
function mallaLineas(polilineas) {
  const g = new p5.Geometry();
  g.gid = 'lineas-' + siguienteId++;
  for (const p of polilineas) {
    const base = g.vertices.length;
    const n = p.length / 3;
    for (let k = 0; k < n; k++) {
      const w = mundo(p[k * 3], p[k * 3 + 1], p[k * 3 + 2]);
      g.vertices.push(new p5.Vector(w.x, w.y, w.z));
    }
    for (let k = 1; k < n; k++) g.edges.push([base + k - 1, base + k]);
  }
  return g;
}

// la piedra: el suelo donde crece todo
function piedra() {
  push();
  noStroke();
  fill(PALETA.peachy);
  translate(0, 7, 0);
  cylinder(RADIO * S + 14, 14, 80, 1);
  fill(PALETA.pastel);
  translate(0, 9, 0);
  cylinder(RADIO * S + 22, 6, 80, 1);
  pop();
}
