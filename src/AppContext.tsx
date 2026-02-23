import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, WorkoutSession, PainTracker, WorkoutSplit, RankTier } from './types';
import { storage, calculateRank } from './lib/storage';
import { isToday, parseISO } from 'date-fns';

interface AppContextType {
  user: UserProfile;
  sessions: WorkoutSession[];
  painLogs: PainTracker[];
  splits: WorkoutSplit[];
  activeSession: WorkoutSession | null;
  startWorkout: (splitId: string) => void;
  finishWorkout: (session: WorkoutSession) => void;
  cancelWorkout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logPain: (pain: Omit<PainTracker, 'id' | 'date'>) => void;
  toggleCreatine: () => void;
  updateSplits: (splits: WorkoutSplit[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(storage.getUserProfile());
  const [sessions, setSessions] = useState<WorkoutSession[]>(storage.getWorkoutSessions());
  const [painLogs, setPainLogs] = useState<PainTracker[]>(storage.getPainLogs());
  const [splits, setSplits] = useState<WorkoutSplit[]>(storage.getSplits());
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    storage.saveUserProfile(user);
  }, [user]);

  useEffect(() => {
    storage.saveSplits(splits);
  }, [splits]);

  // Notification logic
  useEffect(() => {
    if (!user.creatineReminderEnabled) return;

    const checkReminder = () => {
      const now = new Date();
      const [hours, minutes] = user.creatineReminderTime.split(':').map(Number);
      
      // Check if it's the right time
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        // Check if already taken today
        const alreadyTaken = user.lastCreatineDate && isToday(parseISO(user.lastCreatineDate));
        
        // Check if already notified today (using a ref or local state to avoid multiple notifications in the same minute)
        const lastNotifiedDate = localStorage.getItem('levelup_last_creatine_notification');
        const alreadyNotifiedToday = lastNotifiedDate && isToday(parseISO(lastNotifiedDate));

        if (!alreadyTaken && !alreadyNotifiedToday) {
          if (Notification.permission === 'granted') {
            new Notification('Creatine Reminder', {
              body: 'Time to hit your creatine goal for today!',
              icon: '/manifest.json' // Or a specific icon
            });
            localStorage.setItem('levelup_last_creatine_notification', new Date().toISOString());
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Creatine Reminder', {
                  body: 'Time to hit your creatine goal for today!'
                });
                localStorage.setItem('levelup_last_creatine_notification', new Date().toISOString());
              }
            });
          }
        }
      }
    };

    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user.creatineReminderEnabled, user.creatineReminderTime, user.lastCreatineDate]);

  const startWorkout = (splitId: string) => {
    const split = splits.find(s => s.id === splitId);
    if (!split) return;

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      splitType: split.name,
      exercises: split.exercises.map(ex => ({
        id: crypto.randomUUID(),
        exerciseName: ex.name,
        sets: [],
        prAchieved: false,
        stagnating: false,
      })),
      overallPain: 0,
      overallFatigue: 0,
      creatineTaken: user.lastCreatineDate ? isToday(parseISO(user.lastCreatineDate)) : false,
      notes: '',
      xpEarned: 0,
      completedAt: null,
    };
    setActiveSession(newSession);
  };

  const finishWorkout = (session: WorkoutSession) => {
    const completedSession = {
      ...session,
      completedAt: new Date().toISOString(),
    };
    
    storage.saveWorkoutSession(completedSession);
    const updatedSessions = [...sessions, completedSession];
    setSessions(updatedSessions);

    // Update user stats
    const newXP = user.totalXP + session.xpEarned;
    const newRank = calculateRank({ ...user, totalXP: newXP }, updatedSessions);
    
    setUser(prev => ({
      ...prev,
      totalXP: newXP,
      currentRank: newRank,
      gymStreak: prev.lastWorkoutDate && isToday(parseISO(prev.lastWorkoutDate)) ? prev.gymStreak : prev.gymStreak + 1,
      lastWorkoutDate: new Date().toISOString(),
    }));

    setActiveSession(null);
  };

  const cancelWorkout = () => {
    setActiveSession(null);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const logPain = (pain: Omit<PainTracker, 'id' | 'date'>) => {
    const newLog: PainTracker = {
      ...pain,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    storage.savePainLog(newLog);
    setPainLogs(prev => [...prev, newLog]);
  };

  const toggleCreatine = () => {
    const today = new Date().toISOString();
    const alreadyTaken = user.lastCreatineDate && isToday(parseISO(user.lastCreatineDate));
    
    if (alreadyTaken) return;

    setUser(prev => ({
      ...prev,
      creatineStreak: prev.creatineStreak + 1,
      lastCreatineDate: today,
    }));
  };

  const updateSplits = (newSplits: WorkoutSplit[]) => {
    setSplits(newSplits);
  };

  return (
    <AppContext.Provider value={{
      user, sessions, painLogs, splits, activeSession,
      startWorkout, finishWorkout, cancelWorkout,
      updateUser, logPain, toggleCreatine, updateSplits
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
