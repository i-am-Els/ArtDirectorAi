import React, { useEffect, useMemo, useState } from 'react';
import { UserProgress, UserRitual } from '../types';
import { addRitual, deleteRitual, getUserProgress, setRitualCompletionForDay } from '../services/academyService';
import { useAppDialog } from './ui/AppDialogProvider';

const toDayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getRitualStreak = (ritualId: string, ritualCompletions: Record<string, string[]>) => {
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = toDayKey(cursor);
    const doneToday = (ritualCompletions[key] || []).includes(ritualId);
    if (!doneToday) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const RitualStudio: React.FC<{ userId: string }> = ({ userId }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const { showConfirm, showMessage } = useAppDialog();

  const fetchProgress = async () => {
    const p = await getUserProgress(userId);
    setProgress(p);
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const todayKey = useMemo(() => toDayKey(new Date()), []);
  const todayDoneSet = useMemo(() => new Set(progress?.ritualCompletions?.[todayKey] || []), [progress?.ritualCompletions, todayKey]);
  const rituals = progress?.rituals || [];
  const doneCount = rituals.filter((r) => todayDoneSet.has(r.id)).length;
  const completionPct = rituals.length ? Math.round((doneCount / rituals.length) * 100) : 0;

  const handleAdd = async () => {
    const nextTitle = title.trim();
    if (!nextTitle) {
      showMessage({ title: 'Ritual Title Needed', message: 'Enter a ritual title before adding.', tone: 'warning' });
      return;
    }

    setBusy(true);
    try {
      await addRitual(userId, nextTitle);
      setTitle('');
      await fetchProgress();
    } finally {
      setBusy(false);
    }
  };

  const handleToggleToday = async (ritual: UserRitual) => {
    const checked = !todayDoneSet.has(ritual.id);
    setBusy(true);
    try {
      await setRitualCompletionForDay(userId, ritual.id, todayKey, checked);
      await fetchProgress();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (ritual: UserRitual) => {
    const confirmed = await showConfirm({
      title: 'Delete Ritual',
      message: `Delete "${ritual.title}" from your daily tracker?`,
      tone: 'danger'
    });

    if (!confirmed) return;

    setBusy(true);
    try {
      await deleteRitual(userId, ritual.id);
      await fetchProgress();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="glass rounded-[3rem] border border-white/10 p-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 space-y-5">
        <div>
          <h2 className="text-4xl font-black uppercase italic">Daily Rituals</h2>
          <p className="text-zinc-400 mt-2 text-sm">Build momentum with repeatable daily actions for your art career.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !busy) {
                e.preventDefault();
                void handleAdd();
              }
            }}
            placeholder="Add ritual (e.g., 30 min drawing warmup)"
            className="flex-1 bg-zinc-950/80 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-zinc-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={busy}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${busy ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
          >
            Add Ritual
          </button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Today</p>
            <h3 className="text-xl font-black uppercase italic">Checklist</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Completed</p>
            <p className="text-sm font-black text-emerald-300">{doneCount}/{rituals.length} ({completionPct}%)</p>
          </div>
        </div>

        <div className="h-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${completionPct}%` }}></div>
        </div>

        {!rituals.length ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-5 py-6 text-sm text-zinc-500">
            No rituals yet. Add your first daily ritual above.
          </div>
        ) : (
          <div className="space-y-3">
            {rituals.map((ritual) => {
              const doneToday = todayDoneSet.has(ritual.id);
              const streak = getRitualStreak(ritual.id, progress?.ritualCompletions || {});

              return (
                <div key={ritual.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleToggleToday(ritual)}
                    disabled={busy}
                    className={`flex items-center gap-3 text-left flex-1 ${busy ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${doneToday ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'border-zinc-600 bg-zinc-950 text-transparent'}`}>
                      {doneToday ? 'x' : ''}
                    </span>
                    <span>
                      <div className={`text-sm font-bold ${doneToday ? 'text-emerald-100' : 'text-zinc-200'}`}>{ritual.title}</div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">Streak: {streak} day{streak === 1 ? '' : 's'}</div>
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(ritual)}
                    disabled={busy}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${busy ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'border-red-500/40 text-red-300 hover:bg-red-500/10'}`}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RitualStudio;


