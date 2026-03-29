import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, Trophy, Star, Shield, Users, ArrowUpRight, Activity } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Player {
  id: string;
  name: string;
  position: string;
  role: string;
  teamId?: string;
  wins: number;
  losses: number;
  points: number;
  badges?: string[];
}

export const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('points', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Player));
      setPlayers(playersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'players');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const topPlayers = players.slice(0, 3);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || player.position === filter;
    return matchesSearch && matchesFilter;
  });

  const positions = ['All', ...new Set(players.map(p => p.position).filter(Boolean))];

  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="text-5xl font-black mb-4">Players</h1>
          <p className="text-xl text-zinc-500">Meet the champions of the Himalayans League.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full sm:w-64 focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl appearance-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Players Section */}
      {!loading && topPlayers.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-black">Top Players</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topPlayers.map((player, index) => (
              <Link key={player.id} to={`/profile/${player.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative p-8 rounded-[3rem] border-2 transition-all hover:-translate-y-2",
                    index === 0 ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-500/5 dark:border-yellow-500/20" :
                    index === 1 ? "bg-zinc-50 border-zinc-200 dark:bg-zinc-500/5 dark:border-zinc-500/20" :
                    "bg-orange-50 border-orange-200 dark:bg-orange-500/5 dark:border-orange-500/20"
                  )}
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border-2 border-inherit flex items-center justify-center font-black text-xl">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-4xl font-black">
                      {player.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{player.name}</h3>
                      <p className="text-orange-500 font-black uppercase tracking-widest text-sm">{player.position}</p>
                    </div>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white">
                      {player.points} <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">pts</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[3rem]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlayers.map((player, index) => (
            <Link
              key={player.id}
              to={`/profile/${player.id}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-6 h-6 text-orange-500" />
                </div>
                
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white text-3xl font-black">
                    {player.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{player.name}</h3>
                    <div className="flex items-center space-x-2 text-zinc-500">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">{player.position}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Wins</p>
                    <p className="text-xl font-black">{player.wins}</p>
                  </div>
                  <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Losses</p>
                    <p className="text-xl font-black">{player.losses}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl">
                    <p className="text-xs font-bold text-orange-400 uppercase mb-1">Points</p>
                    <p className="text-xl font-black text-orange-500">{player.points}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {player.badges?.map((badge, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold text-zinc-500 flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                      {badge}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
