import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, Download, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';

interface ImageData {
  url: string;
  rotation: number;
  scale: number;
}

const ContactSheet = () => {
  const [images, setImages] = useState<ImageData[]>([]);

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

    const printElement = document.getElementById('print-sheet');
    if (!printElement) return;

    toast.loading('Generating PDF...');

    try {
      // Create a temporary div for PDF generation without UI elements
      const tempDiv = document.createElement('div');
      tempDiv.className = 'grid grid-cols-3 gap-4 p-4';
      tempDiv.style.width = '2480px'; // A4 landscape at 300 DPI
      tempDiv.style.height = '1754px';

      // Add images to the temporary div
      images.forEach((image, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative aspect-square';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.transform = `rotate(${image.rotation}deg) scale(${image.scale})`;
        
        imgContainer.appendChild(img);
        tempDiv.appendChild(imgContainer);
      });

      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 2480,
        height: 1754,
      });

      document.body.removeChild(tempDiv);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [2480, 1754]
      });

      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 2480, 1754);
      pdf.save('contact-sheet.pdf');
      
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 9
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      {images.length > 0 ? (
        <>
          <div id="print-sheet" className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {images[index] ? (
                  <>
                    <img
                      src={images[index].url}
                      alt={`Contact sheet image ${index + 1}`}
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{
                        transform: `rotate(${images[index].rotation}deg) scale(${images[index].scale})`
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => rotateImage(index)}
                        className="p-1 bg-background/80 rounded-full hover:bg-background"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => adjustScale(index, 0.1)}
                        className="p-1 bg-background/80 rounded-full hover:bg-background"
                      >
                        +
                      </button>
                      <button
                        onClick={() => adjustScale(index, -0.1)}
                        className="p-1 bg-background/80 rounded-full hover:bg-background"
                      >
                        -
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
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
            ))}
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