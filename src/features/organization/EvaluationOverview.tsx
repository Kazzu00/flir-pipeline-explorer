import { useSearchParams } from 'react-router-dom'
import { useSnapshot } from '@/data/provider'
import { Select, Notice } from '@/components/feedback/Primitives'
import { EmptyArtifactState } from '@/components/research/Evidence'
import { ArtifactStage } from './ArtifactStage'
import { Splits } from './splitting/Splits'
import { Detector } from './detector/Detector'
export function EvaluationOverview() {
  const { data } = useSnapshot()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'detector' ? 'detector' : 'splits'
  return (
    <>
      <h2>What consequences does this organization have downstream?</h2>
      <div className="toolbar">
        <Select
          label="Evaluation evidence"
          value={view}
          onChange={(v) => setParams({ view: v })}
          options={[
            { value: 'splits', label: 'Grouping / split' },
            { value: 'detector', label: 'Detector evaluation' },
          ]}
        />
      </div>
      {data?.leakage ? (
        <ArtifactStage key={view} snapshot={data.leakage} stage={view} />
      ) : view === 'splits' ? (
        <Splits />
      ) : (
        <Detector />
      )}
      {data?.leakage && (
        <EmptyArtifactState stage="Residual dependency / similarity" />
      )}
      <Notice>
        Historical partitions are not sampled-video partitions. Dataset variant
        differences do not establish causal effects.
      </Notice>
    </>
  )
}
