import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { Trophy, Flame, Zap, ChevronRight, Settings as SettingsIcon, BarChart2, Activity, List } from 'lucide-react';
import { RANK_REQUIREMENTS } from '../types';
import { cn } from '../lib/utils';

export function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, splits, startWorkout, toggleCreatine, painLogs } = useApp();

  const currentRankReq = RANK_REQUIREMENTS.find(r => r.rank === user.currentRank);
  const nextRankIndex = RANK_REQUIREMENTS.findIndex(r => r.rank === user.currentRank) + 1;
  const nextRankReq = RANK_REQUIREMENTS[nextRankIndex] || RANK_REQUIREMENTS[RANK_REQUIREMENTS.length - 1];
  
  const xpProgress = ((user.totalXP - (currentRankReq?.minXP || 0)) / ((nextRankReq.minXP || 1) - (currentRankReq?.minXP || 0))) * 100;

  const latestPain = painLogs.length > 0 ? painLogs[painLogs.length - 1] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {/* HUD Header */}
      <div className="col-span-full flex items-center justify-between px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-primary">System Online</span>
          </div>
          <h1 className="text-2xl font-mono font-black tracking-tighter uppercase italic">
            {user.name} <span className="text-text-tertiary">#001</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('analytics')} className="p-2 rounded-lg bg-bg-secondary border border-white/10 hover:border-accent-tertiary transition-colors" title="Analytics">
            <BarChart2 className="w-5 h-5 text-accent-tertiary" />
          </button>
          <button onClick={() => onNavigate('splits')} className="p-2 rounded-lg bg-bg-secondary border border-white/10 hover:border-accent-primary transition-colors" title="Protocols">
            <List className="w-5 h-5 text-accent-primary" />
          </button>
          <button onClick={() => onNavigate('settings')} className="p-2 rounded-lg bg-bg-secondary border border-white/10 hover:border-text-secondary transition-colors" title="Settings">
            <SettingsIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Rank HUD Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="col-span-full md:col-span-2 card p-6 border-accent-primary/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Trophy className="w-24 h-24 rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center relative z-10",
                "bg-bg-primary border-2",
                `border-rank-${user.currentRank} shadow-[0_0_15px_rgba(var(--color-rank-${user.currentRank}),0.3)]`
              )}>
                <Trophy className={cn("w-8 h-8", `text-rank-${user.currentRank}`)} />
              </div>
              <div className={cn(
                "absolute inset-0 blur-xl opacity-30 animate-pulse-glow",
                `bg-rank-${user.currentRank}`
              )} />
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black text-text-tertiary">Current Rank</span>
              <h2 className="text-3xl font-mono font-black uppercase tracking-tighter italic">
                {user.currentRank}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2 py-0.5 bg-accent-primary/10 border border-accent-primary/30 rounded text-[10px] font-mono font-bold text-accent-primary">
                  LVL {Math.floor(user.totalXP / 100)}
                </div>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {user.totalXP.toLocaleString()} / {nextRankReq.minXP.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative h-2 bg-bg-primary rounded-sm overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, xpProgress))}%` }}
                className={cn("h-full relative", `bg-rank-${user.currentRank}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest text-text-tertiary">
              <span>Progress to {nextRankReq.rank}</span>
              <span>{Math.floor(xpProgress)}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 border-accent-secondary/20 bg-accent-secondary/5 flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-accent-secondary">Gym Streak</span>
            <Flame className="w-4 h-4 text-accent-secondary" />
          </div>
          <div className="text-4xl font-mono font-black italic">{user.gymStreak}</div>
          <div className="hud-line mt-2" />
          <span className="text-[8px] uppercase font-bold text-text-tertiary mt-1">Days Active</span>
        </div>
        
        <button 
          onClick={toggleCreatine}
          className="card p-4 border-accent-tertiary/20 bg-accent-tertiary/5 flex flex-col gap-1 text-left active:scale-95 hover:bg-accent-tertiary/10 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-accent-tertiary">Creatine</span>
            <Zap className="w-4 h-4 text-accent-tertiary" />
          </div>
          <div className="text-4xl font-mono font-black italic">{user.creatineStreak}</div>
          <div className="hud-line mt-2" />
          <span className="text-[8px] uppercase font-bold text-text-tertiary mt-1">Streak Count</span>
        </button>
      </div>

      {/* Protocols Section */}
      <div className="col-span-full flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-primary" />
            <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Available Protocols</h3>
          </div>
          <button 
            onClick={() => onNavigate('splits')}
            className="text-[10px] uppercase tracking-widest font-black text-accent-primary hover:underline"
          >
            Manage All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {splits.map((split) => (
            <motion.div 
              key={split.id}
              whileHover={{ scale: 1.02 }}
              className="card p-5 border-white/5 relative group cursor-pointer hover:border-accent-primary/30 transition-all"
              onClick={() => startWorkout(split.id)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-accent-primary/10 transition-colors" />
              
              <div className="relative z-10">
                <h4 className="text-lg font-mono font-black uppercase italic mb-1 group-hover:text-accent-primary transition-colors">{split.name}</h4>
                <div className="flex items-center gap-3 text-text-secondary text-[10px] mb-4">
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {split.exercises.length} Exercises</span>
                  <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                  <span>~75 MIN</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[8px] uppercase font-black text-text-tertiary tracking-widest">Ready for deployment</span>
                  <ChevronRight className="w-4 h-4 text-accent-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Create Custom Split Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="card p-5 border-dashed border-accent-tertiary/30 bg-accent-tertiary/5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent-tertiary transition-all min-h-[140px]"
            onClick={() => onNavigate('splits')}
          >
            <div className="w-12 h-12 rounded-full bg-accent-tertiary/10 border border-accent-tertiary/20 flex items-center justify-center">
              <List className="w-6 h-6 text-accent-tertiary" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-mono font-black uppercase italic text-accent-tertiary">Create Custom Protocol</h4>
              <p className="text-[8px] uppercase tracking-widest font-bold text-text-tertiary mt-1">Design your own mission</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Readiness HUD */}
      <div className="col-span-full md:col-span-1 flex flex-col gap-3">
        <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary px-1">Biometric Readiness</h3>
        <div className="card p-5 space-y-5 border-white/5 h-full">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Left Elbow Integrity</span>
              <span className={cn("text-[10px] font-mono font-bold", (latestPain?.painLevel || 0) > 5 ? "text-accent-secondary" : "text-accent-primary")}>
                {100 - (latestPain?.painLevel || 0) * 10}%
              </span>
            </div>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={cn(
                  "flex-1 h-1.5 rounded-sm transition-all duration-500",
                  i < 10 - (latestPain?.painLevel || 0) ? "bg-accent-primary shadow-[0_0_5px_rgba(0,255,136,0.5)]" : "bg-bg-tertiary"
                )} />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">System Recovery</span>
              <span className="text-[10px] font-mono font-bold text-accent-tertiary">80%</span>
            </div>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={cn(
                  "flex-1 h-1.5 rounded-sm transition-all duration-500",
                  i < 8 ? "bg-accent-tertiary shadow-[0_0_5px_rgba(0,217,255,0.5)]" : "bg-bg-tertiary"
                )} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

