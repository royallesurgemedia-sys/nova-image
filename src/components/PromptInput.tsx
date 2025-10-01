import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const PromptInput = ({ value, onChange, disabled, className }: PromptInputProps) => {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-0.5 bg-gradient-ai rounded-xl opacity-30 group-hover:opacity-50 transition-opacity blur-sm" />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Describe the image you want to create..."
        className="relative min-h-[120px] bg-card/80 backdrop-blur-md border-border/50 focus:border-primary resize-none text-base transition-all duration-300"
      />
    </div>
  );
};
