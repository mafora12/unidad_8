# Nada se pierde, todo se transforma
**Unidad 8 · Why Bother? ¿Para qué tomarte el trabajo?**
Curso de Simulación, UPB, 2026-20 · Mariana

---

## El encargo
Crear una obra mediante simulación computacional que explore la pregunta **Why Bother? ¿Para qué tomarte el trabajo?**, a partir de la charla de Robert Hodgin *Why Bother? Making Art in the Age of AI*.

## Mi postura frente a Hodgin
Hodgin cuenta que, después de ver lo que Midjourney hacía con su idea de las linternas tōrō, perdió las ganas de seguir construyendo su generador: *"creation had been replaced with curation"*. Para él la IA hace que el artista deje de estar presente en su propia obra.

Mi experiencia es distinta. Para mí la IA es mi mejor amiga y mi ayudante. Que algo esté más automatizado no significa que desaparezca: se transforma, como ha pasado siempre. El mismo Hodgin pasó de Flash a Processing, luego a Cinder y luego a Houdini, y cada herramienta le resolvía más (de 200 partículas a 200.000) sin que él dejara de ser el autor.

Por eso la pregunta que exploro no es *"¿vale la pena esforzarse si una máquina lo puede hacer?"*, sino **"¿dónde queda el esfuerzo cuando el hacer se automatiza?"**.

## Concepto
Un sistema de partículas con **energía conservada**. Un contador visible muestra la energía total, que nunca cambia.

| Modo | Qué pasa con la energía |
|---|---|
| **Construir** | La energía se va a la **forma**. Crece lento, en tiempo real, sin poder acelerarse, y deja rastro: cauces viejos, capas, sedimento. |
| **Prompt** | El resultado aparece al instante, pero la energía no desaparece. Migra a una **capa de decisiones** (elegir, descartar, combinar variantes) que también se ve. |
| **Cierre** | Las dos piezas quedan lado a lado. No se comparan por cuál costó más, sino por **dónde quedó el esfuerzo** en cada una. |

### Referentes de la charla
- **Mapas de Harold Fisk (1944):** la historia del Mississippi visible en un solo mapa. Inspira el rastro del modo Construir.
- **Flocking:** un comportamiento complejo que sale de tres reglas simples (separación, cohesión, alineación).
- **El musgo del tōrō:** crecimiento lento que empieza en las grietas y se extiende.
- **Luca:** *"things that take no effort are hard to value"*. La obra discute esta frase.

## Técnica
- **p5.js**
- Sistema de partículas con fuerzas
- Trails y acumulación para la memoria del modo Construir
- Crecimiento tipo DLA (diffusion-limited aggregation) para la forma lenta
- Flocking para la capa de decisiones del modo Prompt

## Cómo ejecutarlo
<!-- Completar: archivo de entrada, link al sketch y controles (teclas o botones de cada modo) -->

---

## Bitácora

### Sesión 1 — 27 de octubre de 2026 · Concepto
**Qué hice**
- Leí la Unidad 8 y revisé la transcripción de la charla de Hodgin.
- Exploré seis ideas posibles para la obra:
  1. Mismo final, distinto pasado: dos ríos que llegan al mismo estado, uno con historia y otro generado al instante.
  2. Homogenización: un autómata celular donde todo converge al promedio.
  3. Lo que nadie extraña: 50 variaciones instantáneas que desaparecen frente a una pieza construida que persiste.
  4. Tiempo que no se puede comprar: un crecimiento en tiempo real que no se puede acelerar.
  5. Estratos de mi semestre.
  6. Mi propio tōrō.
- Me quedé con la **1, la 3 y la 4** y las fusioné en un solo concepto: *Nada se pierde, todo se transforma*.
- Decidí desarrollar la obra en Claude Code.

**Qué me incomodó de la charla**
Hodgin presenta la IA como una pérdida. Para mí la IA es mi mejor amiga y mi ayudante. Que algo sea más automatizado no significa que desaparezca, solo se transforma, así como ha pasado siempre.

**Cómo usé la IA en el curso**
Todo lo hice con IA, pero yo di mis ideas.

**Dónde puse el esfuerzo hoy**
- **Yo:** la postura frente a la charla, elegir y descartar ideas, decidir fusionar la 1, la 3 y la 4.
- **IA:** proponer las seis ideas, conectar mi postura con la historia de herramientas de Hodgin y redactar el concepto.

> Esto ya es un ejemplo de lo que explora la obra: la IA generó opciones y mi trabajo fue decidir.

**Qué me sorprendió:**
**Qué entendí que antes no:**

---

## Presentación

### 1. ¿Cómo interpreté la pregunta Why Bother?
Lo que más me incomodó de la charla fue que Hodgin presenta la IA casi como una pérdida: el artista desaparece y la creación se vuelve curaduría. Mi experiencia es distinta. Para mí la IA ha sido mi principal ayudante en este curso. Usé IA en todo, pero las ideas, las decisiones y el criterio fueron míos.

Por eso no leo la pregunta como "¿vale la pena esforzarse si una máquina lo puede hacer?", sino como "¿dónde está el esfuerzo ahora?". Cuando algo se automatiza, el trabajo no desaparece, se transforma, como ha pasado con cada herramienta nueva. Incluso Hodgin cambió de herramienta varias veces, y cada una le resolvía más cosas sin que dejara de ser el autor. Decidí explorar esa transformación: qué le pasa al esfuerzo cuando el hacer se automatiza.

*Cómo cambió mi interpretación mientras trabajaba:* <!-- completar al final -->

### 2. ¿Cómo lo exploré?
<!-- técnicas, decisiones y pruebas, a partir de la bitácora -->

### 3. ¿Qué encontré?
<!-- lo que esperaba, lo que me sorprendió y lo que sigue abierto -->

### 4. ¿Qué aprendí realmente?
<!-- qué puedo comprender, explicar o modificar ahora -->

### 5. ¿Qué sentido tuvo tomarme el trabajo?
<!-- qué me hizo continuar, qué esfuerzo valoro y dónde quedo frente a Hodgin -->

---

## Referencias
- Hodgin, R. *Why Bother? Making Art in the Age of AI*. Charla.
- Fisk, H. N. (1944). *Geological Investigation of the Alluvial Valley of the Lower Mississippi River*.
- Unidad 8, curso de Simulación UPB: juanferfranco.github.io/simulacion-2026-20/units/unit8/
