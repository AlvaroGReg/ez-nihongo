# Instrucciones locales de ez-nihongo

Estas reglas complementan el contexto común de `../AGENTS.md`.

## Proyecto

- Es una aplicación Vue 3 con Vite, TypeScript y Vue Router.
- Las especificaciones propias de este repositorio viven en `specs/<version>/`.
- Mantén los cambios pequeños y respeta la estructura existente.

## Flujo de trabajo

- Instala dependencias con `npm install` si faltan.
- Usa `npm run dev` para desarrollo.
- Antes de entregar, ejecuta según corresponda:
  - `npm run type-check`
  - `npm run test:unit`
  - `npm run build`
  - `npm run lint` y `npm run format` solo si la tarea lo requiere; ambos
    pueden modificar archivos.
- Revisa siempre `git diff` y `git status` después de editar.
