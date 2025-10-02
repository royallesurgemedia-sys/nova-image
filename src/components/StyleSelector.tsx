import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const styles = [
  "Realistic",
  "Modern Minimal",
  "Bold & Vibrant",
  "Professional",
  "Creative Artistic",
  "Clean Corporate",
  "Trendy Instagram",
  "Elegant Luxury",
  "Playful Fun",
  "Geometric Abstract",
];

export const StyleSelector = ({ value, onChange, disabled }: StyleSelectorProps) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-ai rounded-lg opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="relative bg-card/80 backdrop-blur-md border-border/50 focus:border-primary h-12">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Select a style" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50 z-50">
          {styles.map((style) => (
            <SelectItem 
              key={style} 
              value={style}
              className="focus:bg-primary/10 cursor-pointer"
            >
              {style}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
