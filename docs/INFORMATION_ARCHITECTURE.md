# Arquitectura de información

La Home prioriza el flujo: FAC aerial videos → 01 Preprocessing → 02 Representation & organization → 03 Panoptic segmentation → Global evaluation. Los números indican orden conceptual; no representan una integración ejecutada.

Progressive disclosure: Pipeline → Module → Stage → Run/artifact/visualization. Sidebar estable con seis destinos; breadcrumbs de ubicación y pestañas por módulo. Experiments es transversal, con filtros de módulo/estado/búsqueda, ordenación y detalle de parámetros, dataset, métricas, artifacts y caveat.

## Estados

`verified`, `complete`, `running`, `experimental`, `pending`, `invalid`, `unavailable`, `mock`, `inconsistent` usan texto más símbolo. `status` es lifecycle; `verification` es estado de evidencia. La fixture puede tener lifecycle complete y verification mock sin implicar ejecución real. Los módulos reflejan incertidumbre del repositorio inspeccionado; los runs representan demostraciones, no esos resultados.

## Organización

- Dataset: ocurrencias frente a contenidos únicos, duplicados y cobertura de encoders.
- Embeddings: representación matemática y coordenadas DEMO; selección enlazada a contenido/galería.
- Similarity: distribución y pares con procedencia e índice de muestreo.
- Reduction: método, parámetros, seed, preservación, selección explícita de candidato DEMO.
- Clustering: un mismo run en BEFORE/AFTER; clúster y split no son intercambiables. Noise es explícito. Los runs sin split compatible no ofrecen AFTER.
- Groups: reutiliza el explorador para bloques por fuente. No crea secuencias.
- Splits: comparación de estrategias, conteos de ocurrencias, porcentajes y asignaciones. Histórica permite membership múltiple del contenido.
- Detector: consumidor downstream; paneles separados para piloto de infraestructura y experimento controlado.

Preprocessing ofrece controles de video, índice y método, slots de imagen original/HUD/cleaned y curvas de calidad. Segmentation separa supervisión, configuración, entrenamiento, predicciones y evaluación; opacidad y layout funcionan sobre un placeholder explícito. La evaluación global presenta límites de comparabilidad sin fabricar un KPI agregado.
