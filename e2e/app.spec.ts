import { expect, test } from '@playwright/test';

test('renders the mobile camera foundation without horizontal overflow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Deine Sicht. Deine Kamera/i })).toBeVisible();
  await expect(page.getByText(/weder hochgeladen noch gespeichert/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Kamera starten/i })).toBeEnabled();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
