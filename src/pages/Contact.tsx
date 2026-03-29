import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-7xl font-black">
          Get in <span className="text-blue-600">Touch</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Email Us</h3>
            <p className="text-xl font-bold break-all">shaheerkhawar287@gmail.com</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Phone className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Call Us</h3>
            <p className="text-xl font-bold">+92 331 8864632</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Venue</h3>
            <p className="text-xl font-bold">House 71, Valleyhomes, Mirpur, Azad Jammu & Kashmir</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 rounded-[4rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-2xl h-[400px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="w-12 h-12 text-zinc-400 mx-auto" />
          <p className="font-bold text-zinc-500">Map View Coming Soon</p>
        </div>
      </div>
    </div>
  );
};
