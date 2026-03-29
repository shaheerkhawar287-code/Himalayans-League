import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, Plus, Trash2, Edit, Save, X, Activity, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';

export const Admin: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'announcements'>('matches');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<any>({});

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [activeTab, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, activeTab), orderBy(activeTab === 'players' ? 'stats.points' : 'date', 'desc'));
      const querySnapshot = await getDocs(q);
      setData(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, activeTab);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, activeTab), {
        ...newItem,
        date: new Date().toISOString()
      });
      setIsAdding(false);
      setNewItem({});
      loadData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, activeTab);
    }
  };

  const handleDelete = async (id: string) => {
    // In a real app, we'd use a custom modal here. For now, we'll just proceed or use a simpler check.
    try {
      await deleteDoc(doc(db, activeTab, id));
      loadData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${activeTab}/${id}`);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>;
  if (!isAdmin) return <div className="text-center py-24"><h1 className="text-4xl font-black text-red-500">Access Denied</h1><p className="mt-4 text-zinc-500">You must be an admin to view this page.</p></div>;

  return (
    <div className="space-y-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="text-5xl font-black mb-4 flex items-center">
            <Shield className="w-10 h-10 mr-4 text-blue-500" />
            Admin Panel
          </h1>
          <p className="text-xl text-zinc-500">Manage the league, players, and announcements.</p>
        </div>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-2 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          {[
            { id: 'matches', icon: <Calendar className="w-4 h-4" />, label: 'Matches' },
            { id: 'players', icon: <Users className="w-4 h-4" />, label: 'Players' },
            { id: 'announcements', icon: <Activity className="w-4 h-4" />, label: 'News' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 px-6 py-2 rounded-2xl text-sm font-bold transition-all",
                activeTab === tab.id ? "bg-white dark:bg-zinc-800 text-orange-500 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-2xl font-bold capitalize">{activeTab} List</h3>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">Status/Role</th>
                <th className="px-8 py-4">Date/Points</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-400">No items found.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold">{item.name || item.title || `${item.team1Id} vs ${item.team2Id}`}</p>
                      <p className="text-xs text-zinc-500">{item.email || item.content?.substring(0, 50) || 'Match fixture'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        item.status === 'completed' || item.role === 'admin' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {item.status || item.role || 'Active'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold">{item.stats?.points || new Date(item.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
