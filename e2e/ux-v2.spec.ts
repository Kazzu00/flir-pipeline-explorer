import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { researchFixture } from '../src/test/research-fixture'
test('runtime V2, sequence evidence, linkage and keyboard disclosure', async ({
  page,
}) => {
  await page.route('**/runtime-config.js', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'window.__FLIR_CONFIG__={dataMode:"real",snapshotUrl:"/runtime/synthetic-v2.json"}',
    }),
  )
  await page.route('**/runtime/synthetic-v2.json', (route) =>
    route.fulfill({ json: researchFixture() }),
  )
  await page.goto('/organization')
  await expect(page.getByText('MIXED', { exact: true })).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Organization stages' })
      .getByRole('link'),
  ).toHaveCount(4)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const details = page.getByRole('button', { name: 'View technical details' })
  await details.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.keyboard.press('Escape')
  await expect(details).toBeFocused()
  await page
    .getByRole('link', { name: 'Sequences & linkage', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: /candidate zone zone-000001/ }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /boundary zone zone-000002/ }),
  ).toBeVisible()
  await page.getByRole('button', { name: /boundary zone zone-000002/ }).click()
  await expect(page.getByText('Bound review', { exact: true })).toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.screenshot({
    path: 'test-results/sequences-v2.png',
    fullPage: true,
  })
  await page
    .getByRole('button', { name: /sequence instance sequence-000002/ })
    .click()
  await expect(
    page.getByText('Bound source-set review', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Cross-dataset linkage', exact: true })
    .click()
  await expect(page.getByText('candidate', { exact: true })).toBeVisible()
  await expect(
    page.getByText(/A candidate line is not a confirmed link/),
  ).toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([])
})
test('legacy redirects and missing temporal evidence', async ({ page }) => {
  for (const [old, destination] of Object.entries({
    dataset: '/organization',
    embeddings: '/organization/explore?view=embeddings',
    similarity: '/organization/explore?view=similarity',
    reduction: '/organization/explore?view=reduction',
    clustering: '/organization/explore?view=clustering',
    groups: '/organization/sequences',
    splits: '/organization/evaluation?view=splits',
    detector: '/organization/evaluation?view=detector',
  })) {
    await page.goto(`/organization/${old}`)
    await expect(page).toHaveURL(
      new RegExp(destination.replace('?', '\\?') + '$'),
    )
  }
  await page.goto('/organization/sequences')
  await expect(
    page.getByRole('heading', { name: 'Sequences: pending' }),
  ).toBeVisible()
})
