// Nada se pierde, todo se transforma
// Teclas: 1 Construir · 2 Prompt · 3 Cierre · R reiniciar · G/espacio generar · X descartar
// Arrastrar: girar · rueda: acercar

const E_TOTAL = 2000; // energía total de cada pieza; nunca cambia

let modo = 1;
let cam, piezaConstruir, piezaPrompt;
let sobreCanvas = false, inicioClic = null;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL).parent('lienzo');
  pixelDensity(Math.min(2, displayDensity()));
  frameRate(60); // fijo: Construir crece en tiempo real y no hay forma de acelerarla
  cam = createCamera();
  piezaConstruir = new Construir();
  piezaPrompt = new Prompt();
  conectarEventos(document.querySelector('#lienzo canvas'));
  conectarUI();
  cambiarModo(1);
}

function draw() {
  clear();
  if (sobreCanvas) orbitControl(1, 1, 0.3);
  luces();

  if (modo === 1) {
    piezaConstruir.actualizar();
    piezaConstruir.dibujar();
  } else if (modo === 2) {
    piezaPrompt.actualizar();
    piezaPrompt.dibujar(true);
  } else {
    piezaPrompt.actualizar();
    push(); translate(-300, 0, 0); scale(0.85); piezaConstruir.dibujar(); pop();
    push(); translate(300, 0, 0); scale(0.85); piezaPrompt.dibujar(false); pop();
  }

  if (frameCount % 6 === 0) actualizarUI();
}

function luces() {
  ambientLight(105, 85, 95);
  directionalLight(200, 180, 190, -0.4, 0.75, -0.55);
  directionalLight(170, 120, 140, 0.7, 0.2, 0.4);
  directionalLight(110, 80, 95, 0, 0.2, -1); // de frente: los costados de la piedra no quedan grises
}

function cambiarModo(m) {
  modo = m;
  ponerCamara();
  document.body.dataset.modo = m;
  document.querySelector('#pista').innerHTML = PISTAS[m]; // texto fijo nuestro, no viene del usuario
  document.querySelectorAll('[data-modo]').forEach(b => b.classList.toggle('activo', +b.dataset.modo === m));
  actualizarUI();
}

// en pantallas angostas (celular) la cámara se aleja para que quepa la piedra
function ponerCamara() {
  const k = Math.max(1, 0.9 / (width / height));
  const [ey, ez, cy] = modo === 3 ? [-330, 900, -120] : [-300, 680, -150];
  cam.camera(0, cy + (ey - cy) * k, ez * k, 0, cy, 0, 0, 1, 0);
}

// ---------- cámara: rayos y proyección para hacer click en 3D ----------

function baseCamara() {
  const eye = createVector(cam.eyeX, cam.eyeY, cam.eyeZ);
  const fwd = createVector(cam.centerX - cam.eyeX, cam.centerY - cam.eyeY, cam.centerZ - cam.eyeZ).normalize();
  const der = p5.Vector.cross(fwd, createVector(cam.upX, cam.upY, cam.upZ)).normalize();
  const arr = p5.Vector.cross(der, fwd).normalize(); // en p5 apunta hacia abajo de la pantalla
  const t = Math.tan(cam.cameraFOV / 2);
  return { eye, fwd, der, arr, t, a: cam.aspectRatio };
}

function rayo(mx, my) {
  const b = baseCamara();
  const nx = (mx / width * 2 - 1) * b.t * b.a;
  const ny = (my / height * 2 - 1) * b.t;
  const d = b.fwd.copy().add(b.der.mult(nx)).add(b.arr.mult(ny)).normalize();
  return { o: b.eye, d };
}

function proyectar(x, y, z) {
  const b = baseCamara();
  const v = createVector(x, y, z).sub(b.eye);
  const cz = v.dot(b.fwd);
  return {
    x: (v.dot(b.der) / (cz * b.t * b.a) + 1) / 2 * width,
    y: (v.dot(b.arr) / (cz * b.t) + 1) / 2 * height,
  };
}

function clic(mx, my, shift) {
  if (modo === 1) {
    const r = rayo(mx, my);
    if (r.d.y <= 0) return; // mirando hacia arriba: no toca la piedra
    const k = -r.o.y / r.d.y;  // intersección con el plano y = 0
    piezaConstruir.clicPiedra(r.o.x + r.d.x * k, r.o.z + r.d.z * k);
  } else if (modo === 2) {
    piezaPrompt.clicPantalla(mx, my, shift);
  }
}

// ---------- eventos ----------

function conectarEventos(el) {
  el.addEventListener('pointerenter', () => { sobreCanvas = true; });
  el.addEventListener('pointerleave', () => { sobreCanvas = false; });
  el.addEventListener('pointerdown', e => { inicioClic = { x: e.clientX, y: e.clientY }; });
  el.addEventListener('pointerup', e => {
    // un click es soltar casi donde se presionó; si no, fue un arrastre para girar
    if (inicioClic && Math.hypot(e.clientX - inicioClic.x, e.clientY - inicioClic.y) < 6) {
      const r = el.getBoundingClientRect();
      clic(e.clientX - r.left, e.clientY - r.top, e.shiftKey);
    }
    inicioClic = null;
  });
}

function keyPressed() {
  if (key === '1' || key === '2' || key === '3') cambiarModo(+key);
  else if (key === 'r' || key === 'R') reiniciar();
  else if (modo === 2 && (key === 'g' || key === 'G' || key === ' ')) piezaPrompt.generar();
  else if (modo === 2 && (key === 'x' || key === 'X')) piezaPrompt.descartar();
  else return;
  actualizarUI();
  return false;
}

function reiniciar() {
  if (modo === 1) piezaConstruir.reiniciar();
  if (modo === 2) piezaPrompt.reiniciar();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ponerCamara();
}

// ---------- interfaz HTML ----------

const PISTAS = {
  1: 'Arrastra para girar · rueda para acercar · <b>click en la piedra</b> para sembrar. La forma crece a su ritmo: no se puede acelerar.',
  2: '<b>Generar</b> trae 4 variantes al instante · <b>click</b> en una para elegirla · <b>shift + click</b> para combinarla con la actual.',
  3: 'No cuál costó más, sino <b>dónde quedó el esfuerzo</b>.',
};

function conectarUI() {
  document.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => cambiarModo(+b.dataset.modo)));
  document.querySelector('[data-accion=generar]').addEventListener('click', () => { piezaPrompt.generar(); actualizarUI(); });
  document.querySelector('[data-accion=descartar]').addEventListener('click', () => { piezaPrompt.descartar(); actualizarUI(); });
  document.querySelector('[data-accion=reiniciar]').addEventListener('click', () => { reiniciar(); actualizarUI(); });
}

function mmss(seg) {
  const s = Math.floor(seg);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function llenarTarjeta(el, en, extra) {
  const total = en.libre + en.forma + en.decisiones; // el total se suma, no está escrito a mano
  el.querySelector('.total').textContent = total;
  for (const k of ['forma', 'decisiones', 'libre']) {
    el.querySelector(`.seg.${k}`).style.width = (en[k] / E_TOTAL * 100) + '%';
    el.querySelector(`.val.${k}`).textContent = en[k];
  }
  el.querySelector('.extra').textContent = extra;
}

function actualizarUI() {
  const tc = document.querySelector('#tarjeta-construir');
  const tp = document.querySelector('#tarjeta-prompt');
  tc.hidden = modo === 2;
  tp.hidden = modo === 1;
  llenarTarjeta(tc, piezaConstruir.energia(),
    (piezaConstruir.terminada() ? 'terminada en ' : 'construyendo · ') + mmss(piezaConstruir.segundos));
  llenarTarjeta(tp, piezaPrompt.energia(),
    piezaPrompt.decisiones + ' decisiones' + (piezaPrompt.sinEnergia() ? ' · ya no queda energía para decidir' : ''));
  document.querySelector('[data-accion=generar]').disabled = piezaPrompt.sinEnergia();
  document.querySelector('[data-accion=descartar]').disabled = !piezaPrompt.actual || piezaPrompt.sinEnergia();
}
