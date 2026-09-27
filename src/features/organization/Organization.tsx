import { NavLink, useParams, Link } from 'react-router-dom'
import { organizationTabs } from '@/app/navigation'
import { PageTitle, Notice } from '@/components/feedback/Primitives'
import { ModuleOverview } from '@/features/overview/ModuleOverview'
import { Dataset } from './dataset/Dataset'
import { Embeddings } from './embeddings/Embeddings'
import { Similarity } from './similarity/Similarity'
import { Reduction } from './reduction/Reduction'
import { Clustering } from './clustering/Clustering'
import { Splits } from './splitting/Splits'
import { Detector } from './detector/Detector'
import { useSnapshot } from '@/data/provider'
import { ArtifactStage } from './ArtifactStage'
const views: Record<string, React.ComponentType> = {
  dataset: Dataset,
  embeddings: Embeddings,
  similarity: Similarity,
  reduction: Reduction,
  clustering: Clustering,
  groups: Clustering,
  splits: Splits,
  detector: Detector,
}
export function Organization() {
  const { data } = useSnapshot()
  const { stage = '' } = useParams()
  const View = views[stage]
  const title =
    organizationTabs.find(([id]) => id === stage)?.[1] ?? 'Stage unavailable'
  return (
    <>
      <PageTitle
        eyebrow="MODULE 02 / REPRESENTATION & LEAKAGE"
        title={stage ? title : 'Representation & organization'}
        description={
          stage === 'clustering'
            ? 'Inspect related contents before and after allocation. Clusters and splits remain separate.'
            : 'Explore visual relationships, content identities and leakage-aware data partitions.'
        }
      />
      <nav className="tabs-nav" aria-label="Organization stages">
        {organizationTabs.map(([id, name]) => (
          <NavLink end key={id} to={`/organization${id ? `/${id}` : ''}`}>
            {name}
          </NavLink>
        ))}
      </nav>
      {data?.leakage ? (
        <ArtifactStage key={stage} snapshot={data.leakage} stage={stage} />
      ) : View ? (
        <View />
      ) : stage ? (
        <Link to="/organization">Return to module</Link>
      ) : (
        <>
          <ModuleOverview id="organization" />
          <Notice>
            Historical outputs and sampled-video outputs have different
            execution and verification states. This demo does not import either
            dataset.
          </Notice>
          <div className="two-columns">
            <Link className="evaluation-lane" to="/organization/clustering">
              <div>
                <span className="eyebrow">INTERACTIVE EXPLORER</span>
                <h2>Inspect clusters →</h2>
                <p>Scatter · provenance · sampling grid · gallery</p>
              </div>
            </Link>
            <Link className="evaluation-lane" to="/organization/splits">
              <div>
                <span className="eyebrow">COMPARE PARTITIONS</span>
                <h2>Audit split strategies →</h2>
                <p>Historical · random/content · cluster-aware</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </>
  )
}
