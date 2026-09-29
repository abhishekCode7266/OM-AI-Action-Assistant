export interface VideoGenerationOptions {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface GeneratedVideoResult {
  url: string;
  createdAt: number;
}

export function isVideoGenerationConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN || process.env.RUNWAY_API_KEY);
}

export async function generateVideo(options: VideoGenerationOptions): Promise<GeneratedVideoResult> {
  const replicateKey = process.env.REPLICATE_API_TOKEN;

  if (!replicateKey) {
    throw new Error(
      'Video generation is not configured yet. Add REPLICATE_API_TOKEN or RUNWAY_API_KEY to your environment variables to enable video generation.'
    );
  }

  // Example integration with Replicate video model (e.g., minimax/video-01 or luma/ray)
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${replicateKey}`,
    },
    body: JSON.stringify({
      version: 'minimax/video-01',
      input: {
        prompt: options.prompt,
        aspect_ratio: options.aspectRatio || '16:9',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Video generation error (${res.status}): ${err}`);
  }

  const prediction = await res.json();
  let status = prediction.status;
  let result = prediction;

  while (status !== 'succeeded' && status !== 'failed') {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { Authorization: `Token ${replicateKey}` },
    });
    result = await pollRes.json();
    status = result.status;
  }

  if (status === 'succeeded' && result.output) {
    return {
      url: Array.isArray(result.output) ? result.output[0] : result.output,
      createdAt: Date.now(),
    };
  } else {
    throw new Error(`Video generation failed: ${result.error || 'Timed out or model error'}`);
  }
}
