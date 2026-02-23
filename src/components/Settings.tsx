import React from 'react';
import { useApp } from '../AppContext';
import { ArrowLeft, Bell, Clock, Save } from 'lucide-react';

export function Settings({ onBack }: { onBack: () => void }) {
  const { user, updateUser } = useApp();

  const handleToggleReminder = () => {
    updateUser({ creatineReminderEnabled: !user.creatineReminderEnabled });
    if (!user.creatineReminderEnabled) {
      Notification.requestPermission();
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUser({ creatineReminderTime: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 gap-8 pb-24">
      <div className="flex items-center gap-4 px-1">
        <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-accent-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent-primary">System Config</span>
          <h2 className="text-2xl font-mono font-black tracking-tighter uppercase italic">Settings</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary px-1">Notifications</h3>
          <div className="card p-6 border-accent-primary/20 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20">
                  <Bell className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h4 className="font-mono font-black uppercase italic text-sm">Creatine Reminder</h4>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-widest">Daily system alert</p>
                </div>
              </div>
              <button 
                onClick={handleToggleReminder}
                className={`w-12 h-6 rounded-full transition-all relative ${user.creatineReminderEnabled ? 'bg-accent-primary' : 'bg-bg-tertiary border border-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${user.creatineReminderEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {user.creatineReminderEnabled && (
              <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs font-bold uppercase tracking-wider">Scheduled Time</span>
                  </div>
                  <input 
                    type="time" 
                    value={user.creatineReminderTime}
                    onChange={handleTimeChange}
                    className="bg-bg-primary border border-white/10 rounded-lg px-3 py-2 font-mono text-sm text-accent-primary focus:border-accent-primary outline-none transition-colors"
                  />
                </div>
                <p className="text-[10px] text-text-tertiary leading-relaxed italic">
                  * System will trigger a desktop notification at the specified time if the application is active in your browser.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] uppercase tracking-widest font-black text-text-secondary px-1">User Profile</h3>
          <div className="card p-6 border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Pilot Name</span>
              <span className="font-mono text-sm text-text-secondary">{user.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Bodyweight</span>
              <span className="font-mono text-sm text-text-secondary">{user.bodyweight} KG</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="btn-primary w-full py-4 font-mono italic flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Commit Changes
      </button>
    </div>
  );
}
