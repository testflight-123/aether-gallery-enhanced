import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Image, Box, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { signOut, username } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const features = [
    {
      icon: Image,
      title: 'Gallery',
      description: 'View and manage your photos and videos',
      action: () => navigate('/gallery'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Box,
      title: '3D View',
      description: 'Experience your photos in 3D',
      action: () => navigate('/gallery?view=3d'),
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AetherGallery
              </h1>
            </motion.div>
            
            <div className="flex items-center gap-3">
              {username && (
                <span className="text-foreground font-medium">
                  {username}
                </span>
              )}
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(true)}
                className="border-border bg-card hover:bg-secondary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to Your Gallery
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Organize, view, and experience your memories in stunning ways
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={feature.action}
                className="w-full p-8 rounded-xl border border-border bg-card hover:bg-secondary transition-all group hover:shadow-glow"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-glow`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Confirm Logout"
        description="Are you sure you want to log out?"
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Home;