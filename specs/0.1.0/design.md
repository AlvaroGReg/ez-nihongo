# Diseño técnico — 0.1.0

## Flujo

```text
SetupView
  -> vocabulary API adapter
  -> validated, deduplicated and shuffled questions
  -> active TestSession
  -> feedback per answer
  -> TestResult
  -> ResultView + history storage
```

La sesión se prepara completa antes de mostrar la primera pregunta. Por ello,
una desconexión posterior no interrumpe el test; el progreso se guarda tras
cada transición de estado.

## Contratos internos

- `JlptLevel`: `1 | 2 | 3 | 4 | 5`, con presentación `N1`–`N5`.
- `VocabularyWord`: `word`, `meaning`, `furigana`, `romaji` y `level`.
- `TestConfig`: `level` y `questionCount`.
- `TestQuestion`: entrada de vocabulario usada en una sesión.
- `TestAnswer`: índice de pregunta, respuesta original, respuesta esperada y
  resultado.
- `TestSession`: versión, configuración, preguntas, índice actual, respuestas,
  feedback pendiente y fecha de creación.
- `TestResult`: identificador, configuración, preguntas, respuestas, score,
  percentage, niveles usados y fecha de finalización.
- `HistoryEntry`: resultado terminado almacenado localmente.

## API

El adaptador valida que cada entrada tenga palabra y significado textuales,
furigana textual, romanji no vacío y nivel JLPT válido. Las entradas inválidas
se descartan y se continúa la paginación. El offset avanza según el número de
entradas devueltas por la API, evitando bucles si el servidor devuelve una
página inesperada.

Las palabras se deduplican por su representación visible (`word` + `furigana`)
y se mezclan antes de crear la sesión.

## Persistencia

Usar claves versionadas:

- `ez-nihongo:active-session:v1`
- `ez-nihongo:history:v1`

El parser debe tolerar JSON corrupto o esquemas desconocidos eliminando solo el
valor inválido. La sesión activa se conserva hasta completar o abandonar; el
historial se conserva para futuras versiones, aunque no tenga pantalla visible
en 0.1.0.

## GitHub Pages

Usar `createWebHashHistory(import.meta.env.BASE_URL)` y `base: '/ez-nihongo/'`.
El workflow de Actions para `master` ejecutará `npm ci`, type-check, pruebas,
build y las acciones oficiales de Pages para publicar `dist`.
