import { test as base, expect } from '@playwright/test'
import { organizationEvidenceFixture } from '../src/test/organization-evidence-fixture'

/** Every browser scenario is offline and independent of ignored research mounts. */
export const test = base.extend<{ organizationEvidence: void }>({
  organizationEvidence: [
    async ({ page }, use) => {
      const bundle = organizationEvidenceFixture()
      await page.route('**/runtime/**', (route) =>
        route.fulfill({ status: 404 }),
      )
      await page.route(
        '**/runtime/organization-evidence-v2/*.json',
        (route) => {
          const resource = new URL(route.request().url()).pathname
            .split('/')
            .at(-1)!
            .replace('.json', '')
          if (!Object.hasOwn(bundle, resource))
            return route.fulfill({ status: 404 })
          return route.fulfill({
            json: bundle[resource as keyof typeof bundle],
          })
        },
      )
      await use()
    },
    { auto: true },
  ],
})
export { expect }
