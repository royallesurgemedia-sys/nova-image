import { Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  src: string;
  prompt: string;
  className?: string;
  onSendToSchedule?: (image: string, prompt: string) => void;
}

export const ImageCard = ({ src, prompt, className, onSendToSchedule }: ImageCardProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToSchedule = () => {
    onSendToSchedule?.(src, prompt);
  };

  return (
    <div className={cn("group relative animate-fade-in", className)}>
      <div className="absolute -inset-0.5 bg-gradient-ai rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-60 transition-all duration-300 blur-md" />
      <div className="relative bg-card/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-border/50 overflow-hidden">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={src}
            alt={prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{prompt}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="flex-1 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs sm:text-sm"
            >
              <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Download
            </Button>
            <Button
              onClick={handleSendToSchedule}
              variant="default"
              size="sm"
              className="flex-1 text-xs sm:text-sm"
            >
              <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
