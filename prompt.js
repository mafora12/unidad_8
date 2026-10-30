// Pieza Prompt: las formas aparecen al instante, pero cada decisión (generar, elegir,
// combinar, descartar) convierte energía libre en energía de decisión.
// La capa de decisiones es un enjambre (flocking 3D): cada boid es energía gastada decidiendo.

const N_PROMPT = 200;        // partículas de energía libre
const COSTO_DECISION = 50;   // energía que mueve cada decisión (≈40 decisiones en total)
const CELDAS_FORMA = 2000;   // las variantes tienen el mismo tamaño que la forma construida
const ESCALA_VARIANTE = 0.3;
const CENTRO_ENJAMBRE = { x: 0, y: -170, z: 0 };

const COLOR_ACCION = {
  generar: PALETA.dusty,
  elegir: PALETA.deepRose,
  combinar: PALETA.blush,
  descartar: PALETA.amaranth,
};
// en el Cierre, todo lo de Prompt se tiñe de morado para distinguirlo dentro de la misma piedra
const MORADO = '#9C27B0';
const COLOR_ACCION_MORADO = {
  generar: '#9C27B0',
  elegir: '#6A1B9A',
  combinar: '#BA68C8',
  descartar: '#CE93D8',
};
// color plano por variante: sin capas, sin historia
const COLORES_VARIANTE = [PALETA.amaranth, PALETA.cherry, PALETA.blush, PALETA.pink];

// Una forma guarda sus celdas y arma sus mallas solo cuando hacen falta:
// la miniatura (detalle bajo) al generarla, la grande al elegirla, la morada en el Cierre.
class Forma {
  constructor(celdas) {
    this.celdas = celdas;
    this.mallas = {};
  }

  malla(tipo) {
    if (!this.mallas[tipo]) {
      const morada = tipo === 'morada';
      const col = morada ? rgbNorm(MORADO) : null;
      // las moradas un poco más pequeñas que las de Construir para que no parpadeen donde coinciden
      const r = morada ? S * 0.55 : S * 0.62;
      this.mallas[tipo] = mallaEsferas(
        this.celdas.map(c => ({ ...mundo(c.x, c.h, c.z), r, c: col || c.c })),
        tipo === 'mini' ? 'bajo' : 'alto'
      );
    }
    return this.mallas[tipo];
  }

  liberar() {
    for (const m of Object.values(this.mallas)) freeGeometry(m);
    this.mallas = {};
  }
}

class Prompt {
  constructor() {
    this.variantes = [];
    this.actual = null;
    this.reiniciar();
  }

  reiniciar() {
    for (const v of this.variantes) v.liberar();
    if (this.actual) this.actual.liberar();
    this.eParticula = E_TOTAL / N_PROMPT;
    this.libres = [];
    for (let i = 0; i < N_PROMPT; i++) {
      const a = random(TWO_PI), r = 170 * sqrt(random());
      this.libres.push({
        pos: createVector(r * cos(a), random(-300, -20), r * sin(a)),
        vel: p5.Vector.random3D().mult(0.6),
      });
    }
    this.boids = [];
    this.variantes = [];
    this.actual = null;
    this.decisiones = 0;
  }

  sinEnergia() {
    return this.libres.length * this.eParticula < COSTO_DECISION;
  }

  // mueve COSTO_DECISION de libre a decisiones; false si ya no alcanza
  gastar(accion) {
    if (this.sinEnergia()) return false;
    const n = COSTO_DECISION / this.eParticula;
    for (let k = 0; k < n; k++) {
      const p = this.libres.pop();
      this.boids.push(new Boid3(p.pos, accion));
    }
    this.decisiones++;
    return true;
  }

  // libera las mallas de una forma que ya no se ve en ningún lado
  soltar(v) {
    if (v && v !== this.actual && !this.variantes.includes(v)) v.liberar();
  }

  generar() {
    if (!this.gastar('generar')) return;
    const viejas = this.variantes;
    this.variantes = [0, 1, 2, 3].map(() => this.generarForma());
    viejas.forEach(v => this.soltar(v));
  }

  elegir(i) {
    if (!this.variantes[i] || !this.gastar('elegir')) return;
    const antes = this.actual;
    this.actual = this.variantes[i];
    this.soltar(antes);
  }

  combinar(i) {
    if (!this.actual || !this.variantes[i] || !this.gastar('combinar')) return;
    const antes = this.actual;
    const mitad = GX / 2;
    this.actual = new Forma(antes.celdas.filter(c => c.x < mitad).concat(this.variantes[i].celdas.filter(c => c.x >= mitad)));
    this.soltar(antes);
  }

  descartar() {
    if (!this.actual || !this.gastar('descartar')) return;
    const antes = this.actual;
    this.actual = null;
    this.soltar(antes);
  }

  // crecimiento instantáneo: ramas que suben desde puntos recientes, sin historia
  generarForma() {
    const ocupadas = new Uint8Array(GX * GZ * GH);
    const celdas = [];
    const col = rgbNorm(random(COLORES_VARIANTE));
    const sesgo = random(0.12, 0.45);  // qué tan largas son las ramas
    const subir = random(0.3, 0.7);    // qué tan alta es la forma
    const agregar = (x, h, z) => { ocupadas[indice(x, h, z)] = 1; celdas.push({ x, h, z, c: col }); };
    const ocupada = (x, h, z) => x >= 0 && x < GX && z >= 0 && z < GZ && h >= 0 && h < GH && ocupadas[indice(x, h, z)] === 1;
    const vecinos = (x, h, z) => {
      let n = 0;
      for (let dh = -1; dh <= 1; dh++)
        for (let dz = -1; dz <= 1; dz++)
          for (let dx = -1; dx <= 1; dx++)
            if ((dx || dh || dz) && ocupada(x + dx, h + dh, z + dz)) n++;
      return n;
    };

    const bases = floor(random(1, 5));
    for (let b = 0; b < bases; b++) {
      agregar(floor(GX / 2 + random(-14, 14)), 0, floor(GZ / 2 + random(-14, 14)));
    }
    let intentos = 0;
    while (celdas.length < CELDAS_FORMA && intentos++ < CELDAS_FORMA * 40) {
      const p = celdas[Math.floor(celdas.length * Math.pow(Math.random(), sesgo))];
      const x = p.x + Math.floor(Math.random() * 3) - 1;
      const z = p.z + Math.floor(Math.random() * 3) - 1;
      const h = p.h + (Math.random() < subir ? 1 : Math.random() < 0.2 ? -1 : 0);
      if (h < 0 || h >= GH || !dentro(x, z)) continue;
      if (ocupadas[indice(x, h, z)] || vecinos(x, h, z) > 2) continue;
      agregar(x, h, z);
    }
    const forma = new Forma(celdas);
    forma.malla('mini');
    return forma;
  }

  // las variantes orbitan despacio alrededor de la piedra (coordenadas de mundo)
  posVariante(i) {
    const a = i * HALF_PI + frameCount * 0.0025;
    return { x: 300 * cos(a), y: -250 + sin(frameCount * 0.02 + i * 1.7) * 8, z: 300 * sin(a) };
  }

  actualizar() {
    for (const p of this.libres) {
      p.vel.add(p5.Vector.random3D().mult(0.08)).limit(0.6);
      p.pos.add(p.vel);
      const r = Math.hypot(p.pos.x, p.pos.z);
      if (r > 175) { p.pos.x *= 175 / r; p.pos.z *= 175 / r; p.vel.x *= -1; p.vel.z *= -1; }
      if (p.pos.y < -300 || p.pos.y > -15) { p.pos.y = constrain(p.pos.y, -300, -15); p.vel.y *= -1; }
    }
    for (const b of this.boids) b.flock(this.boids);
    for (const b of this.boids) b.mover();
  }

  energia() {
    return {
      libre: this.libres.length * this.eParticula,
      forma: 0,
      decisiones: this.boids.length * this.eParticula,
    };
  }

  dibujar(conVariantes) {
    piedra();

    noStroke();
    fill(PALETA.pastel);
    if (this.actual) dibujarMalla(this.actual.malla('grande'));

    if (conVariantes) {
      this.variantes.forEach((v, i) => {
        const p = this.posVariante(i);
        push();
        translate(p.x, p.y, p.z);
        rotateY(frameCount * 0.008 + i);
        scale(ESCALA_VARIANTE);
        piedra();
        noStroke();
        fill(PALETA.pastel);
        dibujarMalla(v.malla('mini'));
        pop();
      });
    }

    this.dibujarEnergia(false);
  }

  // Cierre: la forma y el enjambre en morado, sobre la piedra de Construir (sin piedra propia)
  dibujarFusion() {
    noStroke();
    fill('#E1BEE7');
    if (this.actual) dibujarMalla(this.actual.malla('morada'));
    this.dibujarEnergia(true);
  }

  dibujarEnergia(morado) {
    // energía libre
    stroke(morado ? '#BA68C8' : PALETA.dusty);
    strokeWeight(2.5);
    beginShape(POINTS);
    for (const p of this.libres) vertex(p.pos.x, p.pos.y, p.pos.z);
    endShape();

    // capa de decisiones: pétalos (dos rombos cruzados) orientados según su velocidad,
    // todos en una sola figura para que sea un único dibujo por frame
    if (!this.boids.length) return;
    noStroke();
    noLights(); // color plano; las luces se vuelven a poner al inicio del siguiente frame
    beginShape(TRIANGLES);
    for (const b of this.boids) {
      fill(morado ? b.colMorado : b.col);
      const sp = Math.hypot(b.vx, b.vy, b.vz) || 1;
      const dx = b.vx / sp, dy = b.vy / sp, dz = b.vz / sp;
      // lado = dirección × (0,1,0); arriba = lado × dirección
      let lx = -dz, lz = dx;
      const ll = Math.hypot(lx, lz) || 1;
      lx /= ll; lz /= ll;
      const ux = -lz * dy, uy = lz * dx - lx * dz, uz = lx * dy;
      const tx = b.x + dx * 7, ty = b.y + dy * 7, tz = b.z + dz * 7;   // punta
      const cx = b.x - dx * 6, cy = b.y - dy * 6, cz = b.z - dz * 6;   // cola
      const w = 3, hgt = 2;
      vertex(tx, ty, tz); vertex(b.x + lx * w, b.y, b.z + lz * w); vertex(cx, cy, cz);
      vertex(tx, ty, tz); vertex(b.x - lx * w, b.y, b.z - lz * w); vertex(cx, cy, cz);
      vertex(tx, ty, tz); vertex(b.x + ux * hgt, b.y + uy * hgt, b.z + uz * hgt); vertex(cx, cy, cz);
      vertex(tx, ty, tz); vertex(b.x - ux * hgt, b.y - uy * hgt, b.z - uz * hgt); vertex(cx, cy, cz);
    }
    endShape();
  }

  // click en pantalla: ¿cayó sobre alguna variante?
  clicPantalla(mx, my, shift) {
    let mejor = -1, mejorD = 90;
    this.variantes.forEach((v, i) => {
      const p = this.posVariante(i);
      const s = proyectar(p.x, p.y - 140 * ESCALA_VARIANTE, p.z);
      const d = dist(mx, my, s.x, s.y);
      if (d < mejorD) { mejor = i; mejorD = d; }
    });
    if (mejor < 0) return;
    if (shift) this.combinar(mejor);
    else this.elegir(mejor);
  }
}

// Flocking 3D: separación, alineación, cohesión (+ no alejarse de la piedra).
// Con números sueltos en vez de vectores: 200 boids se comparan 40.000 veces por frame.
const R_VECINOS = 70, R_SEPARAR = 22, VEL_MAX = 2.2, R_ENJAMBRE = 230;

function limitar(x, y, z, m) {
  const l = Math.hypot(x, y, z);
  return l > m ? [x / l * m, y / l * m, z / l * m] : [x, y, z];
}

// dirección deseada (con magnitud VEL_MAX) menos la velocidad actual, limitada a f
function girarHacia(b, x, y, z, f) {
  const l = Math.hypot(x, y, z) || 1;
  return limitar(x / l * VEL_MAX - b.vx, y / l * VEL_MAX - b.vy, z / l * VEL_MAX - b.vz, f);
}

class Boid3 {
  constructor(pos, accion) {
    this.x = pos.x; this.y = pos.y; this.z = pos.z;
    const v = p5.Vector.random3D().mult(2);
    this.vx = v.x; this.vy = v.y; this.vz = v.z;
    this.ax = 0; this.ay = 0; this.az = 0;
    this.col = color(COLOR_ACCION[accion]);
    this.colMorado = color(COLOR_ACCION_MORADO[accion]);
  }

  flock(boids) {
    let sx = 0, sy = 0, sz = 0, nSep = 0;
    let ax = 0, ay = 0, az = 0, cx = 0, cy = 0, cz = 0, nVec = 0;
    for (const o of boids) {
      if (o === this) continue;
      const dx = this.x - o.x, dy = this.y - o.y, dz = this.z - o.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > R_VECINOS * R_VECINOS) continue;
      ax += o.vx; ay += o.vy; az += o.vz;
      cx += o.x; cy += o.y; cz += o.z;
      nVec++;
      if (d2 < R_SEPARAR * R_SEPARAR) {
        const d2s = d2 || 1;
        sx += dx / d2s; sy += dy / d2s; sz += dz / d2s;
        nSep++;
      }
    }
    if (nVec) {
      const a = girarHacia(this, ax, ay, az, 0.04);
      const c = girarHacia(this, cx / nVec - this.x, cy / nVec - this.y, cz / nVec - this.z, 0.03);
      this.ax += a[0] + c[0]; this.ay += a[1] + c[1]; this.az += a[2] + c[2];
    }
    if (nSep) {
      const s = girarHacia(this, sx, sy, sz, 0.07);
      this.ax += s[0]; this.ay += s[1]; this.az += s[2];
    }

    const kx = CENTRO_ENJAMBRE.x - this.x, ky = CENTRO_ENJAMBRE.y - this.y, kz = CENTRO_ENJAMBRE.z - this.z;
    const dc = Math.hypot(kx, ky, kz);
    if (dc > R_ENJAMBRE) {
      const f = Math.min(0.15, (dc - R_ENJAMBRE) * 0.002) / dc;
      this.ax += kx * f; this.ay += ky * f; this.az += kz * f;
    }
  }

  mover() {
    [this.vx, this.vy, this.vz] = limitar(this.vx + this.ax, this.vy + this.ay, this.vz + this.az, VEL_MAX);
    this.x += this.vx; this.y += this.vy; this.z += this.vz;
    this.ax = 0; this.ay = 0; this.az = 0;
  }
}
