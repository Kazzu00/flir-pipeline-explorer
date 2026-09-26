# FLIR Pipeline Explorer

Interfaz de investigación para explorar tres pipelines independientes de visión por computador sobre video aéreo de la Amazonía colombiana. **Prototipo frontend funcional con datos DEMO; no ejecuta procesamiento científico.**

## Estado

- Implementado: Home con el pipeline completo; navegación por módulos y etapas; explorador de clustering con scatter, selección, detalles, timeline por grilla y galería; BEFORE / AFTER SPLIT; comparación de particiones; registro de experimentos; temas claro/oscuro.
- Implementado: contratos Zod, adaptador mock, estados de carga/error/vacío, tests unitarios y pruebas Chromium/axe.
- No conectado: APIs científicas, imágenes, máscaras reales, embeddings, trabajos de entrenamiento y resultados controlados. Los espacios visuales de imágenes son placeholders explícitos; las galerías permiten seleccionar identidades DEMO.
- No ejecutado: experimentos científicos ni validación independiente de resultados upstream. La UI no certifica que un split elimine toda dependencia.
- No desplegado: se entrega código en GitHub y ejecución local, sin servicio de hosting ni backend.

## Relación con los repositorios científicos

| Módulo                           | Repositorio independiente                                                                           | Responsabilidad                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 01 Preprocessing                 | [proyecto-FAC](https://github.com/Laura-Martinez-Galindo/proyecto-FAC)                              | Extracción, HUD, inpainting, denoising, calidad                   |
| 02 Representation & organization | [flir-leakage-pipeline](https://github.com/Kazzu00/flir-leakage-pipeline)                           | Identidades, embeddings, similitud, reducción, clustering, splits |
| 03 Panoptic segmentation         | [proyecto-segementacion-panoptica](https://github.com/manugalarza/proyecto-segementacion-panoptica) | Pseudo-anotaciones, modelos, predicciones y evaluación            |

Se inspeccionaron clones `--depth 1` en `.references/`, ignorados por Git y tratados como read-only. No son necesarios para ejecutar la aplicación. Los commits revisados, contratos nativos y contradicciones están documentados en [RESEARCH](docs/RESEARCH.md). En particular, el README de segmentación está desalineado con código/reportes y con el estado actual de organización. La interfaz mantiene la advertencia `inconsistent`.

## Instalación y ejecución

Usar Node.js 24 LTS y npm 11 (versiones exactas de dependencias en `package-lock.json`). No requiere `.env`, GPU, Python ni datos.

```sh
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. Para probar el bundle:

```sh
npm run build
npm run preview
```

`BrowserRouter` requiere fallback a `index.html` en un futuro servidor estático. No se ha configurado un despliegue público.

## Stack y arquitectura

React 19, TypeScript 6 strict, Vite 8, React Router 7, TanStack Query 5, TanStack Table 8, Zod 4, Apache ECharts 6 con echarts-for-react, Tailwind 4, primitivas shadcn/ui y Lucide. ESLint, Prettier, Vitest, Testing Library, Playwright y axe.

Se eligió Table 8.21.3 por compatibilidad con la API estable utilizada; no se mezcla su API con Table 9. No se añadió Zustand: el estado compartido de datos vive en Query y la selección es local al explorador. ECharts carga módulos de scatter/line/bar por su entrada ESM, y los módulos de la aplicación se cargan bajo demanda. React Compiler no está habilitado; su regla específica de incompatibilidad con Table se desactiva, manteniendo las reglas de hooks.

```text
src/app/                       rutas y arranque
src/components/                layout, UI, feedback, visualizaciones
src/features/                  overview, preprocessing, organization,
                               segmentation, experiments
src/contracts/                 esquemas Zod e invariantes
src/data/adapters/             DataAdapter y MockDataAdapter
src/data/mock/                 fixture determinista
src/data/provider.tsx          frontera React Query / adapter
src/styles/                   tokens, temas y responsive
src/test/                     tests unitarios e integración React
e2e/                          navegador y axe
```

## Rutas

| Ruta                                                           | Vista                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| `/`                                                            | Pipeline completo y evaluación global                     |
| `/preprocessing`                                               | Overview del módulo                                       |
| `/preprocessing/{frames,hud,inpainting,denoising,quality}`     | Fuentes, comparación visual, métricas                     |
| `/organization`                                                | Overview de organización                                  |
| `/organization/dataset`                                        | Manifest, identidades, cobertura                          |
| `/organization/embeddings`                                     | DINOv2 / CLIP, scatter y contenido                        |
| `/organization/similarity`                                     | Distribución, vecinos y pares                             |
| `/organization/reduction`                                      | Comparación t-SNE / PaCMAP                                |
| `/organization/clustering`                                     | Scatter + detalles + timeline + galería                   |
| `/organization/groups`                                         | Mismo explorador, énfasis en procedencia/grupos           |
| `/organization/splits`                                         | Historical, Random/content, Cluster-aware                 |
| `/organization/detector`                                       | Piloto vs protocolo controlado downstream                 |
| `/segmentation`                                                | Overview del módulo                                       |
| `/segmentation/{points,model,training,predictions,evaluation}` | Supervisión, configuración, estados, overlay y evaluación |
| `/experiments`                                                 | Tabla ordenable, filtros y detalle de run                 |
| `/evaluation`                                                  | Familias de métricas y límites de comparación             |

En clustering, elegir un run y un clúster mediante scatter, botones o timeline. AFTER SPLIT agrega símbolos para train/validation/test sin cambiar el clúster. Solo DBSCAN tiene un split compatible en la fixture; en los otros runs el botón se deshabilita. No se inventan secuencias: la timeline usa índices de muestreo por video fuente.

## Datos DEMO y futura integración

La fixture contiene **144 contenidos sintéticos, 156 ocurrencias, 12 grupos de copias, 6 clústeres y 12 contenidos noise**. No coincide deliberadamente con los conteos del dataset real. Los tres algoritmos muestran fixtures ilustrativas, no resultados comparativos de algoritmos. Las curvas NIQE son sintéticas y no se reconstruyen de resúmenes XLSX. Las métricas no disponibles de evaluación científica son `null`.

`DataAdapter.getSnapshot(signal)` devuelve un snapshot validado. `DataAdapterContext` permite sustituir el adaptador sin reescribir visualizaciones. La versión 1 es deliberadamente de demostración: aceptar evidencia real requiere ampliar la procedencia tipada, actualizar la política de etiquetas y aportar tests de normalización. No existe todavía `APIDataAdapter`; no hay un endpoint oculto ni acceso directo a archivos upstream.

Consultar [DATA_CONTRACTS](docs/DATA_CONTRACTS.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [INFORMATION_ARCHITECTURE](docs/INFORMATION_ARCHITECTURE.md) y [UX_STANDARDS](docs/UX_STANDARDS.md).

## Validación

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
npm run format:check
```

Tests sintéticos, sin FLIR, modelos, GPU o red en la ejecución de tests. La instalación inicial de npm/Chromium requiere descargar dependencias públicas. Las capturas y reportes quedan ignorados en `test-results/` y `playwright-report/`. CI ejecuta las mismas comprobaciones. Axe es un smoke automatizado, no una certificación de WCAG/ISO ni una auditoría exhaustiva con tecnologías de asistencia.

## Seguridad y alcance

No se versionan `.references`, `.env*`, datasets, archivos FLIR, pesos, cachés, reportes ejecutados ni artifacts científicos. Los repositorios científicos permanecen independientes. No se implementan algoritmos de ciencia de datos en este frontend; transformar fixtures para la visualización no equivale a ejecutar experimentos.
