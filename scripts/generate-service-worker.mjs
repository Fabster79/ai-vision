import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const outputDirectory = 'dist';

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : path;
    }),
  );
  return files.flat();
}

const assets = (await filesBelow(outputDirectory))
  .filter((file) => !file.endsWith('service-worker.js'))
  .map((file) => relative(outputDirectory, file).split(sep).join('/'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const cacheName = `pocketvision-${packageJson.version}`;

const source = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const APP_ASSETS = ${JSON.stringify(assets)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name.startsWith('pocketvision-') && name !== CACHE_NAME).map((name) => caches.delete(name))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isRuntimeVisionAsset = /\\.(?:tflite|wasm|mjs)$/.test(url.pathname);
  if (isRuntimeVisionAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok || response.type === 'opaque') await cache.put(event.request, response.clone());
        return response;
      }),
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(async () => (await caches.match(event.request)) || (await caches.match('index.html'))),
  );
});
`;

await writeFile(join(outputDirectory, 'service-worker.js'), source);
