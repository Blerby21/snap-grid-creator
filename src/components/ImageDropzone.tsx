import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export const ImageDropzone = ({ onDrop }: ImageDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 9
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "dropzone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-8",
        "hover:border-primary/50 transition-all",
        isDragActive ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium">Drag & drop images here</p>
      <p className="text-sm text-muted-foreground mt-2">
        or click to select files
      </p>
    </div>
  );
};