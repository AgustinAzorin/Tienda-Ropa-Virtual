const CACHE_NAME = 'anya-3d-assets-v1';
const MAX_ENTRIES = 60;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function is3DAsset(url) {
  return /\.(gltf|glb|bin)(\?|$)/i.test(url);
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRECACHE_3D' && typeof event.data.url === 'string') {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const req = new Request(event.data.url, { mode: 'cors' });
      const res = await fetch(req);
      if (res.ok) {
        const stamped = new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: new Headers(res.headers),
        });
        stamped.headers.set('x-cached-at', String(Date.now()));
        await cache.put(req, stamped);
        await enforceLimit(cache);
      }
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (!is3DAsset(request.url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      const cachedAt = Number(cached.headers.get('x-cached-at') || 0);
      if (!cachedAt || Date.now() - cachedAt <= MAX_AGE_MS) {
        return cached;
      }
      await cache.delete(request);
    }

    const response = await fetch(request);
    if (response.ok) {
      const stamped = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
      stamped.headers.set('x-cached-at', String(Date.now()));
      await cache.put(request, stamped);
      await enforceLimit(cache);
    }

    return response;
  })());
});

async function enforceLimit(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;

  const entries = await Promise.all(keys.map(async (key) => {
    const res = await cache.match(key);
    const cachedAt = Number(res?.headers.get('x-cached-at') || 0);
    return { key, cachedAt };
  }));

  entries.sort((a, b) => a.cachedAt - b.cachedAt);

  const overflow = entries.length - MAX_ENTRIES;
  for (let i = 0; i < overflow; i += 1) {
    await cache.delete(entries[i].key);
  }
}
