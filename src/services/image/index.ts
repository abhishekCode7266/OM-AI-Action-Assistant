export interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  style?: 'vivid' | 'natural';
  quality?: 'standard' | 'hd';
}

export interface GeneratedImageResult {
  url: string;
  revisedPrompt?: string;
  createdAt: number;
}

export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImageResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const replicateKey = process.env.REPLICATE_API_TOKEN;

  if (!openaiKey && !replicateKey) {
    throw new Error(
      'Image generation is not configured yet. Add an image-generation provider (such as OPENAI_API_KEY for DALL-E 3 or REPLICATE_API_TOKEN for Flux / SDXL) to your .env file to enable this feature.'
    );
  }

  // 1. OpenAI DALL-E 3
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: options.prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI Image Generation error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const item = data.data?.[0];
    if (!item?.url) {
      throw new Error('No image URL returned by OpenAI DALL-E 3');
    }

    return {
      url: item.url,
      revisedPrompt: item.revised_prompt,
      createdAt: Date.now(),
    };
  }

  // 2. Replicate FLUX.1-schnell
  if (replicateKey) {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${replicateKey}`,
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-schnell',
        input: { prompt: options.prompt },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Replicate error (${res.status}): ${err}`);
    }

    const prediction = await res.json();
    // Poll prediction
    let status = prediction.status;
    let result = prediction;
    while (status !== 'succeeded' && status !== 'failed') {
      await new Promise((r) => setTimeout(r, 1500));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${replicateKey}` },
      });
      result = await pollRes.json();
      status = result.status;
    }

    if (status === 'succeeded' && result.output && result.output[0]) {
      return {
        url: result.output[0],
        createdAt: Date.now(),
      };
    } else {
      throw new Error(`Replicate generation failed: ${result.error || 'Unknown error'}`);
    }
  }

  throw new Error('Image generation provider could not be reached.');
}
