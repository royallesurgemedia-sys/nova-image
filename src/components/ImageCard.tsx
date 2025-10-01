import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  src: string;
  prompt: string;
  className?: string;
}

export const ImageCard = ({ src, prompt, className }: ImageCardProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("group relative animate-fade-in", className)}>
      <div className="absolute -inset-0.5 bg-gradient-ai rounded-2xl opacity-0 group-hover:opacity-60 transition-all duration-300 blur-md" />
      <div className="relative bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={src}
            alt={prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="w-full bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};
