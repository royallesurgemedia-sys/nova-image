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

    console.log('Checking for scheduled posts to mark as executed...');

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
        // Simply mark the post as executed without posting to any platform
        await supabase
          .from('scheduled_posts')
          .update({ last_run: new Date().toISOString() })
          .eq('id', post.id);

        results.push({
          id: post.id,
          status: 'success',
          message: 'Post marked as executed (no platform posting)'
        });

        console.log(`Successfully marked post ${post.id} as executed`);
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
