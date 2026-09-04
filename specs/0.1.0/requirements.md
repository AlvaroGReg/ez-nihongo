# Especificación de requisitos — 0.1.0

## Historias de usuario

### US-01 — Configurar un test

Como estudiante, quiero elegir un nivel JLPT y una cantidad de palabras para
iniciar una sesión de práctica ajustada a mi objetivo.

### US-02 — Responder vocabulario

Como estudiante, quiero ver una palabra en kanji e hiragana y escribir su
romanji para comprobar si conozco su lectura.

### US-03 — Recibir feedback

Como estudiante, quiero saber inmediatamente si mi respuesta es correcta y ver
la respuesta esperada cuando fallo.

### US-04 — Recuperar una sesión

Como estudiante, quiero poder continuar un test después de recargar la página o
perder temporalmente la conexión.

## Requisitos y escenarios

### REQ-01 — Configuración

- Los niveles disponibles son N5, N4, N3, N2 y N1.
- Las cantidades disponibles son 10, 20, …, 100.
- El test no comienza hasta que se han cargado todas las preguntas.

**Escenario:** configuración válida

```gherkin
Given the setup screen is visible
When the user selects JLPT N3 and 20 words
And starts the test
Then the application loads 20 valid questions before showing the first one
```

### REQ-02 — Datos y fallback

- Las preguntas se obtienen de `/api/words` con `level`, `offset` y `limit`.
- No puede repetirse una palabra mostrada en una sesión.
- El orden de ampliación desde N3 es N4, N2, N5 y N1.
- Si todos los niveles son insuficientes, el test no comienza.

**Escenario:** nivel insuficiente

```gherkin
Given the user selected JLPT N3 and 20 words
And N3 contains fewer than 20 valid unique words
When the application prepares the test
Then it requests adjacent levels in the defined fallback order
And shows a notice that additional levels were included
And starts only when 20 unique questions are available
```

### REQ-03 — Respuesta

- Se muestra `word` y, si existe, `furigana`.
- Después de responder se muestra el significado (`meaning`) de la palabra.
- La comparación ignora mayúsculas y espacios exteriores, y normaliza la
  composición Unicode sin eliminar las marcas de vocal larga.
- Las vocales largas aceptan sus alias de teclado: `ā`/`aa`, `ī`/`ii`,
  `ū`/`uu`, `ē`/`ee` para `ええ`, y `ō`/`oo`/`ou` para `おお` o `おう`.
- `えい` se escribe `ei` aunque suene como una `ē` larga (por ejemplo,
  `先生` es `sensei`); no se convierte automáticamente en `ee` ni `ē`.
- Las vocales cortas no equivalen a las largas: `o` y `ou` son distintos.
- Una respuesta vacía no se corrige y solicita una respuesta.

**Escenario:** respuesta incorrecta

```gherkin
Given a question with the expected romanji "kōhī"
When the user submits "ko-hi"
Then the answer is marked incorrect
And the expected romanji is shown
And the next question is not shown until Continue is pressed
```

### REQ-04 — Resultado

```gherkin
Given the user has answered every question
When the user confirms the last feedback
Then the application shows the score and percentage
And lists every incorrect answer with the submitted and expected romanji
And removes the active session
And stores the completed result in history
```

### REQ-05 — Errores y recuperación

```gherkin
Given the API is unavailable or returns invalid data
When the application tries to prepare a test
Then it shows a recoverable error
And offers Retry and Back to setup
And does not start an incomplete test
```

```gherkin
Given an active test was persisted
When the page is reloaded
Then the application offers Resume and Abandon
When Abandon is selected
Then the persisted active session is deleted
And no partial result is added to history
```

## No objetivos de 0.1.0

No se incluyen cuentas, historial visible, audio, modo offline, temporizador,
estadísticas avanzadas, repetición espaciada ni traducción de interfaz.
