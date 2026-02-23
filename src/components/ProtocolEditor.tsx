import React, { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Search, Zap, Activity, Info } from 'lucide-react';
import { WorkoutSplit, ExerciseDefinition, DEFAULT_SPLITS } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProtocolEditorProps {
  initialSplit?: WorkoutSplit;
  onSave: (split: WorkoutSplit) => void;
  onBack: () => void;
}

export function ProtocolEditor({ initialSplit, onSave, onBack }: ProtocolEditorProps) {
  const [name, setName] = useState(initialSplit?.name || 'New Protocol');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseDefinition[]>(initialSplit?.exercises || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEx, setCustomEx] = useState({ name: '', targetSets: 3, notes: '' });

  // Extract all unique exercises from default splits as recommendations
  const globalExercises = useMemo(() => {
    const all = DEFAULT_SPLITS.flatMap(s => s.exercises);
    const unique = Array.from(new Map(all.map(ex => [ex.name, ex])).values());
    return unique;
  }, []);

  const filteredExercises = globalExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = (ex: ExerciseDefinition) => {
    setSelectedExercises([...selectedExercises, { ...ex }]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleCreateCustom = () => {
    if (!customEx.name) return;
    setSelectedExercises([...selectedExercises, { ...customEx }]);
    setCustomEx({ name: '', targetSets: 3, notes: '' });
    setShowCustomForm(false);
  };

  const handleSave = () => {
    onSave({
      id: initialSplit?.id || crypto.randomUUID(),
      name,
      exercises: selectedExercises
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
      {/* Header */}
      <div className="lg:col-span-12 flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-accent-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-primary">Protocol Designer</span>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-mono font-black tracking-tighter uppercase italic bg-transparent border-none p-0 outline-none focus:text-accent-primary transition-colors"
              placeholder="Protocol Name"
            />
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="btn-primary px-8 py-3 h-auto font-mono italic flex items-center gap-2"
        >
          <Save className="w-5 h-5" /> Deploy Protocol
        </button>
      </div>

      {/* Selected Exercises (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Activity className="w-4 h-4 text-accent-primary" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Selected Tactical Units</h3>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {selectedExercises.length > 0 ? selectedExercises.map((ex, i) => (
              <motion.div 
                key={`${ex.name}-${i}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card p-4 border-white/5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-mono text-xs text-accent-primary">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-mono font-black uppercase italic text-sm">{ex.name}</h4>
                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest">{ex.targetSets} Sets {ex.notes && `• ${ex.notes}`}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveExercise(i)}
                  className="p-2 text-accent-secondary opacity-0 group-hover:opacity-100 hover:bg-accent-secondary/10 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )) : (
              <div className="card p-12 border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-4">
                <div className="p-4 rounded-full bg-white/5">
                  <Zap className="w-8 h-8 text-text-tertiary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-mono font-black uppercase italic text-text-tertiary">No Units Assigned</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-widest">Select from the library or create custom units</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Exercise Library (Right Column) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Zap className="w-4 h-4 text-accent-tertiary" />
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary">Tactical Library</h3>
        </div>

        <div className="card p-6 border-white/5 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Library..."
              className="w-full bg-bg-primary border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-mono outline-none focus:border-accent-tertiary transition-colors"
            />
          </div>

          {/* Library List */}
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
            {filteredExercises.map((ex, i) => (
              <button 
                key={i}
                onClick={() => handleAddExercise(ex)}
                className="w-full p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-accent-tertiary/10 hover:border-accent-tertiary/30 transition-all text-left flex items-center justify-between group"
              >
                <span className="font-mono font-black uppercase italic text-xs group-hover:text-accent-tertiary transition-colors">{ex.name}</span>
                <Plus className="w-4 h-4 text-text-tertiary group-hover:text-accent-tertiary" />
              </button>
            ))}
          </div>

          <div className="hud-line" />

          {/* Custom Exercise Form */}
          <div className="space-y-4">
            {!showCustomForm ? (
              <button 
                onClick={() => setShowCustomForm(true)}
                className="w-full py-3 border border-dashed border-accent-primary/30 rounded-xl text-[10px] uppercase tracking-widest font-black text-accent-primary hover:bg-accent-primary/5 transition-all"
              >
                + Create Custom Unit
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-4 bg-bg-primary border border-accent-primary/20 rounded-xl"
              >
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-text-tertiary tracking-widest">Unit Designation</label>
                  <input 
                    value={customEx.name}
                    onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })}
                    placeholder="Exercise Name"
                    className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-accent-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase font-black text-text-tertiary tracking-widest">Target Sets</label>
                    <input 
                      type="number"
                      value={customEx.targetSets}
                      onChange={(e) => setCustomEx({ ...customEx, targetSets: parseInt(e.target.value) || 0 })}
                      className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase font-black text-text-tertiary tracking-widest">Notes</label>
                    <input 
                      value={customEx.notes}
                      onChange={(e) => setCustomEx({ ...customEx, notes: e.target.value })}
                      placeholder="Optional"
                      className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleCreateCustom}
                    className="flex-1 btn-primary py-2 text-[10px] font-mono italic"
                  >
                    Add Unit
                  </button>
                  <button 
                    onClick={() => setShowCustomForm(false)}
                    className="px-4 py-2 border border-white/10 rounded-xl text-[10px] font-mono italic hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tactical Info */}
        <div className="card p-4 border-accent-tertiary/20 bg-accent-tertiary/5 flex gap-3">
          <Info className="w-5 h-5 text-accent-tertiary shrink-0" />
          <p className="text-[10px] text-text-secondary leading-relaxed italic">
            Protocols are the foundation of your progression. Ensure balanced volume across muscle groups for optimal system performance.
          </p>
        </div>
      </div>
    </div>
  );
}
