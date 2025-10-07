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

    // Enhanced prompt for high-quality professional social media posts
    const socialMediaPrompt = `You are an expert AI graphic designer for top marketing agencies. Create a stunning, professional-quality social media poster for: ${prompt}${style && style !== 'Realistic' ? ` in ${style.toLowerCase()} style` : ''}

CRITICAL DESIGN REQUIREMENTS:
Visual Excellence:
- Use beautiful gradient backgrounds (purple, pink, gold, blue combinations work well)
- Create depth with layered effects, glows, and soft lighting
- Include professional 3D elements or decorative graphics when appropriate
- Perfect composition with centered or well-balanced layouts
- Add subtle particles, sparkles, or ambient effects for premium feel

Typography:
- Use large, bold, perfectly readable fonts for main text
- Ensure flawless spelling and grammar
- Properly align all text elements
- Create visual hierarchy with font sizes
- Use contrasting colors for text to ensure readability

Professional Touches:
- Include brand name/logo space at top or bottom
- Add social media icons arranged artistically when relevant
- Use professional color schemes (jewel tones, metallics, gradients)
- Create a polished, finished look - ready for immediate posting
- Add calls-to-action or taglines at bottom

Style Guidelines:
- Match the aesthetic quality of premium marketing agencies
- Think: magazine cover quality, not amateur design
- Every element should look intentional and professional
- No watermarks, no gibberish text, no random elements
- Output should look like it cost thousands to produce

The final image should be Instagram/Facebook ready and look like it was created by a professional design studio.`;

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
