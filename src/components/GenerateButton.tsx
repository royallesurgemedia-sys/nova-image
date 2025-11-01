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
        "relative h-10 sm:h-12 px-4 sm:px-8 bg-gradient-ai text-primary-foreground font-semibold overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 text-sm sm:text-base",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      {isLoading ? (
        <>
          <Loader2 className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
          <span className="sm:hidden">Loading...</span>
        </>
      ) : (
        <>
          <Wand2 className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Generate Post</span>
          <span className="sm:hidden">Generate</span>
        </>
      )}
    </Button>
  );
};
