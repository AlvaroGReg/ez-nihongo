# Diseño técnico — 0.2.0

## Principios

- Mantener Vue 3, Vite, Vue Router y el flujo de sesión actual.
- No introducir un backend ni una dependencia de pago en esta versión.
- Mantener el adaptador de la API externa detrás de una interfaz de proveedor.
- Preferir contratos pequeños para que 0.3.0 pueda añadir catálogo local sin
  acoplar de nuevo todo el dominio.

## Contratos de dominio

```ts
type Locale = 'en' | 'es'
type ContentType = 'kana' | 'kanji' | 'vocabulary' | 'grammar' | 'sentence'
type ExerciseType = 'reading' | 'meaning' | 'writing'
type StudyMode = 'new' | 'review' | 'mistakes' | 'quick'

interface LocalizedText {
  en: string
  es?: string
}

interface ContentItem {
  id: string
  type: ContentType
  level?: number
  localized: Record<Locale, LocalizedText | undefined>
  relations?: string[]
}

interface ExerciseDefinition {
  id: string
  contentId: string
  type: ExerciseType
  prompt: string
  locale: Locale
  acceptedAnswers: string[]
  premium: boolean
}

interface AttemptEvent {
  eventId: string
  sessionId: string
  contentId: string
  exerciseId: string
  response: string
  correct: boolean
  createdAt: string
}

interface ProgressSnapshot {
  contentId: string
  attempts: number
  correctAnswers: number
  distinctSessions: number
  state: 'new' | 'learning' | 'learned' | 'due'
  learnedAt?: string
  nextReviewAt?: string
}
```

`VocabularyWord` debe recibir una clave estable derivada por el adaptador o
suministrada por el futuro catálogo, sin usar traducciones como identidad.

## Localización

- Crear un módulo local de traducciones con claves, no textos repartidos por
  las vistas.
- El locale por defecto es `en`.
- Persistir en `ez-nihongo:locale:v1`.
- Resolver `es` y después `en`; si faltan ambos, mostrar un mensaje interno de
  error controlado, nunca la clave técnica.
- Actualizar `document.documentElement.lang` al cambiar de locale.
- Mantener los textos del contenido separados de los textos de la interfaz.

## Sesión actual y limpieza local

- Usar `ez-nihongo:active-session:v2` y `ez-nihongo:history:v1`.
- El arranque elimina `ez-nihongo:active-session:v1` sin intentar migrarla.
- Las sesiones nuevas incluyen `sessionId`, `contentType`, `exerciseType` y
  `studyMode`.
- No guardar una traducción ya renderizada en la sesión; resolverla al mostrar
  según locale.

## Proveedor de contenido

Definir una interfaz equivalente a:

```ts
interface ContentProvider {
  loadQuestions(config: TestConfig): Promise<{
    questions: VocabularyWord[]
    levelsUsed: JlptLevel[]
  }>
}
```

El proveedor actual seguirá implementando esta interfaz. La futura fuente
estática/CMS podrá implementar el mismo puerto. 0.2.0 no copia la base externa
ni crea un catálogo completo.

## Planes y límites

Definir tipos de plan y una función de capacidad local, sin tratarla como
autorización de seguridad:

```ts
type Plan = 'demo' | 'free' | 'premium'
type Capability =
  | 'basic-exercises'
  | 'advanced-exercises'
  | 'unlimited-review'
  | 'offline'
```

La comprobación local solo sirve para UX en 0.2.0. Cuando exista plataforma,
el entitlement firmado o consultado al backend será la autoridad.

## Criterios técnicos de verificación

- `type-check`, pruebas unitarias y build deben seguir funcionando.
- Las nuevas abstracciones deben probarse sin red mediante proveedores mock.
- El almacenamiento debe probar JSON válido, corrupto, desconocido y el
  descarte de sesiones heredadas.
- No se ejecutan pruebas de Supabase, Stripe ni móvil en esta versión porque no
  forman parte del alcance.
