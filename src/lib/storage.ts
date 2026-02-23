import { UserProfile, WorkoutSession, PainTracker, WorkoutSplit, DEFAULT_SPLITS, RankTier, RANK_REQUIREMENTS, ExerciseLog } from '../types';
import { format, isYesterday, isToday, parseISO } from 'date-fns';

const STORAGE_KEYS = {
  USER_PROFILE: 'levelup_user_profile',
  WORKOUT_SESSIONS: 'levelup_workout_sessions',
  PAIN_LOGS: 'levelup_pain_logs',
  CUSTOM_SPLITS: 'levelup_custom_splits',
};

export const storage = {
  getUserProfile: (): UserProfile => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) return JSON.parse(data);
    
    const initialProfile: UserProfile = {
      id: crypto.randomUUID(),
      name: 'Lifter',
      bodyweight: 55,
      height: 155,
      createdAt: new Date().toISOString(),
      totalXP: 0,
      currentRank: 'unranked',
      creatineStreak: 0,
      lastCreatineDate: null,
      gymStreak: 0,
      lastWorkoutDate: null,
      creatineReminderTime: '09:00',
      creatineReminderEnabled: false,
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(initialProfile));
    return initialProfile;
  },

  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getWorkoutSessions: (): WorkoutSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveWorkoutSession: (session: WorkoutSession) => {
    const sessions = storage.getWorkoutSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(sessions));
  },

  getPainLogs: (): PainTracker[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PAIN_LOGS);
    return data ? JSON.parse(data) : [];
  },

  savePainLog: (log: PainTracker) => {
    const logs = storage.getPainLogs();
    logs.push(log);
    localStorage.setItem(STORAGE_KEYS.PAIN_LOGS, JSON.stringify(logs));
  },

  getSplits: (): WorkoutSplit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_SPLITS);
    return data ? JSON.parse(data) : DEFAULT_SPLITS;
  },

  saveSplits: (splits: WorkoutSplit[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SPLITS, JSON.stringify(splits));
  }
};

export function calculateXP(session: WorkoutSession, lastWorkoutDate: string | null): number {
  let totalXP = 0;
  
  session.exercises.forEach(exercise => {
    totalXP += exercise.sets.length * 10;
    if (exercise.prAchieved) totalXP += 50;
    const allSetsToFailure = exercise.sets.every(set => set.toFailure);
    if (allSetsToFailure && exercise.sets.length > 0) totalXP += 20;
  });
  
  if (lastWorkoutDate && isYesterday(parseISO(lastWorkoutDate))) {
    totalXP += 30;
  }
  
  return totalXP;
}

export function getMaxWeight(sessions: WorkoutSession[], exerciseName: string): number {
  let max = 0;
  sessions.forEach(session => {
    session.exercises.forEach(exercise => {
      if (exercise.exerciseName === exerciseName) {
        exercise.sets.forEach(set => {
          if (set.weight > max) max = set.weight;
        });
      }
    });
  });
  return max;
}

export function calculateRank(userProfile: UserProfile, sessions: WorkoutSession[]): RankTier {
  const bodyweight = userProfile.bodyweight;
  
  const bestBench = getMaxWeight(sessions, 'Incline Barbell Press');
  const bestSquat = getMaxWeight(sessions, 'Smith Machine Squat');
  
  const benchMultiplier = bestBench / bodyweight;
  const squatMultiplier = bestSquat / bodyweight;
  
  for (let i = RANK_REQUIREMENTS.length - 1; i >= 0; i--) {
    const req = RANK_REQUIREMENTS[i];
    if (
      userProfile.totalXP >= req.minXP &&
      benchMultiplier >= req.strengthRequirement.benchMultiplier &&
      squatMultiplier >= req.strengthRequirement.squatMultiplier
    ) {
      return req.rank;
    }
  }
  
  return 'unranked';
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Epley formula: 1RM = w * (1 + r/30)
  return Math.round(weight * (1 + reps / 30));
}

export function getBestSet(sessions: WorkoutSession[], exerciseName: string): { weight: number, reps: number } | null {
  let bestWeight = 0;
  let bestReps = 0;
  
  sessions.forEach(session => {
    session.exercises.forEach(exercise => {
      if (exercise.exerciseName === exerciseName) {
        exercise.sets.forEach(set => {
          if (set.weight > bestWeight || (set.weight === bestWeight && set.reps > bestReps)) {
            bestWeight = set.weight;
            bestReps = set.reps;
          }
        });
      }
    });
  });
  
  return bestWeight > 0 ? { weight: bestWeight, reps: bestReps } : null;
}

export function detectStagnation(exerciseName: string, sessions: WorkoutSession[]): boolean {
  const recentSessions = sessions
    .filter(s => s.completedAt && s.exercises.some(e => e.exerciseName === exerciseName))
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);
  
  if (recentSessions.length < 3) return false;
  
  const volumes = recentSessions.map(session => {
    const exercise = session.exercises.find(e => e.exerciseName === exerciseName)!;
    return exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  });
  
  if (volumes[0] < volumes[1] && volumes[1] < volumes[2]) {
    return true;
  }
  
  return false;
}
