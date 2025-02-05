import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Download, RotateCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { ImageDropzone } from './ImageDropzone';
import { ImagePreview } from './ImagePreview';
import { A4Preview } from './A4Preview';
import { ImageData } from '@/types/contact-sheet';

const ContactSheet = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 9) {
      toast.error('Please select up to 9 images only');
      return;
    }

    const newImages = acceptedFiles.map(file => ({
      url: URL.createObjectURL(file),
      rotation: 0,
      scale: 1
    }));

    setImages(prev => {
      const combined = [...prev, ...newImages];
      if (combined.length > 9) {
        toast.error('Maximum 9 images allowed');
        return prev;
      }
      return combined;
    });
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const rotateImage = (index: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, rotation: (img.rotation + 90) % 360 } : img
    ));
  };

  const adjustScale = (index: number, delta: number) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, scale: Math.max(0.1, Math.min(2, img.scale + delta)) } : img
    ));
  };

  const generatePDF = async () => {
    if (images.length === 0) {
      toast.error('Please add some images first');
      return;
    }

    const previewElement = document.getElementById('a4-preview');
    if (!previewElement) return;

    toast.loading('Generating PDF...');

    try {
      const width = orientation === 'portrait' ? 2480 : 3508; // A4 at 300 DPI
      const height = orientation === 'portrait' ? 3508 : 2480;

      const canvas = await html2canvas(previewElement, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        width,
        height,
      });

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, width, height);
      pdf.save('contact-sheet.pdf');
      
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ImageDropzone onDrop={onDrop} />

      {images.length > 0 ? (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Edit Images</h2>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <ImagePreview
                  key={index}
                  image={images[index]}
                  index={index}
                  onRotate={rotateImage}
                  onScale={adjustScale}
                  onRemove={removeImage}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">A4 Preview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleOrientation}
                className="flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                {orientation === 'portrait' ? 'Switch to Landscape' : 'Switch to Portrait'}
              </Button>
            </div>
            <div id="a4-preview">
              <A4Preview images={images} orientation={orientation} />
            </div>
          </div>

          <Button 
            onClick={generatePDF}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as PDF
          </Button>
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          No images selected yet
        </div>
      )}
    </div>
  );
};

export default ContactSheet;