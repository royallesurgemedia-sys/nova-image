-- Add columns to store generated content in scheduled_posts
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS generated_image_url TEXT,
ADD COLUMN IF NOT EXISTS caption_instagram TEXT,
ADD COLUMN IF NOT EXISTS caption_facebook TEXT,
ADD COLUMN IF NOT EXISTS caption_twitter TEXT,
ADD COLUMN IF NOT EXISTS caption_linkedin TEXT,
ADD COLUMN IF NOT EXISTS selected_platforms TEXT[] DEFAULT ARRAY['instagram', 'facebook', 'twitter', 'linkedin'];