import { useState } from 'react'
import { useSnapshot } from '@/data/provider'
import {
  Panel,
  Select,
  Notice,
  Metrics,
} from '@/components/feedback/Primitives'
import { Status } from '@/components/feedback/Status'
export function Splits() {
  const { data } = useSnapshot()
  const [strategy, setStrategy] = useState('demo-split-2')
  const [after, setAfter] = useState(true)
  if (!data) return null
  const run = data.splits.find((s) => s.id === strategy)!
  const total = Object.values(run.counts).reduce((a, b) => a + b, 0)
  return (
    <>
      <div className="toolbar">
        <Select
          label="Partition strategy"
          value={strategy}
          onChange={setStrategy}
          options={data.splits.map((s) => ({ value: s.id, label: s.strategy }))}
        />
        <div className="split-toggle">
          <button aria-pressed={!after} onClick={() => setAfter(false)}>
            BEFORE SPLIT
          </button>
          <button aria-pressed={after} onClick={() => setAfter(true)}>
            AFTER SPLIT
          </button>
        </div>
      </div>
      <Notice>
        {run.caveat} Historical counts are occurrence-based. Random/content
        preserves exact content, not clusters.
      </Notice>
      <Panel
        title={
          after
            ? `${run.strategy} · split distribution`
            : 'Unassigned groups before split'
        }
        meta="DEMO"
      >
        <div className="panel-body">
          {after ? (
            <>
              <div className="split-bar">
                {Object.entries(run.counts).map(([key, value]) => (
                  <span
                    key={key}
                    style={{ width: `${(value / total) * 100}%` }}
                  >
                    {key} · {value}
                  </span>
                ))}
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Partition</th>
                    <th>Occurrences</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(run.counts).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                      <td>{((value / total) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>
              144 unique contents · 6 clusters + 12 noise singleton groups · no
              split labels applied.
            </p>
          )}
        </div>
      </Panel>
      <Panel
        title="Compare partition strategies"
        meta="DEMO · no scientific ranking"
      >
        <table>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Exact content overlap</th>
              <th>Residual mean NN cosine</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {data.splits.map((s) => (
              <tr key={s.id}>
                <td>
                  <button
                    className="row-link"
                    onClick={() => setStrategy(s.id)}
                  >
                    {s.strategy}
                  </button>
                </td>
                {s.metrics.map((m) => (
                  <td key={m.name}>{m.value}</td>
                ))}
                <td>
                  <Status state={s.verification} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Metrics metrics={run.metrics} />
      <Panel
        title={
          after
            ? 'Group / content assignments'
            : 'Groups available for allocation'
        }
        meta="First 24 contents · DEMO"
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Content ID</th>
                <th>Cluster</th>
                <th>Group ID</th>
                {after && <th>Assigned split(s)</th>}
              </tr>
            </thead>
            <tbody>
              {data.clusterings[0].points.slice(0, 24).map((p) => (
                <tr key={p.contentId}>
                  <td className="mono">{p.contentId}</td>
                  <td>{p.clusterId}</td>
                  <td className="mono">{p.groupId}</td>
                  {after && (
                    <td>
                      {run.assignments
                        .find((a) => a.contentId === p.contentId)
                        ?.splits.join(' + ')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Notice>
        Zero exact overlap does not prove that visual or temporal dependence is
        eliminated. Class distributions are unavailable without a validated
        annotation adapter.
      </Notice>
    </>
  )
}
