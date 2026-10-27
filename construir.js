// Pieza Construir: crecimiento tipo DLA en una grilla.
// Cada partícula libre lleva 1 unidad de energía; al pegarse, esa energía pasa a la forma.

const N_CONSTRUIR = 2000;  // 1 unidad de energía por partícula
const PASOS_POR_FRAME = 1; // constante: no hay tecla para acelerar
const DERIVA = 0.01;       // probabilidad de dar un paso hacia el centro (controla la duración, ~3 min)

class Construir {
  constructor(w, h) {
    this.cols = floor(w / CELDA);
    this.rows = floor(h / CELDA);
    this.pg = createGraphics(w, h);
    this.rastro = createGraphics(w, h);    // cauces: por donde pasó la energía libre
    this.sedimento = createGraphics(w, h); // la forma, coloreada por el momento en que se pegó
    for (const g of [this.pg, this.rastro, this.sedimento]) g.pixelDensity(1);
    this.reiniciar();
  }

  reiniciar() {
    this.grid = new Uint8Array(this.cols * this.rows);
    this.caminantes = [];
    this.formaE = 0;
    this.version = 0;
    this.dibujadoEn = -1;
    this.rastro.clear();
    this.sedimento.clear();
    const e = E_TOTAL / N_CONSTRUIR;
    for (let i = 0; i < N_CONSTRUIR; i++) {
      this.caminantes.push({ x: floor(random(this.cols)), y: floor(random(this.rows)), e });
    }
    this.sembrar(floor(this.cols / 2), floor(this.rows / 2));
  }

  sembrar(x, y) {
    this.version++;
    this.grid[y * this.cols + x] = 1;
    this.sedimento.noStroke();
    this.sedimento.fill(200, 80, 60);
    this.sedimento.rect(x * CELDA, y * CELDA, CELDA, CELDA);
  }

  clickEn(mx, my) {
    this.sembrar(floor(mx / CELDA), floor(my / CELDA));
  }

  ocupada(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows && this.grid[y * this.cols + x] === 1;
  }

  tocaForma(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if ((dx || dy) && this.ocupada(x + dx, y + dy)) return true;
      }
    }
    return false;
  }

  actualizar() {
    this.version++;
    const cx = this.cols / 2, cy = this.rows / 2;
    for (let s = 0; s < PASOS_POR_FRAME; s++) {
      for (let i = this.caminantes.length - 1; i >= 0; i--) {
        const c = this.caminantes[i];
        let nx, ny;
        if (random() < DERIVA) {
          // un paso en un solo eje, elegido en proporción a la distancia: evita la cruz diagonal
          const dx = cx - c.x, dy = cy - c.y;
          nx = c.x; ny = c.y;
          if (random(Math.abs(dx) + Math.abs(dy)) < Math.abs(dx)) nx += Math.sign(dx);
          else ny += Math.sign(dy);
        } else {
          nx = c.x + floor(random(3)) - 1;
          ny = c.y + floor(random(3)) - 1;
        }
        nx = constrain(nx, 0, this.cols - 1);
        ny = constrain(ny, 0, this.rows - 1);
        if (!this.ocupada(nx, ny)) { c.x = nx; c.y = ny; }
        if (this.tocaForma(c.x, c.y)) this.pegar(i);
      }
    }

    // el rastro nunca se borra: historia acumulada
    this.rastro.noStroke();
    this.rastro.fill(30, 50, 70, 4); // color oscuro: acumula sin saturar el fondo
    for (const c of this.caminantes) this.rastro.rect(c.x * CELDA, c.y * CELDA, CELDA, CELDA);
  }

  pegar(i) {
    const c = this.caminantes[i];
    this.grid[c.y * this.cols + c.x] = 1;
    this.formaE += c.e;
    this.caminantes[i] = this.caminantes[this.caminantes.length - 1];
    this.caminantes.pop();

    // capas: lo primero que se pegó es oscuro, lo último claro
    const t = this.formaE / E_TOTAL;
    this.sedimento.noStroke();
    this.sedimento.fill(lerpColor(color(50, 80, 50), color(210, 230, 180), t));
    this.sedimento.rect(c.x * CELDA, c.y * CELDA, CELDA, CELDA);
  }

  energia() {
    let libre = 0;
    for (const c of this.caminantes) libre += c.e;
    return { libre, forma: this.formaE, decisiones: 0 };
  }

  dibujar() {
    const g = this.pg;
    if (this.dibujadoEn === this.version) return g; // congelada (p. ej. en Cierre): no redibujar
    this.dibujadoEn = this.version;
    g.background(12);
    g.image(this.rastro, 0, 0);
    g.image(this.sedimento, 0, 0);
    g.noStroke();
    g.fill(255, 170);
    for (const c of this.caminantes) g.rect(c.x * CELDA, c.y * CELDA, CELDA - 1, CELDA - 1);
    return g;
  }
}
