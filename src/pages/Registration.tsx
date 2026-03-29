import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Users, CheckCircle, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const Registration: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    age: '',
    familyRelation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login first!');
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: formData.name,
        age: parseInt(formData.age),
        familyRelation: formData.familyRelation,
        role: 'player',
        status: 'pending',
        stats: { wins: 0, losses: 0, points: 0 },
        badges: ['Newbie'],
        appliedAt: new Date().toISOString()
      }, { merge: true });

      setSubmitted(true);
      setTimeout(() => navigate('/profile'), 4000);
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
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-4">Application Sent!</h2>
          <p className="text-zinc-500 mb-8">Your application has been submitted for verification. Only family members are approved.</p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="space-y-8 text-center mb-12">
        <h1 className="text-6xl font-black">
          League <span className="text-blue-600">Registration</span>
        </h1>
      </div>

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
              className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold"
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
              className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold"
              placeholder="Your Age"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Family Relation</label>
            <input
              required
              type="text"
              value={formData.familyRelation}
              onChange={(e) => setFormData({ ...formData, familyRelation: e.target.value })}
              className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 transition-all font-bold"
              placeholder="e.g. Son of Arjun Sharma"
            />
          </div>
        </div>

        <button
          disabled={loading || !user}
          type="submit"
          className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center space-x-2 text-lg"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Join League</span>}
        </button>
        
        {!user && (
          <p className="text-center text-sm text-red-500 font-black uppercase tracking-widest">
            Please login with Google to apply.
          </p>
        )}
      </motion.form>
    </div>
  );
};
