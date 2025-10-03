import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StyleSelector } from "./StyleSelector";

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
        <h2 className="text-2xl font-semibold">Schedule Posts</h2>
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
    </Card>
  );
};
