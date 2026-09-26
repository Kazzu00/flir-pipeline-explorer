# Validación local · 2026-09-26

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
