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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Enhance prompt for social media posts with style (English only, professional design)
    const socialMediaPrompt = `You are a professional AI graphic designer specialized in creating social media posters for marketing agencies. Generate a high-quality, realistic poster for ${prompt}${style && style !== 'Realistic' ? ` in ${style.toLowerCase()} style` : ''}. 

Requirements:
- All text must be perfectly spelled, grammatically correct English
- Use clean, modern, professional fonts
- Text must be clearly readable and properly aligned
- Make it eye-catching, modern, and optimized for Instagram/Facebook
- No gibberish, no random text, no watermarks
- Layout should look like a professional marketing poster
- Include only the text explicitly mentioned in the prompt
- If complex text is required, ensure accuracy or leave clean space for manual text addition
- Output must look like a finished ad, ready for client use`;

    console.log('Generating social media post with Lovable AI:', socialMediaPrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: socialMediaPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error('No image returned from AI');
    }

    console.log('Successfully generated social media post image with Lovable AI');

    return new Response(
      JSON.stringify({ 
        image: generatedImageUrl,
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
