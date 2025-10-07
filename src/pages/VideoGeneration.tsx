import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Video, Download } from "lucide-react";

interface VideoScene {
  scene_number: number;
  duration: string;
  description: string;
  text_overlay: string;
  transition: string;
  voiceover: string;
  image_url: string | null;
  error?: string;
}

interface GeneratedStoryboard {
  id: string;
  videoType: string;
  totalScenes: number;
  estimatedDuration: string;
  scenes: VideoScene[];
  instructions: string;
  prompt: string;
}

const VideoGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [videoType, setVideoType] = useState<"reel" | "long">("reel");
  const [style, setStyle] = useState("Realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStoryboards, setGeneratedStoryboards] = useState<GeneratedStoryboard[]>([]);

  const generateStoryboard = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Generating storyboard with images... This may take a minute");
      
      const { data, error } = await supabase.functions.invoke('generate-video-storyboard', {
        body: { prompt, videoType, style }
      });

      if (error) throw error;

      const newStoryboard: GeneratedStoryboard = {
        id: Date.now().toString(),
        ...data,
        prompt: prompt
      };

      setGeneratedStoryboards(prev => [newStoryboard, ...prev]);
      toast.success(`Storyboard with ${data.totalScenes} scene images generated!`);
      setPrompt("");
    } catch (error) {
      console.error('Error generating storyboard:', error);
      toast.error("Failed to generate storyboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Generate Video Storyboard</h2>
          <p className="text-muted-foreground">Create scene-by-scene images for CapCut video editing</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="video-prompt">Video Prompt</Label>
            <Textarea
              id="video-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video content... (e.g., Product launch announcement, Behind the scenes tour, Customer testimonial)"
              className="min-h-[120px] mt-1"
            />
          </div>

          <div>
            <Label htmlFor="video-type">Video Type</Label>
            <select
              id="video-type"
              value={videoType}
              onChange={(e) => setVideoType(e.target.value as "reel" | "long")}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="reel">Short Reel/TikTok (15-30s, 3-4 scenes)</option>
              <option value="long">Long Form Video (60-90s, 4-5 scenes)</option>
            </select>
          </div>

          <div>
            <Label>Style</Label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="Realistic">Realistic</option>
              <option value="Anime">Anime</option>
              <option value="Cartoon">Cartoon</option>
              <option value="3D">3D Render</option>
              <option value="Minimalist">Minimalist</option>
            </select>
          </div>

          <Button
            onClick={generateStoryboard}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Storyboard...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Generate Storyboard with Images
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedStoryboards.length > 0 ? (
        <div className="space-y-6">
          {generatedStoryboards.map((storyboard) => (
            <Card key={storyboard.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {storyboard.videoType === "reel" ? "Reel Storyboard" : "Long-Form Storyboard"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{storyboard.prompt}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {storyboard.totalScenes} scenes • {storyboard.estimatedDuration}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">📋 Instructions for CapCut/Video Editor:</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{storyboard.instructions}</p>
              </div>
              
              <div className="space-y-6">
                {storyboard.scenes.map((scene) => (
                  <div key={scene.scene_number} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">Scene {scene.scene_number}</h4>
                        <p className="text-xs text-muted-foreground">{scene.duration}</p>
                      </div>
                      {scene.image_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = scene.image_url!;
                            link.download = `scene-${scene.scene_number}.png`;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Scene
                        </Button>
                      )}
                    </div>

                    {scene.image_url ? (
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={scene.image_url}
                          alt={`Scene ${scene.scene_number}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-destructive/10 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-destructive">
                          {scene.error || "Image generation failed"}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">📝 Text Overlay:</span>
                        <p className="text-muted-foreground">{scene.text_overlay}</p>
                      </div>
                      <div>
                        <span className="font-medium">🎬 Description:</span>
                        <p className="text-muted-foreground">{scene.description}</p>
                      </div>
                      <div>
                        <span className="font-medium">🎤 Voiceover:</span>
                        <p className="text-muted-foreground">{scene.voiceover}</p>
                      </div>
                      <div>
                        <span className="font-medium">⚡ Transition:</span>
                        <p className="text-muted-foreground capitalize">{scene.transition}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No storyboards generated yet</h3>
          <p className="text-muted-foreground">
            Create your first video storyboard with scene images for CapCut editing
          </p>
        </Card>
      )}
    </div>
  );
};

export default VideoGeneration;
