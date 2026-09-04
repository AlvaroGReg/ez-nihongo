# Diseño técnico — 0.3.0

## Principios y límites

- Mantener Vue 3, Vite, TypeScript, Vue Router y la localización de 0.2.0.
- El cliente web es responsable de navegación, accesibilidad, sesiones y
  agregados locales; nunca contiene fuentes maestras ni secretos.
- El repositorio futuro `ez-nihongo-content` publica un artefacto de catálogo.
  El cliente lo consume por manifiesto y datos versionados, sin imports
  relativos entre checkouts.
- No se introduce `ez-nihongo-platform` en esta versión. La autoridad futura
  sobre cuenta, progreso y entitlements será la plataforma, no este estado
  local.

## Flujo propuesto

```text
Public start
  -> Quick test setup (niveles JLPT, 10–100 preguntas)
  -> Test de vocabulario 0.1 compatible
  -> Resultados
  -> Onboarding local opcional (objetivo, nivel, tiempo)
  -> Dashboard / ruta N5
  -> ruta N5 fija / modo de estudio
  -> CatalogContentProvider
  -> StudySession v3
  -> AttemptEvent local
  -> ProgressReducer + annotations
  -> dashboard, siguiente recomendación y result
```

La carga del catálogo se valida completa para la unidad solicitada antes de
crear una sesión. La sesión guarda referencias estables y una instantánea
mínima suficiente para reanudar; no guarda textos de interfaz localizados.

## Contratos de dominio

Los tipos actuales de `src/types/domain.ts` se amplían sin romper los
identificadores de 0.2. Los nombres siguientes son el contrato propuesto; los
detalles de presentación no forman parte del contrato compartido.

```ts
type LearningGoal = 'general' | 'travel' | 'jlpt-n5'
type InitialLevel = 'zero' | 'kana' | 'n5'
type DailyMinutes = 5 | 10 | 15 | 20
type KanaScript = 'hiragana' | 'katakana'
type ExerciseType = 'recognition' | 'reading' | 'meaning' | 'writing'
type ProgressState = 'new' | 'learning' | 'learned'

interface OnboardingProfile {
  version: 1
  goal: LearningGoal
  initialLevel: InitialLevel
  dailyMinutes: DailyMinutes
  placement?: PlacementResult
  completedAt: string
}

interface PlacementResult {
  version: 1
  answered: number
  correct: number
  recommendedEntry: 'kana' | 'vocabulary' | 'kanji'
  completedAt: string
}

interface ContentRelation {
  type: 'reading' | 'vocabulary' | 'kanji'
  contentId: string
}

interface ContentItem {
  id: string
  type: 'kana' | 'kanji' | 'vocabulary' | 'grammar' | 'sentence'
  level?: 1 | 2 | 3 | 4 | 5
  localized: Record<'en' | 'es', { en: string; es?: string } | undefined>
  reading?: string
  script?: KanaScript
  relations?: ContentRelation[]
}

interface CatalogManifest {
  schemaVersion: 1
  catalogVersion: string
  minClientVersion: string
  locales: Array<'en' | 'es'>
  routes: Array<{ id: 'n5'; unitIds: string[] }>
  contentFiles: string[]
  sources: Array<{ id: string; name: string; license: string; url?: string }>
}

interface ExerciseDefinition {
  id: string
  contentId: string
  type: ExerciseType
  locale: 'en' | 'es'
  prompt: string
  acceptedAnswers?: string[]
  options?: Array<{ id: string; label: string; correct: boolean }>
  showFurigana: boolean
  premium: false
}

interface StudySession {
  version: 3
  sessionId: string
  routeId: 'n5'
  unitId: string
  studyMode: 'new' | 'review' | 'mistakes' | 'quick'
  exerciseIds: string[]
  showFurigana: boolean
  currentIndex: number
  answers: TestAnswer[]
  pendingFeedback: TestAnswer | null
  createdAt: string
}

interface AttemptEvent {
  eventId: string
  sessionId: string
  contentId: string
  exerciseId: string
  response: string
  correct: boolean
  createdAt: string
  studyMode: 'new' | 'review' | 'mistakes' | 'quick'
  occurredOnLocalDate: string
}

interface ProgressRecord {
  contentId: string
  attempts: number
  correctAnswers: number
  distinctSessions: number
  correctSessionIds: string[]
  lastAttemptAt?: string
  lastMistakeAt?: string
  state: ProgressState
}

interface Annotation {
  contentId: string
  favorite: boolean
  note: string
  updatedAt: string
}
```

El contrato de `AttemptEvent` conserva los campos de 0.2 (`eventId`,
`sessionId`, `contentId`, `exerciseId`, `response`, `correct`, `createdAt`) y
añade el modo y la fecha local calculada al registrar el evento. El cliente
debe conservar la respuesta original para poder auditar la corrección local.

Los IDs de kana, kanji y vocabulario los proporciona el catálogo. No se
derivan de traducciones ni de la posición en un fichero. Las relaciones son
referencias, no copias anidadas del contenido.

## Catálogo y proveedor

Se crea un `CatalogContentProvider` detrás de `ContentProvider` o de una
interfaz equivalente. Su responsabilidad es:

1. cargar el manifiesto desde el artefacto estático de 0.3;
2. comprobar `schemaVersion`, `minClientVersion`, locales, rutas y referencias;
3. cargar solo los ficheros declarados para la ruta/unidad;
4. devolver contenido y ejercicios ya validados;
5. devolver errores tipados para red/asset, esquema, licencia o contenido
   insuficiente.

La forma concreta del artefacto puede ser `public/content/manifest.json` más
ficheros JSON declarados por el manifiesto, o un paquete generado equivalente.
La decisión no debe cambiar el contrato ni crear una dependencia de código con
el repositorio de contenido. El proveedor de la API externa queda disponible
para compatibilidad de 0.2, pero no participa en la ruta N5 de 0.3.

El repositorio de contenido debe entregar como dependencia de release:

- un manifiesto compatible con este contrato;
- unidades N5 con kana básico, vocabulario inicial y kanji relacionados;
- validación de IDs, relaciones, respuestas, idiomas y licencias;
- una versión de artefacto que el cliente pueda fijar y probar.

Como ese repositorio todavía es futuro, esta especificación del cliente no
autoriza crear sus fuentes dentro de `ez-nihongo`.

## Onboarding y rutas

`HomeView` es la puerta pública principal y conserva la configuración del test
de vocabulario de 0.1.0: niveles N5–N1 seleccionables y cantidades de 10 a 100
en incrementos de 10. No exige perfil ni autenticación. Desde esa pantalla se
ofrece una tarjeta destacada para crear el plan, pero la prueba rápida sigue
siendo la acción inicial.

`OnboardingView` guarda un `OnboardingProfile` en
`ez-nihongo:onboarding:v1`. El formulario puede editarse posteriormente sin
alterar los agregados de progreso. La prueba de nivel usa un conjunto pequeño
de ejercicios deterministas del catálogo; su resultado solo selecciona una
recomendación.

`DashboardView` consume el perfil, la ruta N5, los agregados y las
anotaciones. Mantiene un enlace visible a la prueba rápida para que el test no
quede oculto tras la planificación. El orden de recomendación es:

1. unidad nueva compatible con el nivel inicial;
2. errores pendientes;
3. contenido en aprendizaje;
4. contenido aprendido para práctica;
5. si no queda contenido, repetir la ruta con modo rápido.

Las etiquetas de la recomendación se localizan, pero sus IDs son estables.

## Selección de ejercicios y furigana

El selector recibe `studyMode`, `routeId`, `unitId` y una instantánea de
progreso. Filtra primero por elegibilidad y después limita `quick` a una
cantidad pequeña configurable. No modifica progreso durante la selección.

- `recognition`: elegir la lectura o símbolo correcto entre opciones.
- `reading`: producir o seleccionar la lectura de kana, kanji o vocabulario.
- `meaning`: elegir el significado en el locale activo.
- `writing` permanece en el tipo de dominio de 0.2 para compatibilidad, pero
  no es obligatorio publicar ejercicios de escritura en 0.3.

La presentación de furigana se resuelve al renderizar a partir de la preferencia
de sesión. Los ejercicios no deben reconstruir IDs cuando cambia el locale o
la visibilidad del furigana.

## Sesión y eventos

Se usa `ez-nihongo:active-session:v3`. En el arranque se eliminan las claves
activas v1 y v2; no se migran porque sus invariantes solo describen el test de
vocabulario de 0.1/0.2. El historial v1 se conserva intacto.

Cada respuesta confirmada genera exactamente un `AttemptEvent` con `eventId`
único. El store mantiene un conjunto de IDs ya aplicados al cargar una sesión;
si un evento se reintenta al persistir, se ignora el duplicado. Primero se
persiste el evento y después se recalcula la vista de progreso para que una
recarga no pierda una respuesta confirmada.

El foco se mueve al campo de respuesta al cambiar de pregunta y al panel de
feedback después de corregir. La sesión no se completa hasta confirmar el
feedback de la última pregunta.

## Progreso, racha y recomendación

`progress.ts` implementa un reducer puro:

```text
events + previous ProgressRecord
  -> deduplicate by eventId
  -> increment attempts
  -> increment correctAnswers when correct
  -> add sessionId to correctSessionIds when correct
  -> state = new | learning | learned
```

`learned` se alcanza cuando `correctSessionIds` contiene tres sesiones
distintas. Un mismo `sessionId` solo cuenta una vez aunque tenga varios
aciertos. No se calcula `nextReviewAt` ni se crea `due`.

La actividad diaria se deriva de `occurredOnLocalDate`. La racha usa la zona
horaria del navegador y las fechas de actividad únicas; una actividad hoy vale
1, una actividad ayer mantiene la racha existente y un salto de dos o más días
la reinicia. El dashboard nunca interpreta un cambio de reloj como actividad
real adicional.

Persistencia propuesta:

- `ez-nihongo:onboarding:v1` — perfil y placement;
- `ez-nihongo:active-session:v3` — sesión reanudable;
- `ez-nihongo:progress:v1` — eventos/agregados locales;
- `ez-nihongo:annotations:v1` — favoritos y notas;
- `ez-nihongo:locale:v1` y `ez-nihongo:history:v1` — contratos existentes.

Cada parser valida su propio formato y elimina solo el valor corrupto o
desconocido. No se almacenan secretos ni datos de autenticación.

## Accesibilidad e IME

- usar `button`, `fieldset`, `legend`, `label`, `output`, listas y headings
  coherentes;
- mantener un único foco lógico por pantalla y foco visible;
- usar regiones `aria-live`/`role="status"` para cambio de ejercicio,
  resultado y errores;
- proporcionar estado textual además de color o iconografía;
- no disparar submit desde Enter mientras un input esté en composición IME;
- probar teclado, lector de pantalla y entrada japonesa en los ejercicios que
  admitan texto.

## Organización prevista del cliente

```text
src/
  views/OnboardingView.vue
  views/DashboardView.vue
  views/StudyView.vue
  services/catalog.ts
  services/onboarding.ts
  services/progress.ts
  services/annotations.ts
  stores/learning.ts
  types/domain.ts
  i18n/index.ts
  __tests__/
```

Se reutilizan `content.ts`, `storage.ts`, `entitlements.ts` y los componentes
de resultado donde sea compatible. La sustitución de `HomeView`/`TestView` se
hace solo cuando el nuevo flujo mantenga la compatibilidad de 0.2 requerida
por sus pruebas o cuando esas pruebas se actualicen a los requisitos de 0.3.

## Verificación

- pruebas unitarias de parsers, selector de modos, reducer, migraciones,
  racha, favoritos/notas y composición IME;
- pruebas de componentes para onboarding, dashboard, ruta, feedback y estados
  vacíos/error;
- fixture de catálogo válido, incompleto, incompatible y con relación rota;
- `npm run type-check`, `npm run test:unit -- --run` y `npm run build`;
- revisión manual de teclado, lector de pantalla, locale en/es y recarga;
- no se exige login, backend, Stripe ni pruebas móviles.
