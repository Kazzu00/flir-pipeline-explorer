import { OrganizationEvidenceBundleSchema } from '@/contracts/organization-evidence-v2'
import { organizationClusteringFixture } from './organization-clustering-fixture'

/** Offline infrastructure only. Never installed as a runtime/research snapshot. */
export function organizationEvidenceFixture() {
  const base = organizationClusteringFixture(80)
  // These synthetic occurrences also serve the labeled split explorer. Keep its
  // annotation population consistent with the complete membership tables.
  base.records = base.records.map((record) => ({
    ...record,
    cohort: 'labeled',
    num_objects: record.class_ids?.length ?? 0,
    label_empty: !record.class_ids?.length,
  }))
  base.media = base.media.map((m) => ({
    ...m,
    media_available: false,
    relative_path: null,
    unavailable_reason: 'not_requested' as const,
  }))
  const splits = [0, 1].map((seed) => ({
    strategy: 'synthetic-cluster-aware',
    split_seed: seed,
    split_space_id: `synthetic-split-${seed}`,
    artifact_id: `synthetic-artifact-${seed}`,
    source_strategy: 'cluster_aware',
    cluster_run_id: 'synthetic-run-a',
    partitions: {
      train: { n_records: 81, n_unique_contents: 80 },
      val: { n_records: 1, n_unique_contents: 1 },
      test: { n_records: 1, n_unique_contents: 1 },
    },
    class_support: [],
  }))
  return OrganizationEvidenceBundleSchema.parse({
    ...base,
    manifest: {
      generated_at: '2000-01-01T00:00:00Z',
      source_commit: null,
      source_dirty: false,
      dataset_id: 'synthetic-dataset',
      manifest_sha256: 'synthetic-only',
      plan_id: 'synthetic-plan',
      plan_sha256: 'synthetic-only',
      runtime_freeze_sha256: 'synthetic-only',
      record_count: base.records.length,
      unique_content_count: base.contents.length,
      labeled_record_count: base.records.length,
      labeled_unique_content_count: base.contents.length,
      source_video_count: 1,
      timeline_count: 1,
      split_count: splits.length,
      strategy_count: 1,
      candidate_pair_count: 1,
      clustering_configuration_ids: base.clustering_configurations.map(
        (c) => c.cluster_run_id,
      ),
      evidence_sources: [],
      limitations: [
        'Synthetic offline infrastructure, not a scientific result.',
      ],
      terminology: {},
      file_sha256: {},
    },
    splits,
    split_memberships: splits.flatMap((s) =>
      base.records.map((r) => ({
        strategy: s.strategy,
        split_seed: s.split_seed,
        split_space_id: s.split_space_id,
        record_id: r.record_id,
        content_id: r.content_id,
        partition:
          r.frame_index! < 80
            ? 'train'
            : r.frame_index === 80
              ? s.split_seed === 0
                ? 'val'
                : 'test'
              : s.split_seed === 0
                ? 'test'
                : 'val',
      })),
    ),
    timelines: [
      {
        timeline_id: 'synthetic-timeline',
        source_video_id: 'synthetic-source',
        source_archive: null,
        inferred_family: null,
        temporal_source: 'sampled_video_grid',
        points: base.contents.map((c) => ({
          content_id: c.content_id,
          record_ids: c.record_ids,
          preview_key: c.preview_key,
          frame_index: c.frame_index,
          timestamp_seconds: c.frame_index,
        })),
      },
    ],
    boundary_zones: [
      {
        evidence_artifact_id: 'synthetic-zone-artifact',
        element_id: 'synthetic-zone',
        upstream_timeline_id: 'synthetic-timeline',
        timeline_ids: ['synthetic-timeline'],
        start: 2,
        end: 5,
        decision: 'candidate',
        notes: 'Synthetic inclusive uncertainty interval.',
      },
    ],
    candidate_pairs: [
      {
        evidence_artifact_id: 'synthetic-link-artifact',
        candidate_id: 'synthetic-candidate',
        labeled_content_id: base.contents[0].content_id,
        video_content_id: base.contents[1].content_id,
        clip_cosine: 0.8,
        dinov2_cosine: 0.7,
        clip_rank: 1,
        dinov2_rank: 2,
        clip_topk: true,
        dinov2_topk: true,
        both_topk: true,
        mean_reciprocal_rank: 0.75,
        video_occurrence_count: 1,
        video_sequence_count: 0,
      },
    ],
    linkage_groups: [],
    linkage_memberships: [],
    reviews: [],
  })
}
