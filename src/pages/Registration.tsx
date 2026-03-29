import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Users, CheckCircle, Activity, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const Registration: React.FC = () => {
  const { user, profile, handleLogin, isLoggingIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    age: '',
    position: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('Please login first!');
      return;
    }
    
    setLoading(true);
    try {
      const userData = {
        uid: user.uid,
        name: formData.name,
        age: parseInt(formData.age),
        position: formData.position,
        role: 'player',
        status: 'approved',
        wins: 0,
        losses: 0,
        points: 0,
        badges: ['Newbie'],
        appliedAt: new Date().toISOString()
      };

      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData, { merge: true });

      // Also create/update player document so they show up in players tab
      const playerRef = doc(db, 'players', user.uid);
      await setDoc(playerRef, userData, { merge: true });

      setSubmitted(true);
      setTimeout(() => navigate('/players'), 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl max-w-md"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-4">Welcome to the League!</h2>
          <p className="text-zinc-500 mb-8">Your profile has been created and you are now officially a player.</p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="space-y-8 text-center mb-12">
        <h1 className="text-6xl font-black">
          League <span className="text-orange-500">Registration</span>
        </h1>
        <p className="text-zinc-500 text-lg">Join the most competitive league in the region.</p>
      </div>

      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl text-center space-y-8"
        >
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-10 h-10 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black">Sign in Required</h2>
            <p className="text-zinc-500">Please sign in with your Google account to start your registration.</p>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full py-6 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-3 text-lg"
          >
            {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <LogIn className="w-6 h-6" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/20 transition-all font-bold"
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Age</label>
              <input
                required
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/20 transition-all font-bold"
                placeholder="Your Age"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Position</label>
              <input
                required
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/20 transition-all font-bold"
                placeholder="e.g. Forward, Midfielder, etc."
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-6 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-2 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Complete Registration</span>}
          </button>
        </motion.form>
      )}
    </div>
  );
};
