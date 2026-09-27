# Arquitectura

```text
DEMO: fixture sintética → MockDataAdapter → SnapshotSchema
REAL: artifacts M02 → exportador read-only → LeakageSnapshotV1 → Zod
      → RealLeakageAdapter → CompositeDataAdapter (+ mock M01/M03)
      → SnapshotSchema → TanStack Query → rutas React existentes
```

Los componentes consumen `useSnapshot`; no abren Parquet, NPY, CSV ni rutas científicas. El exportador Python es una herramienta offline de transformación y validación, no un backend ni un ejecutor de ciencia. Separa los contratos upstream de la presentación. Los metadatos arbitrarios se descartan mediante listas permitidas antes de escribir el JSON.

`RuntimeDataProvider` usa `VITE_DATA_MODE=demo|real` y permite cambio explícito en la UI. Los IDs de los adapters particionan la caché de Query. REAL carga el snapshot local con `AbortSignal`, `cache: no-store` y errores seguros; no usa credenciales externas. Si falla, no entrega M02 mock. El composite elimina todos los registros mock de M02, conserva los otros módulos, incorpora el dominio `leakage` y normaliza el registro de experimentos. Las rutas y el shell son los mismos en ambos modos; `ArtifactStage` presenta evidencia real sin asumir IDs, colecciones o rangos de la demo. Los widgets de gráficos, selección, métricas y paneles se comparten.

`Snapshot` schemaVersion=1 sigue siendo el sobre de UI; su dominio real adicional usa el discriminador independiente `LeakageSnapshotV1`. El contrato real incluye ocurrencias completas, índices por feature space, coordenadas por run, referencias upstream y orígenes explícitos. No se unen datasets ni experimentos de M01/M03 con los de M02. El indicador global es MIXED y cada run conserva su origen.

Los módulos tienen imports dinámicos. React Query gestiona carga/caché; el estado local gestiona selección, filtros y BEFORE/AFTER. ECharts usa Canvas para las proyecciones de artifacts y SVG para gráficos pequeños/demo. Las coordenadas no se normalizan a rangos ficticios y no se submuestrean. Las tablas reales paginan filas; las galerías muestran seis identidades con thumbnails no disponibles, sin simular imágenes. Las ocurrencias se muestran como puntos discretos por fuente/índice de muestreo, no como intervalos de captura continuos.

Los assets de `public/runtime` solo se sirven localmente y se excluyen de `dist` mediante `copyPublicDir: false`. No hay despliegue, backend, autenticación, uploads, WebSockets ni control de jobs. El lote compartido de ECharts sigue generando una advertencia de tamaño de Vite; la validación de 9.000 puntos es sintética, no un benchmark general de rendimiento.

Detalles operativos, límites y garantías: [REAL_DATA_INTEGRATION](REAL_DATA_INTEGRATION.md). Contratos e invariantes: [DATA_CONTRACTS](DATA_CONTRACTS.md).
