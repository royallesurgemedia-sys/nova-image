import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, style } = await req.json();
    const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

    if (!HF_TOKEN) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Enhance prompt for social media posts with style (English only)
    const socialMediaPrompt = `Create a professional social media post image for a marketing agency. ${prompt}${style && style !== 'Realistic' ? `, ${style.toLowerCase()} style` : ''}. Make it eye-catching, modern, and optimized for Instagram/Facebook. All text must be in English only. Include clear, readable English text if mentioned in the prompt.`;

    console.log('Generating social media post with Hugging Face:', socialMediaPrompt);

    const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: socialMediaPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    // Convert blob to base64
    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode(...chunk);
    }
    const base64Image = btoa(binary);

    console.log('Successfully generated social media post image with Hugging Face');

    return new Response(
      JSON.stringify({ 
        image: `data:image/png;base64,${base64Image}`,
        prompt: socialMediaPrompt,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
