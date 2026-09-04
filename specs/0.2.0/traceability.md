# Trazabilidad — 0.2.0

| Requisito | Implementación prevista | Verificación |
| --- | --- | --- |
| REQ-01 | Módulo de locale y diccionarios `en`/`es` | Render de claves principales en ambos idiomas |
| REQ-02 | Persistencia `ez-nihongo:locale:v1` | Recarga y lectura de locale |
| REQ-03 | Locale solo para presentación | Test de sesión antes/después del cambio |
| REQ-04 | Tipos de contenido, ejercicio, intento y progreso | Type-check y tests de construcción |
| REQ-05 | `contentId` estable del adaptador | Test con el mismo contenido en páginas distintas |
| REQ-06 | Uniones `ContentType` | Type-check y fixture de cada tipo |
| REQ-07 | Unión `ExerciseType` | Type-check y fixture de cada tipo |
| REQ-08 | Migración compatible de sesión v1 | Prueba de restauración de fixture 0.1.0 |
| REQ-09 | Normalización de `meaning` como `en` | Prueba del adaptador externo |
| REQ-10 | Reutilización de errores y retry | Pruebas existentes de API y HomeView |
| REQ-11 | Tipos `Plan`/`Capability` locales | Test de matriz de capacidades, sin autoridad de seguridad |
| REQ-12 | Configuración separada de capacidades | Test de configuración sin cambiar validadores |
| Compatibilidad | Vistas y store actuales | `npm run type-check`, `npm run test:unit -- --run`, `npm run build` |

## Criterio de cierre

0.2.0 se considera completa cuando todos los requisitos tienen una prueba o
verificación documentada, las sesiones 0.1.0 siguen siendo recuperables y no
se ha introducido ninguna dependencia obligatoria de backend, autenticación o
pagos.
