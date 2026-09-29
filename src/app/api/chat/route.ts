import { NextRequest } from 'next/server';
import { aiProviderManager } from '@/services/ai/manager';
import { AI_MODES } from '@/config/modes';
import { AIModeType } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      mode = 'general',
      provider = 'gemini',
      model,
      customApiKey,
      temperature,
    } = body;

    const modeConfig = AI_MODES[mode as AIModeType] || AI_MODES.general;
    const systemPrompt = modeConfig.systemPrompt;

    // Check provider configuration
    const activeProvider = aiProviderManager.get(provider);
    if (!activeProvider.isConfigured(customApiKey)) {
      return new Response(
        JSON.stringify({
          error: `${activeProvider.name} is not configured yet. Please provide an API key in Settings or add it to your .env file to enable live AI responses.`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await activeProvider.streamChat(
            {
              messages,
              mode: mode as AIModeType,
              systemPrompt,
              model,
              apiKey: customApiKey,
              temperature,
            },
            {
              onChunk: (chunk: string) => {
                const sseData = `data: ${JSON.stringify({ text: chunk })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              },
              onComplete: (fullText: string) => {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                controller.close();
              },
              onError: (err: Error) => {
                const sseErr = `data: ${JSON.stringify({ error: err.message })}\n\n`;
                controller.enqueue(encoder.encode(sseErr));
                controller.close();
              },
            }
          );
        } catch (err: any) {
          const sseErr = `data: ${JSON.stringify({ error: err.message || 'Stream processing failed' })}\n\n`;
          controller.enqueue(encoder.encode(sseErr));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
