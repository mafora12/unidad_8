# Nada se pierde, todo se transforma

Unidad 8 — *Why Bother? ¿Para qué tomarte el trabajo?* · Curso de Simulación, UPB · Mariana

**Ver la obra:** https://mafora12.github.io/unidad_8/

A partir de la charla de Robert Hodgin *"Why Bother? Making Art in the Age of AI"*, la obra no pregunta si vale la pena esforzarse, sino **¿dónde queda el esfuerzo cuando el hacer se automatiza?**

Es un sistema de partículas con **energía conservada**: cada pieza tiene 2000 unidades de energía y el contador total nunca cambia. Lo que cambia es dónde termina esa energía.

## Cómo se usa

| Modo | Tecla | Qué pasa |
|---|---|---|
| **Construir** | `1` | La energía se va a la forma. Las partículas caen sobre una piedra y se pegan una a una (crecimiento tipo DLA en 3D). Tarda unos 4 minutos y no se puede acelerar. Deja historia: lo primero que se pega queda abajo y oscuro (sedimento) y el camino de cada partícula queda como un cauce. **Click en la piedra** para sembrar. |
| **Prompt** | `2` | **Generar** (`G`) trae 4 variantes al instante, que orbitan la piedra. **Click** en una para elegirla y **shift + click** para combinarla con la actual. `X` descarta. Cada decisión cuesta 50 de energía, que se convierte en pétalos de un enjambre (flocking). |
| **Cierre** | `3` | Las dos piezas en una sola piedra: Construir en rosa, Prompt en morado. No se comparan por cuál costó más, sino por dónde quedó el esfuerzo. |

Arrastrar gira la escena, la rueda acerca y `R` reinicia la pieza actual.

## Técnica

- **p5.js 1.9.4** en modo WEBGL (3D).
- **Construir:** DLA en una grilla 3D de 90 × 90 × 72. Las partículas caen con una leve deriva hacia abajo y hacia el centro. Si tocan la piedra desnuda vuelven a subir: la energía no se pierde, solo vuelve a circular.
- **Prompt:** crecimiento instantáneo por ramas y flocking 3D (separación, alineación, cohesión) para la capa de decisiones.
- **Energía:** el total que se muestra es la suma de *forma + decisiones + libre*, calculada cada vez, no un número escrito a mano.
- **Paleta:** rosas de *deep rose* `#C2185B` a *lavender blush* `#FAE8ED`, más morado `#9C27B0` para Prompt en el cierre. Tipografías Italiana e Inter.

### Archivos

| Archivo | Contenido |
|---|---|
| `index.html`, `estilo.css` | Página e interfaz (modos, tarjetas de energía, botones) |
| `sketch.js` | Ciclo principal, cámara, click en 3D, interfaz |
| `construir.js` | Pieza Construir (DLA, sedimento, cauces) |
| `prompt.js` | Pieza Prompt (variantes, decisiones, enjambre) |
| `util3d.js` | Paleta, grilla y mallas de esferas en una sola geometría |
| `.github/workflows/pages.yml` | Publicación automática en GitHub Pages en cada push |

---

## Bitácora

Cada sesión tiene dos partes: **Registro**, con lo que se hizo y lo que falló, y **Mis notas**, que son mis reflexiones con mis propias palabras.

### Sesión 1 — 27 de octubre de 2026

**Registro**

- **Qué probé:**
  - Prototipo mínimo en 2D: Construir con DLA en una grilla y Prompt con variantes instantáneas y boids. El contador de energía se mantuvo en 2000 en ambas piezas.
  - Publicación en GitHub Pages con Actions.
  - Reescritura completa en 3D (p5 WEBGL) con la paleta rosa, tarjetas de energía en HTML, cámara orbital y click sobre objetos 3D (sembrar en la piedra, elegir variantes que orbitan).
  - Cierre combinado: las dos formas en una sola piedra, Prompt en morado.
- **Qué falló o no funcionó:**
  - En 2D la forma se completaba en 9 segundos (no era "lenta") y crecía en cruz por cómo estaba hecha la deriva hacia el centro. Se bajó la velocidad y se cambió la deriva para que fuera igual en todas las direcciones.
  - En 3D, primero las esferas no se veían (la plantilla de esfera no tenía caras) y luego las partículas formaban una alfombra plana en el suelo en vez de crecer hacia arriba. Se resolvió haciendo que nacieran arriba y que, al tocar la piedra desnuda, volvieran a subir.
  - Los cauces salían blancos y tapaban la forma. Se pasaron a rosa translúcido.
  - Los boids dibujados como línea y punto se veían raros. Se cambiaron por pétalos orientados según su velocidad.
  - Al principio la versión 2D se veía "súper aburrida", y por eso se pasó a 3D.

**Mis notas**

- Qué me sorprendió:
- Qué entendí que antes no:
- Dónde puse el esfuerzo hoy (yo / IA / ambos):

### Sesión 2 — 29 de octubre de 2026

**Registro**

- **Qué probé:** medir cuánto tardaba cada acción para encontrar por qué todo cargaba lento.
- **Qué falló o no funcionó:**
  - Generar variantes tardaba ~1,7 s. La causa principal era que la función `model()` de p5, la primera vez que dibuja una malla, arma líneas de contorno para cada triángulo (cientos de miles), aunque nunca se dibujen. Se cambió por un dibujo directo de la malla.
  - El enjambre de 200 pétalos tardaba ~57 ms por frame porque creaba vectores nuevos en 40.000 comparaciones. Se reescribió con números simples y se dibuja de una sola vez.
  - Construir dibujaba la forma en decenas de pedazos (~13 ms por frame). Ahora los pedazos chicos se funden en uno grande cada cierto tiempo.
  - Resultado: Generar tarda ~20 ms y cada frame entre 0,5 y 2 ms.

**Mis notas**

- Qué me sorprendió:
- Qué entendí que antes no:
- Dónde puse el esfuerzo hoy (yo / IA / ambos):
