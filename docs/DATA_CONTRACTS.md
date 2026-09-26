# Contratos y evidencia

Fuente ejecutable: `src/contracts/index.ts`. `SnapshotSchema.parse` se aplica dentro de `MockDataAdapter`; validación fallida produce un estado de error y opción de reintento. Tipos derivados de Zod evitan divergencia entre interfaz y runtime.

| Contrato                           | Responsabilidad                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| PipelineModule / PipelineStage     | Vocabulario, output, estado y evidencia del repositorio                           |
| DatasetSummary                     | Identidad, ocurrencias, contenidos, duplicados y procedencia                      |
| RunSummary                         | Módulo, etapa, dataset, método, seed, parámetros, lifecycle, verification, caveat |
| ArtifactReference                  | Referencia normalizada, formato, estado y descripción; no paths privados          |
| EmbeddingRun                       | Encoder, dimensiones, pooling, feature space, cobertura                           |
| SimilarityRun                      | Pares coseno y distribución; source-video relation y sample gap separados         |
| ReductionRun                       | Método t-SNE/PaCMAP, encoder, parámetros, métricas, candidato explícito           |
| ClusteringRun / ClusterSummary     | Contenidos únicos, coordenadas, clústeres, noise, medoid DEMO                     |
| SplitRun                           | Referencia al clustering, memberships de contenido y asignaciones por ocurrencia  |
| SegmentationRun / PredictionResult | Variante, predicciones, métricas por imagen/clase, caveats                        |

## Invariantes implementadas

- Números finitos; coseno en [-1,1]; métricas ausentes `null`, no cero.
- Un content_id por fila de clustering; frame_id conserva cada ocurrencia.
- Secuencia no verificada no puede presentarse como sequenceId válido.
- Tamaño y medoid consistentes con los miembros del clúster.
- Un grupo por clúster no negativo; noise con grupos singleton.
- Referencia de split válida, cobertura exacta de contenidos y ocurrencias.
- Conteos por split reconstruibles de sus ocurrencias y coherentes con memberships de contenido.
- Nuevas particiones asignan un contenido una vez. Historical admite múltiples memberships auditables.
- Cluster-aware no fragmenta grupos. Random/content no promete integridad del clúster.

## Procedencia y límites de v1

Las identidades usan prefijo `demo-`, nunca hashes reales. `origin: mock` es obligatorio para datasets/runs/predicciones de v1; `Metric.origin` admite además reported/unavailable para una evolución posterior. El aviso global permanece siempre DEMO. Ningún adaptador debe insertar evidencia real bajo esa etiqueta. Ampliar el contrato y el aviso es un cambio explícito previo a conectar datos reales.

El snapshot describe una única colección pequeña, completa y validada. No modela aún archivos grandes, paginación, múltiples datasets simultáneos ni autorizaciones. Arrays raw/L2 no se sirven a la UI; un adapter futuro expondría resúmenes de validación y coordenadas precomputadas. El schema no sustituye verificación científica de distancias, métricas o entrenamiento.

Los métodos alternativos y sus coordenadas en las fixtures solo prueban estados e interacción: no simulan fielmente el resultado de DBSCAN/OPTICS/HDBSCAN ni permiten comparar su calidad.
