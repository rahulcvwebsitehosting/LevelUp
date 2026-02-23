import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../AppContext';
import { X, Check, Plus, Minus, AlertCircle, Trophy } from 'lucide-react';
import { SetLog, WorkoutSession } from '../types';
import { calculateXP, calculate1RM, getBestSet } from '../lib/storage';
import { cn } from '../lib/utils';

export function WorkoutLogger() {
  const { activeSession, finishWorkout, cancelWorkout, painLogs, sessions } = useApp();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [session, setSession] = useState<WorkoutSession>(activeSession!);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [toFailure, setToFailure] = useState(true);
  const [rpe, setRpe] = useState(8);
  const [timer, setTimer] = useState(0);
  const [showPR, setShowPR] = useState(false);

  const currentExercise = session.exercises[currentExerciseIndex];
  const latestPain = painLogs[painLogs.length - 1];
  const bestSet = getBestSet(sessions, currentExercise.exerciseName);

  useEffect(() => {
    if (bestSet) {
      setWeight(bestSet.weight);
      setReps(bestSet.reps);
    } else {
      setWeight(0);
      setReps(0);
    }
  }, [currentExerciseIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const logSet = () => {
    const newSet: SetLog = {
      id: crypto.randomUUID(),
      setNumber: currentExercise.sets.length + 1,
      weight,
      reps,
      toFailure,
      rpe,
      notes: '',
    };

    const updatedExercises = [...session.exercises];
    updatedExercises[currentExerciseIndex] = {
      ...currentExercise,
      sets: [...currentExercise.sets, newSet],
    };

    const updatedSession = {
      ...session,
      exercises: updatedExercises,
      xpEarned: calculateXP({ ...session, exercises: updatedExercises }, null)
    };

    setSession(updatedSession);
    setTimer(90);
    
    if (bestSet && weight > bestSet.weight) {
      setShowPR(true);
      setTimeout(() => setShowPR(false), 3000);
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      finishWorkout(session);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex flex-col overflow-hidden md:inset-4 md:rounded-3xl md:border md:border-white/10 md:shadow-2xl md:max-w-7xl md:mx-auto md:my-4">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]" />

      {/* Mission Header */}
      <div className="p-6 pt-12 flex items-center justify-between border-b border-white/5 bg-bg-secondary/50 backdrop-blur-xl z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-primary">Mission Active</span>
          </div>
          <h2 className="text-xl font-mono font-black uppercase tracking-tighter italic">{session.name}</h2>
        </div>
        <button onClick={cancelWorkout} className="p-2 text-text-tertiary hover:text-accent-secondary transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 md:pb-6 md:grid md:grid-cols-12 md:gap-8 md:content-start">
        {/* Exercise Selector HUD */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar md:col-span-12">
          {session.exercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => setCurrentExerciseIndex(i)}
              className={cn(
                "px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest whitespace-nowrap border transition-all",
                i === currentExerciseIndex 
                  ? "bg-accent-primary/20 border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(0,255,136,0.2)]" 
                  : "bg-bg-secondary border-white/5 text-text-tertiary"
              )}
            >
              {i + 1}. {ex.exerciseName}
            </button>
          ))}
        </div>

        {/* Active Exercise Card */}
        <motion.div 
          key={currentExerciseIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-6 border-accent-tertiary/20 relative md:col-span-7"
        >
          <div className="mb-6">
            <h3 className="text-3xl font-mono font-black uppercase italic tracking-tighter text-accent-tertiary">
              {currentExercise.exerciseName}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Target: 3 Sets</span>
              {currentExercise.isElbowSensitive && (
                <div className="flex items-center gap-1 text-accent-secondary animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Elbow Warning</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats HUD */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-bg-primary/50 p-3 rounded-xl border border-white/5">
              <span className="block text-[8px] uppercase tracking-widest font-black text-text-tertiary mb-1">Previous Best</span>
              <span className="font-mono text-sm text-accent-primary">
                {bestSet ? `${bestSet.weight}kg × ${bestSet.reps}` : 'NO DATA'}
              </span>
            </div>
            <div className="bg-bg-primary/50 p-3 rounded-xl border border-white/5 text-right">
              <span className="block text-[8px] uppercase tracking-widest font-black text-text-tertiary mb-1">Est. 1RM</span>
              <span className="font-mono text-sm text-accent-tertiary">{calculate1RM(weight, reps)}kg</span>
            </div>
          </div>

          {/* Input HUD */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Load</span>
                  <span className="text-xl font-mono font-black text-white italic">{weight}kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeight(Math.max(0, weight - 2.5))} className="flex-1 h-12 rounded-xl bg-bg-tertiary border border-white/5 flex items-center justify-center active:scale-95 transition-all"><Minus className="w-4 h-4" /></button>
                  <button onClick={() => setWeight(weight + 2.5)} className="flex-1 h-12 rounded-xl bg-bg-tertiary border border-white/5 flex items-center justify-center active:scale-95 transition-all"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Reps</span>
                  <span className="text-xl font-mono font-black text-white italic">{reps}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReps(Math.max(0, reps - 1))} className="flex-1 h-12 rounded-xl bg-bg-tertiary border border-white/5 flex items-center justify-center active:scale-95 transition-all"><Minus className="w-4 h-4" /></button>
                  <button onClick={() => setReps(reps + 1)} className="flex-1 h-12 rounded-xl bg-bg-tertiary border border-white/5 flex items-center justify-center active:scale-95 transition-all"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setToFailure(!toFailure)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest border transition-all",
                  toFailure ? "bg-accent-secondary/20 border-accent-secondary text-accent-secondary shadow-[0_0_10px_rgba(255,0,110,0.2)]" : "bg-bg-tertiary border-white/5 text-text-tertiary"
                )}
              >
                Failure: {toFailure ? 'ON' : 'OFF'}
              </button>
              <button className="flex-1 py-3 rounded-xl bg-bg-tertiary border border-white/5 font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
                RPE: {rpe}
              </button>
            </div>

            <button onClick={logSet} className="btn-primary w-full py-4 text-lg">
              Log Set Data
            </button>
          </div>
        </motion.div>

        {/* Set History HUD */}
        <div className="space-y-4 md:col-span-5 md:h-full md:overflow-y-auto pr-2">
          <h4 className="text-[10px] uppercase tracking-widest font-black text-text-tertiary px-1">Session Log</h4>
          <div className="space-y-2">
            {currentExercise.sets.map((set, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={set.id} 
                className="card p-4 flex items-center justify-between border-white/5 bg-bg-secondary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-bg-primary border border-white/10 flex items-center justify-center font-mono text-xs text-text-tertiary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-black italic">{set.weight}kg × {set.reps}</div>
                    <div className="text-[8px] uppercase tracking-widest font-bold text-text-tertiary">RPE {set.rpe} {set.toFailure && '• FAILURE'}</div>
                  </div>
                </div>
                {set.weight > (bestSet?.weight || 0) && <Trophy className="w-4 h-4 text-accent-gold animate-bounce" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer HUD */}
      <div className="p-6 border-t border-white/5 bg-bg-secondary/50 backdrop-blur-xl flex items-center gap-4 z-10">
        {timer > 0 ? (
          <div className="flex-1 h-14 rounded-xl bg-accent-tertiary/10 border border-accent-tertiary/30 flex items-center justify-center gap-3">
            <span className="font-mono text-lg font-black italic text-accent-tertiary">REST: {timer}S</span>
          </div>
        ) : (
          <button 
            onClick={nextExercise}
            className="flex-1 h-14 rounded-xl bg-accent-primary text-bg-primary font-mono font-black uppercase italic tracking-tighter shadow-[0_0_20px_rgba(0,255,136,0.3)] active:scale-95 transition-all"
          >
            {currentExerciseIndex === session.exercises.length - 1 ? 'Complete Mission' : 'Next Exercise'}
          </button>
        )}
      </div>

      {/* PR Alert Overlay */}
      <AnimatePresence>
        {showPR && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-accent-gold text-bg-primary px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(255,215,0,0.5)] flex items-center gap-4">
              <Trophy className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest">New Record</span>
                <span className="text-2xl font-mono font-black italic uppercase">PR ACHIEVED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

