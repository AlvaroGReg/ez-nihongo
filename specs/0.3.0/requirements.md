# Especificación de requisitos — 0.3.0

## Estado y objetivo

Estado: implementada en MVP local; pendiente validación manual de accesibilidad.

La versión 0.3.0 convierte el test de vocabulario en un MVP gratuito de
aprendizaje para principiantes. Una persona debe poder entrar sin cuenta,
recibir una ruta N5 corta, estudiar kana, vocabulario y kanji relacionados,
practicar, y conservar su progreso y sus anotaciones en el dispositivo.

La experiencia es local y anónima. No se introduce autenticación, servidor de
progreso, sincronización, pagos ni SRS con fechas.

## Alcance funcional

### US-01 — Entrada y orientación

Como estudiante nuevo, quiero empezar sin cuenta con una prueba breve y
configurar un plan solo cuando necesite una ruta más guiada.

**REQ-01:** La pantalla raíz debe mostrar primero la configuración de una prueba
rápida de vocabulario, con selección de uno o más niveles JLPT N5–N1 y una
cantidad de 10 a 100 preguntas en incrementos de 10, como en 0.1.0. Debe poder
iniciarse sin login, sin token y sin enviar progreso personal a un servidor.
El catálogo público se consume como artefacto versionado; la API externa de
vocabulario de 0.2.0 no es un requisito de ejecución para la ruta 0.3.0.

**REQ-02:** La creación de un plan de estudio debe estar destacada en la
pantalla raíz, pero ser opcional y posterior a la prueba rápida. El onboarding
debe recoger y conservar localmente un objetivo, un nivel inicial y un tiempo
diario elegido. Debe poder repetirse desde el dashboard sin borrar intentos,
progreso, favoritos ni notas.

**REQ-03:** La prueba de nivel básica debe poder omitirse, usar ejercicios del
catálogo local, terminar mostrando una recomendación de punto de entrada y no
presentarse como una certificación JLPT. La recomendación no debe impedir el
acceso a la ruta N5.

**Escenario:** primera entrada sin cuenta

```gherkin
Given the user has no local onboarding data
When the application is opened
Then it shows the quick test configuration before the study plan form
And it offers a prominent entry to create a study plan
And it does not request authentication
And no personal progress is sent to a remote service
```

**Escenario:** acceso recurrente a pruebas y plan

```gherkin
Given the user has a saved study plan
When the application is opened
Then quick test configuration is immediately available
And the saved plan is available from a separate highlighted entry
And the dashboard offers a direct link back to quick tests
```

**Escenario:** onboarding persistente

```gherkin
Given the user chooses an objective, an initial level and 15 daily minutes
When the user completes onboarding and reloads the application
Then those choices are restored locally
And existing progress and annotations remain unchanged
```

### US-02 — Ruta y catálogo inicial

Como principiante, quiero seguir un recorrido corto y coherente desde kana
hacia vocabulario y kanji para saber qué estudiar a continuación.

**REQ-04:** La aplicación debe ofrecer una ruta N5 fija, pública y finita, con
orden explícito de unidades y una recomendación de siguiente actividad. El
usuario puede repetir o abandonar una unidad sin perder el progreso anterior.

**REQ-05:** El catálogo 0.3.0 debe incluir hiragana y katakana básicos,
vocabulario inicial y kanji básicos relacionados mediante identificadores
estables. Como mínimo debe poder construirse una unidad de cada tipo y cada
relación publicada debe apuntar a un contenido existente.

**REQ-06:** El cliente debe cargar un manifiesto de contenido versionado que
declare su versión de esquema, versión de catálogo, idiomas disponibles,
compatibilidad mínima del cliente y fuentes/licencias de los contenidos. Un
manifiesto ausente, incompatible o inválido debe producir un error recuperable,
no una ruta parcialmente construida.

**REQ-07:** Los ejercicios básicos deben distinguir `recognition`, `reading` y
`meaning`, estar vinculados a un `contentId` estable y declarar sus respuestas
aceptadas o sus opciones válidas. La validación debe ser determinista y no
depender de IA ni de texto enviado por el usuario a un proveedor externo.

**REQ-08:** El furigana debe poder mostrarse u ocultarse como preferencia local
y como opción de sesión. Ocultarlo solo cambia la presentación del enunciado;
no cambia el contenido, las respuestas aceptadas ni los contadores.

**Escenario:** catálogo válido y relaciones consistentes

```gherkin
Given a compatible 0.3.0 content manifest is available
When the user opens the N5 route
Then the route contains ordered units for kana and related vocabulary/kanji
And every published relation resolves to an existing contentId
And the first unit can be started without the vocabulary API
```

**Escenario:** catálogo incompatible

```gherkin
Given the content manifest has an unsupported schema version
When the application tries to open the route
Then it shows a localized recoverable catalog error
And it does not create an incomplete study session
```

**Escenario:** furigana oculto

```gherkin
Given the user has disabled furigana
When a vocabulary or kanji exercise is displayed
Then the furigana is absent from the prompt
And the content identity and answer validation are unchanged
```

### US-03 — Modos de estudio y ejercicios

Como estudiante, quiero elegir una actividad adecuada a mi estado actual.

**REQ-09:** Deben existir los modos `new`, `review`, `mistakes` y `quick`:

- `new` selecciona contenido sin intentos válidos previos;
- `review` selecciona contenido en estado `learning` o `learned`;
- `mistakes` selecciona contenido con al menos un fallo;
- `quick` crea una sesión corta y acotada usando contenido disponible.

Si un modo no tiene contenido, la aplicación debe explicarlo y ofrecer una
alternativa sin crear una sesión vacía.

**REQ-10:** Las respuestas deben mostrar feedback inmediato, permitir
reintentar o continuar según el ejercicio y conservar una respuesta incorrecta
como fallo de progreso. La sesión debe poder reanudarse tras una recarga.

**REQ-11:** El contador de intentos, aciertos y aciertos en sesiones distintas
debe actualizarse después de cada respuesta confirmada. Repetir una respuesta
no puede duplicar el mismo evento durante una reanudación.

**Escenario:** modo sin contenido

```gherkin
Given the user selects mistakes and has no recorded mistakes
When the application prepares the activity
Then it explains that there is no pending content
And it offers another study mode
And it does not persist an empty session
```

### US-04 — Progreso local y dashboard

Como estudiante, quiero saber qué he aprendido y qué debería estudiar ahora.

**REQ-12:** El progreso debe almacenarse localmente de forma anónima, con
claves y formato versionados. El cliente no debe tratar el almacenamiento local
como autoridad para desbloquear premium; 0.3.0 solo expone capacidades
gratuitas.

**REQ-13:** Cada contenido debe tener estado `new`, `learning` o `learned`.
`new` significa cero intentos; `learning` significa al menos un intento sin
cumplir la regla de aprendizaje; `learned` significa al menos un acierto en
tres sesiones de estudio distintas. La regla de tres sesiones debe estar
aislada en configuración para poder cambiarla después. 0.3.0 no genera fechas
de vencimiento ni estado `due`.

**REQ-14:** El dashboard debe mostrar al menos la actividad actual, una racha,
el contenido pendiente y una recomendación de siguiente paso. Una racha cuenta
días locales consecutivos con al menos una respuesta confirmada y puede
continuar si la última actividad fue ayer; no cuenta días futuros.

**Escenario:** aprendizaje en tres sesiones

```gherkin
Given a content item has no attempts
When the user answers it incorrectly in session A
Then its state is learning and its attempt count is 1
When the user answers it correctly in sessions A, B and C
Then its state is learned
And its distinct correct-session count is 3
And no review date is created
```

**Escenario:** dashboard después de estudiar

```gherkin
Given the user has confirmed an answer today
When the user opens the dashboard
Then the dashboard shows today's activity
And the current streak is at least one day
And it recommends new content, review or mistakes according to local progress
```

### US-05 — Favoritos y notas

Como estudiante, quiero marcar contenido y escribir una nota personal para
volver a él.

**REQ-15:** El usuario debe poder añadir o quitar un favorito y crear, editar o
vaciar una nota asociada a un `contentId`. Favoritos y notas deben persistir
localmente, sobrevivir a una recarga y no formar parte del catálogo publicado.

### US-06 — Accesibilidad y localización

Como estudiante, quiero usar la aplicación con teclado, lector de pantalla o
un IME japonés.

**REQ-16:** Toda la ruta 0.3.0 debe estar disponible con teclado, usar controles
semánticos con nombre accesible, mantener foco visible y anunciar cambios de
pregunta, feedback y errores sin depender solo del color.

**REQ-17:** Los campos de respuesta deben respetar la composición de un IME:
una tecla Enter durante `compositionstart`/`compositionupdate` no debe enviar
la respuesta, y el valor compuesto debe conservarse al terminar la composición.

**REQ-18:** Los textos nuevos de interfaz deben estar disponibles en `en` y
`es`, usar el fallback de 0.2.0 y mantener separado el texto del catálogo. El
locale no debe cambiar los identificadores, las respuestas ni el progreso.

## Compatibilidad y migración

- Se conserva el idioma `en`/`es` y su clave `ez-nihongo:locale:v1`.
- Las sesiones activas de 0.2.0 no se migran automáticamente: el arranque de
  0.3.0 descarta los formatos activos anteriores y no muestra un diálogo de
  reanudación para ellos.
- El historial `ez-nihongo:history:v1` no se borra. Su eventual importación al
  nuevo agregado de progreso debe ser explícita, idempotente y limitada a
  eventos que contengan `contentId`; no es requisito para cerrar 0.3.0.
- Los datos inválidos de onboarding, progreso, favoritos o notas se descartan
  de forma aislada y se reemplazan por valores vacíos/default.

## Fuera de alcance

- Cuenta, login, sincronización entre dispositivos y API de progreso.
- CMS, edición de contenido por usuarios y publicación desde el cliente.
- SRS con fechas, intervalos, cola de vencimientos o analítica remota.
- Stripe, premium real, anuncios, comunidad y contenido creado por usuarios.
- Corrección por IA, conversación libre, audio, escritura manuscrita y móvil.
- Catálogo completo de gramática o traducción en tiempo de ejecución.

## Criterios de cierre

0.3.0 se considera especificada para implementación cuando el contrato del
catálogo y los tres documentos SDD estén aprobados, y se considera cerrada
cuando todos los requisitos tienen pruebas en el cliente, existe un artefacto
de contenido compatible con su propia validación y los checks de web pasan sin
autenticación ni servicios remotos obligatorios.
