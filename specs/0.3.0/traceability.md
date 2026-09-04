# Trazabilidad — 0.3.0

Estado: borrador de planificación. Las rutas indicadas son objetivos de
implementación; deben confirmarse si la estructura cambia durante el diseño.

| Requisito | Implementación prevista | Verificación |
| --- | --- | --- |
| REQ-01 | `router/index.ts`, shell público y `CatalogContentProvider` | prueba de arranque sin credenciales y fixture sin llamadas de progreso remoto |
| REQ-02 | `OnboardingView.vue`, `services/onboarding.ts`, `onboarding:v1` | prueba de persistencia, edición sin pérdida y recarga |
| REQ-03 | `PlacementView.vue`, selector de placement y `PlacementResult` | pruebas de omisión, resultado y recomendación no bloqueante |
| REQ-04 | `DashboardView.vue`, definición de ruta N5 y navegación por unidades | prueba de orden, siguiente actividad, repetición y abandono |
| REQ-05 | artefacto de `ez-nihongo-content`, `services/catalog.ts`, `types/domain.ts` | fixture de kana/vocabulario/kanji, IDs estables y relaciones resolubles |
| REQ-06 | `CatalogManifest`, parser/validador de catálogo y error localizado | fixtures compatible, incompatible, ausente y relación inválida |
| REQ-07 | definiciones de ejercicio, `StudyView.vue`, selector y corrector | pruebas de recognition/reading/meaning, opciones y respuestas deterministas |
| REQ-08 | preferencia `showFurigana`, `StudyView.vue`, almacenamiento local | pruebas de render visible/oculto con identidad y corrección invariantes |
| REQ-09 | `services/studySelector.ts`, `stores/learning.ts` | pruebas de los cuatro modos y estado sin contenido |
| REQ-10 | `StudyView.vue`, `stores/learning.ts`, `active-session:v3` | flujo de feedback, recarga, reanudación y abandono |
| REQ-11 | `AttemptEvent`, `services/progress.ts`, deduplicación por `eventId` | reducer idempotente y contadores tras reanudación |
| REQ-12 | `storage.ts`, `progress:v1`, `annotations:v1`, entitlements gratuitos | pruebas de aislamiento local, JSON corrupto y ausencia de autoridad premium |
| REQ-13 | `ProgressRecord` y `progress.ts` | tabla de estados, tres sesiones distintas, no `due`/`nextReviewAt` |
| REQ-14 | `DashboardView.vue`, cálculo de actividad y recomendación | pruebas de hoy, ayer, hueco de días, contenido pendiente y recomendación |
| REQ-15 | `services/annotations.ts`, control de favorito y editor de nota | pruebas de crear/editar/vaciar, recarga y separación del catálogo |
| REQ-16 | componentes de estudio, focus management y atributos ARIA | pruebas de nombres/roles y revisión manual con teclado/lector de pantalla |
| REQ-17 | handlers `compositionstart`/`compositionend` del campo de respuesta | prueba de Enter durante composición y valor japonés conservado |
| REQ-18 | `i18n/index.ts`, diccionarios en/es y textos de nuevas vistas | pruebas de traducción/fallback, `document.lang` e invariancia del progreso |
| Migración 0.2 | `storage.ts`, claves activas v1/v2 y parser de historial | prueba de descarte aislado de sesión antigua y conservación de history |
| Integración contenido | release de `ez-nihongo-content` y fixture fijado por versión | validación del artefacto, licencias y compatibilidad mínima |

## Matriz de entregables por repositorio

| Repositorio | Entrega 0.3.0 | Bloqueo actual |
| --- | --- | --- |
| `ez-nihongo` | onboarding, ruta, ejercicios, progreso anónimo, dashboard, anotaciones y accesibilidad | disponible en este workspace |
| `ez-nihongo-content` | manifiesto y catálogo inicial versionado con fuentes/licencias | repositorio todavía futuro; debe crearse su propia especificación 0.3.0 |
| `ez-nihongo-platform` | ninguna implementación | explícitamente fuera de alcance |
| `ez-nihongo-contracts` | ninguna implementación obligatoria | el contrato vive provisionalmente en web y catálogo |

## Criterio de trazabilidad

No se considera listo para implementación mientras REQ-05, REQ-06 y la
integración del artefacto de contenido no tengan un propietario confirmado.
Durante la implementación, cada fila debe enlazar a una prueba concreta o a
una verificación manual reproducible; los checks globales son:

```text
npm run type-check
npm run test:unit -- --run
npm run build
```

La cobertura de backend, móvil, pagos y sincronización no se añade a esta
matriz porque pertenece a versiones posteriores.
