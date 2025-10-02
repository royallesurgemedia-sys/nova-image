import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { StyleSelector } from "@/components/StyleSelector";
import { GenerateButton } from "@/components/GenerateButton";
import { ImageGrid } from "@/components/ImageGrid";
import { ModeToggle } from "@/components/ModeToggle";
import { SurpriseMeButton } from "@/components/SurpriseMeButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

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
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your image.",
        variant: "destructive",
      });
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
        toast({
          title: "Image generated!",
          description: "Your AI-generated image is ready.",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancePrompt = (enhancedPrompt: string) => {
    setPrompt(enhancedPrompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-glow-pulse" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-glow-pulse animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-glow-pulse animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-ai rounded-xl">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-ai bg-clip-text text-transparent">
              Social Media Post Generator
            </h1>
          </div>
          <ModeToggle />
        </header>

        {/* Main content */}
        <div className="space-y-8">
          {/* Input section */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-ai rounded-3xl opacity-10 blur-2xl" />
            <div className="relative bg-card/60 backdrop-blur-xl rounded-3xl border border-border/50 p-8 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Create Your Post</h2>
                <p className="text-sm text-muted-foreground">
                  Describe your social media post and let AI create stunning visuals for your agency.
                </p>
              </div>

              <PromptInput
                value={prompt}
                onChange={setPrompt}
                disabled={isLoading}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <StyleSelector
                    value={style}
                    onChange={setStyle}
                    disabled={isLoading}
                  />
                </div>
                <SurpriseMeButton 
                  currentPrompt={prompt}
                  onEnhance={handleEnhancePrompt}
                  disabled={isLoading}
                />
              </div>

              <GenerateButton
                onClick={generateImage}
                isLoading={isLoading}
                disabled={!prompt.trim()}
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          {/* Results section */}
          {images.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h2 className="text-xl font-semibold">Your Creations</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <ImageGrid images={images} />
            </div>
          )}

          {/* Empty state */}
          {images.length === 0 && !isLoading && (
            <div className="text-center py-20 space-y-4">
              <div className="inline-flex p-4 bg-gradient-glow rounded-full mb-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Ready to Create Amazing Posts?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter your post description above and let AI create professional social media content for your agency.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
