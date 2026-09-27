import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import fixture from '../src/test/fixtures/leakage-synthetic.json' with { type: 'json' }
import {
  largeSyntheticSnapshot,
  withClusteringAndSplit,
} from '../src/test/artifact-fixtures'

test('synthetic artifact flow: MIXED, persisted coordinates, both encoders and missing stages', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('**/runtime/leakage-snapshot.json', (route) =>
    route.fulfill({ json: fixture }),
  )
  await page.goto('/organization/reduction')
  await page.getByLabel('Data mode', { exact: true }).selectOption('real')
  await expect(page.getByText('MIXED', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('img', {
      name: 'Artifact scatter: 3 persisted coordinates',
    }),
  ).toBeVisible()
  await expect(page.locator('canvas').first()).toBeVisible()
  await expect(page.getByText(/coordinates: -4.5, 12/)).toBeVisible()
  await page.getByLabel('Encoder', { exact: true }).selectOption('CLIP')
  await expect(
    page.getByRole('heading', { name: 't-SNE · reduction-000002' }),
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/artifact-reduction.png',
    fullPage: true,
  })
  await expect(
    page.getByText('Sequence: unknown. Capture timestamp: unavailable.'),
  ).toBeVisible()
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze())
      .violations,
  ).toEqual([])
  const nav = page.getByRole('navigation', { name: 'Organization stages' })
  await nav.getByRole('link', { name: 'Clustering', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'clustering: pending' }),
  ).toBeVisible()
  await nav.getByRole('link', { name: 'Splits', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'splits: pending' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'AFTER SPLIT' })).toHaveCount(0)
  await nav.getByRole('link', { name: 'Similarity', exact: true }).click()
  await expect(page.getByText(/Histogram counts are unavailable/)).toBeVisible()
  expect(await page.locator('body').innerText()).not.toMatch(
    /private_person|private-drone|C:\\Users|demo-content/,
  )
  await page.getByLabel('Data mode', { exact: true }).selectOption('demo')
  await expect(page.locator('.demo-bar')).toContainText('DEMO')
  expect(errors).toEqual([])
})

test('malformed private snapshot produces a safe recoverable error', async ({
  page,
}) => {
  await page.route('**/runtime/leakage-snapshot.json', (route) =>
    route.fulfill({
      body: '{private C:\\Users\\secret',
      contentType: 'application/json',
    }),
  )
  await page.goto('/')
  await page.getByLabel('Data mode', { exact: true }).selectOption('real')
  await expect(page.getByRole('alert')).toContainText('snapshot-malformed')
  await expect(page.locator('body')).not.toContainText('secret')
  await page.getByLabel('Data mode', { exact: true }).selectOption('demo')
  await expect(
    page.getByRole('heading', { name: 'One pipeline. Three perspectives.' }),
  ).toBeVisible()
})

test('9000 persisted points use canvas and a bounded content table', async ({
  page,
}) => {
  await page.route('**/runtime/leakage-snapshot.json', (route) =>
    route.fulfill({ json: largeSyntheticSnapshot() }),
  )
  await page.goto('/organization/reduction')
  await page.getByLabel('Data mode', { exact: true }).selectOption('real')
  await expect(
    page.getByRole('img', {
      name: 'Artifact scatter: 9000 persisted coordinates',
    }),
  ).toBeVisible()
  await expect(page.locator('canvas').first()).toBeVisible()
  await page.getByLabel('Find content alias').fill('content-009000')
  await page
    .getByRole('button', { name: 'content-009000', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Content detail · content-009000' }),
  ).toBeVisible()
  expect(await page.locator('tbody tr').count()).toBeLessThan(30)
})

test('real clustering preserves BEFORE/AFTER and disables incompatible allocation', async ({
  page,
}) => {
  const data = withClusteringAndSplit()
  data.runs = data.runs.filter((r) => r.stage !== 'splits')
  await page.route('**/runtime/leakage-snapshot.json', (route) =>
    route.fulfill({ json: data }),
  )
  await page.goto('/organization/clustering')
  await page.getByLabel('Data mode', { exact: true }).selectOption('real')
  await expect(
    page.getByRole('button', { name: 'AFTER SPLIT', exact: true }),
  ).toBeDisabled()
  await page.unroute('**/runtime/leakage-snapshot.json')
  await page.route('**/runtime/leakage-snapshot.json', (route) =>
    route.fulfill({ json: withClusteringAndSplit() }),
  )
  await page.reload()
  await page.getByLabel('Data mode', { exact: true }).selectOption('real')
  await page.getByRole('button', { name: 'AFTER SPLIT', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Clusters after allocation' }),
  ).toBeVisible()
  await page.getByLabel('Cluster filter', { exact: true }).selectOption('-1')
  await expect(
    page.getByRole('img', {
      name: 'Artifact scatter: 1 persisted coordinates',
    }),
  ).toBeVisible()
})
