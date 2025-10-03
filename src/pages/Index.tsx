import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { StyleSelector } from "@/components/StyleSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { ImageGrid } from "@/components/ImageGrid";
import { ModeToggle } from "@/components/ModeToggle";
import { SurpriseMeButton } from "@/components/SurpriseMeButton";
import { ScheduleManager } from "@/components/ScheduleManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedImage {
  id: string;
  src: string;
  prompt: string;
}

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your image");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style }
      });

      if (error) throw error;

      if (data?.image) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          src: data.image,
          prompt: data.prompt || prompt,
        };
        setImages(prev => [newImage, ...prev]);
        toast.success("Image generated! Your AI-powered social media post is ready.");
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancePrompt = (enhancedPrompt: string) => {
    setPrompt(enhancedPrompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Social Post Generator
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create stunning social media posts with AI
              </p>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generate" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-8">
            {/* Input Section */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                <PromptInput 
                  value={prompt} 
                  onChange={setPrompt}
                  disabled={isLoading}
                />
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Style
                  </label>
                  <StyleSelector 
                    value={style}
                    onChange={setStyle}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-3">
                  <GenerateButton 
                    onClick={generateImage} 
                    isLoading={isLoading}
                    className="flex-1"
                  />
                  <SurpriseMeButton 
                    currentPrompt={prompt}
                    onEnhance={handleEnhancePrompt}
                    disabled={isLoading}
                  />
                </div>
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
                      Creating your masterpiece...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && images.length > 0 && (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Generated Images ({images.length})
                  </h2>
                </div>
                <ImageGrid images={images} />
              </div>
            )}

            {!isLoading && images.length === 0 && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      No images yet
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Enter a prompt above and click "Generate Image" to create your first AI-powered social media post
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <div className="max-w-4xl mx-auto">
              <ScheduleManager />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
