import { useSearchParams } from 'react-router-dom'
import { useSnapshot } from '@/data/provider'
import { Select, Notice } from '@/components/feedback/Primitives'
import { EmptyArtifactState } from '@/components/research/Evidence'
import { ArtifactStage } from './ArtifactStage'
import { Splits } from './splitting/Splits'
import { DetectionEvaluation } from '@/features/detection/DetectionEvaluation'
export function EvaluationOverview() {
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'splits' ? 'splits' : 'detector'
  const { data } = useSnapshot(view === 'splits')
  return (
    <>
      <div className="toolbar detection-view-selector">
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
      {view === 'detector' ? (
        <DetectionEvaluation />
      ) : data?.leakage ? (
        <ArtifactStage key={view} snapshot={data.leakage} stage={view} />
      ) : (
        <Splits />
      )}
      {view === 'splits' && data?.leakage && (
        <EmptyArtifactState stage="Residual dependency / similarity" />
      )}
      {view === 'splits' && (
        <Notice>
          Historical partitions are not sampled-video partitions. Dataset
          variant differences do not establish causal effects.
        </Notice>
      )}
    </>
  )
}
