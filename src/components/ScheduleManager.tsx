import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Play, Facebook, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StyleSelector } from "./StyleSelector";

const SOCIAL_MEDIA_ACCOUNTS = {
  twitter: "https://x.com/Royalsurgmedia?t=nC39gcOy_Fbg5tdy-BvaRg&s=09",
  instagram: "https://www.instagram.com/royalle_surge.media?igsh=MWV3NHB5cmtiaGYwcQ==",
  facebook: "https://www.facebook.com/share/1HF6XLPnsX/",
  youtube: "https://youtube.com/@royallesurgemedia?si=PLJyrThd1z75hdU_",
  linkedin: "https://www.linkedin.com/company/royalle-surge-media/",
};

export const ScheduleManager = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    if (!prompt || !scheduleTime) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          prompt,
          style,
          schedule_time: new Date(scheduleTime).toISOString(),
        });

      if (error) throw error;

      toast.success("Post scheduled successfully!");
      setPrompt("");
      setScheduleTime("");
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error("Failed to schedule post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunNow = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-scheduled-posts');
      
      if (error) throw error;

      toast.success(`Processed ${data?.processed || 0} scheduled posts`);
    } catch (error) {
      console.error('Error running scheduled posts:', error);
      toast.error("Failed to run scheduled posts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Schedule Posts - Royal Surge Media</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your social media content</p>
        </div>
        <Button
          onClick={handleRunNow}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Run Scheduled Posts Now
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="schedule-prompt">Prompt</Label>
          <Input
            id="schedule-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="mt-1"
          />
        </div>

        <div>
          <Label>Style</Label>
          <StyleSelector value={style} onChange={setStyle} />
        </div>

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

        <Button
          onClick={handleSchedule}
          disabled={isLoading}
          className="w-full"
        >
          <Clock className="w-4 h-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Royal Surge Media Social Accounts</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open(SOCIAL_MEDIA_ACCOUNTS.twitter, '_blank')}
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open(SOCIAL_MEDIA_ACCOUNTS.instagram, '_blank')}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open(SOCIAL_MEDIA_ACCOUNTS.facebook, '_blank')}
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open(SOCIAL_MEDIA_ACCOUNTS.youtube, '_blank')}
          >
            <Youtube className="w-4 h-4" />
            YouTube
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.open(SOCIAL_MEDIA_ACCOUNTS.linkedin, '_blank')}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          After generating your post, click on these buttons to open your social media accounts and manually post the content.
        </p>
      </div>
    </Card>
  );
};
