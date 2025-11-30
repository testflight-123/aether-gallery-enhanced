import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ImageEditorProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (blob: Blob) => void;
}

export const ImageEditor = ({ imageUrl, onClose, onSave }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (image && canvasRef.current) {
      applyFilters();
    }
  }, [image, brightness, contrast, saturation, sharpness, rotation, zoom]);

  const applyFilters = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = image.width;
    canvas.height = image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.drawImage(image, 0, 0);

    // Apply sharpness
    if (sharpness > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sharpened = applySharpen(imageData, sharpness / 100);
      ctx.putImageData(sharpened, 0, 0);
    }

    // Restore context state
    ctx.restore();
  };

  const applySharpen = (imageData: ImageData, amount: number): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(width, height);

    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kidx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kidx];
            }
          }
          const idx = (y * width + x) * 4 + c;
          output.data[idx] = Math.min(255, Math.max(0, sum));
        }
        const idx = (y * width + x) * 4 + 3;
        output.data[idx] = data[idx];
      }
    }

    return output;
  };

  const handleSave = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/png');
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-6xl h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Edit Image</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 flex items-center justify-center bg-black/50 rounded-xl overflow-hidden">
            <canvas ref={canvasRef} className="max-w-full max-h-full" />
          </div>

          <div className="w-80 bg-card rounded-xl p-6 overflow-y-auto space-y-6">
            <div>
              <Label className="text-foreground">Brightness</Label>
              <Slider
                value={[brightness]}
                onValueChange={(v) => setBrightness(v[0])}
                min={0}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-foreground">Contrast</Label>
              <Slider
                value={[contrast]}
                onValueChange={(v) => setContrast(v[0])}
                min={0}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-foreground">Saturation</Label>
              <Slider
                value={[saturation]}
                onValueChange={(v) => setSaturation(v[0])}
                min={0}
                max={200}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-foreground">Sharpness</Label>
              <Slider
                value={[sharpness]}
                onValueChange={(v) => setSharpness(v[0])}
                min={0}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRotate} className="flex-1">
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleZoomOut} className="flex-1">
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </Button>
              <Button onClick={handleZoomIn} className="flex-1">
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};