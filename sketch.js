// Nada se pierde, todo se transforma — prototipo mínimo
// Teclas: 1 Construir · 2 Prompt · 3 Cierre · R reiniciar pieza actual

const E_TOTAL = 2000;   // energía total de cada pieza; nunca cambia
const PANEL = 600;      // tamaño de cada pieza en px
const CELDA = 3;        // tamaño de celda de la grilla (forma y partículas)

let modo = 1;
let piezaConstruir, piezaPrompt;

function setup() {
  createCanvas(1240, 760).parent(document.querySelector('main'));
  pixelDensity(1);
  frameRate(60); // fijo: la forma crece en tiempo real, no hay forma de acelerarla
  textFont('monospace');
  piezaConstruir = new Construir(PANEL, PANEL);
  piezaPrompt = new Prompt(PANEL, PANEL);
}

function draw() {
  background(0);

  if (modo === 1) piezaConstruir.actualizar();
  if (modo === 2 || modo === 3) piezaPrompt.actualizar();

  fill(220);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);

  if (modo === 1) {
    text('CONSTRUIR — la energía se va a la forma. Click: nueva semilla · R: reiniciar', 20, 20);
    dibujarPieza(piezaConstruir, posUnica(), 'Construir');
  } else if (modo === 2) {
    text('PROMPT — G/espacio: generar · click: elegir · shift+click: combinar · X: descartar · R: reiniciar', 20, 20);
    dibujarPieza(piezaPrompt, posUnica(), 'Prompt');
  } else {
    text('CIERRE — no cuál costó más, sino dónde quedó el esfuerzo', 20, 20);
    dibujarPieza(piezaConstruir, { x: 13, y: 60 }, 'Construir');
    dibujarPieza(piezaPrompt, { x: 627, y: 60 }, 'Prompt');
  }
}

function posUnica() {
  return { x: (width - PANEL) / 2, y: 60 };
}

function dibujarPieza(pieza, pos, nombre) {
  image(pieza.dibujar(), pos.x, pos.y);
  noFill();
  stroke(60);
  rect(pos.x, pos.y, PANEL, PANEL);
  hudEnergia(pieza.energia(), pos.x, pos.y + PANEL + 14, nombre);
}

// Contador de energía: el total se calcula sumando las partes, no está escrito a mano
function hudEnergia(en, x, y, nombre) {
  const total = en.libre + en.forma + en.decisiones;
  noStroke();
  fill(220);
  textSize(13);
  textAlign(LEFT, TOP);
  text(`${nombre}   libre ${en.libre}   forma ${en.forma}   decisiones ${en.decisiones}`, x, y);
  textAlign(RIGHT, TOP);
  text(`TOTAL ${total}`, x + PANEL, y);

  // barra apilada: dónde está la energía
  const by = y + 22, bh = 14;
  let bx = x;
  const partes = [
    [en.forma, color(120, 170, 110)],
    [en.decisiones, color(230, 150, 70)],
    [en.libre, color(90)],
  ];
  for (const [v, c] of partes) {
    const w = (v / E_TOTAL) * PANEL;
    fill(c);
    rect(bx, by, w, bh);
    bx += w;
  }
}

function keyPressed() {
  if (key === '1') modo = 1;
  else if (key === '2') modo = 2;
  else if (key === '3') modo = 3;
  else if (key === 'r' || key === 'R') {
    if (modo === 1) piezaConstruir.reiniciar();
    if (modo === 2) piezaPrompt.reiniciar();
  } else if (modo === 2) {
    if (key === 'g' || key === 'G' || key === ' ') piezaPrompt.generar();
    if (key === 'x' || key === 'X') piezaPrompt.descartar();
  }
}

function mousePressed() {
  const p = posUnica();
  const mx = mouseX - p.x, my = mouseY - p.y;
  if (mx < 0 || my < 0 || mx >= PANEL || my >= PANEL) return;
  if (modo === 1) piezaConstruir.clickEn(mx, my);
  if (modo === 2) piezaPrompt.clickEn(mx, my, keyIsDown(SHIFT));
}
