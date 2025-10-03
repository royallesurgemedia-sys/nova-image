-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a table to store scheduled image generation tasks
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  style TEXT DEFAULT 'Realistic',
  schedule_time TIMESTAMP WITH TIME ZONE NOT NULL,
  cron_expression TEXT,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled posts (public access for now, you can add auth later)
CREATE POLICY "Anyone can view scheduled posts" 
ON public.scheduled_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create scheduled posts" 
ON public.scheduled_posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update scheduled posts" 
ON public.scheduled_posts 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete scheduled posts" 
ON public.scheduled_posts 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_posts_updated_at
BEFORE UPDATE ON public.scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_scheduled_posts_updated_at();