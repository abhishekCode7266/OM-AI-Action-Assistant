/**
 * OM AI Action Assistant — Production Configuration & API Routing
 * Tagline: "Think. Plan. Act. Achieve."
 * 
 * Provides centralized, secure API routing for GitHub Pages, Vercel Serverless,
 * and Local Python Environments without hardcoding secrets or localhost URLs.
 */

(function(window) {
  'use strict';

  const DEFAULT_VERCEL_API = 'https://om-ai-eight.vercel.app/api';

  function resolveApiBaseUrl() {
    if (typeof window === 'undefined') return '/api';
    
    // 1. User-customized backend URL from settings (if any)
    const custom = localStorage.getItem('om_custom_api_url');
    if (custom && (custom.includes('om-ai-abhishek-ef1f') || custom.includes('om-7s6lf1bi4'))) {
      localStorage.removeItem('om_custom_api_url');
    } else if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }

    // 2. If hosted on GitHub Pages (static), route to production Vercel serverless backend
    if (window.location && window.location.hostname && window.location.hostname.includes('github.io')) {
      return DEFAULT_VERCEL_API;
    }

    // 3. Same-origin deployment (e.g. running on Vercel or local Python server)
    return '/api';
  }

  const OM_CONFIG = {
    VERSION: '3.0.0',
    BRAND: 'OM',
    TAGLINE: 'Think. Plan. Act. Achieve.',
    DEFAULT_VERCEL_API: DEFAULT_VERCEL_API,
    
    getApiBaseUrl: function() {
      return resolveApiBaseUrl();
    },

    getApiUrl: function(endpoint) {
      const base = this.getApiBaseUrl();
      const cleanEndpoint = (endpoint || '').replace(/^\/+/, '');
      if (base.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
        return `${base}/${cleanEndpoint.slice(4)}`;
      }
      return `${base}/${cleanEndpoint}`;
    },

    setCustomApiUrl: function(url) {
      if (url && url.trim().length > 0) {
        localStorage.setItem('om_custom_api_url', url.trim().replace(/\/+$/, ''));
      } else {
        localStorage.removeItem('om_custom_api_url');
      }
    },

    async checkBackendHealth() {
      const url = this.getApiUrl('health');
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          return { online: true, data: data, url: url };
        }
        return { online: false, status: res.status, url: url, error: `HTTP ${res.status}` };
      } catch (err) {
        return { online: false, error: err.message || 'Connection timed out', url: url };
      }
    }
  };

  window.OM_CONFIG = OM_CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);
