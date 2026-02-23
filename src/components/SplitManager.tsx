import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ArrowLeft, Plus, GripVertical, Trash2, Save, Edit2, X, Check, Activity } from 'lucide-react';
import { WorkoutSplit, ExerciseDefinition, DEFAULT_SPLITS } from '../types';
import { ProtocolEditor } from './ProtocolEditor';

export function SplitManager({ onBack }: { onBack: () => void }) {
  const { splits, updateSplits } = useApp();
  const [localSplits, setLocalSplits] = useState<WorkoutSplit[]>(splits);
  const [editingSplit, setEditingSplit] = useState<WorkoutSplit | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = () => {
    updateSplits(localSplits);
    onBack();
  };

  const handleEditorSave = (updatedSplit: WorkoutSplit) => {
    if (isCreating) {
      setLocalSplits([...localSplits, updatedSplit]);
    } else {
      setLocalSplits(localSplits.map(s => s.id === updatedSplit.id ? updatedSplit : s));
    }
    setEditingSplit(null);
    setIsCreating(false);
  };

  const removeSplit = (id: string) => {
    setLocalSplits(localSplits.filter(s => s.id !== id));
  };

  const startEditing = (split: WorkoutSplit) => {
    setEditingSplit(split);
    setIsCreating(false);
  };

  const startCreating = () => {
    setEditingSplit(null);
    setIsCreating(true);
  };

  if (editingSplit || isCreating) {
    return (
      <ProtocolEditor 
        initialSplit={editingSplit || undefined}
        onSave={handleEditorSave}
        onBack={() => {
          setEditingSplit(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
      <div className="col-span-full flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-accent-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-primary">Protocol Lab</span>
            <h2 className="text-2xl font-mono font-black tracking-tighter uppercase italic">Mission Control</h2>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          className="btn-primary px-6 py-2 h-auto text-xs font-mono italic flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Commit All
        </button>
      </div>

      {localSplits.map((split) => (
        <div key={split.id} className="space-y-4 group/split">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-mono font-black uppercase italic text-text-secondary">{split.name}</h3>
              <button onClick={() => startEditing(split)} className="opacity-0 group-hover/split:opacity-100 text-text-tertiary hover:text-accent-primary transition-all">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-text-tertiary font-mono uppercase">{split.exercises.length} Units</span>
              <button onClick={() => removeSplit(split.id)} className="opacity-0 group-hover/split:opacity-100 text-accent-secondary hover:scale-110 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="card divide-y divide-white/5 border-white/5">
            {split.exercises.slice(0, 3).map((ex, exIndex) => (
              <div key={exIndex} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-3 h-3 text-accent-primary" />
                  <span className="font-mono font-black uppercase italic text-xs">{ex.name}</span>
                </div>
                <span className="text-[10px] text-text-tertiary font-mono">{ex.targetSets} Sets</span>
              </div>
            ))}
            {split.exercises.length > 3 && (
              <div className="p-2 text-center text-[8px] uppercase tracking-widest font-black text-text-tertiary">
                + {split.exercises.length - 3} More Units
              </div>
            )}
            <button 
              onClick={() => startEditing(split)}
              className="w-full p-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
            >
              <Edit2 className="w-4 h-4" /> Modify Protocol
            </button>
          </div>
        </div>
      ))}

      <div className="col-span-full mt-4">
        <button 
          onClick={startCreating}
          className="w-full bg-bg-secondary border border-dashed border-white/10 text-text-secondary font-mono font-black uppercase italic py-8 rounded-xl hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary transition-all flex flex-col items-center gap-3"
        >
          <Plus className="w-8 h-8" />
          <div className="text-center">
            <span className="block text-lg">Initialize New Protocol</span>
            <span className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">Design a custom tactical routine</span>
          </div>
        </button>
      </div>
    </div>
  );
}


