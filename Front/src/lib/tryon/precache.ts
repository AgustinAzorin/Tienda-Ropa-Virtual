export function precacheTryonModel(url: string) {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  void navigator.serviceWorker.ready
    .then((registration) => {
      if (!registration.active) return;
      registration.active.postMessage({ type: 'PRECACHE_3D', url });
    })
    .catch(() => {
      // silent fail
    });
}
