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

class Prompt {
  constructor() {
    this.variantes = [];
    this.actual = null;
    this.reiniciar();
  }

  reiniciar() {
    for (const v of this.variantes) freeGeometry(v.malla);
    if (this.actual && !this.variantes.includes(this.actual)) freeGeometry(this.actual.malla);
    if (this.morada) freeGeometry(this.morada.malla);
    this.morada = null; // versión morada de la forma actual, para el Cierre
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

  // libera la malla de una forma que ya no se ve en ningún lado
  soltar(v) {
    if (v && v !== this.actual && !this.variantes.includes(v)) freeGeometry(v.malla);
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
    const celdas = antes.celdas.filter(c => c.x < mitad).concat(this.variantes[i].celdas.filter(c => c.x >= mitad));
    this.actual = { celdas, malla: this.malla(celdas) };
    this.soltar(antes);
  }

  descartar() {
    if (!this.actual || !this.gastar('descartar')) return;
    const antes = this.actual;
    this.actual = null;
    this.soltar(antes);
  }

  malla(celdas) {
    return mallaEsferas(celdas.map(c => ({ ...mundo(c.x, c.h, c.z), r: S * 0.62, c: c.c })));
  }

  // crecimiento instantáneo: ramas que suben desde puntos recientes, sin historia
  generarForma() {
    const ocupadas = new Set();
    const celdas = [];
    const col = rgbNorm(random(COLORES_VARIANTE));
    const sesgo = random(0.12, 0.45);  // qué tan largas son las ramas
    const subir = random(0.3, 0.7);    // qué tan alta es la forma
    const agregar = (x, h, z) => { ocupadas.add(indice(x, h, z)); celdas.push({ x, h, z, c: col }); };
    const vecinos = (x, h, z) => {
      let n = 0;
      for (let dh = -1; dh <= 1; dh++)
        for (let dz = -1; dz <= 1; dz++)
          for (let dx = -1; dx <= 1; dx++)
            if ((dx || dh || dz) && ocupadas.has(indice(x + dx, h + dh, z + dz))) n++;
      return n;
    };

    const bases = floor(random(1, 5));
    for (let b = 0; b < bases; b++) {
      agregar(floor(GX / 2 + random(-14, 14)), 0, floor(GZ / 2 + random(-14, 14)));
    }
    let intentos = 0;
    while (celdas.length < CELDAS_FORMA && intentos++ < CELDAS_FORMA * 40) {
      const p = celdas[floor(celdas.length * pow(random(), sesgo))];
      const x = p.x + floor(random(3)) - 1;
      const z = p.z + floor(random(3)) - 1;
      const h = p.h + (random() < subir ? 1 : random() < 0.2 ? -1 : 0);
      if (h < 0 || h >= GH || !dentro(x, z)) continue;
      if (ocupadas.has(indice(x, h, z)) || vecinos(x, h, z) > 2) continue;
      agregar(x, h, z);
    }
    return { celdas, malla: this.malla(celdas) };
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
    if (this.actual) model(this.actual.malla);

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
        model(v.malla);
        pop();
      });
    }

    this.dibujarEnergia(false);
  }

  // Cierre: la forma y el enjambre en morado, sobre la piedra de Construir (sin piedra propia)
  dibujarFusion() {
    if (this.actual && (!this.morada || this.morada.de !== this.actual)) {
      if (this.morada) freeGeometry(this.morada.malla);
      const col = rgbNorm(MORADO);
      // un poco más pequeñas que las de Construir para que no parpadeen donde coinciden
      const malla = mallaEsferas(this.actual.celdas.map(c => ({ ...mundo(c.x, c.h, c.z), r: S * 0.55, c: col })));
      this.morada = { de: this.actual, malla };
    }
    noStroke();
    fill('#E1BEE7');
    if (this.actual) model(this.morada.malla);
    this.dibujarEnergia(true);
  }

  dibujarEnergia(morado) {
    // energía libre
    stroke(morado ? '#BA68C8' : PALETA.dusty);
    strokeWeight(2.5);
    beginShape(POINTS);
    for (const p of this.libres) vertex(p.pos.x, p.pos.y, p.pos.z);
    endShape();

    // capa de decisiones: pétalos orientados según su velocidad
    noStroke();
    for (const b of this.boids) {
      const v = b.vel;
      push();
      translate(b.pos.x, b.pos.y, b.pos.z);
      rotateY(Math.atan2(-v.z, v.x));
      rotateZ(Math.atan2(v.y, Math.hypot(v.x, v.z)));
      fill(morado ? b.colMorado : b.col);
      ellipsoid(7, 2.2, 3.5, 8, 5);
      pop();
    }
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

// Flocking 3D: separación, alineación, cohesión (+ no alejarse de la piedra)
class Boid3 {
  constructor(pos, accion) {
    this.pos = pos.copy();
    this.vel = p5.Vector.random3D().mult(2);
    this.acc = createVector();
    this.col = color(COLOR_ACCION[accion]);
    this.colMorado = color(COLOR_ACCION_MORADO[accion]);
  }

  flock(boids) {
    const sep = createVector(), ali = createVector(), coh = createVector();
    let nSep = 0, nVec = 0;
    for (const o of boids) {
      if (o === this) continue;
      const d = this.pos.dist(o.pos);
      if (d < 70) {
        ali.add(o.vel);
        coh.add(o.pos);
        nVec++;
        if (d < 22) {
          sep.add(p5.Vector.sub(this.pos, o.pos).div(d || 1));
          nSep++;
        }
      }
    }
    if (nVec) {
      ali.div(nVec).setMag(2.2).sub(this.vel).limit(0.04);
      coh.div(nVec).sub(this.pos).setMag(2.2).sub(this.vel).limit(0.03);
      this.acc.add(ali).add(coh);
    }
    if (nSep) this.acc.add(sep.div(nSep).setMag(2.2).sub(this.vel).limit(0.07));

    const c = createVector(CENTRO_ENJAMBRE.x - this.pos.x, CENTRO_ENJAMBRE.y - this.pos.y, CENTRO_ENJAMBRE.z - this.pos.z);
    const dc = c.mag();
    if (dc > 230) this.acc.add(c.setMag(Math.min(0.15, (dc - 230) * 0.002)));
  }

  mover() {
    this.vel.add(this.acc).limit(2.2);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
}
