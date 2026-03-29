import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Calendar, Award, Star, Zap, User, Users, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockChartData = [
  { name: 'Week 1', points: 400 },
  { name: 'Week 2', points: 600 },
  { name: 'Week 3', points: 550 },
  { name: 'Week 4', points: 900 },
  { name: 'Week 5', points: 1100 },
  { name: 'Week 6', points: 1300 },
];

export const Stats: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  useEffect(() => {
    // Listen to players for leaderboard
    const qPlayers = query(collection(db, 'players'), orderBy('points', 'desc'), limit(10));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setTopPlayers(players);
      
      // Calculate total points from all players (simplified)
      const total = players.reduce((acc: number, p: any) => acc + (p.points || 0), 0);
      setTotalPoints(total);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'players');
      setLoading(false);
    });

    // Listen to matches for total count
    const qMatches = query(collection(db, 'matches'));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      setTotalMatches(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, []);

  return (
    <div className="space-y-16 py-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-7xl font-black uppercase tracking-tighter">
          League <span className="text-blue-600">Stats</span>
        </h1>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">TERM 26-27</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-[3rem] text-white shadow-xl shadow-orange-500/20">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
          <p className="text-orange-100 font-bold uppercase tracking-wider text-sm mb-1">Total Points Scored</p>
          <h3 className="text-5xl font-black">{totalPoints.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-wider text-sm mb-1">Active Players</p>
          <h3 className="text-5xl font-black">{topPlayers.length}</h3>
        </div>

        <div className="bg-zinc-900 dark:bg-white p-8 rounded-[3rem] text-white dark:text-zinc-900 shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-white/10 dark:bg-zinc-100 rounded-2xl">
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <p className="opacity-60 font-bold uppercase tracking-wider text-sm mb-1">Matches Played</p>
          <h3 className="text-5xl font-black">{totalMatches.toLocaleString()}</h3>
        </div>
      </div>

      {/* Leaderboard & Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight">Win/Loss Comparison</h3>
            <div className="flex items-center space-x-4 text-xs font-black uppercase tracking-widest">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Wins</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Losses</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {topPlayers.slice(0, 5).map((player, i) => (
              <div key={player.id} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span>{player.name}</span>
                  <span className="text-zinc-400">{player.wins}W - {player.losses}L</span>
                </div>
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(player.wins / (player.wins + player.losses || 1)) * 100}%` }}
                    className="h-full bg-green-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(player.losses / (player.wins + player.losses || 1)) * 100}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight">Leaderboard</h3>
            <span className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold uppercase tracking-widest">Top 10</span>
          </div>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-800 animate-pulse rounded-2xl" />)
            ) : topPlayers.length > 0 ? (
              topPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl hover:scale-[1.02] transition-transform cursor-pointer">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black mr-4",
                    index === 0 ? "bg-yellow-500 text-white" : 
                    index === 1 ? "bg-zinc-300 text-zinc-700" :
                    index === 2 ? "bg-orange-400 text-white" : "bg-zinc-200 dark:bg-zinc-700"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">{player.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-500">{player.points}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">Points</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs">
                No player data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Players Showcase */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-orange-500/30">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Trophy className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">League Elite</span>
            <h2 className="text-5xl font-black uppercase tracking-tight">Top Players of the Season</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topPlayers.slice(0, 3).map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-md p-8 rounded-[3rem] border border-white/20 text-center space-y-6"
              >
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black">
                    {player.name[0]}
                  </div>
                  <div className={cn(
                    "absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-orange-500",
                    i === 0 ? "bg-yellow-500" : i === 1 ? "bg-zinc-300 text-zinc-900" : "bg-orange-400"
                  )}>
                    {i + 1}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black">{player.name}</h3>
                  <p className="text-orange-100 font-bold uppercase tracking-widest text-xs">{player.position || 'Player'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <p className="text-2xl font-black">{player.points}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">Points</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <p className="text-2xl font-black">{player.wins}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">Wins</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
