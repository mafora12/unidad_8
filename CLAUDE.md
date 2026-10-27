# Unidad 8 — Why Bother? ¿Para qué tomarte el trabajo?

Curso de Simulación, UPB. Unidad 8 (12.5% de la nota final). Autora: Mariana.

## Encargo (Actividad 02)
Obra mediante simulación computacional que explore *Why Bother?* a partir de la charla de Robert Hodgin "Why Bother? Making Art in the Age of AI".

## Postura de la autora
Hodgin: la IA hace desaparecer al artista y la creación se vuelve curaduría.
Mariana: la IA es su principal ayudante; el trabajo no desaparece cuando se automatiza, se transforma, como con cada herramienta nueva (Hodgin mismo pasó de Flash a Processing, Cinder y Houdini, de 200 a 200.000 partículas, sin dejar de ser el autor).
Pregunta de la obra: **¿dónde queda el esfuerzo cuando el hacer se automatiza?** (no "¿vale la pena esforzarse?").

## Concepto: "Nada se pierde, todo se transforma"
Sistema de partículas con energía conservada. Contador visible de energía total que nunca cambia.
- **Construir**: la energía se va a la forma. Crece lento, en tiempo real, sin poder acelerarse. Deja rastro e historia (cauces viejos, capas, sedimento).
- **Prompt**: el resultado aparece al instante, pero la energía migra a una capa de decisiones (elegir, descartar, combinar variantes), que también se visualiza.
- **Cierre**: las dos piezas lado a lado. No se comparan por cuál costó más, sino por dónde quedó el esfuerzo.

Referencias: meandros de Harold Fisk, flocking (3 reglas), musgo en las grietas del tōrō, frase de Luca (lo que no costó esfuerzo es difícil de valorar).

## Técnica
- p5.js 1.9.4 en modo WEBGL (3D). Paleta rosa de Mariana (deep rose #C2185B → lavender blush #FAE8ED), tipografías Italiana + Inter.
- Construir: DLA 3D sobre una piedra (grilla 90×90×72); las partículas caen y, si tocan piedra desnuda, vuelven a subir. Color por orden de llegada (sedimento) y cauces congelados del camino de cada partícula. Click en la piedra = semilla. ~4 min, sin acelerar.
- Prompt: variantes 3D instantáneas que orbitan la piedra; click elige, shift+click combina. Cada decisión (50 de energía) se vuelve pétalos de un flocking 3D.
- Cierre: ambas piedras lado a lado. Contador de energía en tarjetas HTML (total = suma de partes).
- Archivos: `util3d.js` (paleta, grilla, mallas horneadas en una sola geometría), `construir.js`, `prompt.js`, `sketch.js` (cámara, click en 3D, UI), `estilo.css`.
- Deploy: GitHub Pages con Actions (`.github/workflows/pages.yml`) → https://mafora12.github.io/unidad_8/

## Forma de trabajo
- Respuestas directas y concisas, en español. Editar archivos directamente.
- Si Mariana tiene una visión clara, ejecutarla con precisión. No reinterpretar.
- `BITACORA.md`: al final de cada sesión, recordarle que anote. Las entradas las escribe ella con sus palabras (base de su presentación, preguntas 2–5). **No redactarlas por ella**; solo ofrecer las preguntas guía de la plantilla.

## Presentación (Actividad 03)
1. ¿Cómo interpretaste Why Bother? ¿Qué aspecto exploraste y cómo cambió tu interpretación? (borrador inicial hecho; falta "cómo cambió")
2. ¿Cómo lo exploraste? Técnicas, decisiones, pruebas.
3. ¿Qué encontraste? Lo esperado, lo que sorprendió, lo que sigue abierto.
4. ¿Qué aprendiste realmente? ¿Qué puedes comprender, explicar o modificar ahora?
5. ¿Qué sentido tuvo tomarte el trabajo? ¿Cómo te sitúas ahora frente a la pregunta de Hodgin?

### Borrador pregunta 1 (parte inicial, de Mariana)
Lo que más me incomodó de la charla fue que Hodgin presenta la IA casi como una pérdida: el artista desaparece y la creación se vuelve curaduría. Mi experiencia es distinta. Para mí la IA ha sido mi principal ayudante en este curso. Usé IA en todo, pero las ideas, las decisiones y el criterio fueron míos. Por eso no leo la pregunta como "¿vale la pena esforzarse si una máquina lo puede hacer?", sino como "¿dónde está el esfuerzo ahora?". Cuando algo se automatiza, el trabajo no desaparece, se transforma, como ha pasado con cada herramienta nueva. Incluso Hodgin cambió de herramienta varias veces, y cada una le resolvía más cosas sin que dejara de ser el autor. Decidí explorar esa transformación: qué le pasa al esfuerzo cuando el hacer se automatiza.
