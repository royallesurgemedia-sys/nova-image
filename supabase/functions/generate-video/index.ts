import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, videoType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const duration = videoType === 'reel' ? '15-60 seconds vertical format' : '1-10 minutes horizontal format';
    
    // Generate a storyboard of key frames for the video using AI
    const storyboardPrompt = `Create a detailed storyboard for a professional social media video about: ${prompt}
    
Format: ${duration}
Platform: ${videoType === 'reel' ? 'Instagram Reels, TikTok (9:16 aspect ratio)' : 'YouTube, Facebook (16:9 aspect ratio)'}

Provide a JSON response with this structure:
{
  "title": "Video title",
  "description": "Brief description",
  "keyFrames": [
    {
      "timestamp": "0:00-0:03",
      "scene": "Opening scene description with visual details",
      "text": "Any text overlay"
    }
  ],
  "transitions": ["transition style between scenes"],
  "music": "suggested background music mood"
}`;

    console.log('Generating video storyboard with Lovable AI');

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
            role: 'system',
            content: 'You are a professional video director and storyboard artist. Create detailed, visually compelling video concepts.'
          },
          {
            role: 'user',
            content: storyboardPrompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`Video storyboard generation failed: ${response.status}`);
    }

    const data = await response.json();
    const storyboardText = data.choices?.[0]?.message?.content;

    if (!storyboardText) {
      throw new Error('No storyboard generated');
    }

    console.log('Successfully generated video storyboard');

    // Note: True video generation requires specialized APIs like Runway, Pika, or similar
    // For now, we return the storyboard and a sample video
    // In production, you would integrate with a proper video generation API
    
    return new Response(
      JSON.stringify({ 
        videoUrl: videoType === 'reel' 
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        storyboard: storyboardText,
        prompt: prompt,
        videoType: videoType,
        note: 'This is a sample video. Video storyboard has been generated. For actual video generation, integration with services like Runway ML, Pika, or similar would be needed.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-video function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate video';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
