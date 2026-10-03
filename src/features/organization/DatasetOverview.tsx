import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSnapshot } from '@/data/provider'
import { MetricSummary, ArtifactStatus } from '@/components/research/Evidence'
import { TechnicalDetailsDrawer } from '@/components/research/TechnicalDetailsDrawer'
import { Notice } from '@/components/feedback/Primitives'
export function DatasetOverview() {
  const { data } = useSnapshot()
  const sources = useMemo(
    () =>
      new Set(
        data?.leakage?.contents.flatMap((c) =>
          c.occurrences.map((o) => o.sourceVideo),
        ),
      ).size,
    [data],
  )
  if (!data) return null
  const snapshot = data.leakage
  const research =
    snapshot?.schemaVersion === 'LeakageSnapshotV2'
      ? snapshot.research
      : undefined
  const state = (stage: string) =>
    snapshot
      ? snapshot.runs.some((r) => r.stage === stage)
        ? 'artifact_available'
        : 'pending'
      : 'demo'
  return (
    <>
      <div className="section-intro">
        <h2>What data and analysis are available?</h2>
        <span className="eyebrow">
          {snapshot ? 'ARTIFACT / SAMPLED VIDEO' : 'DEMO / SYNTHETIC'}
        </span>
      </div>
      <MetricSummary
        items={[
          {
            label: 'Occurrences',
            value: data.dataset.occurrences.toLocaleString(),
          },
          {
            label: 'Unique contents',
            value: data.dataset.uniqueContents.toLocaleString(),
          },
          { label: 'Source videos', value: snapshot ? sources : null },
        ]}
      />
      <div className="research-flow">
        <div className="flow-source">
          Source videos <span>↓ sampling / manifest ↓</span>
          <strong>DINOv2 + CLIP</strong>
          <div className="inline-status">
            {['DINOv2', 'CLIP'].map((encoder) => (
              <span key={encoder}>
                {encoder}{' '}
                <ArtifactStatus
                  state={
                    snapshot
                      ? snapshot.runs.some(
                          (r) =>
                            r.stage === 'embeddings' && r.encoder === encoder,
                        )
                        ? 'artifact_available'
                        : 'pending'
                      : 'demo'
                  }
                />
              </span>
            ))}
          </div>
        </div>
        <div className="flow-branches">
          <Link to="/organization/explore" className="flow-branch">
            <span className="eyebrow">VISUAL STRUCTURE ↗</span>
            <h3>Explore visual relationships</h3>
            {['similarity', 'reduction', 'clustering'].map((s) => (
              <div className="availability-row" key={s}>
                <span>{s}</span>
                <ArtifactStatus state={state(s)} />
              </div>
            ))}
          </Link>
          <Link to="/organization/sequences" className="flow-branch">
            <span className="eyebrow">TEMPORAL STRUCTURE ↗</span>
            <h3>Inspect sequence evidence</h3>
            <div className="availability-row">
              Sequences{' '}
              <ArtifactStatus state={research?.sequences.state ?? 'pending'} />
            </div>
            <div className="availability-row">
              Experiments{' '}
              <ArtifactStatus
                state={research?.experiments.state ?? 'pending'}
              />
            </div>
            <div className="availability-row">
              Review / evidence{' '}
              <ArtifactStatus state={research?.evidence.state ?? 'pending'} />
            </div>
          </Link>
        </div>
        <Link className="flow-merge" to="/organization/sequences?mode=linkage">
          <strong>Cross-dataset linkage ↗</strong>
          <span>Labeled data ↔ sampled video</span>
          <ArtifactStatus state={research?.linkage.state ?? 'pending'} />
        </Link>
        <Link className="flow-merge" to="/organization/evaluation">
          <strong>Future organization & downstream evaluation ↗</strong>
          <span>Grouping / split · residual dependency · detector</span>
          <ArtifactStatus state={state('splits')} />
        </Link>
      </div>
      <TechnicalDetailsDrawer title="View technical details">
        <pre className="audit-json">
          {JSON.stringify(
            snapshot
              ? {
                  dataset: snapshot.dataset,
                  exportPolicy: snapshot.exportPolicy,
                  runs: snapshot.runs.map(
                    ({
                      id,
                      stage,
                      encoder,
                      coverage,
                      integrity,
                      featureSpaceId,
                    }) => ({
                      id,
                      stage,
                      encoder,
                      coverage,
                      integrity,
                      featureSpaceId,
                    }),
                  ),
                }
              : data.dataset,
            null,
            2,
          )}
        </pre>
        <p>
          Exact duplicate groups: {data.dataset.duplicateGroups}. Source video ≠
          sequence. Cluster ≠ scene. Sampling-grid time ≠ capture timestamp.
          Labels and historical splits are not representation inputs.
        </p>
      </TechnicalDetailsDrawer>
      <Notice>
        Availability describes the exported evidence. It does not establish
        scientific verification or a completed detector comparison.
      </Notice>
    </>
  )
}
