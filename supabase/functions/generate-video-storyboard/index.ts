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
    const { prompt, videoType, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('Generating video storyboard with images for:', prompt, videoType);

    // Generate storyboard plan
    const storyboardPrompt = `Create a detailed video storyboard for ${videoType === 'reel' ? 'a 15-30 second Instagram/TikTok reel' : 'a 60-90 second long-form video'} about: "${prompt}" ${style ? `in ${style} style` : ''}.

Generate a JSON array of 3-5 scenes (reels: 3-4 scenes, long-form: 4-5 scenes).

Each scene should include:
- scene_number: number
- duration: string (e.g., "3-5 seconds")
- description: detailed visual description for image generation
- text_overlay: text to display on screen
- transition: type of transition to next scene
- voiceover: suggested narration text

Return ONLY valid JSON (no markdown):
[
  {
    "scene_number": 1,
    "duration": "3-5 seconds",
    "description": "detailed visual description",
    "text_overlay": "text to show",
    "transition": "fade/slide/zoom",
    "voiceover": "narration text"
  }
]`;

    const storyboardResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: storyboardPrompt
          }
        ]
      }),
    });

    if (!storyboardResponse.ok) {
      const errorText = await storyboardResponse.text();
      console.error('Storyboard generation error:', storyboardResponse.status, errorText);
      throw new Error(`Storyboard generation failed: ${storyboardResponse.status}`);
    }

    const storyboardData = await storyboardResponse.json();
    const storyboardText = storyboardData.choices?.[0]?.message?.content;

    if (!storyboardText) {
      throw new Error('No storyboard returned from AI');
    }

    // Parse storyboard
    let scenes;
    try {
      const cleanedText = storyboardText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      scenes = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse storyboard:', storyboardText);
      throw new Error('Failed to parse storyboard JSON');
    }

    console.log(`Generating ${scenes.length} scene images...`);

    // Generate an image for each scene
    const sceneImages = [];
    for (const scene of scenes) {
      const imagePrompt = `Professional social media video scene: ${scene.description}. 
      
      Create a stunning, high-quality image for video use:
      - Beautiful composition suitable for ${videoType}
      - Professional lighting and colors
      - Space for text overlay at top or bottom
      - ${style ? `${style} style` : 'Modern, eye-catching style'}
      - Optimized for vertical video format (9:16 ratio)
      - High quality, Instagram/TikTok ready`;

      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: imagePrompt
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!imageResponse.ok) {
        console.error(`Failed to generate image for scene ${scene.scene_number}`);
        sceneImages.push({
          ...scene,
          image_url: null,
          error: 'Image generation failed'
        });
        continue;
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      sceneImages.push({
        ...scene,
        image_url: imageUrl || null
      });

      console.log(`Generated image for scene ${scene.scene_number}`);
    }

    console.log('Successfully generated video storyboard with images');

    return new Response(
      JSON.stringify({ 
        videoType,
        totalScenes: sceneImages.length,
        estimatedDuration: videoType === 'reel' ? '15-30 seconds' : '60-90 seconds',
        scenes: sceneImages,
        instructions: `Import these ${sceneImages.length} images into CapCut or your video editor:
1. Add each scene image in sequence
2. Set the duration for each scene as specified
3. Add the text overlays provided
4. Apply the suggested transitions between scenes
5. Add voiceover or background music
6. Export as ${videoType === 'reel' ? '9:16 vertical video for Reels/TikTok' : '16:9 or 9:16 video'}

All images are ready to download and import into your video editor!`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-video-storyboard function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate video storyboard';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
