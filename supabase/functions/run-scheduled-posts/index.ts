import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ayrshareApiKey = Deno.env.get('AYRSHARE_API_KEY');
    
    if (!ayrshareApiKey) {
      console.error('AYRSHARE_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Ayrshare API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking for scheduled posts to run...');

    // Get active scheduled posts that should run now
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('is_active', true)
      .lte('schedule_time', new Date().toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${scheduledPosts?.length || 0} posts to process`);

    const results = [];
    for (const post of scheduledPosts || []) {
      try {
        console.log(`Processing post ${post.id}:`, { prompt: post.prompt, platforms: post.platforms });

        // Prepare platforms array (Ayrshare expects lowercase platform names)
        const platformMap: { [key: string]: string } = {
          'instagram': 'instagram',
          'facebook': 'facebook', 
          'twitter': 'twitter',
          'linkedin': 'linkedin'
        };
        
        const platforms = post.platforms?.map((p: string) => platformMap[p.toLowerCase()] || p.toLowerCase()) || [];

        if (platforms.length === 0) {
          throw new Error('No platforms specified for post');
        }

        // Post to Ayrshare
        console.log('Posting to Ayrshare:', { platforms, hasImage: !!post.image_url });
        const ayrshareResponse = await fetch('https://app.ayrshare.com/api/post', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ayrshareApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post: post.caption || post.prompt,
            platforms: platforms,
            mediaUrls: post.image_url ? [post.image_url] : undefined
          })
        });

        const ayrshareData = await ayrshareResponse.json();
        
        if (!ayrshareResponse.ok) {
          throw new Error(`Ayrshare API error: ${JSON.stringify(ayrshareData)}`);
        }

        console.log(`Successfully posted to Ayrshare for post ${post.id}:`, ayrshareData);

        // Update last_run timestamp
        await supabase
          .from('scheduled_posts')
          .update({ last_run: new Date().toISOString() })
          .eq('id', post.id);

        results.push({
          id: post.id,
          status: 'success',
          platforms: platforms,
          ayrshareResponse: ayrshareData
        });

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        results.push({
          id: post.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: results.length,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in run-scheduled-posts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to run scheduled posts';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
