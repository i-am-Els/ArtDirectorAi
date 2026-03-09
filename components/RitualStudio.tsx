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

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const dateLabel = (selected: Date, today: Date) => {
  const deltaDays = Math.round((selected.getTime() - today.getTime()) / 86400000);
  if (deltaDays === 0) return 'Today';
  if (deltaDays === -1) return 'Yesterday';
  return selected.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const getRitualStreak = (ritualId: string, ritualCompletions: Record<string, string[]>) => {
  let streak = 0;
  const cursor = startOfDay(new Date());

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
  const [manageMode, setManageMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const { showConfirm, showMessage } = useAppDialog();

  const fetchProgress = async () => {
    const p = await getUserProgress(userId);
    setProgress(p);
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const todayDate = useMemo(() => startOfDay(new Date()), []);
  const selectedDayKey = useMemo(() => toDayKey(selectedDate), [selectedDate]);
  const selectedDoneSet = useMemo(
    () => new Set(progress?.ritualCompletions?.[selectedDayKey] || []),
    [progress?.ritualCompletions, selectedDayKey]
  );

  const rituals = progress?.rituals || [];
  const doneCount = rituals.filter((r) => selectedDoneSet.has(r.id)).length;
  const completionPct = rituals.length ? Math.round((doneCount / rituals.length) * 100) : 0;
  const canGoNext = selectedDate.getTime() < todayDate.getTime();

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

  const handleToggleForSelectedDay = async (ritual: UserRitual) => {
    if (selectedDate.getTime() > todayDate.getTime()) {
      showMessage({ title: 'Future Day Locked', message: 'You cannot mark rituals for future dates.', tone: 'warning' });
      return;
    }

    const checked = !selectedDoneSet.has(ritual.id);
    setBusy(true);
    try {
      await setRitualCompletionForDay(userId, ritual.id, selectedDayKey, checked);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/70 p-1">
            <button
              onClick={() => setSelectedDate((prev) => startOfDay(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1)))}
              disabled={busy}
              className={`w-9 h-9 rounded-xl border text-sm font-black transition-colors ${busy ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/80'}`}
              aria-label="Previous day"
            >
              {'<'}
            </button>

            <div className="h-9 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 inline-flex items-center gap-2 text-xs font-bold text-zinc-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.8" />
                <path d="M8 3v4M16 3v4M3 10h18" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>{dateLabel(selectedDate, todayDate)}</span>
            </div>

            <button
              onClick={() => setSelectedDate((prev) => startOfDay(new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1)))}
              disabled={busy || !canGoNext}
              className={`w-9 h-9 rounded-xl border text-sm font-black transition-colors ${busy || !canGoNext ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/80'}`}
              aria-label="Next day"
            >
              {'>'}
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(todayDate)}
            disabled={busy || selectedDate.getTime() === todayDate.getTime()}
            className={`px-3 py-2 rounded-xl text-[11px] font-bold ${busy || selectedDate.getTime() === todayDate.getTime() ? 'text-zinc-600 cursor-not-allowed' : 'text-blue-300 hover:text-blue-200'}`}
          >
            {selectedDate.getTime() === todayDate.getTime() ? 'Today' : 'Go to Today'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Completed</p>
            <p className="text-sm font-black text-emerald-300">{doneCount}/{rituals.length} ({completionPct}%)</p>
          </div>
          <button
            onClick={() => setManageMode((prev) => !prev)}
            disabled={busy || rituals.length === 0}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${busy || rituals.length === 0 ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : manageMode ? 'border-red-500/50 text-red-300 bg-red-500/10' : 'border-zinc-600 text-zinc-200 hover:border-zinc-300'}`}
          >
            {manageMode ? 'Done Managing' : 'Manage Rituals'}
          </button>
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
              const doneForSelectedDay = selectedDoneSet.has(ritual.id);
              const streak = getRitualStreak(ritual.id, progress?.ritualCompletions || {});

              return (
                <div key={ritual.id} className="rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleToggleForSelectedDay(ritual)}
                    disabled={busy}
                    className={`flex items-center gap-3 text-left flex-1 ${busy ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-black ${doneForSelectedDay ? 'bg-emerald-500 border-emerald-400 text-zinc-950' : 'border-zinc-600 bg-zinc-950 text-transparent'}`}>
                      {doneForSelectedDay ? 'x' : ''}
                    </span>
                    <span>
                      <div className={`text-sm font-bold ${doneForSelectedDay ? 'text-emerald-100' : 'text-zinc-200'}`}>{ritual.title}</div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                        Streak: {streak} day{streak === 1 ? '' : 's'}
                      </div>
                    </span>
                  </button>

                  {manageMode && (
                    <button
                      onClick={() => handleDelete(ritual)}
                      disabled={busy}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${busy ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'border-red-500/50 text-red-300 hover:bg-red-500/10'}`}
                    >
                      Remove
                    </button>
                  )}
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
