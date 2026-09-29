import { NextResponse } from 'next/server';
import { aiProviderManager } from '@/services/ai/manager';

export async function GET() {
  const providers = aiProviderManager.getStatuses();
  return NextResponse.json({
    providers,
    search: {
      tavily: Boolean(process.env.TAVILY_API_KEY),
      serper: Boolean(process.env.SERPER_API_KEY),
    },
    image: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      replicate: Boolean(process.env.REPLICATE_API_TOKEN),
    },
    video: {
      replicate: Boolean(process.env.REPLICATE_API_TOKEN),
      runway: Boolean(process.env.RUNWAY_API_KEY),
    },
    speech: {
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
    },
  });
}
