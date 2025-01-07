import React from 'react';
import { ImageData } from '@/types/contact-sheet';

interface A4PreviewProps {
  images: ImageData[];
  orientation: 'portrait' | 'landscape';
}

export const A4Preview = ({ images, orientation }: A4PreviewProps) => {
  // A4 aspect ratio is 1:√2 (approximately 1:1.4142) for portrait
  // For landscape, we invert this ratio
  const aspectRatio = orientation === 'portrait' ? '0.707' : '1.414';
  
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 bg-white shadow-lg">
      <div 
        style={{ aspectRatio }} 
        className="w-full border border-gray-200 p-8 grid grid-cols-3 gap-4"
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="relative aspect-square">
            {images[index] && (
              <img
                src={images[index].url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-contain"
                style={{
                  transform: `rotate(${images[index].rotation}deg) scale(${images[index].scale})`
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};