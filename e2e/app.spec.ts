import { expect, test } from '@playwright/test';

test('renders the mobile-first foundation without horizontal overflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Sieh, was deine Kamera sieht/i })).toBeVisible();
  await expect(page.getByText('Bilder bleiben auf diesem Gerät.')).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
