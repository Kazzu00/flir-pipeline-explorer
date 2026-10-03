import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSnapshot } from '@/data/provider'
import { Select } from '@/components/feedback/Primitives'
import { ArtifactStage } from './ArtifactStage'
import { Embeddings } from './embeddings/Embeddings'
import { Similarity } from './similarity/Similarity'
import { Reduction } from './reduction/Reduction'
import { Clustering } from './clustering/Clustering'
const views = {
  embeddings: Embeddings,
  similarity: Similarity,
  reduction: Reduction,
  clustering: Clustering,
}
export function VisualExplorer() {
  const { data } = useSnapshot()
  const [params, setParams] = useSearchParams()
  const [encoder, setEncoder] = useState('DINOv2')
  const requested = params.get('view') ?? 'reduction'
  const view =
    requested in views ? (requested as keyof typeof views) : 'reduction'
  const Demo = views[view]
  return (
    <>
      <div className="toolbar explorer-toolbar">
        {data?.leakage && (
          <Select
            label="Encoder"
            value={encoder}
            onChange={setEncoder}
            options={['DINOv2', 'CLIP'].map((value) => ({
              value,
              label: value,
            }))}
          />
        )}
        <Select
          label="View"
          value={view}
          onChange={(value) => setParams({ view: value })}
          options={Object.keys(views).map((value) => ({
            value,
            label: value[0].toUpperCase() + value.slice(1),
          }))}
        />
        <span className="muted">Visual similarity ≠ temporal continuity</span>
      </div>
      {data?.leakage ? (
        <ArtifactStage
          key={`${view}-${encoder}`}
          snapshot={data.leakage}
          stage={view}
          encoder={encoder}
        />
      ) : (
        <Demo />
      )}
    </>
  )
}
