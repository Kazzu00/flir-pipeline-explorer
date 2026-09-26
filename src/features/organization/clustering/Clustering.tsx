import { useState } from 'react'
import { useSnapshot } from '@/data/provider'
import {
  Panel,
  Select,
  Notice,
  Metrics,
} from '@/components/feedback/Primitives'
import { Gallery } from '@/components/visualization/Gallery'
import { Status } from '@/components/feedback/Status'
import { Scatter } from './Scatter'
export function Clustering() {
  const { data } = useSnapshot()
  const [runId, setRunId] = useState('demo-cluster-dbscan')
  const [cluster, setCluster] = useState<number | null>(null)
  const [after, setAfter] = useState(false)
  const [color, setColor] = useState('Cluster')
  const [contentId, setContentId] = useState('')
  if (!data) return null
  const run = data.clusterings.find((r) => r.id === runId)!
  const split = data.splits.find(
    (s) => s.clusteringRunId === runId && s.strategy === 'Cluster-aware',
  )
  const splitMap = new Map(
    split?.assignments.map((a) => [a.contentId, a.splits.join(',')]),
  )
  const points = run.points.filter(
    (p) => cluster === null || p.clusterId === cluster,
  )
  const summary = run.clusters.find((c) => c.id === cluster)
  const selected = points.find((p) => p.contentId === contentId) ?? points[0]
  const actualAfter = after && !!split
  const selectCluster = (id: number | null) => {
    setCluster(id)
    setContentId('')
  }
  return (
    <>
      <div className="toolbar">
        <Select
          label="Run / encoder / reduction / algorithm"
          value={runId}
          onChange={(v) => {
            setRunId(v)
            setCluster(null)
            setAfter(false)
            setColor('Cluster')
            setContentId('')
          }}
          options={data.clusterings.map((r) => ({
            value: r.id,
            label: `${r.encoder} / ${r.reduction} / ${r.algorithm}`,
          }))}
        />
        <Select
          label="Color / group by"
          value={color}
          onChange={setColor}
          options={[
            'Cluster',
            'Source video',
            ...(actualAfter ? ['Split'] : []),
          ].map((v) => ({ value: v, label: v }))}
        />
        <div className="split-toggle" aria-label="Clustering split view">
          <button
            aria-pressed={!actualAfter}
            onClick={() => {
              setAfter(false)
              if (color === 'Split') setColor('Cluster')
            }}
          >
            BEFORE SPLIT
          </button>
          <button
            aria-pressed={actualAfter}
            disabled={!split}
            title={
              !split ? 'No compatible split artifact for this run' : undefined
            }
            onClick={() => setAfter(true)}
          >
            AFTER SPLIT
          </button>
        </div>
      </div>
      <p className="micro muted">
        {run.id} · seed {run.seed} · {JSON.stringify(run.parameters)} · DEMO
        coordinates; no reducer or clustering runs in the browser.
      </p>
      <Notice>
        {actualAfter
          ? 'Clusters are unchanged. Shapes add the compatible cluster-aware assignment: ○ train · □ validation · ◇ test.'
          : 'Before split: only grouping is shown; no train / validation / test assignment is applied.'}{' '}
        Noise −1 is explicit; each noise content has its own allocation group.
        Sequence grouping unavailable: no verified sequence.
      </Notice>
      <div className="cluster-workspace">
        <Panel
          title="Content representation"
          meta={`${run.encoder} · ${run.reduction} · ${run.points.length} unique contents`}
        >
          <Scatter
            run={run}
            selected={cluster}
            after={actualAfter}
            splitMap={splitMap}
            groupBy={color}
            onSelect={selectCluster}
            onContentSelect={setContentId}
          />
          <div className="cluster-buttons" aria-label="Select cluster">
            <button
              aria-pressed={cluster === null}
              onClick={() => selectCluster(null)}
            >
              All contents
            </button>
            {run.clusters.map((c) => (
              <button
                key={c.id}
                aria-pressed={cluster === c.id}
                onClick={() => selectCluster(c.id)}
              >
                {c.id === -1
                  ? '△ Noise −1'
                  : `Cluster ${String(c.id).padStart(2, '0')}`}{' '}
                · {c.size}
              </button>
            ))}
          </div>
          <div className="legend">
            {color === 'Source video'
              ? 'Color: demo-video-1 / 2 / 3 · provenance in details'
              : color === 'Split'
                ? 'Color: train / validation / test · repeated by shape'
                : 'Color: run-local cluster · select a labeled cluster above'}
          </div>
        </Panel>
        <Panel title="Selection details" meta="DEMO">
          <dl className="details" aria-live="polite">
            <dt>Cluster ID</dt>
            <dd className="cluster-id">
              {cluster === null
                ? 'All contents'
                : cluster === -1
                  ? 'Noise −1'
                  : `Cluster ${String(cluster).padStart(2, '0')}`}
            </dd>
            <dt>Unique contents</dt>
            <dd>{points.length}</dd>
            <dt>Medoid · sample designation</dt>
            <dd className="mono">
              {summary?.medoidContentId ?? 'Unavailable'}
            </dd>
            <dt>Source provenance</dt>
            <dd>{[...new Set(points.map((p) => p.sourceVideo))].join(', ')}</dd>
            <dt>Sequence</dt>
            <dd>Unknown / not validated</dd>
            {actualAfter && (
              <>
                <dt>Split assignment</dt>
                <dd>
                  {[
                    ...new Set(points.map((p) => splitMap.get(p.contentId))),
                  ].join(', ')}
                </dd>
              </>
            )}
            <dt>Verification</dt>
            <dd>
              <Status state="mock" />
            </dd>
          </dl>
          {summary && <Metrics metrics={summary.metrics} />}
        </Panel>
      </div>
      <Panel
        title="Source-video sampling grid"
        meta="Blocks show contiguous indices · not scene boundaries"
      >
        <div className="timeline">
          <div className="timeline-axis">
            <span>0</span>
            <span>12</span>
            <span>24</span>
            <span>36</span>
            <span>47 · index</span>
          </div>
          {[...new Set(run.points.map((p) => p.sourceVideo))].map((video) => {
            const members = points.filter((p) => p.sourceVideo === video)
            const ids = [...new Set(members.map((p) => p.clusterId))]
            return (
              <div className="timeline-row" key={video}>
                <span>{video}</span>
                <div className="timeline-track">
                  {ids.map((id) => {
                    const indices = members
                      .filter((p) => p.clusterId === id)
                      .map((p) => p.sampleIndex)
                    const start = Math.min(...indices),
                      end = Math.max(...indices)
                    return (
                      <button
                        key={id}
                        className="timeline-block"
                        style={{
                          left: `${(start / 48) * 100}%`,
                          width: `${((end - start + 1) / 48) * 100}%`,
                        }}
                        onClick={() => selectCluster(id)}
                        aria-label={`Select ${id === -1 ? 'noise' : `cluster ${id}`} in ${video}`}
                      >
                        {id === -1 ? '−1' : `C${id}`}
                        {actualAfter
                          ? ` · ${splitMap.get(members.find((p) => p.clusterId === id)!.contentId)}`
                          : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
      <Panel
        title="Selected content & occurrence mapping"
        meta="SYNTHETIC IDENTITIES"
      >
        <div className="panel-body">
          <Select
            label="Content (keyboard-accessible scatter alternative)"
            value={selected?.contentId ?? ''}
            onChange={setContentId}
            options={points.map((p) => ({
              value: p.contentId,
              label: p.contentId,
            }))}
          />
          {selected && (
            <p className="mono" style={{ marginTop: 15 }}>
              {selected.frameIds.join(' + ')} → {selected.contentId} → row{' '}
              {selected.embeddingRow} → cluster {selected.clusterId} →{' '}
              {selected.groupId}
              {actualAfter ? ` → ${splitMap.get(selected.contentId)}` : ''}
            </p>
          )}
        </div>
      </Panel>
      <Panel
        title="Contents in selection"
        meta="Up to 6 previews · source images unavailable"
      >
        <Gallery
          points={points}
          selected={selected?.contentId}
          onSelect={setContentId}
        />
      </Panel>
    </>
  )
}
