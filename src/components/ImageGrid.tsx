import { ImageCard } from "./ImageCard";

interface GeneratedImage {
  id: string;
  src: string;
  prompt: string;
}

interface ImageGridProps {
  images: GeneratedImage[];
}

export const ImageGrid = ({ images }: ImageGridProps) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <ImageCard key={image.id} src={image.src} prompt={image.prompt} />
      ))}
    </div>
  );
};
