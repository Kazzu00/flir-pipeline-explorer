import { describe, expect, it, vi } from 'vitest'
import {
  CandidateSplitsSchema,
  candidateRuns,
  loadHistoricalSplits,
} from '@/data/split-evidence'
import { organizationEvidenceFixture } from './organization-evidence-fixture'

it('offline browser fixture has complete labeled historical memberships', async () => {
  const bundle = organizationEvidenceFixture()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const resource = String(input).split('/').at(-1)!.replace('.json', '')
      return new Response(
        JSON.stringify(bundle[resource as keyof typeof bundle]),
      )
    }),
  )
  try {
    const result = await loadHistoricalSplits()
    expect(result.runs).toHaveLength(2)
    for (const run of result.runs)
      expect(run.members).toHaveLength(bundle.manifest.labeled_record_count)
    expect(
      bundle.records.every(
        (r) => r.cohort === 'labeled' && r.label_empty !== null,
      ),
    ).toBe(true)
  } finally {
    vi.unstubAllGlobals()
  }
})

function fixture() {
  return {
    schema_version: 'candidate-splits-view-v1',
    test_status: 'PROPOSED',
    ready_for_training: false,
    dataset_id: 'synthetic',
    source_receipt_sha256: 'a'.repeat(64),
    consumed_sha256: {},
    source_commit: 'synthetic',
    source_dirty: true,
    plan_id: 'synthetic',
    blockers: ['review_missing'],
    verification_scope: 'synthetic test',
    records: [0, 1, 2, 3].map((i) => ({
      record_id: `f${i}`,
      content_id: `c${i}`,
      filename: `synthetic-${i}`,
      source: 'synthetic',
      cohort: 'historical',
      class_ids: [0],
      label_sha256: `label${i}`,
    })),
    runs: [0, 1].map((seed) => ({
      id: `r${seed}`,
      membership_id: 'same-membership',
      policy: 'S1',
      population: 'historical',
      seed,
      test_id: 'test',
      state: 'PROVISIONAL_VERIFIED',
      ready_for_training: false,
      members: ['train', 'val', 'test', 'quarantine'].map((partition, i) => ({
        record_id: `f${i}`,
        partition,
        group_id: i < 2 ? `g${i}` : null,
      })),
      metrics: {
        state: 'PROVISIONAL_VERIFIED',
        ready_for_training: false,
        class_support: {
          test: [{ class_id: 0, images: 1, contents: 1, instances: 2 }],
        },
        blockers: ['review_missing'],
      },
    })),
    relations: [
      {
        relation_id: 'candidate',
        left_frame_id: 'f0',
        right_frame_id: 'f1',
        state: 'visual_candidate',
      },
    ],
  }
}

describe('candidate presentation contract', () => {
  it('preserves aliases, reported support, quarantine and missing previews', () => {
    const parsed = CandidateSplitsSchema.parse(fixture())
    const runs = candidateRuns(parsed, new Map([['c0', 'existing.jpg']]))
    expect(runs).toHaveLength(2)
    expect(runs[0].members[0].preview).toBe('existing.jpg')
    expect(runs[0].members[1].preview).toBeNull()
    expect(runs[0].members[3].partition).toBe('quarantine')
    expect(runs[0].support[0].instances).toBe(2)
    expect(runs[0].testStatus).toBe('PROPOSED')
  })
  it('rejects approval claims', () => {
    const data = fixture()
    data.ready_for_training = true
    expect(CandidateSplitsSchema.safeParse(data).success).toBe(false)
  })
  it('rejects unknown references and changed test membership', () => {
    const unknown = fixture()
    unknown.runs[0].members[0].record_id = 'unknown'
    expect(CandidateSplitsSchema.safeParse(unknown).success).toBe(false)
    const changed = fixture()
    changed.runs[1].members[2].partition = 'quarantine'
    expect(CandidateSplitsSchema.safeParse(changed).success).toBe(false)
  })
  it('rejects fractured development groups and exact-content overlap', () => {
    const groups = fixture()
    groups.runs[0].members[1].group_id = 'g0'
    expect(CandidateSplitsSchema.safeParse(groups).success).toBe(false)
    const overlap = fixture()
    overlap.records[1].content_id = 'c0'
    expect(CandidateSplitsSchema.safeParse(overlap).success).toBe(false)
  })
})
