import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, Trophy, Star, Shield, Users, ArrowUpRight } from 'lucide-react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Player {
  id: string;
  name: string;
  skillLevel: string;
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

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || player.skillLevel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="text-5xl font-black mb-4">Players & Teams</h1>
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
              <option>All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </div>

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
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">{player.skillLevel}</span>
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
                  {player.teamId && (
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full text-xs font-bold text-blue-500 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {player.teamId}
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
