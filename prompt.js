// Pieza Prompt: las formas aparecen al instante, pero cada decisión (generar, elegir,
// combinar, descartar) convierte energía libre en energía de decisión.
// La capa de decisiones es un flocking: cada boid es energía gastada decidiendo.

const N_PROMPT = 200;        // partículas de energía libre
const COSTO_DECISION = 50;   // energía que mueve cada decisión (≈40 decisiones en total)
const CELDAS_FORMA = 2000;   // las variantes tienen el mismo tamaño que la forma construida
const THUMB = 135, THUMB_GAP = 10, THUMB_Y = 10;

const COLOR_ACCION = {
  generar: [230, 150, 70],
  elegir: [240, 210, 90],
  combinar: [220, 110, 160],
  descartar: [200, 70, 60],
};

class Prompt {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cols = floor(w / CELDA);
    this.rows = floor(h / CELDA);
    this.pg = createGraphics(w, h);
    this.pg.pixelDensity(1);
    this.reiniciar();
  }

  reiniciar() {
    this.eParticula = E_TOTAL / N_PROMPT;
    this.libres = [];
    for (let i = 0; i < N_PROMPT; i++) {
      this.libres.push({ pos: createVector(random(this.w), random(this.h)), vel: p5.Vector.random2D() });
    }
    this.boids = [];
    this.variantes = [];
    this.actual = null;
  }

  // mueve COSTO_DECISION de libre a decisiones; false si ya no alcanza
  gastar(accion) {
    const n = COSTO_DECISION / this.eParticula;
    if (this.libres.length < n) return false;
    for (let k = 0; k < n; k++) {
      const p = this.libres.pop();
      this.boids.push(new Boid(p.pos.x, p.pos.y, COLOR_ACCION[accion]));
    }
    return true;
  }

  generar() {
    if (!this.gastar('generar')) return;
    this.variantes = [0, 1, 2, 3].map(() => this.generarForma());
  }

  elegir(i) {
    if (!this.variantes[i] || !this.gastar('elegir')) return;
    this.actual = this.variantes[i];
  }

  combinar(i) {
    if (!this.actual || !this.variantes[i] || !this.gastar('combinar')) return;
    const mitad = this.cols / 2;
    this.actual = this.actual.filter(c => c.x < mitad).concat(this.variantes[i].filter(c => c.x >= mitad));
  }

  descartar() {
    if (!this.actual || !this.gastar('descartar')) return;
    this.actual = null;
  }

  clickEn(mx, my, shift) {
    for (let i = 0; i < 4; i++) {
      const tx = this.thumbX(i);
      if (mx >= tx && mx < tx + THUMB && my >= THUMB_Y && my < THUMB_Y + THUMB) {
        if (shift) this.combinar(i);
        else this.elegir(i);
      }
    }
  }

  thumbX(i) {
    return (this.w - (4 * THUMB + 3 * THUMB_GAP)) / 2 + i * (THUMB + THUMB_GAP);
  }

  // crecimiento instantáneo: ramas que salen de puntos recientes, sin historia
  generarForma() {
    const ocupadas = new Set();
    const celdas = [];
    const agregar = (x, y) => { ocupadas.add(y * this.cols + x); celdas.push({ x, y }); };
    const vecinos = (x, y) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if ((dx || dy) && ocupadas.has((y + dy) * this.cols + (x + dx))) n++;
      return n;
    };
    agregar(floor(this.cols / 2), floor(this.rows / 2));
    let intentos = 0;
    while (celdas.length < CELDAS_FORMA && intentos < CELDAS_FORMA * 50) {
      intentos++;
      const p = celdas[floor(celdas.length * pow(random(), 0.25))];
      const x = p.x + floor(random(3)) - 1;
      const y = p.y + floor(random(3)) - 1;
      if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
      if (ocupadas.has(y * this.cols + x) || vecinos(x, y) > 2) continue;
      agregar(x, y);
    }
    return celdas;
  }

  actualizar() {
    for (const p of this.libres) {
      p.vel.add(p5.Vector.random2D().mult(0.2)).limit(0.8);
      p.pos.add(p.vel);
      p.pos.x = (p.pos.x + this.w) % this.w;
      p.pos.y = (p.pos.y + this.h) % this.h;
    }
    for (const b of this.boids) b.flock(this.boids);
    for (const b of this.boids) b.mover(this.w, this.h);
  }

  energia() {
    return {
      libre: this.libres.length * this.eParticula,
      forma: 0,
      decisiones: this.boids.length * this.eParticula,
    };
  }

  dibujarForma(g, celdas, x, y, escala) {
    g.noStroke();
    g.fill(170, 200, 150); // color plano: sin capas, sin historia
    const s = Math.max(1, CELDA * escala);
    for (const c of celdas) g.rect(x + c.x * CELDA * escala, y + c.y * CELDA * escala, s, s);
  }

  dibujar() {
    const g = this.pg;
    g.background(12);

    // forma elegida, en el área bajo las miniaturas
    if (this.actual) {
      const top = THUMB_Y + THUMB + 15;
      const esc = (this.h - top - 10) / this.h;
      this.dibujarForma(g, this.actual, (this.w - this.w * esc) / 2, top, esc);
    }

    for (let i = 0; i < 4; i++) {
      const tx = this.thumbX(i);
      g.fill(25);
      g.stroke(70);
      g.rect(tx, THUMB_Y, THUMB, THUMB);
      if (this.variantes[i]) this.dibujarForma(g, this.variantes[i], tx, THUMB_Y, THUMB / this.w);
    }

    g.noStroke();
    g.fill(255, 120);
    for (const p of this.libres) g.circle(p.pos.x, p.pos.y, 3);

    for (const b of this.boids) b.dibujar(g);

    if (this.libres.length * this.eParticula < COSTO_DECISION) {
      g.fill(230);
      g.textAlign(CENTER, BOTTOM);
      g.textSize(13);
      g.text('sin energía libre: ya no hay más decisiones', this.w / 2, this.h - 8);
    }
    return g;
  }
}

// Flocking: separación, alineación, cohesión
class Boid {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(2);
    this.acc = createVector();
    this.col = col;
  }

  flock(boids) {
    const sep = createVector(), ali = createVector(), coh = createVector();
    let nSep = 0, nVec = 0;
    for (const o of boids) {
      if (o === this) continue;
      const d = p5.Vector.dist(this.pos, o.pos);
      if (d < 50) {
        ali.add(o.vel);
        coh.add(o.pos);
        nVec++;
        if (d < 14) {
          sep.add(p5.Vector.sub(this.pos, o.pos).div(d || 1));
          nSep++;
        }
      }
    }
    if (nVec) {
      ali.div(nVec).setMag(2).sub(this.vel).limit(0.05);
      coh.div(nVec).sub(this.pos).setMag(2).sub(this.vel).limit(0.04);
      this.acc.add(ali).add(coh);
    }
    if (nSep) this.acc.add(sep.div(nSep).setMag(2).sub(this.vel).limit(0.08));
  }

  mover(w, h) {
    this.vel.add(this.acc).limit(2);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.pos.x = (this.pos.x + w) % w;
    this.pos.y = (this.pos.y + h) % h;
  }

  dibujar(g) {
    const a = this.vel.heading();
    g.push();
    g.translate(this.pos.x, this.pos.y);
    g.rotate(a);
    g.noStroke();
    g.fill(...this.col, 220);
    g.triangle(5, 0, -4, 3, -4, -3);
    g.pop();
  }
}
