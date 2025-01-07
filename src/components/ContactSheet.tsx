import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';

const ContactSheet = () => {
  const [images, setImages] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 9) {
      toast.error('Please select up to 9 images only');
      return;
    }

    const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
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

  const generatePDF = async () => {
    if (images.length === 0) {
      toast.error('Please add some images first');
      return;
    }

    const element = document.getElementById('contact-sheet');
    if (!element) return;

    toast.loading('Generating PDF...');

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
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
          <div id="contact-sheet" className="image-grid grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {images[index] ? (
                  <>
                    <img
                      src={images[index]}
                      alt={`Contact sheet image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
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