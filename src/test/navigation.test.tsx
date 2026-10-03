import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { App } from '@/app/App'
function open(path: string) {
  window.history.replaceState({}, '', path)
  render(<App />)
}
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
    await userEvent.click(screen.getByRole('link', { name: 'Overview' }))
    expect(
      await screen.findByText('What data and analysis are available?'),
    ).toBeVisible()
  })
  it('selects a cluster and preserves it when adding split metadata', async () => {
    open('/organization/clustering')
    await screen.findByRole('heading', { name: 'Visual exploration', level: 1 })
    await userEvent.click(
      await screen.findByRole('button', { name: 'Cluster 00 · 22' }),
    )
    expect(
      screen.getByRole('button', { name: 'Cluster 00 · 22' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Split assignment')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'AFTER SPLIT' }))
    expect(screen.getByText('Split assignment')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Cluster 00 · 22' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await userEvent.selectOptions(
      screen.getByLabelText('Run / encoder / reduction / algorithm'),
      'demo-cluster-hdbscan',
    )
    expect(screen.getByRole('button', { name: 'AFTER SPLIT' })).toBeDisabled()
  })
  it('compares splits and preserves historical overlap disclosure', async () => {
    open('/organization/splits')
    await screen.findByText('Compare partition strategies')
    await userEvent.selectOptions(
      screen.getByLabelText('Partition strategy'),
      'demo-split-0',
    )
    expect(screen.getByText('Historical · split distribution')).toBeVisible()
    expect(screen.getAllByText('train + test').length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'BEFORE SPLIT' }))
    expect(
      screen.queryByRole('columnheader', { name: 'Assigned split(s)' }),
    ).not.toBeInTheDocument()
  })
  it('filters experiments and exposes run metadata', async () => {
    open('/experiments')
    await screen.findByRole('heading', { name: 'Experiments' })
    await userEvent.selectOptions(
      screen.getByLabelText('Module'),
      'segmentation',
    )
    const table = screen.getByRole('table', {
      name: 'Demo experiment registry',
    })
    expect(within(table).getAllByRole('row')).toHaveLength(2)
    await userEvent.click(
      screen.getByRole('button', { name: 'demo-panoptic-01' }),
    )
    expect(screen.getByText('Artifact references')).toBeVisible()
    await userEvent.type(screen.getByRole('searchbox'), 'does-not-exist')
    expect(screen.getByText('No runs match these filters.')).toBeVisible()
  })
})
