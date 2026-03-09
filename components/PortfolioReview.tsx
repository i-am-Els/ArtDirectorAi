import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzePortfolio } from '../services/geminiService.ts';
import { appendReviewThreadEntry, deleteReviewThread, getUserProgress } from '../services/academyService.ts';
import { ArtRole, ExperienceLevel, PortfolioFeedback, ReviewThread, SavedBriefChallenge, UserProgress } from '../types.ts';
import { useAppDialog } from './ui/AppDialogProvider';

interface PortfolioReviewProps {
  role: ArtRole;
  experience: ExperienceLevel;
  userId: string;
}

const PortfolioReview: React.FC<PortfolioReviewProps> = ({ role, experience, userId }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PortfolioFeedback | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mode, setMode] = useState<'ADHOC' | 'BRIEF'>('ADHOC');
  const [selectedBriefId, setSelectedBriefId] = useState<string>('');
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [reviewSidebarOpen, setReviewSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showConfirm } = useAppDialog();

  const fetchProgress = async () => {
    const p = await getUserProgress(userId);
    setProgress(p);
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const savedBriefs = useMemo(() => progress?.savedBriefs || [], [progress?.savedBriefs]);
  const reviewThreads = useMemo(() => progress?.reviewThreads || [], [progress?.reviewThreads]);
  const allThreads = useMemo(() => [...reviewThreads].sort((a, b) => b.updatedAt - a.updatedAt), [reviewThreads]);

  useEffect(() => {
    if (!savedBriefs.length) {
      setSelectedBriefId('');
      return;
    }
    if (!selectedBriefId || !savedBriefs.some((b) => b.id === selectedBriefId)) {
      setSelectedBriefId(savedBriefs[0].id);
    }
  }, [savedBriefs, selectedBriefId]);

  const activeBrief: SavedBriefChallenge | null = useMemo(
    () => savedBriefs.find((b) => b.id === selectedBriefId) || null,
    [savedBriefs, selectedBriefId]
  );

  const effectiveRole = mode === 'BRIEF' && activeBrief ? activeBrief.role : role;
  const effectiveExperience = mode === 'BRIEF' && activeBrief ? activeBrief.experience : experience;

  const filteredThreads: ReviewThread[] = useMemo(() => {
    if (mode === 'BRIEF') {
      if (!activeBrief) return [];
      return reviewThreads.filter((thread) => thread.source === 'BRIEF' && thread.linkedBriefId === activeBrief.id);
    }
    return reviewThreads.filter((thread) => thread.source === 'ADHOC');
  }, [mode, reviewThreads, activeBrief]);

  useEffect(() => {
    if (!filteredThreads.length) {
      setSelectedThreadId('');
      return;
    }

    if (!selectedThreadId || !filteredThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(filteredThreads[0].id);
    }
  }, [filteredThreads, selectedThreadId]);

  const selectedThread = useMemo(
    () => filteredThreads.find((thread) => thread.id === selectedThreadId) || null,
    [filteredThreads, selectedThreadId]
  );

  useEffect(() => {
    const latestEntry = selectedThread?.entries?.[selectedThread.entries.length - 1];
    if (latestEntry?.feedback) {
      setFeedback(latestEntry.feedback);
    }
  }, [selectedThread?.id]);

  const openThreadFromArchive = (thread: ReviewThread) => {
    if (thread.source === 'BRIEF' && thread.linkedBriefId) {
      setMode('BRIEF');
      setSelectedBriefId(thread.linkedBriefId);
    } else {
      setMode('ADHOC');
    }
    setSelectedThreadId(thread.id);
    const last = thread.entries[thread.entries.length - 1];
    if (last?.feedback) setFeedback(last.feedback);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSelectedThread = async () => {
    if (!selectedThread) return;
    const ok = await showConfirm({
      title: 'Delete Review Thread',
      message: 'This removes the selected review thread permanently. Continue?',
      tone: 'danger'
    });
    if (!ok) return;

    await deleteReviewThread(userId, selectedThread.id);
    await fetchProgress();
    setSelectedThreadId('');
    setFeedback(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    if (mode === 'BRIEF' && !activeBrief) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzePortfolio(image, effectiveRole, effectiveExperience);
      setFeedback(result);

      const nextThread = await appendReviewThreadEntry(userId, {
        source: mode,
        role: effectiveRole,
        experience: effectiveExperience,
        feedback: result,
        linkedBriefId: activeBrief?.id,
        linkedBriefTitle: activeBrief?.brief?.title,
        threadId: mode === 'ADHOC' ? selectedThreadId || undefined : undefined
      });

      await fetchProgress();
      setSelectedThreadId(nextThread.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/10 pb-6 space-y-4">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Portfolio Review</h2>
          <p className="text-zinc-400">Review unknown work or connect review to one of your saved challenge briefs.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setMode('ADHOC')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${mode === 'ADHOC' ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
          >
            Unknown Piece
          </button>
          <button
            onClick={() => setMode('BRIEF')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${mode === 'BRIEF' ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
          >
            Saved Brief
          </button>
          <button
            onClick={() => setReviewSidebarOpen((prev) => !prev)}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-600 text-zinc-200 hover:border-zinc-400"
          >
            {reviewSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {mode === 'BRIEF' && activeBrief && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="text-[10px] uppercase tracking-widest text-blue-300">Active Challenge Brief</div>
                <div className="mt-1 text-sm font-bold text-zinc-100">{activeBrief.brief.title}</div>
                <div className="text-xs text-zinc-400 mt-1">{activeBrief.brief.summary}</div>
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-zinc-900/30 ${image ? 'border-blue-500/50' : 'border-white/10 hover:border-white/20'}`}
            >
              {image ? (
                <img src={image} alt="Upload" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 font-medium">Click to upload artwork</p>
                  <p className="text-zinc-600 text-xs mt-2">Image is used for review only and is not stored.</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!image || isAnalyzing || (mode === 'BRIEF' && !activeBrief)}
              className="w-full py-4 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-white disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                  <span>Reviewing...</span>
                </>
              ) : (
                <span>Request Review</span>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {!feedback && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 glass rounded-2xl border-white/5 opacity-50">
                <p className="text-zinc-500 italic">Run a review and the result will be saved in a thread.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-32 bg-zinc-800 rounded"></div>
                <div className="h-24 bg-zinc-800 rounded"></div>
                <div className="h-24 bg-zinc-800 rounded"></div>
              </div>
            )}

            {feedback && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Director's Verdict</h3>
                  <div className="flex items-center gap-3">
                    {!!selectedThread && (
                      <button
                        onClick={handleDeleteSelectedThread}
                        className="text-[10px] uppercase tracking-widest font-black text-red-300 hover:text-red-200"
                      >
                        Delete Thread
                      </button>
                    )}
                    <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-blue-400 uppercase">Score</span>
                      <span className="text-lg font-black text-blue-400 mono">{feedback.overallScore}/10</span>
                    </div>
                  </div>
                </div>

                <section>
                  <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Key Strengths</h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="bg-green-500/5 border border-green-500/10 p-3 rounded-lg text-sm text-zinc-300 flex items-start">
                        <span className="text-green-500 mr-2">*</span> {s}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Target Improvements</h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {feedback.areasToImprove.map((a, i) => (
                      <li key={i} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-sm text-zinc-300 flex items-start">
                        <span className="text-amber-500 mr-2">!</span> {a}
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="p-4 glass rounded-xl border-blue-500/20">
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Technical Insight</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feedback.technicalAdvice}</p>
                </div>

                <div className="p-4 bg-zinc-900 rounded-xl">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Next Steps</h4>
                  <p className="text-sm text-zinc-300 italic">"{feedback.nextSteps}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {reviewSidebarOpen && (
          <aside className={`no-print absolute top-0 right-0 w-[30rem] max-w-[96vw] rounded-2xl border border-white/10 bg-zinc-950/95 p-5 space-y-5 shadow-2xl ${isAnalyzing ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}>
            {mode === 'BRIEF' && (
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Saved Brief Selection</div>
                <select
                  value={selectedBriefId}
                  onChange={(e) => setSelectedBriefId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200"
                >
                  {!savedBriefs.length && <option value="">No saved briefs yet</option>}
                  {savedBriefs.map((saved) => (
                    <option key={saved.id} value={saved.id}>{saved.brief.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Review Thread (Current Scope)</div>
              {!filteredThreads.length ? (
                <div className="text-xs text-zinc-500 mt-2">No thread yet in this scope.</div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mt-2">
                  {filteredThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full text-left rounded-lg border px-3 py-2 ${selectedThreadId === thread.id ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-100' : 'border-zinc-700 bg-zinc-950/60 text-zinc-300'}`}
                    >
                      <div className="text-[10px] uppercase tracking-widest">{thread.source === 'BRIEF' ? (thread.linkedBriefTitle || 'Saved Brief') : 'Unknown Piece'}</div>
                      <div className="text-xs mt-1">{thread.entries.length} review{thread.entries.length === 1 ? '' : 's'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Thread Archive (All)</div>
              {!allThreads.length ? (
                <div className="text-xs text-zinc-500 mt-2">No review history yet.</div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mt-2">
                  {allThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => openThreadFromArchive(thread)}
                      className="w-full text-left rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2.5 text-zinc-300 hover:border-zinc-500"
                    >
                      <div className="text-[10px] uppercase tracking-widest">{thread.source === 'BRIEF' ? (thread.linkedBriefTitle || 'Saved Brief') : 'Unknown Piece'}</div>
                      <div className="text-xs mt-1">{thread.entries.length} review{thread.entries.length === 1 ? '' : 's'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Entries In Selected Thread</div>
              {!selectedThread?.entries?.length ? (
                <div className="text-xs text-zinc-500 mt-2">No entries yet.</div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1 mt-2">
                  {[...selectedThread.entries].reverse().map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setFeedback(entry.feedback)}
                      className="w-full text-left rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2.5 text-zinc-300 hover:border-zinc-500"
                    >
                      <div className="text-[10px] uppercase tracking-widest">Score {entry.feedback.overallScore}/10</div>
                      <div className="text-xs mt-1 text-zinc-500">{new Date(entry.createdAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default PortfolioReview;





