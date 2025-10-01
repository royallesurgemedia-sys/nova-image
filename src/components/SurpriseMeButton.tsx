import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SurpriseMeButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const surprisePrompts = [
  "A futuristic city with flying cars at sunset",
  "A magical forest with glowing mushrooms and fairy lights",
  "An astronaut riding a horse on Mars",
  "A steampunk robot serving tea in a Victorian garden",
  "A crystal palace underwater with colorful fish",
  "A dragon made of clouds soaring through a purple sky",
  "A cyberpunk samurai in neon-lit Tokyo streets",
  "An ancient library filled with floating books and magical orbs",
  "A cosmic whale swimming through a nebula",
  "A miniature city inside a glass bottle on a beach",
];

export const SurpriseMeButton = ({ onClick, disabled }: SurpriseMeButtonProps) => {
  const getRandomPrompt = () => {
    return surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="bg-card/80 backdrop-blur-md border-border/50 hover:border-accent hover:bg-accent/10 transition-all duration-300 group"
    >
      <Sparkles className="mr-2 h-4 w-4 text-accent group-hover:animate-spin" />
      Surprise Me
    </Button>
  );
};

export { surprisePrompts };
