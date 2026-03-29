import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Star, Shield, Users, LogOut, Settings, Award, Zap, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

export const Profile: React.FC = () => {
  const { user: currentUser, profile: currentProfile, loading: authLoading } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !userId || userId === currentUser?.uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || userId === currentUser?.uid) {
        setViewedProfile(currentProfile);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First try users collection (for logged in users)
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setViewedProfile(userDocSnap.data());
        } else {
          // Then try players collection (for match-based player profiles)
          const playerDocRef = doc(db, 'players', userId);
          const playerDocSnap = await getDoc(playerDocRef);
          
          if (playerDocSnap.exists()) {
            setViewedProfile(playerDocSnap.data());
          } else {
            setError('User not found');
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users_or_players/${userId}`);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, currentProfile]);

  if (authLoading || loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  
  if (error) {
    return (
      <div className="text-center py-24">
        <h1 className="text-4xl font-black">Error</h1>
        <p className="mt-4 text-zinc-500">{error}</p>
        <Link to="/players" className="mt-8 inline-flex items-center text-blue-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
        </Link>
      </div>
    );
  }

  const profile = isOwnProfile ? currentProfile : viewedProfile;
  const user = isOwnProfile ? currentUser : { 
    displayName: viewedProfile?.name, 
    photoURL: viewedProfile?.photoUrl,
    email: viewedProfile?.email // Note: In a real app, you might want to hide email for public profiles
  };

  if (!profile && isOwnProfile && !currentUser) {
    return (
      <div className="text-center py-24">
        <h1 className="text-4xl font-black">Not Logged In</h1>
        <p className="mt-4 text-zinc-500">Please login to view your profile.</p>
      </div>
    );
  }

  const stats = profile?.stats || { 
    wins: profile?.wins || 0, 
    losses: profile?.losses || 0, 
    points: profile?.points || 0 
  };

  return (
    <div className="space-y-12 py-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800 shadow-xl flex flex-col md:flex-row items-center gap-12">
        <div className="relative">
          <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-orange-500 to-blue-600 p-1">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[2.9rem] flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-20 h-20 text-zinc-300" />
              )}
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 p-4 bg-yellow-500 rounded-3xl shadow-lg border-4 border-white dark:border-zinc-900">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          {!isOwnProfile && (
            <Link to="/players" className="inline-flex items-center text-zinc-400 hover:text-orange-500 transition-colors text-sm font-bold mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
            </Link>
          )}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-5xl font-black">{profile?.name || user?.displayName}</h1>
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full text-xs font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
              {profile?.role || 'Guest'}
            </span>
          </div>
          <p className="text-xl text-zinc-500">{isOwnProfile ? user?.email : 'Family Member'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
              <Shield className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold">{profile?.skillLevel || 'Not Set'}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold">{profile?.teamId || 'No Team'}</span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl font-bold transition-all">
              <Settings className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => { signOut(auth); navigate('/'); }}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-orange-500 p-8 rounded-[3rem] text-white">
          <p className="opacity-60 font-bold uppercase tracking-widest text-xs mb-2">Total Points</p>
          <h3 className="text-5xl font-black">{stats.points}</h3>
          <Zap className="w-12 h-12 mt-8 opacity-20" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800">
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Wins</p>
          <h3 className="text-5xl font-black">{stats.wins}</h3>
          <Trophy className="w-12 h-12 mt-8 text-yellow-500 opacity-20" />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800">
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Losses</p>
          <h3 className="text-5xl font-black">{stats.losses}</h3>
          <Heart className="w-12 h-12 mt-8 text-red-500 opacity-20" />
        </div>
        <div className="bg-blue-600 p-8 rounded-[3rem] text-white">
          <p className="opacity-60 font-bold uppercase tracking-widest text-xs mb-2">Win Rate</p>
          <h3 className="text-5xl font-black">
            {Math.round((stats.wins / (stats.wins + stats.losses || 1)) * 100)}%
          </h3>
          <Star className="w-12 h-12 mt-8 opacity-20" />
        </div>
      </div>


      {/* Badges */}
      <div className="bg-white dark:bg-zinc-900 p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-3xl font-black mb-8">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8">
          {profile?.badges?.map((badge, i) => (
            <div key={i} className="text-center space-y-4 group">
              <div className="aspect-square rounded-3xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-12 h-12 text-orange-500" />
              </div>
              <p className="font-bold text-sm">{badge}</p>
            </div>
          ))}
          {(!profile?.badges || profile.badges.length === 0) && (
            <p className="text-zinc-400 col-span-full text-center py-12">No badges earned yet. Start playing to unlock achievements!</p>
          )}
        </div>
      </div>
    </div>
  );
};
