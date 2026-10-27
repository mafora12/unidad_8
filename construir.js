// Pieza Construir: crecimiento tipo DLA en 3D sobre la piedra.
// Cada partícula libre lleva 1 unidad de energía; al pegarse, esa energía pasa a la forma.
// Lo que se pega primero queda abajo y oscuro (sedimento); el camino de cada partícula
// queda congelado como un cauce.

const N_CONSTRUIR = 2000;
const DERIVA_ABAJO = 0.05;    // caen como sedimento
const DERIVA_CENTRO = 0.006;  // y se acercan un poco al centro
const RADIO_LLUVIA = 0.4;     // al evaporarse vuelven a caer cerca del centro (fracción del radio)
const LOTE = 40;              // partículas pegadas que se hornean en una sola malla
const RASTRO_LARGO = 6, RASTRO_CADA = 6;
const CAPAS = [PALETA.deepRose, PALETA.dusty, PALETA.blush, PALETA.cherry];

class Construir {
  constructor() {
    this.lotes = [];
    this.reiniciar();
  }

  reiniciar() {
    for (const l of this.lotes) { freeGeometry(l.esferas); freeGeometry(l.cauces); }
    this.lotes = [];
    this.pendientes = [];
    this.semillas = [];
    this.grid = new Uint8Array(GX * GZ * GH);
    this.caminantes = [];
    this.formaE = 0;
    this.pasos = 0;
    this.segundos = 0;
    const e = E_TOTAL / N_CONSTRUIR;
    // nacen arriba y caen: así la forma crece hacia arriba en vez de cubrir el suelo
    while (this.caminantes.length < N_CONSTRUIR) {
      const x = floor(random(GX)), z = floor(random(GZ)), h = floor(random(GH * 0.55, GH));
      if (dentro(x, z)) this.caminantes.push({ x, h, z, e, rastro: [] });
    }
    this.sembrar(GX >> 1, GZ >> 1);
  }

  sembrar(x, z) {
    if (!dentro(x, z) || this.grid[indice(x, 0, z)]) return;
    this.grid[indice(x, 0, z)] = 1;
    this.semillas.push(mundo(x, 0, z));
  }

  ocupada(x, h, z) {
    return h >= 0 && h < GH && x >= 0 && x < GX && z >= 0 && z < GZ && this.grid[indice(x, h, z)] === 1;
  }

  tocaForma(x, h, z) {
    return this.ocupada(x + 1, h, z) || this.ocupada(x - 1, h, z) ||
           this.ocupada(x, h + 1, z) || this.ocupada(x, h - 1, z) ||
           this.ocupada(x, h, z + 1) || this.ocupada(x, h, z - 1);
  }

  terminada() {
    return this.caminantes.length === 0;
  }

  actualizar() {
    if (this.terminada()) return;
    this.segundos += deltaTime / 1000; // tiempo real invertido
    this.pasos++;
    const cx = GX / 2, cz = GZ / 2;
    for (let i = this.caminantes.length - 1; i >= 0; i--) {
      const c = this.caminantes[i];
      let x = c.x, h = c.h, z = c.z;
      const r = random();
      if (r < DERIVA_ABAJO) {
        h--;
      } else if (r < DERIVA_ABAJO + DERIVA_CENTRO) {
        const dx = cx - x, dz = cz - z;
        if (random(Math.abs(dx) + Math.abs(dz)) < Math.abs(dx)) x += Math.sign(dx);
        else z += Math.sign(dz);
      } else {
        const d = floor(random(6));
        if (d === 0) x++; else if (d === 1) x--;
        else if (d === 2) z++; else if (d === 3) z--;
        else if (d === 4) h++; else h--;
      }
      h = constrain(h, 0, GH - 1);
      if (!dentro(x, z)) { x = c.x; z = c.z; }
      if (!this.ocupada(x, h, z)) { c.x = x; c.h = h; c.z = z; }

      // si toca la piedra desnuda vuelve a subir, como agua que se evapora:
      // la energía no se pierde, solo vuelve a circular
      if (c.h === 0 && !this.tocaForma(c.x, c.h, c.z)) {
        const a = random(TWO_PI), rr = RADIO * RADIO_LLUVIA * sqrt(random());
        c.x = Math.round(GX / 2 + rr * cos(a));
        c.z = Math.round(GZ / 2 + rr * sin(a));
        c.h = GH - 1;
        c.rastro = [];
        continue;
      }

      if (this.pasos % RASTRO_CADA === 0) {
        c.rastro.push(c.x, c.h, c.z);
        if (c.rastro.length > RASTRO_LARGO * 3) c.rastro.splice(0, 3);
      }
      if (this.tocaForma(c.x, c.h, c.z)) this.pegar(i);
    }
    if (this.terminada() && this.pendientes.length) this.hornear();
  }

  pegar(i) {
    const c = this.caminantes[i];
    this.grid[indice(c.x, c.h, c.z)] = 1;
    this.formaE += c.e;
    this.pendientes.push({
      ...mundo(c.x, c.h, c.z),
      r: S * 0.7,
      c: gradiente(CAPAS, this.formaE / E_TOTAL),
      rastro: c.rastro.concat([c.x, c.h, c.z]),
    });
    this.caminantes[i] = this.caminantes[this.caminantes.length - 1];
    this.caminantes.pop();
    if (this.pendientes.length >= LOTE) this.hornear();
  }

  hornear() {
    this.lotes.push({
      esferas: mallaEsferas(this.pendientes),
      cauces: mallaLineas(this.pendientes.map(p => p.rastro)),
    });
    this.pendientes = [];
  }

  energia() {
    let libre = 0;
    for (const c of this.caminantes) libre += c.e;
    return { libre, forma: this.formaE, decisiones: 0 };
  }

  dibujar() {
    piedra();

    noStroke();
    fill(PALETA.deepRose);
    for (const s of this.semillas) {
      push(); translate(s.x, s.y, s.z); sphere(S * 0.9, 8, 6); pop();
    }

    fill(PALETA.pastel); // el término ambiental usa el fill: así tiñe de rosa y no de blanco
    for (const l of this.lotes) model(l.esferas);
    for (const p of this.pendientes) {
      push(); translate(p.x, p.y, p.z); fill(p.c[0] * 255, p.c[1] * 255, p.c[2] * 255); sphere(p.r, 7, 5); pop();
    }

    // cauces: la historia del camino de cada partícula
    noFill();
    stroke(244, 143, 177, 70); // blush translúcido
    strokeWeight(1);
    for (const l of this.lotes) model(l.cauces);

    // energía libre
    stroke(PALETA.dusty);
    strokeWeight(2.5);
    beginShape(POINTS);
    for (const c of this.caminantes) {
      const w = mundo(c.x, c.h, c.z);
      vertex(w.x, w.y, w.z);
    }
    endShape();
  }

  // click sobre la piedra: nueva semilla
  clicPiedra(wx, wz) {
    this.sembrar(Math.round(wx / S + GX / 2), Math.round(wz / S + GZ / 2));
  }
}
