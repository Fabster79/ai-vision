import { expect, test } from '@playwright/test';

const visionModuleUrl = '**/vision_bundle.mjs';

async function mockVisionAndCamera(page: import('@playwright/test').Page) {
  await page.route(visionModuleUrl, (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      headers: { 'access-control-allow-origin': '*' },
      body: `
        export const FilesetResolver = { forVisionTasks: async () => ({}) };
        export const ObjectDetector = {
          createFromOptions: async () => ({ detectForVideo: () => ({ detections: [] }), close() {} })
        };
      `,
    }),
  );
  await page.addInitScript(() => {
    const stream = new MediaStream();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () => Promise.resolve(stream),
        enumerateDevices: () =>
          Promise.resolve([
            { kind: 'videoinput', deviceId: 'rear', label: 'Back camera', groupId: 'cameras' },
            { kind: 'videoinput', deviceId: 'front', label: 'Front camera', groupId: 'cameras' },
          ]),
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
      configurable: true,
      get: () => HTMLMediaElement.HAVE_ENOUGH_DATA,
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
      configurable: true,
      get: () => 1280,
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
      configurable: true,
      get: () => 720,
    });
    HTMLMediaElement.prototype.play = () => Promise.resolve();
  });
}

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

test('covers camera start, single analysis and live mode with mocked media', async ({ page }) => {
  await mockVisionAndCamera(page);
  await page.goto('/');

  await expect(page.getByText('KI bereit')).toBeVisible();
  await page.getByRole('button', { name: /Kamera starten/i }).click();
  await expect(page.getByText('Kamera aktiv')).toBeVisible();

  await page.getByRole('button', { name: /Einzelanalyse/i }).click();
  await expect(page.getByText(/Letzte gültige Analyse/i)).toBeVisible();

  await page.getByRole('button', { name: /Live starten/i }).click();
  await expect(page.getByText(/Live-Erkennung aktiv/i)).toBeVisible();
  await page.getByRole('button', { name: /Live stoppen/i }).click();
  await expect(page.getByText(/Live-Erkennung aktiv/i)).toBeHidden();
});

test('shows a useful error when camera permission is denied', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')),
        enumerateDevices: () => Promise.resolve([]),
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Kamera starten/i }).click();

  await expect(page.getByText('Kamera nicht verfügbar')).toBeVisible();
  await expect(page.getByText(/Browser-Einstellungen/i).first()).toBeVisible();
});
