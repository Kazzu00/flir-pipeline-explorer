import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSnapshot } from '@/data/provider'
import { Panel, Notice, Select } from '@/components/feedback/Primitives'
import {
  ArtifactStatus,
  EmptyArtifactState,
  MetricSummary,
} from '@/components/research/Evidence'
import { TechnicalDetailsDrawer } from '@/components/research/TechnicalDetailsDrawer'
import { LinkageExplorer } from './LinkageExplorer'
import type { Research } from '@/contracts/research'
import { Pager } from './evidence-views/Pager'

export function SequenceExplorer() {
  const { data } = useSnapshot()
  const [params, setParams] = useSearchParams()
  const research =
    data?.leakage?.schemaVersion === 'LeakageSnapshotV2'
      ? data.leakage.research
      : undefined
  const linkage = params.get('mode') === 'linkage'
  return (
    <>
      <div className="toolbar">
        <div className="split-toggle" aria-label="Sequence and linkage views">
          <button
            aria-pressed={!linkage}
            onClick={() => setParams({ mode: 'sequences' })}
          >
            Sequence structure
          </button>
          <button
            aria-pressed={linkage}
            onClick={() => setParams({ mode: 'linkage' })}
          >
            Cross-dataset linkage
          </button>
        </div>
      </div>
      {linkage ? (
        <LinkageExplorer research={research} />
      ) : (
        <SequenceStructure research={research} />
      )}
    </>
  )
}
function SequenceStructure({ research }: { research?: Research }) {
  const seq = research?.sequences.artifact
  const sources = useMemo(
    () => [...new Set(seq?.zones.map((z) => z.sourceVideo))],
    [seq],
  )
  const [source, setSource] = useState('')
  const [selected, setSelected] = useState('')
  const [page, setPage] = useState(0)
  const [experimentIndex, setExperimentIndex] = useState('0')
  const active = sources.includes(source) ? source : sources[0]
  const zones = seq?.zones.filter((z) => z.sourceVideo === active) ?? []
  const current = zones.find((z) => z.id === selected) ?? zones[0]
  const max = zones.reduce((m, z) => Math.max(m, z.end), 1)
  const experiments = research?.experiments.artifact
  const experiment = experiments?.[Number(experimentIndex)] ?? experiments?.[0]
  return (
    <>
      <h2>Where does temporal evidence suggest a boundary?</h2>
      <Notice>
        Sequence boundaries are reviewed evidence, not ground truth. Candidate
        zones are not exact cuts; visual recurrence is not exact duplication.
      </Notice>
      {!seq ? (
        <EmptyArtifactState stage="Sequences" />
      ) : (
        <>
          <div className="toolbar">
            <ArtifactStatus state={research!.sequences.state} />
            <Select
              label="Source video"
              value={active ?? ''}
              onChange={(v) => {
                setSource(v)
                setPage(0)
              }}
              options={sources.map((value) => ({ value, label: value }))}
            />
          </div>
          <Panel
            title="Source-video sampling grid"
            meta="Sample indices · not capture timestamps"
          >
            <div
              className="sequence-grid"
              aria-label="Sequence evidence intervals"
            >
              <div className="grid-axis">
                <span>0</span>
                <span>{max} samples</span>
              </div>
              {zones.slice(page * 20, page * 20 + 20).map((z) => (
                <div className="sequence-lane" key={z.id}>
                  <button
                    className={`sequence-interval decision-${z.decision}`}
                    style={{
                      marginLeft: `${(z.start / (max + 1)) * 85}%`,
                      width: `${Math.max(4, ((z.end - z.start + 1) / (max + 1)) * 85)}%`,
                    }}
                    aria-label={`${z.kind.replaceAll('_', ' ')} ${z.id}: ${z.start}–${z.end}, ${z.decision}`}
                    aria-pressed={current?.id === z.id}
                    onClick={() => setSelected(z.id)}
                  >
                    <span aria-hidden="true">
                      {z.decision === 'candidate'
                        ? '?'
                        : z.decision === 'rejected'
                          ? '×'
                          : '◇'}
                    </span>
                  </button>
                  <span>
                    {z.kind.replaceAll('_', ' ')} · {z.decision} · {z.start}–
                    {z.end}
                  </span>
                </div>
              ))}
              {!zones.length && (
                <p>
                  No intervals exported. Availability does not imply detected
                  boundaries.
                </p>
              )}
              <Pager
                page={page}
                size={20}
                count={zones.length}
                setPage={setPage}
              />
            </div>
          </Panel>
          {current && (
            <Panel title="Selected evidence">
              <MetricSummary
                items={[
                  { label: 'Kind', value: current.kind.replaceAll('_', ' ') },
                  { label: 'Decision', value: current.decision },
                  {
                    label: 'Sampling interval',
                    value: `${current.start}–${current.end}`,
                  },
                  {
                    label: 'Review',
                    value: current.reviewId ? 'Bound review' : 'Pending',
                  },
                ]}
              />
              <TechnicalDetailsDrawer>
                <pre className="audit-json">
                  {JSON.stringify(
                    {
                      sequenceSet: seq.id,
                      zone: current,
                      review:
                        seq.reviews.find((r) => r.id === current.reviewId) ??
                        null,
                      recurrence: seq.recurrence.filter(
                        (r) => r.a === current.id || r.b === current.id,
                      ),
                    },
                    null,
                    2,
                  )}
                </pre>
              </TechnicalDetailsDrawer>
            </Panel>
          )}
        </>
      )}
      <Panel
        title="Sequence experiments"
        meta={research?.experiments.state ?? 'pending'}
      >
        {!experiments || !experiment ? (
          <p className="panel-body muted">
            Pending · no compatible experiment suite exported.
          </p>
        ) : (
          <>
            {experiments.length > 1 && (
              <div className="panel-body">
                <Select
                  label="Experiment evidence"
                  value={experimentIndex}
                  onChange={setExperimentIndex}
                  options={experiments.map((e, i) => ({
                    value: String(i),
                    label: `${e.encoder ?? 'Suite'} · ${e.representation ?? 'temporal'} · ${e.method ?? 'summary'} · ${i + 1}`,
                  }))}
                />
              </div>
            )}
            <MetricSummary
              items={[
                { label: 'Experiment runs', value: experiments.length },
                { label: 'Coverage', value: experiment.coverage },
                { label: 'Agreement', value: experiment.agreement },
                { label: 'Review state', value: experiment.reviewState },
                {
                  label: 'Recurrence candidates',
                  value: experiment.recurrenceCandidates,
                },
              ]}
            />
            <TechnicalDetailsDrawer title="View experiment details">
              <p>
                Selected evidence summarized above. Runs are not ranked.
                Agglomerative remains experimental.
              </p>
              <pre className="audit-json">
                {JSON.stringify(experiments, null, 2)}
              </pre>
            </TechnicalDetailsDrawer>
          </>
        )}
      </Panel>
      <TechnicalDetailsDrawer title="Evidence and provenance">
        <p>
          Source video ≠ sequence. Sequence candidate ≠ sequence instance.
          Review ≠ ground truth.
        </p>
        {research?.evidence.artifact?.map((e) => (
          <div className="panel-body" key={e.id}>
            <h3>
              {e.source === 'hypatia_legacy_evidence_v1'
                ? 'Legacy Hypatia review'
                : e.source}
            </h3>
            <p>
              State: {e.state} · Canonical binding:{' '}
              {e.canonicalBinding === null
                ? 'unavailable'
                : e.canonicalBinding
                  ? 'yes'
                  : 'no'}
            </p>
            <pre className="audit-json">{JSON.stringify(e, null, 2)}</pre>
          </div>
        )) ?? (
          <p>Evidence source: unavailable. No reviewer or date inferred.</p>
        )}
      </TechnicalDetailsDrawer>
      {research && research.variants.length > 1 && (
        <VariantDetails research={research} />
      )}
    </>
  )
}
function VariantDetails({ research }: { research: Research }) {
  const [selected, setSelected] = useState(research.variants[0].id)
  const variant = research.variants.find((v) => v.id === selected)!
  return (
    <TechnicalDetailsDrawer title="Dataset variant">
      <Select
        label="Dataset variant"
        value={selected}
        onChange={setSelected}
        options={research.variants.map((v) => ({ value: v.id, label: v.name }))}
      />
      <pre className="audit-json">{JSON.stringify(variant, null, 2)}</pre>
      <p>
        Registry metadata only. This does not switch analysis populations or
        establish causal effects.
      </p>
    </TechnicalDetailsDrawer>
  )
}
