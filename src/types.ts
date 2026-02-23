export type RankTier = 'unranked' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export interface RankRequirement {
  rank: RankTier;
  minXP: number;
  strengthRequirement: {
    benchMultiplier: number;
    squatMultiplier: number;
    deadliftMultiplier: number;
  };
}

export const RANK_REQUIREMENTS: RankRequirement[] = [
  { rank: 'unranked', minXP: 0, strengthRequirement: { benchMultiplier: 0, squatMultiplier: 0, deadliftMultiplier: 0 } },
  { rank: 'bronze', minXP: 500, strengthRequirement: { benchMultiplier: 0.5, squatMultiplier: 0.8, deadliftMultiplier: 1.0 } },
  { rank: 'silver', minXP: 1500, strengthRequirement: { benchMultiplier: 0.8, squatMultiplier: 1.2, deadliftMultiplier: 1.5 } },
  { rank: 'gold', minXP: 3000, strengthRequirement: { benchMultiplier: 1.0, squatMultiplier: 1.5, deadliftMultiplier: 2.0 } },
  { rank: 'platinum', minXP: 6000, strengthRequirement: { benchMultiplier: 1.25, squatMultiplier: 1.8, deadliftMultiplier: 2.5 } },
  { rank: 'diamond', minXP: 10000, strengthRequirement: { benchMultiplier: 1.5, squatMultiplier: 2.2, deadliftMultiplier: 3.0 } },
  { rank: 'master', minXP: 20000, strengthRequirement: { benchMultiplier: 2.0, squatMultiplier: 2.5, deadliftMultiplier: 3.5 } }
];

export interface UserProfile {
  id: string;
  name: string;
  bodyweight: number;
  height: number;
  createdAt: string;
  totalXP: number;
  currentRank: RankTier;
  creatineStreak: number;
  lastCreatineDate: string | null;
  gymStreak: number;
  lastWorkoutDate: string | null;
  creatineReminderTime: string; // HH:mm format
  creatineReminderEnabled: boolean;
}

export interface SetLog {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  toFailure: boolean;
  rpe: number;
  notes: string;
}

export interface ExerciseLog {
  id: string;
  exerciseName: string;
  sets: SetLog[];
  prAchieved: boolean;
  stagnating: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  splitType: string;
  exercises: ExerciseLog[];
  overallPain: number;
  overallFatigue: number;
  creatineTaken: boolean;
  notes: string;
  xpEarned: number;
  completedAt: string | null;
}

export interface PainTracker {
  id: string;
  date: string;
  bodyPart: 'left_elbow' | 'right_elbow' | 'left_shoulder' | 'right_shoulder' | 'lower_back' | 'knees';
  painLevel: number;
}

export interface ExerciseDefinition {
  name: string;
  targetSets: number;
  notes: string;
  elbowSensitive?: boolean;
}

export interface WorkoutSplit {
  id: string;
  name: string;
  exercises: ExerciseDefinition[];
}

export const DEFAULT_SPLITS: WorkoutSplit[] = [
  {
    id: 'chest_tri',
    name: 'Chest / Shoulders / Triceps',
    exercises: [
      { name: 'Cable Flys', targetSets: 3, notes: '' },
      { name: 'Incline Barbell Press', targetSets: 2, notes: 'Focus on stretch' },
      { name: 'Cable Flys (Isometric Hold)', targetSets: 2, notes: '10s holds' },
      { name: 'Skullcrushers', targetSets: 3, notes: '⚠️ Watch elbow', elbowSensitive: true },
      { name: 'Cable Tricep Pushdowns', targetSets: 2, notes: '' },
      { name: 'Overhead Tricep Extension', targetSets: 2, notes: '⚠️ Watch elbow', elbowSensitive: true },
      { name: 'DB Shoulder Press', targetSets: 2, notes: 'Seated' },
      { name: 'Lateral Raises', targetSets: 3, notes: 'Controlled tempo' }
    ]
  },
  {
    id: 'back_bi',
    name: 'Back / Biceps',
    exercises: [
      { name: 'Lat Pulldown', targetSets: 3, notes: 'Wide grip' },
      { name: 'Seated Cable Row', targetSets: 3, notes: '' },
      { name: 'Single-Arm Cable Row', targetSets: 3, notes: 'Focus on squeeze' },
      { name: 'EZ Bar Curl', targetSets: 2, notes: '' },
      { name: 'Incline Dumbbell Curl', targetSets: 2, notes: 'Full ROM' },
      { name: 'Preacher Curl', targetSets: 2, notes: '' },
      { name: 'Hammer Curl', targetSets: 2, notes: '' }
    ]
  },
  {
    id: 'legs_abs',
    name: 'Legs / Abs',
    exercises: [
      { name: 'Smith Machine Squat', targetSets: 4, notes: 'Ass to grass' },
      { name: 'Leg Extension', targetSets: 2, notes: 'Peak contraction' },
      { name: 'Lying Hamstring Curl', targetSets: 2, notes: '' },
      { name: 'Hanging Leg Raises', targetSets: 2, notes: 'Slow and controlled' }
    ]
  }
];
