import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const GenerateButton = ({ onClick, isLoading, disabled, className }: GenerateButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "relative h-12 px-8 bg-gradient-ai text-primary-foreground font-semibold overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-5 w-5" />
          Generate Post
        </>
      )}
    </Button>
  );
};
