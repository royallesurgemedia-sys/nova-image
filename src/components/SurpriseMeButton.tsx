import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SurpriseMeButtonProps {
  currentPrompt: string;
  onEnhance: (enhancedPrompt: string) => void;
  disabled?: boolean;
}

const promptEnhancements = [
  "professional, high-quality, studio lighting, vibrant colors, eye-catching",
  "modern design, clean aesthetic, bold typography, engaging composition",
  "premium look, sleek design, dynamic angle, attention-grabbing",
  "creative layout, trendy style, sharp details, instagram-worthy",
  "polished finish, contemporary vibe, striking visual, social media optimized",
  "artistic flair, sophisticated design, vivid colors, scroll-stopping",
];

export const SurpriseMeButton = ({ currentPrompt, onEnhance, disabled }: SurpriseMeButtonProps) => {
  const enhancePrompt = () => {
    if (!currentPrompt.trim()) return;
    
    const enhancement = promptEnhancements[Math.floor(Math.random() * promptEnhancements.length)];
    const enhancedPrompt = `${currentPrompt}, ${enhancement}`;
    onEnhance(enhancedPrompt);
  };

  return (
    <Button
      onClick={enhancePrompt}
      disabled={disabled || !currentPrompt.trim()}
      variant="outline"
      className="bg-card/80 backdrop-blur-md border-border/50 hover:border-accent hover:bg-accent/10 transition-all duration-300 group h-10 sm:h-auto px-3 sm:px-4 text-xs sm:text-sm"
    >
      <Sparkles className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-accent group-hover:animate-spin" />
      <span className="hidden sm:inline">Enhance Prompt</span>
      <span className="sm:hidden">Enhance</span>
    </Button>
  );
};
