import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('home, module navigation and core clustering interaction', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'One pipeline. Three perspectives.' }),
  ).toBeVisible()
  await page.screenshot({
    path: 'test-results/home-desktop.png',
    fullPage: true,
  })
  await page.getByRole('link', { name: 'Explore module' }).nth(1).click()
  await page
    .getByRole('navigation', { name: 'Organization stages' })
    .getByRole('link', { name: 'Visual exploration', exact: true })
    .click()
  await page.getByLabel('View', { exact: true }).selectOption('clustering')
  await page
    .getByRole('button', { name: 'Cluster 00 · 22', exact: true })
    .click()
  await page.getByRole('button', { name: 'AFTER SPLIT', exact: true }).click()
  await expect(
    page.getByText('Split assignment', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cluster 00 · 22', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.screenshot({
    path: 'test-results/clustering-desktop.png',
    fullPage: true,
  })
  await page.getByRole('button', { name: 'BEFORE SPLIT', exact: true }).click()
  await expect(page.getByText('Split assignment', { exact: true })).toHaveCount(
    0,
  )
  expect(errors).toEqual([])
})
test('split comparison and prediction overlay', async ({ page }) => {
  await page.goto('/organization/splits')
  await expect(
    page.getByLabel('Partition strategy / seed', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('REAL / VERIFIED EXPORT', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: /· split distribution$/ }),
  ).toBeVisible()
  await page.goto('/segmentation/predictions')
  await page.getByLabel('Comparison layout').selectOption('Overlay')
  await page.getByRole('slider', { name: 'Overlay opacity' }).fill('70')
  await expect(
    page.getByText('Illustrative overlay · opacity 70%'),
  ).toBeVisible()
})
test('mobile navigation, keyboard and responsive layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Experiments' })
    .click()
  await expect(page.getByRole('heading', { name: 'Experiments' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true })
  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toBeVisible()
})
test('all primary and stage routes render without runtime errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const route of [
    '/',
    '/preprocessing',
    '/preprocessing/frames',
    '/preprocessing/hud',
    '/preprocessing/inpainting',
    '/preprocessing/denoising',
    '/preprocessing/quality',
    '/organization',
    '/organization/dataset',
    '/organization/embeddings',
    '/organization/similarity',
    '/organization/reduction',
    '/organization/clustering',
    '/organization/sequences',
    '/organization/evaluation',
    '/organization/explore',
    '/organization/groups',
    '/organization/splits',
    '/organization/detector',
    '/segmentation',
    '/segmentation/points',
    '/segmentation/model',
    '/segmentation/training',
    '/segmentation/predictions',
    '/segmentation/evaluation',
    '/experiments',
    '/evaluation',
  ]) {
    await page.goto(route)
    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.getByText('Data could not be validated')).toHaveCount(0)
  }
  expect(errors).toEqual([])
})
test('axe smoke: primary views in both themes', async ({ page }) => {
  for (const route of [
    '/',
    '/organization/clustering',
    '/organization/sequences',
    '/organization/evaluation',
    '/organization/explore',
    '/organization/splits',
    '/segmentation/predictions',
    '/experiments',
  ]) {
    await page.goto(route)
    await expect(page.locator('main h1')).toBeVisible()
    for (const theme of ['dark', 'light']) {
      if (theme === 'light')
        await page
          .getByRole('button', { name: 'Switch to light theme' })
          .click()
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(
        result.violations,
        `${route} ${theme}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([])
      if (theme === 'light')
        await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    }
  }
})
test('desktop widths remain contained', async ({ page }) => {
  for (const width of [1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1080 })
    await page.goto('/organization/clustering')
    await expect(page.locator('main h1')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `width ${width}`,
    ).toBe(true)
  }
})
