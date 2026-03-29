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

      {/* Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Performance Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="points" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
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

      {/* Family Rivalry Tracker */}
      <section className="bg-white dark:bg-zinc-900 p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-12">
          <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Family Rivalry Tracker</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { family1: "The Sharmas", family2: "The Thapas", score: "12 - 8", intensity: "High" },
            { family1: "Gurung Clan", family2: "Rai Warriors", score: "5 - 5", intensity: "Extreme" }
          ].map((rivalry, i) => (
            <div key={i} className="p-8 bg-zinc-50 dark:bg-zinc-800 rounded-[3rem] flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="font-black text-xl">{rivalry.family1}</p>
                <p className="text-xs text-zinc-400 uppercase font-bold">Family A</p>
              </div>
              <div className="px-6 text-center">
                <p className="text-2xl font-black text-orange-500">{rivalry.score}</p>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full">
                  {rivalry.intensity}
                </span>
              </div>
              <div className="text-center flex-1">
                <p className="font-black text-xl">{rivalry.family2}</p>
                <p className="text-xs text-zinc-400 uppercase font-bold">Family B</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Player of the Week */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Star className="w-64 h-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest">Player of the Week</span>
            <h2 className="text-5xl font-black uppercase tracking-tight">Arjun शर्मा</h2>
            <div className="flex space-x-4">
              <div className="text-center p-6 bg-white/10 rounded-3xl backdrop-blur-sm">
                <p className="text-4xl font-black">15-0</p>
                <p className="text-xs font-bold uppercase opacity-60">Record</p>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-3xl backdrop-blur-sm">
                <p className="text-4xl font-black">92%</p>
                <p className="text-xs font-bold uppercase opacity-60">Accuracy</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-[3rem] bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30">
              <User className="w-32 h-32" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
