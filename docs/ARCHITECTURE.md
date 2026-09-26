# Arquitectura

```text
Fuentes científicas (independientes; no conectadas)
    → futuro normalizador/API
    → DataAdapter → validación Zod → TanStack Query
    → dominio React → visualización / tabla / detalle

Hoy: fixture sintética → MockDataAdapter → misma frontera
```

La unidad de carga actual es `Snapshot` schemaVersion=1. Es pequeña y apropiada para este prototipo. El contexto inyecta el adapter; su `id` estable particiona la caché. `AbortSignal` permite cancelación. Las pantallas no importan la fixture, acceden a filesystem ni interpretan contratos nativos. Los adapters deben normalizar y validar antes de devolver datos.

Los módulos tienen rutas propias y carga bajo demanda. React Query gestiona datos remotos; React local gestiona selección, filtros, comparación y opacidad. El parámetro `module` del registro de experimentos se conserva en la URL. El tema es una preferencia local. No existe almacenamiento de resultados ni sesiones de usuario.

Las tablas usan TanStack Table para ordenación, semántica HTML nativa y contenedores de scroll. ECharts usa renderer SVG y solo los módulos requeridos. La galería expone explícitamente que no hay imágenes conectadas; el overlay panóptico es un esquema de interfaz, no una segmentación calculada.

## Integración posterior

1. Acordar esquemas y permisos con cada dueño del pipeline, incluyendo estados de validación y granularidad de las métricas.
2. Implementar normalizadores fuera de los componentes; nunca convertir un path privado en una URL pública.
3. Extender el contrato de procedencia de v1 (mock-only) para recibos reportados/verificados y cambiar la etiqueta global en función de ese contrato.
4. Implementar `APIDataAdapter` con validación Zod, cancelación, errores y pruebas con datos sintéticos. Inyectarlo mediante `DataAdapterContext.Provider` y usar un `id` de caché distinto.
5. Para imágenes, añadir referencias autorizadas y estados de carga/error. Para volumen real, paginar galerías/tablas, seleccionar campos mínimos y acordar muestreo de visualización. No ejecutar reducción/clustering en cliente.

No hay deployment, backend, autenticación, uploads ni ciencia ejecutada en esta versión. El hosting futuro necesita SPA fallback. El lote compartido de ECharts sigue siendo relativamente grande (aproximadamente 579 kB minificado / 196 kB gzip) y Vite lo precarga por dependencias compartidas; permanece una oportunidad de optimización. Los módulos de dominio sí tienen imports dinámicos.
