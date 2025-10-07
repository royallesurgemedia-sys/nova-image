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

    const captionPrompt = `Create highly engaging, conversion-optimized social media captions for: "${prompt}" ${style && style !== 'Realistic' ? `in ${style} style` : ''}.

Generate 4 platform-specific captions with strategic hashtags:

1. INSTAGRAM (2200 chars max):
   - Hook with emojis in first line
   - Engaging storytelling body
   - Strong call-to-action
   - 8-15 relevant hashtags (mix of popular & niche)
   - Include hashtags like #SocialMediaMarketing #DigitalMarketing #ContentCreator #MarketingStrategy

2. FACEBOOK (500 chars max):
   - Conversational and community-focused
   - Question or engagement hook
   - 2-3 hashtags
   - Encourage comments/shares

3. TWITTER/X (280 chars max):
   - Ultra-concise and punchy
   - Thread-worthy hook
   - 2-3 hashtags max
   - Include trending relevant hashtags

4. LINKEDIN (700 chars max):
   - Professional value proposition
   - Industry insights or lessons
   - 3-5 professional hashtags
   - Network-building tone

CRITICAL: Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "instagram": "caption with emojis and 8-15 hashtags",
  "facebook": "caption with 2-3 hashtags",
  "twitter": "short punchy caption with 2-3 hashtags",
  "linkedin": "professional caption with 3-5 hashtags"
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
