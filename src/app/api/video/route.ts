import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, isVideoGenerationConfigured } from '@/services/video';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    configured: isVideoGenerationConfigured(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, duration, aspectRatio } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Video prompt is required' }, { status: 400 });
    }

    const result = await generateVideo({ prompt, duration, aspectRatio });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Video generation failed' }, { status: 400 });
  }
}
