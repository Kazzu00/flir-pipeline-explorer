import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'

function open(path: string) {
  window.history.replaceState({}, '', path)
  render(<App />)
}

afterEach(() => vi.unstubAllGlobals())

describe('Research exploration flows', () => {
  it('navigates from the complete pipeline to a module', async () => {
    open('/')

    expect(
      await screen.findByRole('heading', {
        name: 'One pipeline. Three perspectives.',
      }),
    ).toBeVisible()

    const links = screen.getAllByRole('link', { name: /Explore module/ })

    expect(links).toHaveLength(3)

    await userEvent.click(links[1])

    expect(
      await screen.findByRole('heading', {
        name: 'Representation & organization',
        level: 1,
      }),
    ).toBeVisible()

    await userEvent.click(
      screen.getByRole('link', { name: 'Overview' }),
    )

    expect(
      await screen.findByText(
        'What data and analysis are available?',
      ),
    ).toBeVisible()
  })

  it('selects a cluster and preserves it when adding split metadata', async () => {
    open('/organization/clustering')

    await screen.findByRole('heading', {
      name: 'Visual exploration',
      level: 1,
    })

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Cluster 00 · 22',
      }),
    )

    expect(
      screen.getByRole('button', {
        name: 'Cluster 00 · 22',
      }),
    ).toHaveAttribute('aria-pressed', 'true')

    expect(
      screen.queryByText('Split assignment'),
    ).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', {
        name: 'AFTER SPLIT',
      }),
    )

    expect(
      screen.getByText('Split assignment'),
    ).toBeVisible()

    expect(
      screen.getByRole('button', {
        name: 'Cluster 00 · 22',
      }),
    ).toHaveAttribute('aria-pressed', 'true')

    await userEvent.selectOptions(
      screen.getByLabelText(
        'Run / encoder / reduction / algorithm',
      ),
      'demo-cluster-hdbscan',
    )

    expect(
      screen.getByRole('button', {
        name: 'AFTER SPLIT',
      }),
    ).toBeDisabled()
  })

  it('renders exported splits without synthesizing pre-split groups', async () => {
    const splits = [
      {
        strategy: 'C10',
        split_seed: 0,
        split_space_id: 'split-test-c10-seed-0',
        artifact_id: 'artifact-test-split',
        source_strategy: 'cluster_aware' as const,
        cluster_run_id: 'cluster-test',
        partitions: {
          train: {
            n_records: 80,
            n_unique_contents: 70,
          },
          val: {
            n_records: 10,
            n_unique_contents: 9,
          },
          test: {
            n_records: 20,
            n_unique_contents: 18,
          },
        },
        class_support: [],
      },
    ]

    const memberships = [
      {
        strategy: 'C10',
        split_seed: 0,
        split_space_id: 'split-test-c10-seed-0',
        partition: 'train' as const,
        record_id: 'record-000001',
        content_id: 'content-000001',
      },
    ]

    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async (input) => {
        const url = String(input)

        if (url.endsWith('/splits.json')) {
          return new Response(JSON.stringify(splits), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }

        if (url.endsWith('/split_memberships.json')) {
          return new Response(JSON.stringify(memberships), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }

        return new Response('', { status: 404 })
      }),
    )

    open('/organization/splits')

    await screen.findByText(
      'Available partition artifacts',
    )

    expect(
      screen.getByLabelText(
        'Partition strategy / seed',
      ),
    ).toBeVisible()

    expect(
      screen.getByText('REAL / VERIFIED EXPORT'),
    ).toBeVisible()

    await userEvent.click(
      screen.getByRole('button', {
        name: 'BEFORE SPLIT',
      }),
    )

    expect(
      screen.getByText(
        'Grouping context before assignment',
      ),
    ).toBeVisible()

    expect(
      screen.getByText(
        /No DEMO groups are substituted here/,
      ),
    ).toBeVisible()
  })

  it('filters experiments and exposes run metadata', async () => {
    open('/experiments')

    await screen.findByRole('heading', {
      name: 'Experiments',
    })

    await userEvent.selectOptions(
      screen.getByLabelText('Module'),
      'segmentation',
    )

    const table = screen.getByRole('table', {
      name: 'Demo experiment registry',
    })

    expect(
      within(table).getAllByRole('row'),
    ).toHaveLength(2)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'demo-panoptic-01',
      }),
    )

    expect(
      screen.getByText('Artifact references'),
    ).toBeVisible()

    await userEvent.type(
      screen.getByRole('searchbox'),
      'does-not-exist',
    )

    expect(
      screen.getByText(
        'No runs match these filters.',
      ),
    ).toBeVisible()
  })
})