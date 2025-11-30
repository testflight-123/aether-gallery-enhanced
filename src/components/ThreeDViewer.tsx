import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

interface ThreeDViewerProps {
  media: MediaItem[];
}

interface ImageCubeProps {
  images: string[];
  currentIndex: number;
}

const ImageCube = ({ images, currentIndex }: ImageCubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<THREE.Texture[]>([]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  useState(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures = images.slice(0, 6).map((url) => {
      const texture = loader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    });
    setTextures(loadedTextures);
  });

  if (textures.length === 0) return null;

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <boxGeometry args={[3, 3, 3]} />
      {textures.map((texture, index) => (
        <meshStandardMaterial
          key={index}
          attach={`material-${index}`}
          map={texture}
          side={THREE.FrontSide}
        />
      ))}
    </mesh>
  );
};

const Scene = ({ images, currentIndex }: ImageCubeProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={15}
      />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      <Suspense fallback={null}>
        <ImageCube images={images} currentIndex={currentIndex} />
      </Suspense>

      <gridHelper args={[20, 20, 0x444444, 0x222222]} />
    </>
  );
};

export const ThreeDViewer = ({ media }: ThreeDViewerProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const imageUrls = media.map((m) => m.url);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  if (imageUrls.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">
            No images available for 3D view
          </p>
          <Button onClick={() => navigate('/gallery')}>
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="absolute top-0 left-0 right-0 z-10 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/gallery')}
              className="hover:bg-secondary"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Gallery
            </Button>

            <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              3D Cube View
            </h2>

            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="h-screen pt-20">
        <Canvas shadows>
          <Scene images={imageUrls} currentIndex={currentIndex} />
        </Canvas>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card/80 backdrop-blur-lg rounded-full px-6 py-3 border border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={imageUrls.length <= 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-sm font-medium">
          {currentIndex + 1} / {imageUrls.length}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={imageUrls.length <= 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};