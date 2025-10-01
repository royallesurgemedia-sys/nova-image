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
    const apiKey = Deno.env.get('CLIPDROP_API_KEY');

    if (!apiKey) {
      throw new Error('CLIPDROP_API_KEY not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Enhance prompt with style if provided
    const enhancedPrompt = style && style !== 'Realistic' 
      ? `${prompt}, ${style.toLowerCase()} style` 
      : prompt;

    console.log('Generating image with prompt:', enhancedPrompt);

    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);

    const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Clipdrop API error:', response.status, errorText);
      throw new Error(`Clipdrop API error: ${response.status}`);
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return new Response(
      JSON.stringify({ 
        image: `data:image/png;base64,${base64Image}`,
        prompt: enhancedPrompt,
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
