import React from 'react';
import { useApp } from '../AppContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowLeft, TrendingUp, AlertCircle, Activity, Target } from 'lucide-react';
import { detectStagnation, calculate1RM } from '../lib/storage';
import { format, parseISO } from 'date-fns';

export function Analytics({ onBack }: { onBack: () => void }) {
  const { sessions, user } = useApp();

  const getExerciseHistory = (exerciseName: string) => {
    return sessions
      .filter(s => s.completedAt && s.exercises.some(e => e.exerciseName === exerciseName))
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseName === exerciseName)!;
        const bestSet = ex.sets.reduce((best, current) => {
          const current1RM = calculate1RM(current.weight, current.reps);
          const best1RM = calculate1RM(best.weight, best.reps);
          return current1RM > best1RM ? current : best;
        }, ex.sets[0] || { weight: 0, reps: 0 });
        
        return {
          date: format(parseISO(s.completedAt!), 'MMM d'),
          weight: calculate1RM(bestSet.weight, bestSet.reps)
        };
      });
  };

  const chartData = getExerciseHistory('Incline Barbell Press');
  const displayData = chartData.length > 0 ? chartData : [
    { date: 'NO DATA', weight: 0 }
  ];

  const stagnationAlerts = ['Skullcrushers', 'Overhead Extension'].filter(ex => detectStagnation(ex, sessions));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
      {/* Header HUD */}
      <div className="col-span-full flex items-center gap-4 px-1">
        <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-accent-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-tertiary">Data Stream</span>
          <h2 className="text-2xl font-mono font-black tracking-tighter uppercase italic">Analytics</h2>
        </div>
      </div>

      {/* Stats HUD */}
      <div className="col-span-full md:col-span-1 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
        <div className="card p-5 border-accent-tertiary/20">
          <span className="text-[10px] text-accent-tertiary uppercase tracking-widest font-black block mb-2">Bodyweight</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black italic">55.0</span>
            <span className="text-text-tertiary text-xs">KG</span>
          </div>
        </div>
        <div className="card p-5 border-accent-gold/20">
          <span className="text-[10px] text-accent-gold uppercase tracking-widest font-black block mb-2">Rank</span>
          <div className="text-xl font-mono font-black uppercase italic text-rank-silver">{user.currentRank}</div>
        </div>
      </div>

      {/* Chart HUD */}
      <div className="col-span-full md:col-span-2 lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Activity className="w-4 h-4 text-accent-tertiary" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary">1RM Progression (Incline Press)</h3>
        </div>
        <div className="card p-5 h-64 border-accent-tertiary/20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="date" stroke="#60607a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#60607a" fontSize={10} tickLine={false} axisLine={false} width={30} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121218', border: '1px solid #262626', borderRadius: '8px', fontFamily: 'Orbitron' }}
                itemStyle={{ color: '#00d9ff' }}
              />
              <Area type="monotone" dataKey="weight" stroke="#00d9ff" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts HUD */}
      <div className="col-span-full md:col-span-1 lg:col-span-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <AlertCircle className="w-4 h-4 text-accent-secondary" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Stagnation Alerts</h3>
        </div>
        <div className="space-y-3">
          {stagnationAlerts.length > 0 ? stagnationAlerts.map(ex => (
            <div key={ex} className="card p-5 border-accent-secondary/30 flex items-start gap-4 bg-accent-secondary/5">
              <AlertCircle className="text-accent-secondary w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono font-black uppercase italic text-sm mb-1">{ex}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">Declining volume detected. System recommends 20% load reduction.</p>
              </div>
            </div>
          )) : (
            <div className="card p-5 flex items-center gap-4 border-accent-primary/20 bg-accent-primary/5">
              <TrendingUp className="text-accent-primary w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest font-black text-text-secondary">All systems nominal. Progression steady.</span>
            </div>
          )}
        </div>
      </div>

      {/* Milestones HUD */}
      <div className="col-span-full md:col-span-1 lg:col-span-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Target className="w-4 h-4 text-accent-primary" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Strength Milestones</h3>
        </div>
        <div className="card p-5 space-y-6 border-white/5 h-full">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-mono font-black uppercase italic text-sm">Bench Press</h4>
                <p className="text-[8px] uppercase tracking-widest font-bold text-text-tertiary">Target: 55kg (1.0x BW)</p>
              </div>
              <span className="text-sm font-mono font-black italic text-accent-primary">45/55kg</span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-sm overflow-hidden border border-white/5">
              <div className="h-full bg-accent-primary shadow-[0_0_10px_rgba(0,255,136,0.5)] w-[81%]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="font-mono font-black uppercase italic text-sm">Squat</h4>
                <p className="text-[8px] uppercase tracking-widest font-bold text-text-tertiary">Target: 66kg (1.2x BW)</p>
              </div>
              <span className="text-sm font-mono font-black italic text-accent-tertiary">60/66kg</span>
            </div>
            <div className="h-1.5 bg-bg-tertiary rounded-sm overflow-hidden border border-white/5">
              <div className="h-full bg-accent-tertiary shadow-[0_0_10px_rgba(0,217,255,0.5)] w-[90%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

