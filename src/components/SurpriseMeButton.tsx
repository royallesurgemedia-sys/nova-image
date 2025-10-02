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
      className="bg-card/80 backdrop-blur-md border-border/50 hover:border-accent hover:bg-accent/10 transition-all duration-300 group"
    >
      <Sparkles className="mr-2 h-4 w-4 text-accent group-hover:animate-spin" />
      Enhance Prompt
    </Button>
  );
};
