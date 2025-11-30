import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Home, Edit2, Trash2, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ImageEditor } from '@/components/ImageEditor';
import { ThreeDViewer } from '@/components/ThreeDViewer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

const Gallery = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (user) {
      loadMedia();
    }
  }, [user]);

  const loadMedia = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(user.id, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      const mediaItems: MediaItem[] = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(`${user.id}/${file.name}`);

        const isVideo = file.name.toLowerCase().match(/\.(mp4|webm|mov)$/);
        
        return {
          id: file.id,
          name: file.name,
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
        };
      });

      setMedia(mediaItems);
    } catch (error: any) {
      toast({
        title: 'Error loading media',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setUploading(true);
    const files = Array.from(e.target.files);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (error) throw error;
      }

      toast({
        title: 'Upload successful',
        description: `${files.length} file(s) uploaded`,
      });

      loadMedia();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([`${user.id}/${item.name}`]);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Media deleted successfully',
      });

      loadMedia();
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
    setDeleteDialog(null);
  };

  if (view === '3d') {
    return <ThreeDViewer media={media.filter(m => m.type === 'image')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="hover:bg-secondary"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-primary hover:opacity-90 shadow-glow text-primary-foreground">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your gallery...</p>
          </div>
        ) : media.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              Your gallery is empty. Upload your first photo or video!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-card cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    {item.type === 'image' && (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMedia(item);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog(item);
                      }}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Media Viewer */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedMedia(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="w-full h-auto rounded-xl"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="w-full h-auto rounded-xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Editor */}
      {editingMedia && (
        <ImageEditor
          imageUrl={editingMedia.url}
          onClose={() => setEditingMedia(null)}
          onSave={async (editedBlob) => {
            if (!user) return;
            
            try {
              const fileExt = editingMedia.name.split('.').pop();
              const fileName = `${Date.now()}_edited.${fileExt}`;
              const filePath = `${user.id}/${fileName}`;

              const { error } = await supabase.storage
                .from('media')
                .upload(filePath, editedBlob);

              if (error) throw error;

              toast({
                title: 'Success',
                description: 'Edited image saved',
              });

              loadMedia();
              setEditingMedia(null);
            } catch (error: any) {
              toast({
                title: 'Save failed',
                description: error.message,
                variant: 'destructive',
              });
            }
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDialog && (
        <ConfirmDialog
          open={!!deleteDialog}
          onOpenChange={(open) => !open && setDeleteDialog(null)}
          title="Delete Media"
          description="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={() => handleDelete(deleteDialog)}
        />
      )}
    </div>
  );
};

export default Gallery;