import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Video, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  type: string;
}

const VideoGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [videoType, setVideoType] = useState<"reel" | "long">("reel");
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your video");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: { prompt, videoType }
      });

      if (error) throw error;

      if (data?.videoUrl) {
        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          url: data.videoUrl,
          prompt: prompt,
          type: videoType,
        };
        setVideos(prev => [newVideo, ...prev]);
        toast.success(`${videoType === 'reel' ? 'Reel' : 'Long-form video'} generated successfully!`);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              AI Video Generator
            </h2>
            <p className="text-sm text-muted-foreground">
              Generate reels or long-form videos for your social media accounts
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Video Type
            </label>
            <Select value={videoType} onValueChange={(value: "reel" | "long") => setVideoType(value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reel">Short Reel (15-60s)</SelectItem>
                <SelectItem value="long">Long-form Video (1-10min)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Video Description
            </label>
            <Textarea
              placeholder="Describe the video you want to create... (e.g., 'A dynamic product showcase with transitions and music')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="min-h-[120px] resize-none"
            />
          </div>

          <Button 
            onClick={generateVideo} 
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-400 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Creating your video...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take several minutes
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && videos.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Generated Videos ({videos.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <video 
                  src={video.url} 
                  controls 
                  className="w-full aspect-video"
                  preload="metadata"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {video.type === 'reel' ? 'Reel' : 'Long-form'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = video.url;
                        link.download = `video-${video.id}.mp4`;
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && videos.length === 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
                <Video className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                No videos yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a prompt above and click "Generate Video" to create your first AI-powered video
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGeneration;
