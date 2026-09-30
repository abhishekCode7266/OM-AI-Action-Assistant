import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/services/image';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, size, style, quality } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Image prompt is required' }, { status: 400 });
    }

    const result = await generateImage({ prompt, size, style, quality });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 400 });
  }
}
