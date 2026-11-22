# Demostración de tesis · 17 de noviembre de 2026

Duración: **3 minutos y 30 segundos**. Esta entrega integra
`feat/organization-evidence-v2-ui` en el frontend independiente. No incorpora
automáticamente los desarrollos posteriores del checkout científico ni los
experimentos B/OE4 de noviembre. El detector aquí es la publicación histórica
`detection-export-v1`: 48 corridas / 16 splits, no la matriz B de 75 modelos.

## Preparación en Windows PowerShell

Node.js **24 LTS**, npm **11**, Git y un navegador Chromium. Se conserva
`package-lock.json`. No se requiere GPU, Python, Hypatia o Internet durante la
demostración. La instalación inicial de paquetes sí requiere red o caché local.

Desde la raíz del **worktree de main preparado para la demostración**, sin
cambiar la rama del checkout que contiene trabajo sin confirmar:

```powershell
git status --short
node --version
npm --version
npm ci
$env:VITE_DATA_MODE = 'demo'
Remove-Item Env:VITE_LEAKAGE_SNAPSHOT_URL -ErrorAction SilentlyContinue
npm run dev -- --port 5187 --strictPort
```

Abrir **http://127.0.0.1:5187/organization**. Si 5187 está ocupado, comprobar
qué proceso lo utiliza; no cerrar terminales ajenas ni aceptar otro puerto sin
actualizar el guion. No iniciar `run_fixed_split.ps1`, jobs ni entrenamiento.

## Qué se está mostrando

| Evidencia                                                           | Estado y significado                                                                                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workspace DEMO, M01/M03                                             | Fixtures ilustrativas: 144 contenidos / 156 ocurrencias. No son FAC ni inferencias reales.                                                                 |
| Embeddings/similitud/reducción DEMO                                 | Validan navegación y visualización; sus valores no son resultados científicos.                                                                             |
| Clustering, secuencias, linkage y splits `organization-evidence-v2` | Provider independiente. Sin un bundle local compatible muestran UNAVAILABLE, incluso en DEMO. No hay sustitución por fixtures de CI.                       |
| Snapshot local validado                                             | REAL / MIXED para sus etapas disponibles; M01/M03 siguen en DEMO. Reportado/exportado no equivale a revalidado científicamente.                            |
| Detector                                                            | REAL / VERIFIED únicamente después de validar bytes, contrato y referencias del paquete público autorizado. Métricas ya publicadas; no se ejecuta el test. |

No presentar como integrados el split compartido Laura/Manuela de noviembre ni
una inferencia panóptica extremo a extremo. **`?view=oe5` no es una vista soportada**
en esta rama; no forma parte del guion. Una query desconocida abre el detector
predeterminado, no una etapa OE5.

## Recorrido y clics · 3:30

| Tiempo    | Ruta y acción                                                                                                                                                                                                                                                               | Explicación breve                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:35 | `/organization`. Desde Home: `Explore module` del módulo 02. Mostrar disponibilidad; abrir y cerrar `View technical details` con Enter/Escape.                                                                                                                              | Identidades de contenido y ocurrencia; ramas visual y temporal. Leer los indicadores DEMO/MIXED/UNAVAILABLE.                                                                                       |
| 0:35–1:35 | Pestaña `Visual exploration`: selector `View`, embeddings → similarity → reduction; cambiar DINOv2/CLIP. Si hay snapshot compatible, inspeccionar scatter y una fila. Seleccionar clustering, configuración y clúster; abrir una miniatura/metadatos y su siguiente página. | Coordenadas persistidas; clúster visual no es escena. Ruido −1 no es un grupo atómico conjunto. Si no hay artefactos, señalar el estado de ausencia y continuar.                                   |
| 1:35–2:25 | Pestaña `Sequences & linkage`: elegir `Timeline`, una zona candidata, `Technical details`; Escape. Cambiar a `Cross-dataset linkage`, seleccionar candidato y abrir sus evidencias.                                                                                         | Zona de incertidumbre ≠ corte exacto. Candidato ≠ correspondencia confirmada. Índice/tiempo de muestreo ≠ PTS/FPS nativo. Si no hay bundle compatible, explicar la frontera, sin improvisar datos. |
| 2:25–3:30 | `Evaluation` → `Grouping / split`; elegir partición y BEFORE/AFTER cuando existan membresías compatibles. Después `Detector evaluation`: comparación, variabilidad, clases/composición y limitaciones.                                                                      | Grupos íntegros no eliminan toda dependencia residual. Contrato histórico de 48 corridas; poblaciones distintas y comparación descriptiva, sin superioridad causal/estadística adjudicada.         |

En REAL/MIXED del **vídeo muestreado**, la vista de splits puede quedar
`pending`: no hay una partición compatible en ese snapshot. Para inspeccionar
por separado las 16 particiones históricas, cambiar explícitamente `Data mode`
a DEMO mientras se está en `?view=splits`; su provider independiente mostrará
el export histórico REAL / VERIFIED. No presentarlo como partición del muestreo.
El detector continúa usando su propio contrato en ambos modos.

Si no hay bundle local compatible, dedicar el minuto de estructuras temporales
a explicar sus estados UNAVAILABLE y la procedencia; no etiquetar ejemplos como
evidencia real ni alargar la búsqueda durante la sustentación. El detector público
permanece disponible aunque falle el snapshot del workspace.

## REAL / MIXED · preparación separada

Usar **solo** exports locales previamente validados de los contratos aprobados.
No apuntar a Parquet, pesos, imágenes, manifiestos nativos o carpetas de Hypatia.
No ejecutar el exporter durante la presentación. No copiar datos a `src/`.

```powershell
# Desde este worktree, después de instalar un snapshot saneado validado
# únicamente en el directorio ignorado public/runtime:
$env:VITE_DATA_MODE = 'real'
$env:VITE_LEAKAGE_SNAPSHOT_URL = '/runtime/leakage-snapshot.json'
npm run dev -- --port 5187 --strictPort
```

`Data mode` permite cambiar explícitamente a DEMO. El bundle
`/runtime/organization-evidence-v2/` tiene disponibilidad independiente y sus
recursos deben validar con los esquemas de esta rama. Las miniaturas ausentes
dicen `Preview unavailable`; no transferir medios para suplirlas. Anonimizar o
sanear un snapshot no autoriza su publicación.

`public/runtime/` sigue ignorado y `build.copyPublicDir: false` lo excluye del
bundle. El detector es la única excepción pública, con sus once archivos
allowlisted y checksums. Nunca montar datos privados en un hosting público.

## Contingencia sin Internet

Preparar el bundle **antes** de la sustentación:

```powershell
npm run build
npm run preview -- --port 5188 --strictPort
```

http://127.0.0.1:5188/organization sirve el bundle ya compilado y el detector
público sin red. Los snapshots privados de `public/runtime/` no forman parte de
este bundle; sus vistas deben indicar ausencia. No interpretar esta ausencia
como fallo de los experimentos científicos. Para fallos de snapshot en dev,
usar el retorno explícito a DEMO y abrir `?view=detector`.

Guardar fuera de Git una copia ZIP de `dist/` y su SHA-256. Si una edición rompe
la aplicación, extraerla en una **carpeta nueva** y servirla sin modificar código:

```powershell
# $bundleZIP debe ser la copia validada; cotejar antes su SHA-256.
Get-FileHash -Algorithm SHA256 -LiteralPath $bundleZIP
$demoRestore = Join-Path $env:TEMP ('flir-demo-' + [guid]::NewGuid().ToString('N'))
Expand-Archive -LiteralPath $bundleZIP -DestinationPath $demoRestore
npm run preview -- --outDir $demoRestore --port 5188 --strictPort
```

No sobrescribir trabajo local, usar reset/clean ni restaurar datasets.
La referencia local `backup/main-before-m02-20261116` conserva main anterior.
Una reversión pública requeriría commits inversos y nueva validación; nunca
`push --force`. Docker local es opcional: si el motor no está disponible,
utilizar npm. Véase [DOCKER.md](DOCKER.md) para health y montaje read-only.

## Rutas de control

Cuatro secciones: `/organization`, `/organization/explore`,
`/organization/sequences`, `/organization/evaluation`.
Evaluación: `?view=splits` y `?view=detector`.
Los ocho redirects conservados son `/dataset`, `/embeddings`, `/similarity`,
`/reduction`, `/clustering`, `/groups`, `/splits` y `/detector`, bajo el prefijo
`/organization`. Consultar [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md).

Las pruebas E2E ahora suministran fixtures **solo dentro del navegador de test**;
no instalan ejemplos en `public/runtime/` y no activan un fallback de investigación.
