import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TextPosts = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [captions, setCaptions] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: true,
    facebook: true,
    twitter: true,
    linkedin: true,
  });

  const handleGenerateCaptions = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-captions', {
        body: { prompt }
      });
      if (error) throw error;
      setCaptions(data.captions);
      toast.success("Captions generated!");
    } catch (err) {
      console.error('generate-captions error', err);
      toast.error("Failed to generate captions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    const platforms = Object.entries(selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);

    if (!prompt || !scheduleTime || platforms.length === 0) {
      toast.error("Add a prompt, pick time, select platforms");
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          prompt,
          style: 'TextOnly',
          schedule_time: new Date(scheduleTime).toISOString(),
          generated_image_url: null,
          caption_instagram: captions.instagram,
          caption_facebook: captions.facebook,
          caption_twitter: captions.twitter,
          caption_linkedin: captions.linkedin,
          selected_platforms: platforms,
          is_active: true,
        });
      if (error) throw error;
      toast.success("Text post scheduled!");
      setPrompt("");
      setScheduleTime("");
      setCaptions({ instagram: "", facebook: "", twitter: "", linkedin: "" });
    } catch (err) {
      console.error('schedule text post error', err);
      toast.error("Failed to schedule post");
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Text Posts Generator</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate platform-optimized text-only captions and schedule them.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="text-prompt">Prompt</Label>
          <Input
            id="text-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your post idea..."
            className="mt-1"
          />
        </div>

        <Button onClick={handleGenerateCaptions} disabled={isGenerating || !prompt} className="w-full" variant="outline">
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Captions
            </>
          )}
        </Button>

        <div>
          <Label className="mb-2 block">Select Platforms</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedPlatforms).map(([platform, selected]) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={platform}
                  checked={selected}
                  onCheckedChange={(checked) =>
                    setSelectedPlatforms((prev) => ({ ...prev, [platform]: checked as boolean }))
                  }
                />
                <Label htmlFor={platform} className="capitalize cursor-pointer">
                  {platform}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {Object.entries(captions).map(([platform, caption]) => (
          selectedPlatforms[platform as keyof typeof selectedPlatforms] && (
            <div key={platform}>
              <Label htmlFor={`caption-${platform}`} className="capitalize">
                {platform} Caption
              </Label>
              <Textarea
                id={`caption-${platform}`]
                value={caption}
                onChange={(e) => setCaptions((prev) => ({ ...prev, [platform]: e.target.value }))}
                className="mt-1 min-h-[100px]"
              />
            </div>
          )
        ))}

        <div>
          <Label htmlFor="schedule-time" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Time
          </Label>
          <Input
            id="schedule-time"
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button onClick={handleSchedule} disabled={!scheduleTime} className="w-full">
          <Clock className="w-4 h-4 mr-2" />
          Schedule Text Post
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: Direct auto-posting to social networks requires connecting your accounts. For now, schedule and post manually when notified.
        </p>
      </div>
    </Card>
  );
};

export default TextPosts;
