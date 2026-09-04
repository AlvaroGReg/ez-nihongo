# Especificación de requisitos — 0.2.0

## Objetivo

Preparar la aplicación actual para soportar varios idiomas, tipos de contenido
y tipos de ejercicio sin activar todavía backend, login, CMS ni pagos.

## Alcance

### US-01 — Seleccionar idioma

Como estudiante, quiero elegir inglés o español para utilizar la interfaz en
mi idioma.

**REQ-01:** La interfaz debe ofrecer `en` y `es`, con inglés como fallback para
una clave no traducida.

**REQ-02:** La selección debe persistir localmente con una clave versionada y
aplicarse tras recargar la aplicación.

**REQ-03:** Cambiar de idioma no debe modificar preguntas, respuestas,
identificadores, score ni sesiones guardadas.

### US-02 — Separar contenido y ejercicio

Como desarrollador, quiero representar el contenido y el ejercicio por
separado para añadir kana, kanji, gramática y traducción sin duplicar el flujo.

**REQ-04:** El dominio debe distinguir como mínimo `ContentItem`,
`ExerciseDefinition`, `AttemptEvent`, `ProgressSnapshot` y `TestSession`.

**REQ-05:** Cada contenido debe tener un identificador estable independiente de
su texto traducido y de la posición que ocupe en una respuesta externa.

**REQ-06:** El modelo debe admitir como tipos de contenido `kana`, `kanji`,
`vocabulary`, `grammar` y `sentence`, aunque 0.2.0 solo ejecute vocabulario.

**REQ-07:** El modelo debe admitir ejercicios de lectura, significado y
escritura, aunque 0.2.0 solo conserve el ejercicio actual de romanji.

### US-03 — Mantener compatibilidad

Como usuario existente, quiero poder recuperar una sesión creada con 0.1.0.

**REQ-08:** Las sesiones `v1` existentes deben seguir cargándose sin perder
preguntas ni respuestas.

**REQ-09:** Un contenido externo con `meaning` único debe normalizarse como
significado inglés sin exigir que la API ya sea multilingüe.

**REQ-10:** Los errores de proveedor deben seguir siendo recuperables mediante
el flujo existente de retry/back.

### US-04 — Definir límites futuros

Como producto, quiero tener un punto de integración para demo, cuenta gratuita
y premium sin aplicar todavía autenticación ni cobros.

**REQ-11:** El dominio debe representar plan o entitlement sin confiar en un
estado premium enviado por el cliente.

**REQ-12:** La demo y los límites de uso deben poder configurarse fuera de la
lógica de validación del ejercicio.

## Fuera de alcance

- Supabase/Auth, CMS, Stripe y webhooks.
- Persistencia remota o sincronización entre dispositivos.
- Catálogo completo de kana, kanji o gramática.
- SRS, cola de repasos y analítica de usuario.
- IA, comunidad, móvil y modo offline.
- Cambios visuales importantes no necesarios para seleccionar idioma.

## Escenarios verificables

```gherkin
Scenario: idioma español persistente
  Given the application is using English
  When the user selects Spanish
  And reloads the page
  Then the interface is displayed in Spanish
  And the selected locale remains Spanish
```

```gherkin
Scenario: fallback de traducción
  Given a UI key has no Spanish translation
  When the locale is Spanish
  Then the English translation is displayed
  And the application does not render the key identifier
```

```gherkin
Scenario: idioma no altera una sesión
  Given an active vocabulary session
  When the user changes the locale
  Then the current content and expected answer remain unchanged
  And only displayable text changes
```

```gherkin
Scenario: sesión heredada
  Given a valid v1 session stored by version 0.1.0
  When the application starts version 0.2.0
  Then the session can be resumed
  And its questions and answers are preserved
```

```gherkin
Scenario: proveedor con significado inglés
  Given an external word with a single meaning string
  When the adapter normalizes it
  Then the word has a stable local content key
  And its meaning is available as English
  And no Spanish value is fabricated at runtime
```
