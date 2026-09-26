# Repository inspection · 2026-09-26

Read-only shallow clones under `.references/`; no scientific code executed, no source images or artifacts imported. These snapshots are evidence for interface vocabulary, not independent validation of scientific results.

| Repository | Inspected commit | Evidence |
|---|---|---|
| [proyecto-FAC](https://github.com/Laura-Martinez-Galindo/proyecto-FAC) | `0eafdb3bcda4a9b1701daca8e41921e77332dccd` | README, scripts, `config/videos.json`, `scripts/calcular_metricas.py` |
| [flir-leakage-pipeline](https://github.com/Kazzu00/flir-leakage-pipeline) | `9dd3d9e02c30d5006e49fb4d5c3d648dd481ee77` | README, `docs/status.md`, `docs/data_model.md`, `src/flir_pipeline/explorer/models.py`, CLI and module tree |
| [proyecto-segementacion-panoptica](https://github.com/manugalarza/proyecto-segementacion-panoptica) | `6810704ebfe7f1f1c0336ceb5f0758d25eac3b0c` | README, README_SEMANA8, docs/training, example config, training/train.py, evaluation script and JSON caveat |

## 01 · Preprocessing

Extraction → morphological/chromatic HUD segmentation → ProPainter inpainting → denoising → quality evaluation. N2N, N2V variants, Neighbor2Neighbor and Blind2Unblind are documented; the code tree additionally includes FastDVDnet, UDVD, RVidNet, temporal bilateral and motion-adaptive fusion experiments. Existence of a script is not a completed run. `config/videos.json` contains per-video stage states and parameters. Metrics include NIQE, BRISQUE, optional PIQE, noise sigma, Laplacian variance and sharpness retention. `calcular_metricas.py` writes summary statistics to XLSX. The frontend's per-sample metric curves are explicitly synthetic: a future adapter needs actual per-frame observations, which cannot be reconstructed from aggregated XLSX statistics. Downstream YOLO ablation scripts exist separately.

## 02 · Representation and organization

Current status is `docs/status.md`, not the older `docs/current_status.md` named in permanent context. Canonical identities, DINOv2 CLS (384), CLIP projected image (512), raw/L2 stores, cosine, t-SNE/PaCMAP, density clustering, splitting, Streamlit and VIKUS are implemented. Historical results and sampled-video results have different evidence boundaries. Full sampled-video downstream execution is pending; detector pilots do not replace the controlled comparison. Native artifacts include metadata JSON and Parquet content/record/cluster/group tables, separate embedding arrays and split assignments. CLI namespaces: data, features, similarity, reduction, clustering, splitting, detection, explorer. The UI never reads these paths directly.

Content IDs are exact-byte identities; occurrences survive deduplication. Cluster IDs are run-scoped. Noise -1 is not one atomic allocation group: noise contents require separate singleton groups. Historical splits can overlap for the same content. Sampling-grid time is not capture time; source videos are not sequences. No confirmed sequence is available in our synthetic fixture.

## 03 · Segmentation: inconsistent / experimental

README says training is planned, while runnable training code, newer training documentation and prediction/evaluation artifacts exist. The README's description of organization as planned conflicts with that repository's current status. The example config declares ResNet50/six thing classes while README describes a small placeholder backbone/three thing classes; it explicitly says the config is not consumed. Training's docstring says mask heads are unsupervised, but the implementation includes optional mask-loss code. These facts do not establish correct full mask supervision. We do not resolve these contradictions by choosing a winner.

Box → points → pseudo-mask, base Panoptic FCN, context fusion, training and predictions are supported concepts. Metric implementations include PQ/SQ/RQ, IoU/F1, precision/recall/mask AP. `panoptic_eval_fixed.json` explicitly warns of train/test overlap and uses thing instances versus SDZI boxes. That output is not dense-ground-truth PQ and cannot support a final scientific comparison. We import no numeric scientific results; demo prediction masks are illustrative placeholders, not inferred outputs.

## Integration decision

Use a versioned Zod-validated frontend snapshot with explicit provenance, lifecycle, verification and nullable unavailable metrics. Adapters normalize source contracts outside UI components. No API, scientific computation, private paths, image copies, model downloads or real experiment execution belongs in this repository.
