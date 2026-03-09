'use client';

import { useEffect } from 'react';

export function TryonServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // no-op: app still works without SW
    });
  }, []);

  return null;
}
