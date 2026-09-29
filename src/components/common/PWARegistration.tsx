'use client';

import { useEffect } from 'react';

export const PWARegistration = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('OM PWA Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('OM PWA Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
};
