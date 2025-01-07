import React from 'react';
import { X, RotateCw } from 'lucide-react';
import { ImageIcon } from 'lucide-react';
import { ImageData } from '@/types/contact-sheet';

interface ImagePreviewProps {
  image?: ImageData;
  index: number;
  onRotate: (index: number) => void;
  onScale: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}

export const ImagePreview = ({ image, index, onRotate, onScale, onRemove }: ImagePreviewProps) => {
  return (
    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
      {image ? (
        <>
          <img
            src={image.url}
            alt={`Contact sheet image ${index + 1}`}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{
              transform: `rotate(${image.rotation}deg) scale(${image.scale})`
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => onRotate(index)}
              className="p-1 bg-background/80 rounded-full hover:bg-background"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onScale(index, 0.1)}
              className="p-1 bg-background/80 rounded-full hover:bg-background"
            >
              +
            </button>
            <button
              onClick={() => onScale(index, -0.1)}
              className="p-1 bg-background/80 rounded-full hover:bg-background"
            >
              -
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="p-1 bg-background/80 rounded-full hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
};