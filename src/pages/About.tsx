import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Zap, Trophy, Activity, Star, CheckCircle } from 'lucide-react';

const values = [
  {
    icon: <Users className="w-8 h-8 text-blue-500" />,
    title: "Family First",
    description: "We believe sports are best enjoyed with loved ones. Our league is designed to be inclusive for all family members."
  },
  {
    icon: <Heart className="w-8 h-8 text-red-500" />,
    title: "Community Bonding",
    description: "Building a strong, supportive community is at the heart of everything we do. We're more than just a sports league."
  },
  {
    icon: <Zap className="w-8 h-8 text-orange-500" />,
    title: "Skill Growth",
    description: "Whether you're picking up a paddle for the first time or you're a seasoned pro, we help you reach your full potential."
  }
];

export const About: React.FC = () => {
  return (
    <div className="space-y-24 py-12">
      {/* Introduction */}
      <section className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8">
            What is <br />
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Himalayans League?
            </span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Founded in 2024, the Himalayans League is a community-driven table tennis platform dedicated to bringing families and amateur players together. We combine the thrill of competition with the warmth of a community.
          </p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {values.map((value, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all text-center"
          >
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-3xl w-fit mx-auto mb-8">
              {value.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {value.description}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Why Join Us Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900 rounded-[4rem] p-12 md:p-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Activity className="w-64 h-64 text-orange-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black mb-8">Why Join Us?</h2>
            <div className="space-y-6">
              {[
                "Professional-grade tables and equipment",
                "Regularly scheduled matches and tournaments",
                "Interactive stats and leaderboard tracking",
                "Family-friendly environment and events",
                "Skill-based matchmaking for fair play",
                "Community workshops and coaching sessions"
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="p-1 bg-green-500 rounded-full">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-500 to-orange-500 p-1">
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[2.9rem] flex items-center justify-center">
                <div className="text-center">
                  <Trophy className="w-24 h-24 text-orange-500 mx-auto mb-6" />
                  <p className="text-4xl font-black">500+</p>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Active Members</p>
                </div>
              </div>
            </div>
            {/* Floating Badges */}
            <div className="absolute -top-8 -right-8 p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-700 animate-bounce">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
