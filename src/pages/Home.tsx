import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowRight, Activity, Star, Zap, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export const Home: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [latestMatches, setLatestMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch top 4 players
    const qPlayers = query(collection(db, 'players'), orderBy('points', 'desc'), limit(4));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      setTopPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'players');
    });

    // Fetch latest 2 matches
    const qMatches = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(2));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      setLatestMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
      setLoading(false);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, []);

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-2/3 h-full opacity-20 dark:opacity-30">
          <Activity className="w-full h-full text-blue-600 animate-pulse" />
        </div>
        
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-6 py-2 mb-8 text-xs font-black tracking-[0.2em] text-blue-600 uppercase bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20">
              TERM 26-27
            </span>
            <h1 className="text-7xl md:text-9xl font-black leading-[0.9] mb-10 tracking-tighter">
              Himalayans <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                League
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[2rem] transition-all hover:scale-105 shadow-2xl shadow-blue-600/30 text-lg"
              >
                Join League
                <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
              <Link
                to="/players"
                className="inline-flex items-center justify-center px-10 py-5 bg-white dark:bg-zinc-900 border-4 border-zinc-100 dark:border-zinc-800 hover:border-orange-500 text-zinc-900 dark:text-white font-black rounded-[2rem] transition-all text-lg"
              >
                Meet Players
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Players Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-2 block">Leaderboard</span>
            <h2 className="text-5xl font-black tracking-tighter">Top Players</h2>
          </div>
          <Link to="/players" className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-full font-black text-sm uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
            View All Players
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[3rem]" />)
          ) : topPlayers.length > 0 ? (
            topPlayers.map((player, i) => (
              <motion.div 
                key={player.id} 
                whileHover={{ y: -10 }}
                className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border-4 border-zinc-50 dark:border-zinc-800 flex flex-col items-center text-center space-y-4 shadow-xl relative"
              >
                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black text-xl shadow-lg`}>
                  {i + 1}
                </div>
                <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-800 shadow-inner">
                  <img 
                    src={`https://picsum.photos/seed/${player.name}/200`} 
                    alt={player.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-black text-xl tracking-tight">{player.name}</h4>
                  <div className="flex flex-col mt-2">
                    <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">{player.points} Points</p>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{player.wins}W - {player.losses}L</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Star className={`w-6 h-6 ${i === 0 ? 'text-yellow-500' : 'text-zinc-400'} fill-current`} />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="md:col-span-4 text-center py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs">
              No player data available
            </div>
          )}
        </div>
      </section>

      {/* Matches Section */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-2 block">Schedule</span>
            <h2 className="text-5xl font-black tracking-tighter">Latest Matches</h2>
          </div>
          <Link to="/matches" className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
            View Full Schedule
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            [1, 2].map(i => <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[3rem]" />)
          ) : latestMatches.length > 0 ? (
            latestMatches.map((match) => (
              <div key={match.id} className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="font-black text-lg">{match.player1}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Player 1</p>
                </div>
                <div className="px-6 text-center">
                  <p className="text-2xl font-black text-orange-500">{match.score1} - {match.score2}</p>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-full">
                    {match.type}
                  </span>
                </div>
                <div className="text-center flex-1">
                  <p className="font-black text-lg">{match.player2}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Player 2</p>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[4rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800">
              <Activity className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No matches recorded yet</p>
            </div>
          )}
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative py-20 bg-orange-500 rounded-[4rem] overflow-hidden flex flex-col items-center justify-center text-center px-6 shadow-3xl shadow-orange-500/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Ready to Smash?</h2>
        <Link
          to="/register"
          className="px-12 py-6 bg-white text-orange-600 font-black rounded-[2rem] text-xl hover:scale-105 transition-all shadow-2xl"
        >
          Join League
        </Link>
      </section>
    </div>
  );
};
