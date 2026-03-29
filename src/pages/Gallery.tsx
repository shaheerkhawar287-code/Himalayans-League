import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Plus, X, Heart, MessageCircle, Upload, Loader2, Camera } from 'lucide-react';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  uploaderId: string;
}

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  
  const [newImage, setNewImage] = useState({
    url: '',
    caption: ''
  });

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'gallery');
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login to upload!');
    if (!newImage.url) return alert('Please provide an image URL!');

    setUploading(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        imageUrl: newImage.url,
        caption: newImage.caption,
        date: new Date().toISOString(),
        uploaderId: user.uid
      });
      setIsUploadOpen(false);
      setNewImage({ url: '', caption: '' });
      // Refresh gallery
      const q = query(collection(db, 'gallery'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'gallery');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="text-5xl font-black mb-4">Gallery</h1>
          <p className="text-xl text-zinc-500">Capturing the best moments from the table.</p>
        </div>
        
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center space-x-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Photo</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[3rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-2xl transition-all"
            >
              <img
                src={item.imageUrl}
                alt={item.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
                <p className="text-lg font-bold mb-4">{item.caption}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-bold">24</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-bold">8</span>
                    </button>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] p-8 md:p-12 shadow-2xl relative"
            >
              <button
                onClick={() => setIsUploadOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-black">Share a Moment</h2>
                <p className="text-zinc-500">Upload your best table tennis shots.</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Image URL</label>
                  <div className="relative">
                    <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      required
                      type="url"
                      value={newImage.url}
                      onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Caption</label>
                  <textarea
                    value={newImage.caption}
                    onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                    className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all resize-none h-32"
                    placeholder="Describe the moment..."
                  />
                </div>

                <button
                  disabled={uploading}
                  type="submit"
                  className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2"
                >
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Post to Gallery</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
