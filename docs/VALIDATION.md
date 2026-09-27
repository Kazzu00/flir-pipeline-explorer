# Validación local

## Fase 2 · 2026-09-27

Infraestructura de lectura de artifacts probada exclusivamente con datos sintéticos. No se accedió a artifacts privados ni se ejecutaron experimentos científicos.

| Comprobación                  | Resultado observado                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ESLint / TypeScript           | PASS                                                                                                                |
| Vitest                        | PASS, 29 tests en 3 archivos                                                                                        |
| Exportador / pytest           | PASS, 13 tests; fixtures temporales NumPy/Parquet; salida compartida con el contrato Zod                            |
| Ruff check / format           | PASS                                                                                                                |
| Build                         | PASS; ECharts ~592 kB minificado / 201 kB gzip, advertencia de tamaño                                               |
| Prettier                      | PASS                                                                                                                |
| Chromium                      | PASS, 10 pruebas, incluidas las seis de DEMO                                                                        |
| Flujo artifact                | Modo MIXED, ambos encoders, coordenadas persistidas, clustering/splits pendientes, errores seguros y retorno a DEMO |
| Volumen sintético             | 9.000 coordenadas persistidas en Canvas; búsqueda de la última identidad y tabla paginada                           |
| Clustering artifact sintético | Ruido explícito, BEFORE/AFTER y AFTER deshabilitado cuando falta split compatible                                   |
| Accesibilidad / responsive    | Axe en vistas demo y reducción artifact; navegación móvil a 390 px; controles etiquetados                           |
| CLI                           | `uv run tools/export_leakage_snapshot.py --help` correcto                                                           |
| Privacidad                    | Runtime y clones ignorados; sin datos reales en fixtures; `dist` contiene solo `index.html` y assets de aplicación  |

El exportador prueba integridad raw/L2, identidades incompatibles, recibos de procedencia temporal, row mapping, preservación multivideo, checksums, benchmark con candidatos declarados, atomicidad de grupos, rechazo de pilotos, solo lectura y no sobrescritura. Los tests de Zod rechazan metadata privada y relaciones incoherentes antes de mostrar datos. La validación de transporte no certifica la calidad científica de métricas upstream.

Se corrigieron durante la validación una etiqueta DEMO residual, clasificación de errores, nombres accesibles de selectores, un desbordamiento móvil y un tipo de fixture JSON. La captura revisada de reducción real usa únicamente tres contenidos sintéticos; el test de volumen usa 9.000. Capturas y traces quedan ignorados. Falta una exportación y revisión con artifacts privados explícitos del usuario.

CI incluye un job de exportador con Python 3.11 y dependencias CPU, además del job frontend. Las instalaciones descargan dependencias públicas; los tests no requieren red, modelos, datasets, GPU ni secretos.

## Fase 1 · 2026-09-26

Entorno: Windows, Node.js 24.11.1, npm 11.6.3. Solo frontend y fixtures sintéticas. No se ejecutaron pipelines científicos ni se importaron datos FLIR.

| Comprobación               | Resultado observado                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run lint`             | PASS, sin errores                                                                           |
| `npm run typecheck`        | PASS, TypeScript strict                                                                     |
| `npm run test`             | PASS, 11 tests en 2 archivos                                                                |
| `npm run build`            | PASS; aviso no bloqueante del chunk ECharts (~579 kB)                                       |
| `npm run test:e2e`         | PASS, 6 pruebas Chromium                                                                    |
| Navegación de rutas        | 24 rutas principales/de etapa cargan sin errores JS                                         |
| Axe                        | Cero violaciones detectadas en cinco vistas y ambos temas, tags WCAG 2 A/AA, 2.1 AA, 2.2 AA |
| Responsive                 | Contención a 1024, 1440 y 1920 px; navegación móvil a 390 px                                |
| Repositorios de referencia | `git status --short` vacío en los tres clones                                               |

Los tests cubren integridad de contenido, grupos indivisibles, singleton noise, asignaciones por ocurrencia, coherencia de conteos, rechazo de secuencias no verificadas, navegación, selección de clúster, BEFORE/AFTER, comparación de splits, filtros de experimentos, overlay y accesibilidad básica. La inspección visual local incluyó Home, clustering y móvil. Screenshots y traces son generados e ignorados por Git.

Los primeros intentos detectaron problemas de semántica de listas de definición, contraste de números y texto del overlay, además de importación CJS/ESM y sincronización de una prueba con rutas lazy; fueron corregidos antes del pase final. No se afirma que la aplicación esté certificada, ni que exista una auditoría exhaustiva con lector de pantalla.

Ruff/pytest no aplican a este repositorio TypeScript. Tampoco se ejecutaron experimentos, extracción de features, entrenamiento, medición de leakage real, integración API ni despliegue web. Las métricas científicas no conectadas permanecen unavailable. GitHub Actions queda configurado; el resultado remoto se verifica por separado del pase local.
