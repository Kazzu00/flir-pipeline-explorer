# FLIR Pipeline Explorer — permanent agent rules

This repository is the independent frontend `flir-pipeline-explorer`. Scientific work remains in the three upstream repositories. Do not apply the old backend workspace scope to this frontend.

- `.references/` contains ignored, read-only shallow clones. Never modify, commit inside, or publish their contents.
- Inspect `docs/RESEARCH.md` and current code before changing scientific vocabulary. Preserve source disagreements as inconsistent / experimental / unavailable, not as resolved facts.
- Never invent scientific results. Label synthetic data DEMO / MOCK / SAMPLE at the workspace and result level. A lifecycle status is not scientific verification.
- Source video != sequence. Cluster != sequence. Sampling-grid time != verified capture time. Pilot != scientific result.
- No access to private datasets, source images, weights, scientific arrays, archives, credentials or environment files. Never publish them. Do not copy images from reference clones just because they are tracked upstream.
- This frontend visualizes existing data only. No training, denoising, embedding extraction, reduction, clustering, segmentation, or scientific split generation.
- Keep the adapter boundary: components consume `useSnapshot`; adapters validate unknown data with Zod before exposing it. No repository-specific CSV/JSON/Parquet parsing in components.
- Preserve frame/content/embedding/cluster/group/split identities. One clustering row per content; cluster-aware groups are indivisible; noise is explicit and uses singleton allocation groups. Historical overlap is a valid audit state, not silently repaired.
- Unavailable metrics are null, never zero. Retain annotation/evaluation caveats. Do not rank methods by a single score or visual appearance.
- Target WCAG 2.2 AA: semantic HTML, keyboard alternatives to charts, visible focus, explicit labels, contrast and redundant encodings. Automated checks are not certification.
- Use npm and the committed lockfile. Do not add backend Python tools or run scientific commands for frontend changes.
- Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`; run `npm run test:e2e` for UI changes. Fix failures; report anything not executed.
- Before committing or pushing inspect `git status`, `git diff`, `git diff --cached` and tracked files. Commit logical changes; keep generated outputs ignored.
- Do not modify or delete other repositories. No deployment, live API, or experimental result may be described as completed unless executed and verified.
