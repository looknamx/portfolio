import { test, expect, type Page } from '@playwright/test';
async function configure(page: Page, username = 'test-developer') {
  await page.route('**/src/config/portfolio.ts', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: (await response.text()).replace(
        /githubUsername:\s*(['"])[^'"]*\1/,
        `githubUsername: ${JSON.stringify(username)}`,
      ),
    });
  });
}
test('unconfigured portfolio, responsive navigation and persistent theme', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await configure(page, 'YOUR_GITHUB_USERNAME');
  await page.goto('/');
  await expect(page.getByText('Your next chapter starts here.')).toBeVisible();
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.getByRole('button', { name: /Switch to .* mode/ }).click();
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme!);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Projects' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Open navigation' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});
test('API error, rate-limit reset and retry recover to live repository UI', async ({
  page,
}) => {
  await configure(page);
  let status = 503;
  await page.route('https://api.github.com/**', (route) => {
    if (status !== 200)
      return route.fulfill({
        status,
        headers:
          status === 403
            ? {
                'x-ratelimit-remaining': '0',
                'x-ratelimit-reset': '1800000000',
                'access-control-expose-headers':
                  'x-ratelimit-remaining, x-ratelimit-reset',
              }
            : {},
        json: { message: 'Error' },
      });
    return route.fulfill({
      json: route.request().url().includes('/repos?')
        ? [
            {
              id: 1,
              name: 'accessible-app',
              description: 'A thoughtful app',
              html_url: 'https://github.com/test-developer/accessible-app',
              homepage: 'https://example.com',
              language: 'TypeScript',
              topics: ['accessibility'],
              stargazers_count: 3,
              forks_count: 1,
              updated_at: '2026-01-01',
              fork: false,
              archived: false,
              license: null,
            },
          ]
        : {
            login: 'test-developer',
            name: 'Test Developer',
            bio: 'Test bio',
            avatar_url: '',
            public_repos: 1,
            followers: 2,
            following: 3,
          },
    });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  status = 403;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Try again after');
  status = 200;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'accessible-app' }),
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Search projects' })
    .fill('not-found');
  await expect(
    page.getByRole('heading', { name: 'No projects found.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'accessible-app' }),
  ).toBeVisible();
});
