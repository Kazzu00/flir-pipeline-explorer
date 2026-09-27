import { useMemo, useState } from 'react'
import type { ArtifactRun, LeakageSnapshot } from '@/contracts/leakage'
import {
  Panel,
  Notice,
  Select,
  Metrics,
} from '@/components/feedback/Primitives'
import { Chart } from '@/components/visualization/Chart'

const colors = [
  '#73d9be',
  '#a4a0f2',
  '#edbd79',
  '#80b8ea',
  '#ed99b1',
  '#bcda87',
]
const splitColors: Record<string, string> = {
  train: '#73d9be',
  validation: '#edbd79',
  test: '#a4a0f2',
}
function ReportedMetrics({ run }: { run: ArtifactRun }) {
  return Object.keys(run.metrics).length ? (
    <Metrics
      metrics={Object.entries(run.metrics).map(([name, value]) => ({
        name,
        value,
        unit: '',
        origin: run.metricOrigin,
        caveat: 'Reported upstream.',
      }))}
    />
  ) : (
    <p className="panel-body muted">Metrics unavailable in this export.</p>
  )
}
function Pending({ stage }: { stage: string }) {
  return (
    <Panel title={`${stage}: pending`} meta="UNAVAILABLE">
      <Notice>
        No compatible {stage} artifact was exported for this dataset. Export an
        explicit completed run to make this stage available. No synthetic
        results are substituted.
      </Notice>
    </Panel>
  )
}
export function ArtifactStage({
  snapshot,
  stage,
}: {
  snapshot: LeakageSnapshot
  stage: string
}) {
  const [encoder, setEncoder] = useState('DINOv2')
  const [selected, setSelected] = useState('')
  const actualStage = stage === 'groups' ? 'clustering' : stage
  const runs = snapshot.runs.filter(
    (r) => r.stage === actualStage && (!r.encoder || r.encoder === encoder),
  )
  const run = runs.find((r) => r.id === selected) ?? runs[0]
  if (!stage || stage === 'dataset')
    return (
      <>
        <Panel title="Sampled-video dataset" meta="ARTIFACT · M02">
          <Metrics
            metrics={[
              ['Occurrences', snapshot.dataset.occurrences],
              ['Unique contents', snapshot.dataset.uniqueContents],
              ['Exact-duplicate groups', snapshot.dataset.duplicateGroups],
              [
                'Source videos',
                new Set(
                  snapshot.contents.flatMap((c) =>
                    c.occurrences.map((o) => o.sourceVideo),
                  ),
                ).size,
              ],
            ].map(([name, value]) => ({
              name: String(name),
              value: Number(value),
              origin: 'artifact',
              unit: '',
              caveat: 'Manifest coverage.',
            }))}
          />
          <div className="panel-body">
            <p className="mono">
              {snapshot.dataset.id} · {snapshot.dataset.manifestVersion}
            </p>
            <p>
              Every content retains all its recorded occurrences and
              source-video memberships. No labels or original split are inputs
              to the representations.
            </p>
          </div>
        </Panel>
        <Panel title="Sampling metadata and encoder coverage" meta="ARTIFACT">
          <div className="panel-body">
            <p>
              Declared sampling rates:{' '}
              {[
                ...new Set(
                  snapshot.contents.flatMap((c) =>
                    c.occurrences.map((o) => o.sampleFps),
                  ),
                ),
              ]
                .sort((a, b) => a - b)
                .join(', ')}{' '}
              samples/second. Grid seconds are relative sampling positions, not
              capture timestamps.
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Encoder</th>
                    <th>Unique-content coverage</th>
                    <th>Feature space</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {['DINOv2', 'CLIP'].map((name) => {
                    const feature = snapshot.runs.find(
                      (r) => r.stage === 'embeddings' && r.encoder === name,
                    )
                    return (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>
                          {feature
                            ? `${feature.coverage} / ${snapshot.dataset.uniqueContents}`
                            : 'unavailable'}
                        </td>
                        <td>{feature?.id ?? 'unavailable'}</td>
                        <td>{feature?.integrity ?? 'pending'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
        <Panel
          title="Available artifacts"
          meta="No stage inferred from another stage"
        >
          <div className="panel-body">
            <ul>
              {[
                'embeddings',
                'similarity',
                'reduction',
                'clustering',
                'splits',
                'detector',
              ].map((s) => (
                <li key={s}>
                  {s}:{' '}
                  {snapshot.runs.filter((r) => r.stage === s).length ||
                    'pending'}{' '}
                  {snapshot.runs.some((r) => r.stage === s)
                    ? 'artifact runs'
                    : ''}
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <ProvenanceNotice />
      </>
    )
  return (
    <>
      <div className="toolbar">
        {[
          'embeddings',
          'similarity',
          'reduction',
          'clustering',
          'groups',
        ].includes(stage) && (
          <Select
            label="Encoder"
            value={encoder}
            onChange={(v) => {
              setEncoder(v)
              setSelected('')
            }}
            options={['DINOv2', 'CLIP'].map((v) => ({ value: v, label: v }))}
          />
        )}
        {runs.length > 0 && (
          <Select
            label="Artifact run"
            value={run.id}
            onChange={setSelected}
            options={runs.map((r) => ({
              value: r.id,
              label: `${r.method} · ${r.id} · seed ${r.seed ?? 'unavailable'}${r.candidate ? ' · exploratory candidate' : ''}`,
            }))}
          />
        )}
      </div>
      {!run ? (
        <Pending stage={actualStage} />
      ) : (
        <>
          <Panel
            title={`${run.method} · ${run.id}`}
            meta="ARTIFACT · metrics REPORTED"
          >
            <dl className="details">
              <dt>Dataset / feature space</dt>
              <dd className="mono">
                {run.datasetId} / {run.featureSpaceId ?? 'not applicable'}
              </dd>
              <dt>Execution / export integrity</dt>
              <dd>
                {run.status} / {run.integrity}
              </dd>
              <dt>Coverage / seed</dt>
              <dd>
                {run.coverage} unique contents / {run.seed ?? 'unavailable'}
              </dd>
              {run.dimensions && (
                <>
                  <dt>Representation</dt>
                  <dd>
                    {run.dimensions} dimensions · {run.pooling} · raw + L2
                    checked
                  </dd>
                </>
              )}
              <dt>Configuration</dt>
              <dd>{run.configurationId ?? 'unavailable'}</dd>
              <dt>Parameters</dt>
              <dd>
                <code>{JSON.stringify(run.parameters)}</code>
              </dd>
            </dl>
            <ReportedMetrics run={run} />
          </Panel>
          {actualStage === 'embeddings' && (
            <Notice>
              Embeddings operate on unique content identities. Full vectors stay
              outside the browser. Persisted projections are available in
              Reduction when exported.
            </Notice>
          )}
          {actualStage === 'similarity' && (
            <SimilarityEvidence key={run.id} run={run} />
          )}
          {(actualStage === 'reduction' || actualStage === 'clustering') && (
            <ArtifactExplorer key={run.id} snapshot={snapshot} run={run} />
          )}
          {actualStage === 'reduction' && (
            <Panel
              title="Reduction run comparison"
              meta="Reported metrics; no ranking by visual appearance"
            >
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Run</th>
                      <th>Method / seed</th>
                      <th>Selection</th>
                      <th>Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <button
                            className="row-link"
                            onClick={() => setSelected(r.id)}
                          >
                            {r.id}
                          </button>
                        </td>
                        <td>
                          {r.method} / {r.seed}
                        </td>
                        <td>
                          {r.candidate
                            ? 'Exploratory candidate'
                            : 'Not selected as candidate'}
                        </td>
                        <td>
                          {r.coordinates.length
                            ? `All ${r.coordinates.length} contents`
                            : 'Not exported'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
          {actualStage === 'splits' && <SplitEvidence run={run} />}
          {actualStage === 'detector' && (
            <Notice>
              Detector metrics belong only to the exported dataset and split{' '}
              {run.splitSpaceId}. A complete artifact is reported evidence, not
              a frontend certification of a final experiment. Small pilots are
              not accepted as final results.
            </Notice>
          )}
          {run.summaries.length > 0 && (
            <Panel title="Persisted summaries" meta="REPORTED">
              <SummaryTables run={run} />
            </Panel>
          )}
        </>
      )}
      <ProvenanceNotice />
    </>
  )
}
function ProvenanceNotice() {
  return (
    <Notice>
      Source video ≠ verified sequence. Cluster ≠ sequence. Sampling-grid time ≠
      capture timestamp. Exact duplication, visual similarity and temporal
      proximity are distinct observations. Scientific metrics are reported, not
      recomputed or independently validated here.
    </Notice>
  )
}
function SummaryTables({ run }: { run: ArtifactRun }) {
  const [scope, setScope] = useState(run.summaries[0]?.scope ?? 'source')
  const [page, setPage] = useState(0)
  const rows = run.summaries.filter((s) => s.scope === scope)
  return (
    <div className="panel-body">
      <Select
        label="Summary scope"
        value={scope}
        onChange={(v) => {
          setScope(v as typeof scope)
          setPage(0)
        }}
        options={[...new Set(run.summaries.map((s) => s.scope))].map((v) => ({
          value: v,
          label: v,
        }))}
      />
      <p>
        Persisted rows; numeric fields are allowlisted. Sampling gaps do not
        establish sequence identity.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Row</th>
              <th>Reported values</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(page * 20, page * 20 + 20).map((r) => (
              <tr key={r.index}>
                <td>{r.label ?? r.configurationId ?? r.index + 1}</td>
                <td>
                  {Object.entries(r.metrics)
                    .map(([k, v]) => `${k}: ${v ?? 'unavailable'}`)
                    .join(' · ') || 'No supported numeric fields'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} count={rows.length} size={20} setPage={setPage} />
    </div>
  )
}
function Pager({
  page,
  count,
  size,
  setPage,
}: {
  page: number
  count: number
  size: number
  setPage: (page: number) => void
}) {
  return (
    <div className="toolbar">
      <button disabled={page === 0} onClick={() => setPage(page - 1)}>
        Previous page
      </button>
      <span>
        {count ? page * size + 1 : 0}–{Math.min(count, (page + 1) * size)} /{' '}
        {count}
      </span>
      <button
        disabled={(page + 1) * size >= count}
        onClick={() => setPage(page + 1)}
      >
        Next page
      </button>
    </div>
  )
}
function SimilarityEvidence({ run }: { run: ArtifactRun }) {
  const queries = useMemo(() => [...new Set(run.pairs.map((p) => p.a))], [run])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState(queries[0] ?? '')
  const options = queries.filter((q) => q.includes(search)).slice(0, 100)
  const neighbors = run.pairs.filter((p) => p.a === query)
  return (
    <>
      <Notice>
        The global values above are persisted summary statistics and quantiles.
        Histogram counts are unavailable; quantiles have not been converted into
        bins.
      </Notice>
      <Panel
        title="Nearest-neighbor inspection"
        meta="Persisted top-k · cosine on L2 embeddings"
      >
        <div className="panel-body">
          <label className="select-field">
            <span>Search content alias</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="content-000001"
            />
          </label>
          <p className="micro">
            Selector shows up to 100 matching aliases. Search an exact alias to
            inspect any content.
          </p>
          <Select
            label="Query content"
            value={options.includes(query) ? query : ''}
            onChange={setQuery}
            options={[
              { value: '', label: 'Select a content' },
              ...options.map((v) => ({ value: v, label: v })),
            ]}
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Neighbor</th>
                  <th>Cosine</th>
                  <th>Same source</th>
                  <th>Sample-index gap</th>
                  <th>Grid-seconds gap</th>
                </tr>
              </thead>
              <tbody>
                {neighbors.map((p) => (
                  <tr key={p.rank}>
                    <td>{p.rank}</td>
                    <td>{p.b}</td>
                    <td>{p.cosine.toFixed(6)}</td>
                    <td>{String(p.sameSourceVideo)}</td>
                    <td>{p.sampleGap ?? 'unavailable'}</td>
                    <td>{p.gridSecondsGap ?? 'unavailable'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Thumbnails unavailable. No FLIR images are included in the snapshot.
          </p>
        </div>
      </Panel>
    </>
  )
}
function SplitEvidence({ run }: { run: ArtifactRun }) {
  const [page, setPage] = useState(0)
  return (
    <Panel
      title="Persisted split assignments"
      meta="ARTIFACT · occurrence counts"
    >
      <Metrics
        metrics={['train', 'validation', 'test'].map((name) => ({
          name,
          value: run.assignments.filter((a) => a.split === name).length,
          unit: '',
          origin: 'artifact',
          caveat: 'Count of persisted assignment rows.',
        }))}
      />
      <div className="panel-body">
        <p>
          Strategy: {run.method}. Clustering reference:{' '}
          {run.clusteringSpaceId ?? 'not applicable'}.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Occurrence</th>
                <th>Content</th>
                <th>Split</th>
              </tr>
            </thead>
            <tbody>
              {run.assignments.slice(page * 25, page * 25 + 25).map((a) => (
                <tr key={a.frameId}>
                  <td>{a.frameId}</td>
                  <td>{a.contentId}</td>
                  <td>{a.split}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager
          page={page}
          count={run.assignments.length}
          size={25}
          setPage={setPage}
        />
      </div>
    </Panel>
  )
}
function ArtifactExplorer({
  snapshot,
  run,
}: {
  snapshot: LeakageSnapshot
  run: ArtifactRun
}) {
  const [cluster, setCluster] = useState('all')
  const [source, setSource] = useState('all')
  const [color, setColor] = useState('Source membership')
  const [after, setAfter] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const coordinates =
    run.stage === 'reduction'
      ? run.coordinates
      : (snapshot.runs.find((r) => r.id === run.reductionSpaceId)
          ?.coordinates ?? [])
  const contents = useMemo(
    () => new Map(snapshot.contents.map((c) => [c.contentId, c])),
    [snapshot],
  )
  const labels = useMemo(
    () => new Map(run.labels.map((l) => [l.contentId, l])),
    [run],
  )
  const split = snapshot.runs.find(
    (r) =>
      r.stage === 'splits' &&
      r.method === 'cluster_aware' &&
      r.clusteringSpaceId === run.id,
  )
  const allocations = useMemo(
    () => new Map(split?.assignments.map((a) => [a.contentId, a.split])),
    [split],
  )
  const clusters = [...new Set(run.labels.map((l) => l.clusterId))].sort(
    (a, b) => a - b,
  )
  const sources = [
    ...new Set(
      snapshot.contents.flatMap((c) => c.occurrences.map((o) => o.sourceVideo)),
    ),
  ].sort()
  const points = coordinates.filter(
    (p) =>
      (cluster === 'all' ||
        labels.get(p.contentId)?.clusterId === Number(cluster)) &&
      (source === 'all' ||
        contents
          .get(p.contentId)
          ?.occurrences.some((o) => o.sourceVideo === source)),
  )
  const selected =
    contents.get(selectedId) ??
    contents.get(points[0]?.contentId) ??
    contents.get(run.labels[0]?.contentId)
  const listed = (
    run.stage === 'clustering'
      ? run.labels
          .map((l) => l.contentId)
          .filter(
            (id) =>
              cluster === 'all' ||
              labels.get(id)?.clusterId === Number(cluster),
          )
      : coordinates.map((p) => p.contentId)
  ).filter(
    (id) =>
      id.includes(search) &&
      (source === 'all' ||
        contents.get(id)?.occurrences.some((o) => o.sourceVideo === source)),
  )
  const getGroup = (id: string) =>
    after
      ? (allocations.get(id) ?? 'unavailable')
      : color === 'Cluster'
        ? String(labels.get(id)?.clusterId ?? 'unavailable')
        : [...new Set(contents.get(id)?.occurrences.map((o) => o.sourceVideo))]
            .sort()
            .join(' + ')
  const groups = [...new Set(points.map((p) => getGroup(p.contentId)))].sort()
  const groupColors = new Map(
    groups.map((group, i) => [group, colors[i % colors.length]]),
  )
  const pointColor = (id: string) =>
    after
      ? (splitColors[getGroup(id)] ?? '#8c9da3')
      : getGroup(id) === '-1'
        ? '#8c9da3'
        : (groupColors.get(getGroup(id)) ?? '#8c9da3')
  const selectedRows = selected?.occurrences ?? []
  const featureRows = new Map(
    snapshot.runs
      .find((r) => r.id === run.featureSpaceId)
      ?.contentIndex.map((p) => [p.contentId, p.embeddingRow]),
  )
  return (
    <>
      <div className="toolbar">
        {run.stage === 'clustering' && (
          <Select
            label="Cluster filter"
            value={cluster}
            onChange={(v) => {
              setCluster(v)
              setPage(0)
              setSelectedId('')
            }}
            options={[
              { value: 'all', label: 'All clusters' },
              ...clusters.map((c) => ({
                value: String(c),
                label: c === -1 ? 'Noise (-1)' : `Cluster ${c}`,
              })),
            ]}
          />
        )}
        <Select
          label="Source video filter"
          value={source}
          onChange={(v) => {
            setSource(v)
            setPage(0)
            setSelectedId('')
          }}
          options={[
            { value: 'all', label: 'All sources' },
            ...sources.map((s) => ({ value: s, label: s })),
          ]}
        />
        <Select
          label="Color by"
          value={color}
          onChange={setColor}
          options={[
            'Source membership',
            ...(run.stage === 'clustering' ? ['Cluster'] : []),
          ].map((v) => ({ value: v, label: v }))}
        />
        {run.stage === 'clustering' && (
          <div className="split-toggle">
            <button aria-pressed={!after} onClick={() => setAfter(false)}>
              BEFORE SPLIT
            </button>
            <button
              aria-pressed={after}
              disabled={!split}
              title={!split ? 'No compatible split artifact' : undefined}
              onClick={() => setAfter(true)}
            >
              AFTER SPLIT
            </button>
          </div>
        )}
      </div>
      <Panel
        title={
          run.stage === 'reduction'
            ? 'Persisted reduction coordinates'
            : after
              ? 'Clusters after allocation'
              : 'Clusters before allocation'
        }
        meta={`${points.length} / ${coordinates.length} coordinates · no visual subsampling`}
      >
        {coordinates.length ? (
          <Chart
            renderer="canvas"
            label={`Artifact scatter: ${points.length} persisted coordinates`}
            onSelect={(i) => setSelectedId(points[i]?.contentId ?? '')}
            option={{
              grid: { left: 55, right: 25, top: 30, bottom: 45 },
              tooltip: {
                trigger: 'item',
                renderMode: 'richText',
                formatter: (p: unknown) => {
                  const idx = (p as { dataIndex: number }).dataIndex
                  return points[idx]?.contentId ?? ''
                },
              },
              xAxis: { type: 'value', scale: true, name: 'Dimension 1' },
              yAxis: { type: 'value', scale: true, name: 'Dimension 2' },
              series: [
                {
                  type: 'scatter',
                  symbolSize: 6,
                  progressive: 2000,
                  data: points.map((p) => ({
                    value: [p.x, p.y],
                    itemStyle: { color: pointColor(p.contentId) },
                  })),
                },
              ],
            }}
          />
        ) : (
          <Notice>
            Coordinates were not exported for this run. The explorer does not
            compute or substitute a projection.
          </Notice>
        )}
        <p className="panel-body micro">
          {after ? 'Color: assigned split' : `Color: ${color}`}. Multi-source
          contents retain their full membership set. Axes use persisted values
          without 0–100 normalization. Select a point or use the content table
          below.
        </p>
      </Panel>
      {run.stage === 'clustering' && !split && (
        <Notice>
          AFTER SPLIT unavailable: no compatible cluster-aware split artifact.
        </Notice>
      )}
      <Panel
        title="Content gallery"
        meta="First 6 matching contents; full coverage in the table"
      >
        <div className="gallery">
          {listed.slice(0, 6).map((id) => (
            <button
              key={id}
              className={`gallery-item ${selected?.contentId === id ? 'selected' : ''}`}
              aria-label={`Inspect ${id}`}
              onClick={() => setSelectedId(id)}
            >
              <div className="sample-image">
                <span>Thumbnail unavailable</span>
                <small>ARTIFACT IDENTITY</small>
              </div>
              <span className="mono">{id}</span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel
        title="Content inspection"
        meta="ARTIFACT · thumbnails unavailable"
      >
        <div className="panel-body">
          <label className="select-field">
            <span>Find content alias</span>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </label>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Cluster</th>
                  <th>Medoid</th>
                  <th>Sources</th>
                </tr>
              </thead>
              <tbody>
                {listed.slice(page * 25, page * 25 + 25).map((id) => (
                  <tr key={id}>
                    <td>
                      <button
                        className="row-link"
                        onClick={() => setSelectedId(id)}
                      >
                        {id}
                      </button>
                    </td>
                    <td>{labels.get(id)?.clusterId ?? 'unavailable'}</td>
                    <td>
                      {labels.has(id)
                        ? String(labels.get(id)?.medoid)
                        : 'unavailable'}
                    </td>
                    <td>
                      {[
                        ...new Set(
                          contents
                            .get(id)
                            ?.occurrences.map((o) => o.sourceVideo),
                        ),
                      ].join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            page={page}
            count={listed.length}
            size={25}
            setPage={setPage}
          />
        </div>
      </Panel>
      {selected && (
        <Panel
          title={`Content detail · ${selected.contentId}`}
          meta="No private filenames or thumbnails"
        >
          <div className="panel-body">
            <p>Sequence: unknown. Capture timestamp: unavailable.</p>
            <p>
              Cluster:{' '}
              {labels.get(selected.contentId)?.clusterId ?? 'unavailable'} ·
              split: {allocations.get(selected.contentId) ?? 'unavailable'} ·
              coordinates:{' '}
              {coordinates.find((p) => p.contentId === selected.contentId)?.x ??
                'unavailable'}
              ,{' '}
              {coordinates.find((p) => p.contentId === selected.contentId)?.y ??
                'unavailable'}
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>frame_id</th>
                    <th>content_id</th>
                    <th>embedding_row</th>
                    <th>Source video</th>
                    <th>Sample index</th>
                    <th>Grid seconds</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRows.map((o) => (
                    <tr key={o.frameId}>
                      <td>{o.frameId}</td>
                      <td>{selected.contentId}</td>
                      <td>
                        {featureRows.get(selected.contentId) ?? 'unavailable'}
                      </td>
                      <td>{o.sourceVideo}</td>
                      <td>{o.sampleIndex}</td>
                      <td>{o.gridSeconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Chart
            height={220}
            label="Sampling-grid occurrences by source; not a capture timeline"
            option={{
              grid: { left: 120, right: 30, top: 30, bottom: 40 },
              xAxis: { type: 'value', name: 'Sample index', minInterval: 1 },
              yAxis: {
                type: 'category',
                data: [...new Set(selectedRows.map((o) => o.sourceVideo))],
              },
              series: [
                {
                  type: 'scatter',
                  symbolSize: 10,
                  data: selectedRows.map((o) => [o.sampleIndex, o.sourceVideo]),
                  itemStyle: { color: '#73d9be' },
                },
              ],
            }}
          />
        </Panel>
      )}
    </>
  )
}
