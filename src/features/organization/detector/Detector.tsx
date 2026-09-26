import { useSnapshot } from '@/data/provider'
import { Panel, Notice, Metrics } from '@/components/feedback/Primitives'
import { Status } from '@/components/feedback/Status'
export function Detector() {
  const { data } = useSnapshot()
  const run = data?.runs.find((r) => r.stage === 'Detector')
  if (!run) return null
  return (
    <>
      <Panel title="Downstream detector protocol" meta="NOT PART OF CLUSTERING">
        <div className="method-flow">
          <div>
            Partition strategy
            <small>Historical / random_content / cluster-aware</small>
          </div>
          <span>→</span>
          <div>
            Controlled detector protocol
            <small>Fixed model · comparable budgets · seeds</small>
          </div>
          <span>→</span>
          <div>
            Evaluation<small>Precision · Recall · mAP</small>
          </div>
        </div>
      </Panel>
      <div className="two-columns">
        <Panel title="Infrastructure pilot">
          <div className="panel-body">
            <Status state="experimental" />
            <p style={{ marginTop: 15 }}>
              The source repository reports small CPU pilots. They establish
              infrastructure behavior and do not establish generalization or a
              winning partition.
            </p>
          </div>
        </Panel>
        <Panel title="Scientific controlled experiment">
          <div className="panel-body">
            <Status state="pending" />
            <p style={{ marginTop: 15 }}>
              Full controlled detector comparison is pending in the inspected
              source status. No final experiment artifacts are connected here.
            </p>
          </div>
        </Panel>
      </div>
      <Panel title="Controlled results" meta="UNAVAILABLE">
        <Metrics metrics={run.metrics} />
      </Panel>
      <Notice>
        {run.caveat} No improvements are inferred from visual separation or
        reduced duplicate overlap.
      </Notice>
    </>
  )
}
