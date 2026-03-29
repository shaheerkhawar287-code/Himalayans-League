import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy, Activity, Plus, X, User, Loader2, CheckCircle } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, runTransaction, doc, increment } from 'firebase/firestore';

interface MatchData {
  id: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  type: string;
  createdAt: Timestamp;
  authorUid: string;
}

export const Matches: React.FC = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    player1: '',
    player2: '',
    score1: '',
    score2: '',
    type: 'League Match'
  });

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MatchData[];
      setMatches(matchesData);
      setFetching(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
      setFetching(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      console.error('Please sign in to record a match.');
      return;
    }

    setLoading(true);
    try {
      const score1 = Number(formData.score1);
      const score2 = Number(formData.score2);
      const player1Name = formData.player1.trim();
      const player2Name = formData.player2.trim();

      await runTransaction(db, async (transaction) => {
        // 1. Add the match document
        const matchRef = doc(collection(db, 'matches'));
        transaction.set(matchRef, {
          player1: player1Name,
          player2: player2Name,
          score1: score1,
          score2: score2,
          type: formData.type,
          createdAt: serverTimestamp(),
          authorUid: auth.currentUser?.uid
        });

        // 2. Update Player 1 Stats
        const p1Id = player1Name.toLowerCase().replace(/\s+/g, '-');
        const p1Ref = doc(db, 'players', p1Id);
        const p1Doc = await transaction.get(p1Ref);

        const p1Win = score1 > score2 ? 1 : 0;
        const p1Loss = score1 < score2 ? 1 : 0;
        const p1Points = score1 > score2 ? 3 : (score1 === score2 ? 1 : 0);

        if (!p1Doc.exists()) {
          transaction.set(p1Ref, {
            name: player1Name,
            wins: p1Win,
            losses: p1Loss,
            points: p1Points,
            matches: 1,
            position: 'Player',
            rank: 0,
            winRate: p1Win > 0 ? 100 : 0
          });
        } else {
          const data = p1Doc.data();
          const newWins = (data.wins || 0) + p1Win;
          const newMatches = (data.matches || 0) + 1;
          transaction.update(p1Ref, {
            wins: increment(p1Win),
            losses: increment(p1Loss),
            points: increment(p1Points),
            matches: increment(1),
            winRate: Math.round((newWins / newMatches) * 100)
          });
        }

        // 3. Update Player 2 Stats
        const p2Id = player2Name.toLowerCase().replace(/\s+/g, '-');
        const p2Ref = doc(db, 'players', p2Id);
        const p2Doc = await transaction.get(p2Ref);

        const p2Win = score2 > score1 ? 1 : 0;
        const p2Loss = score2 < score1 ? 1 : 0;
        const p2Points = score2 > score1 ? 3 : (score1 === score2 ? 1 : 0);

        if (!p2Doc.exists()) {
          transaction.set(p2Ref, {
            name: player2Name,
            wins: p2Win,
            losses: p2Loss,
            points: p2Points,
            matches: 1,
            position: 'Player',
            rank: 0,
            winRate: p2Win > 0 ? 100 : 0
          });
        } else {
          const data = p2Doc.data();
          const newWins = (data.wins || 0) + p2Win;
          const newMatches = (data.matches || 0) + 1;
          transaction.update(p2Ref, {
            wins: increment(p2Win),
            losses: increment(p2Loss),
            points: increment(p2Points),
            matches: increment(1),
            winRate: Math.round((newWins / newMatches) * 100)
          });
        }
      });
      
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowAddForm(false);
        setFormData({ player1: '', player2: '', score1: '', score2: '', type: 'League Match' });
      }, 2000);
    } catch (error) {
      setLoading(false);
      handleFirestoreError(error, OperationType.CREATE, 'matches');
    }
  };

  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-7xl font-black uppercase tracking-tighter">
            Match <span className="text-blue-600">Schedule</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">TERM 26-27</p>
        </div>
        
        {auth.currentUser && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
          >
            {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{showAddForm ? 'Close Form' : 'Add Match'}</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {submitted ? (
              <div className="bg-green-500/10 border-2 border-green-500/20 p-12 rounded-[4rem] text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-3xl font-black">Match Recorded!</h2>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-900/50 p-8 md:p-12 rounded-[4rem] border-4 border-zinc-100 dark:border-zinc-800 shadow-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-6 bg-white dark:bg-zinc-800 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Player 1</label>
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="Name"
                      value={formData.player1}
                      onChange={(e) => setFormData({ ...formData, player1: e.target.value })}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl font-bold"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Points</label>
                      <input
                        required
                        type="number"
                        placeholder="0"
                        value={formData.score1}
                        onChange={(e) => setFormData({ ...formData, score1: e.target.value })}
                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-6 bg-white dark:bg-zinc-800 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="w-5 h-5 text-orange-500" />
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Player 2</label>
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="Name"
                      value={formData.player2}
                      onChange={(e) => setFormData({ ...formData, player2: e.target.value })}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl font-bold"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Points</label>
                      <input
                        required
                        type="number"
                        placeholder="0"
                        value={formData.score2}
                        onChange={(e) => setFormData({ ...formData, score2: e.target.value })}
                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Match Type</label>
                  </div>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-6 py-4 bg-white dark:bg-zinc-800 border-none rounded-2xl font-bold appearance-none"
                  >
                    <option>League Match</option>
                    <option>Quarter-Finals</option>
                    <option>Semi-Finals</option>
                    <option>Finals</option>
                    <option>Friendly</option>
                  </select>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center space-x-2 text-lg"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Record Match Result</span>}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8">
        {fetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : matches.length > 0 ? (
          matches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[4rem] border border-zinc-100 dark:border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-8 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Completed
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
                  {match.type}
                </span>
                <div className="flex items-center justify-center md:justify-start space-x-6 mt-4">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 overflow-hidden border-2 border-zinc-50 dark:border-zinc-800">
                      <img src={`https://picsum.photos/seed/${match.player1}/100`} alt={match.player1} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <p className="font-black text-sm">{match.player1}</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-black text-orange-500 tracking-tighter">{match.score1} - {match.score2}</div>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 overflow-hidden border-2 border-zinc-50 dark:border-zinc-800">
                      <img src={`https://picsum.photos/seed/${match.player2}/100`} alt={match.player2} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <p className="font-black text-sm">{match.player2}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
                <div className="space-y-4 text-center md:text-right">
                  <div className="flex items-center justify-center md:justify-end space-x-2 text-zinc-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-bold">
                      {match.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-end space-x-2 text-zinc-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold">
                      {match.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-[4rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800"
          >
            <Activity className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-zinc-400 uppercase tracking-tight">No Matches Scheduled</h3>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">Check back later for upcoming fixtures</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

