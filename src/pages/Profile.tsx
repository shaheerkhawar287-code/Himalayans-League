import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Star, Shield, Users, LogOut, Settings, Award, Zap, Heart, ArrowLeft, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

export const Profile: React.FC = () => {
  const { user: currentUser, profile: currentProfile, loading: authLoading } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = !userId || userId === currentUser?.uid;
  const targetId = userId || currentUser?.uid;

  useEffect(() => {
    const fetchProfileAndMatches = async () => {
      if (!targetId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch Profile
        let profileData = null;
        if (isOwnProfile && currentProfile) {
          profileData = currentProfile;
        } else {
          const userDocSnap = await getDoc(doc(db, 'users', targetId));
          if (userDocSnap.exists()) {
            profileData = userDocSnap.data();
          } else {
            const playerDocSnap = await getDoc(doc(db, 'players', targetId));
            if (playerDocSnap.exists()) {
              profileData = playerDocSnap.data();
            }
          }
        }

        if (profileData) {
          setViewedProfile(profileData);
          
          // Fetch Matches
          const matchesRef = collection(db, 'matches');
          const q1 = query(matchesRef, where('player1Id', '==', targetId), orderBy('date', 'desc'));
          const q2 = query(matchesRef, where('player2Id', '==', targetId), orderBy('date', 'desc'));
          
          const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
          const allMatches = [...snap1.docs, ...snap2.docs]
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setMatches(allMatches);
        } else {
          setError('User not found');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `profile_data/${targetId}`);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndMatches();
  }, [targetId, isOwnProfile, currentProfile]);

  if (authLoading || loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 font-bold animate-pulse">Loading Profile...</p>
    </div>
  );
  
  if (error) {
    return (
      <div className="text-center py-24">
        <h1 className="text-4xl font-black">Error</h1>
        <p className="mt-4 text-zinc-500">{error}</p>
        <Link to="/players" className="mt-8 inline-flex items-center text-orange-500 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
        </Link>
      </div>
    );
  }

  const profile = isOwnProfile ? currentProfile : viewedProfile;
  const user = isOwnProfile ? currentUser : { 
    displayName: viewedProfile?.name, 
    photoURL: viewedProfile?.photoUrl,
    email: viewedProfile?.email
  };

  if (!profile && isOwnProfile && !currentUser) {
    return (
      <div className="text-center py-24">
        <h1 className="text-4xl font-black">Not Logged In</h1>
        <p className="mt-4 text-zinc-500">Please login to view your profile.</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold">Go Home</button>
      </div>
    );
  }

  const stats = profile?.stats || { 
    wins: profile?.wins || 0, 
    losses: profile?.losses || 0, 
    points: profile?.points || 0 
  };

  return (
    <div className="space-y-12 py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800 shadow-xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-orange-500 to-blue-600 p-1">
            <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[2.9rem] flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
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

        <div className="flex-1 text-center md:text-left space-y-4 z-10">
          {!isOwnProfile && (
            <Link to="/players" className="inline-flex items-center text-zinc-400 hover:text-orange-500 transition-colors text-sm font-bold mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
            </Link>
          )}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-5xl font-black">{profile?.name || user?.displayName}</h1>
            <span className="px-4 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-full text-xs font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
              {profile?.role || 'Guest'}
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-zinc-500 font-bold">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span>Age: {profile?.age || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Position: {profile?.position || 'N/A'}</span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex flex-col gap-4 w-full md:w-auto z-10">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <motion.div whileHover={{ y: -5 }} className="bg-orange-500 p-8 rounded-[3rem] text-white shadow-xl shadow-orange-500/20">
          <p className="opacity-60 font-bold uppercase tracking-widest text-xs mb-2">Total Points</p>
          <h3 className="text-5xl font-black">{stats.points}</h3>
          <Zap className="w-12 h-12 mt-8 opacity-20" />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl">
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Wins</p>
          <h3 className="text-5xl font-black">{stats.wins}</h3>
          <Trophy className="w-12 h-12 mt-8 text-yellow-500 opacity-20" />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl">
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-2">Losses</p>
          <h3 className="text-5xl font-black">{stats.losses}</h3>
          <Heart className="w-12 h-12 mt-8 text-red-500 opacity-20" />
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-600/20">
          <p className="opacity-60 font-bold uppercase tracking-widest text-xs mb-2">Win Rate</p>
          <h3 className="text-5xl font-black">
            {Math.round((stats.wins / (stats.wins + stats.losses || 1)) * 100)}%
          </h3>
          <Star className="w-12 h-12 mt-8 opacity-20" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Matches Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">Recent Matches</h2>
            <Link to="/matches" className="text-orange-500 font-bold hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {matches.length > 0 ? matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                    match.winnerId === targetId ? "bg-green-100 text-green-600 dark:bg-green-500/10" : "bg-red-100 text-red-600 dark:bg-red-500/10"
                  )}>
                    {match.winnerId === targetId ? 'W' : 'L'}
                  </div>
                  <div>
                    <p className="font-bold">vs {match.player1Id === targetId ? match.player2Name : match.player1Name}</p>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{match.type} • {new Date(match.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">{match.player1Id === targetId ? match.player1Score : match.player2Score} - {match.player1Id === targetId ? match.player2Score : match.player1Score}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 font-bold uppercase tracking-widest">No matches played yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black">Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            {profile?.badges?.map((badge: string, i: number) => (
              <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6 text-orange-500" />
                </div>
                <p className="font-bold text-sm">{badge}</p>
              </div>
            ))}
            {(!profile?.badges || profile.badges.length === 0) && (
              <p className="text-zinc-400 col-span-full py-8 text-center bg-zinc-50 dark:bg-zinc-800 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 font-bold uppercase tracking-widest text-xs">No badges yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
