import { SearchSource } from '@/types';

export interface SearchResponse {
  query: string;
  results: SearchSource[];
  isConfigured: boolean;
  provider: string;
  error?: string;
}

export async function performWebSearch(query: string): Promise<SearchResponse> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const serperKey = process.env.SERPER_API_KEY;

  if (!tavilyKey && !serperKey) {
    return {
      query,
      results: [],
      isConfigured: false,
      provider: 'None',
      error: 'Live web search is not configured. Add TAVILY_API_KEY or SERPER_API_KEY in your .env file to enable live search.',
    };
  }

  // 1. Tavily Search
  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          search_depth: 'advanced',
          include_answer: true,
          max_results: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`Tavily search API error: ${res.statusText}`);
      }

      const data = await res.json();
      const results: SearchSource[] = (data.results || []).map((r: any) => ({
        title: r.title || 'Source',
        url: r.url || '#',
        snippet: r.content || r.snippet || '',
        score: r.score,
      }));

      return {
        query,
        results,
        isConfigured: true,
        provider: 'Tavily AI Search',
      };
    } catch (err: any) {
      console.error('Tavily search failed:', err);
    }
  }

  // 2. Serper Search fallback
  if (serperKey) {
    try {
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query, num: 5 }),
      });

      if (!res.ok) {
        throw new Error(`Serper search error: ${res.statusText}`);
      }

      const data = await res.json();
      const results: SearchSource[] = (data.organic || []).map((r: any) => ({
        title: r.title || 'Source',
        url: r.link || '#',
        snippet: r.snippet || '',
      }));

      return {
        query,
        results,
        isConfigured: true,
        provider: 'Serper (Google Search)',
      };
    } catch (err: any) {
      console.error('Serper search failed:', err);
    }
  }

  return {
    query,
    results: [],
    isConfigured: false,
    provider: 'None',
    error: 'All configured search providers failed to respond. Please check your credentials.',
  };
}
