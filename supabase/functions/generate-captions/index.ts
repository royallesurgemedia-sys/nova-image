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

    console.log('Generating platform-specific captions for:', prompt);

    const captionPrompt = `Generate engaging social media captions for the following post: "${prompt}" ${style && style !== 'Realistic' ? `in ${style} style` : ''}.

Create 4 different captions optimized for each platform:

1. Instagram: Engaging, emoji-rich, with relevant hashtags (max 2200 chars). Use 5-10 strategic hashtags.
2. Facebook: Conversational and community-focused, slightly longer form (max 500 chars). 1-3 hashtags.
3. Twitter/X: Concise, punchy, with 1-2 hashtags (max 280 chars including hashtags).
4. LinkedIn: Professional, value-focused, industry-relevant (max 700 chars). 2-4 professional hashtags.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "instagram": "caption with emojis and hashtags",
  "facebook": "caption with minimal hashtags",
  "twitter": "short punchy caption with hashtags",
  "linkedin": "professional caption with industry hashtags"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: captionPrompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`Caption generation failed: ${response.status}`);
    }

    const data = await response.json();
    const captionsText = data.choices?.[0]?.message?.content;

    if (!captionsText) {
      throw new Error('No captions returned from AI');
    }

    // Parse the JSON response
    let captions;
    try {
      // Remove markdown code blocks if present
      const cleanedText = captionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      captions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse captions JSON:', captionsText);
      throw new Error('Failed to parse generated captions');
    }

    console.log('Successfully generated platform-specific captions');

    return new Response(
      JSON.stringify({ captions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-captions function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate captions';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
