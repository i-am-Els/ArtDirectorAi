
import React, { useState, useEffect } from 'react';
import { 
  ArtRole, 
  GrowthPlan, 
  StudyMode, 
  DailyHabit, 
  ACADEMY_DEPARTMENTS, 
  Submission,
  INDUSTRY_PATHS,
  IndustryPathTemplate
} from '../types.ts';
import { generateGrowthPlan } from '../services/geminiService.ts';
// Fix: Import RoleIcon which was missing
import RoleIcon from './RoleIcon.tsx';

const DEFAULT_HABITS: DailyHabit[] = [
  { id: '1', label: 'Draw/Model 30 mins', streak: 0, lastDone: 0 },
  { id: '2', label: 'Reference Mining', streak: 0, lastDone: 0 },
  { id: '3', label: 'Industry Research', streak: 0, lastDone: 0 },
];

const AcademyTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="pointer-events-none fixed z-[9999] w-64 -translate-x-1/2 -translate-y-[110%] rounded-xl bg-zinc-900 border border-white/20 p-4 text-[11px] text-zinc-200 opacity-0 transition-all duration-200 group-hover:opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-relaxed text-center" 
         style={{ top: 'auto', bottom: 'auto', left: 'auto' }}>
      <div className="relative">
        {text}
        <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-8 border-transparent border-t-zinc-900"></div>
      </div>
    </div>
  </div>
);

const GrowthStudio: React.FC<{ currentRole: ArtRole }> = ({ currentRole }) => {
  const [plans, setPlans] = useState<GrowthPlan[]>(() => {
    const saved = localStorage.getItem('art_academy_plans');
    return saved ? JSON.parse(saved) : [];
  });
  const [habits, setHabits] = useState<DailyHabit[]>(() => {
    const saved = localStorage.getItem('art_academy_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('art_academy_submissions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<'STATUS' | 'ENROLLMENT' | 'WORKBENCH' | 'ARCHIVE'>('STATUS');
  const [activePlanId, setActivePlanId] = useState<string | null>(plans[0]?.id || null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Workbench State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700); // 45m
  const [studyMode, setStudyMode] = useState<StudyMode>('FOCUS');
  const [sessionTarget, setSessionTarget] = useState<string>('Select an assignment unit');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Enrollment Form
  const [enrollmentGoal, setEnrollmentGoal] = useState('');
  const [enrollmentRole, setEnrollmentRole] = useState<ArtRole>(currentRole);
  const [enrollmentDays, setEnrollmentDays] = useState(30);
  const [enrollmentHours, setEnrollmentHours] = useState(2);

  useEffect(() => {
    localStorage.setItem('art_academy_plans', JSON.stringify(plans));
    if (!activePlanId && plans.length > 0) setActivePlanId(plans[0].id);
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('art_academy_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('art_academy_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleArchiveWork();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const handleEnroll = async (template?: IndustryPathTemplate) => {
    setIsGenerating(true);
    try {
      const plan = await generateGrowthPlan(
        template?.goal || enrollmentGoal,
        template?.role || enrollmentRole,
        template?.days || enrollmentDays,
        template?.hours || enrollmentHours
      );
      setPlans([plan, ...plans]);
      setActivePlanId(plan.id);
      setActiveTab('STATUS');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Fix: Implemented missing handleApplyTemplate function
  const handleApplyTemplate = (template: IndustryPathTemplate) => {
    handleEnroll(template);
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const today = new Date().toDateString();
      const lastDone = h.lastDone ? new Date(h.lastDone).toDateString() : '';
      const isAlreadyDone = lastDone === today;
      return { 
        ...h, 
        lastDone: isAlreadyDone ? 0 : Date.now(),
        streak: isAlreadyDone ? Math.max(0, h.streak - 1) : h.streak + 1 
      };
    }));
  };

  const launchAssignment = (task: string, taskId: string) => {
    setSessionTarget(task);
    setActiveTaskId(taskId);
    setActiveTab('WORKBENCH');
    setTimerRunning(false);
    setTimeLeft(2700);
  };

  const handleArchiveWork = () => {
    if (!activePlanId || !activeTaskId) return;
    
    const newSubmission: Submission = {
      id: Math.random().toString(36).substring(2, 9),
      planId: activePlanId,
      taskId: activeTaskId,
      timestamp: Date.now(),
      notes: `Completed Course Unit: ${sessionTarget}`,
      mode: studyMode,
      durationSeconds: 2700 - timeLeft
    };

    setSubmissions([newSubmission, ...submissions]);
    
    setPlans(prev => prev.map(p => {
      if (p.id !== activePlanId) return p;
      if (p.completedTasks.includes(activeTaskId)) return p;
      return { ...p, completedTasks: [...p.completedTasks, activeTaskId] };
    }));

    setTimerRunning(false);
    setTimeLeft(2700);
    setActiveTab('ARCHIVE');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activePlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 overflow-visible">
      {/* Academy Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 no-print overflow-visible">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl shadow-inner">🏫</div>
          <div>
            <h2 className="text-3xl font-black gradient-text tracking-tighter uppercase italic leading-none mb-1">Academy Studio</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              Industrial Mastery Registry <span className="w-1 h-1 bg-zinc-700 rounded-full"></span> Batch 2025-Q1
            </p>
          </div>
        </div>

        <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-white/5 shadow-2xl overflow-visible">
          {(['STATUS', 'ENROLLMENT', 'WORKBENCH', 'ARCHIVE'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === t ? 'bg-zinc-100 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              {t === 'STATUS' ? 'Student ID' : t === 'ENROLLMENT' ? 'Faculties' : t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'STATUS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Student Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-visible group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="flex items-center space-x-5 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-2xl shadow-xl">🎓</div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg border-2 border-zinc-950 flex items-center justify-center text-[10px] text-white font-bold">L1</div>
                </div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight uppercase italic">Student Artist</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Verified Profile</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>Industrial Credibility</span>
                    <span className="text-blue-400">XP {submissions.length * 150}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (submissions.length * 150) / 100)}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 text-center">
                    <span className="text-[9px] font-black text-zinc-600 uppercase block mb-1 tracking-widest">Attendance</span>
                    <span className="text-2xl font-black text-zinc-100 italic tabular-nums">{habits[0].streak}D</span>
                  </div>
                  <div className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 text-center">
                    <span className="text-[9px] font-black text-zinc-600 uppercase block mb-1 tracking-widest">Archive Units</span>
                    <span className="text-2xl font-black text-zinc-100 italic tabular-nums">{submissions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <section className="glass p-7 rounded-[2rem] border-white/5 relative overflow-visible shadow-xl">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Daily Rituals
              </h3>
              <div className="space-y-3">
                {habits.map(h => {
                  const isDone = new Date(h.lastDone).toDateString() === new Date().toDateString();
                  return (
                    <button 
                      key={h.id} 
                      onClick={() => toggleHabit(h.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isDone ? 'bg-blue-500/10 border-blue-500/40 shadow-inner' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                    >
                      <span className={`text-xs font-bold ${isDone ? 'text-blue-200/50 line-through' : 'text-zinc-300'}`}>{h.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tabular-nums">{h.streak}🔥</span>
                        {isDone && <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Majors & Syllabus Display */}
          <div className="lg:col-span-8 space-y-6">
            {plans.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center p-12 glass border-dashed border-white/10 rounded-[3rem] text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner border border-white/5">📋</div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-3">No Active Enrollment</h3>
                <p className="text-sm text-zinc-500 max-w-sm mb-10 leading-relaxed font-medium">You haven't signed into a specialization yet. The Academy directory hosts several faculties for your industrial growth.</p>
                <button onClick={() => setActiveTab('ENROLLMENT')} className="px-12 py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Visit Directory</button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Major Switching Interface */}
                <div className="flex flex-wrap items-center gap-3 no-print">
                   <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mr-2">Enrolled Majors:</span>
                   {plans.map(p => (
                     <button 
                       key={p.id}
                       onClick={() => setActivePlanId(p.id)}
                       className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${activePlanId === p.id ? 'bg-blue-600 text-white border-transparent' : 'bg-zinc-900/50 text-zinc-500 border border-white/5 hover:border-white/20'}`}
                     >
                       {p.specialization}
                     </button>
                   ))}
                   <button onClick={() => setActiveTab('ENROLLMENT')} className="w-10 h-10 rounded-xl bg-zinc-900 border border-dashed border-white/10 text-zinc-500 flex items-center justify-center hover:border-white/30 transition-all">+</button>
                </div>

                {activePlan && (
                  <div className="glass p-10 rounded-[3rem] border-white/10 space-y-10 relative overflow-visible shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
                       <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Major Program</span>
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ID: {activePlan.id.toUpperCase()}</span>
                          </div>
                          <h3 className="text-3xl font-black italic uppercase text-white leading-tight">{activePlan.goal}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                             <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" /></svg> Faculty: {activePlan.specialization}</span>
                             <span className="flex items-center gap-1.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg> Intensity: {activePlan.dailyHours}H / D</span>
                          </div>
                       </div>
                       <div className="bg-black/40 border border-white/5 p-5 rounded-[2rem] text-center min-w-[150px] shadow-inner">
                          <span className="text-[10px] text-zinc-600 font-black uppercase block mb-1 tracking-widest">Program Credits</span>
                          <span className="text-4xl font-black text-blue-500 italic tabular-nums">
                            {Math.round((activePlan.completedTasks.length / (activePlan.modules.length * 7)) * 100)}%
                          </span>
                       </div>
                    </div>

                    <div className="space-y-12">
                      {activePlan.modules.map(module => (
                        <div key={module.week} className="space-y-6">
                           <div className="flex items-center justify-between border-b border-white/5 pb-3">
                             <div className="flex items-center space-x-4">
                               <div className="px-4 py-1.5 bg-zinc-800 rounded-xl text-[10px] font-black text-zinc-400 border border-white/5 shadow-md">COURSE TERM {module.week}</div>
                               <h4 className="text-lg font-black text-zinc-200 uppercase tracking-tighter italic">{module.focusTitle}</h4>
                             </div>
                             <AcademyTooltip text="Completion rate for this specific course module. Finalize all units to advance your standing.">
                               <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                                 {module.dailyTasks.filter((_, i) => activePlan.completedTasks.includes(`${module.week}-${i}`)).length} / {module.dailyTasks.length} Units
                               </span>
                             </AcademyTooltip>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {module.dailyTasks.map((task, idx) => {
                               const taskId = `${module.week}-${idx}`;
                               const isDone = activePlan.completedTasks.includes(taskId);
                               return (
                                 <div key={idx} className="flex gap-2">
                                    <button 
                                      onClick={() => launchAssignment(task, taskId)}
                                      className={`flex-1 text-left p-5 rounded-[1.5rem] border flex items-center justify-between transition-all group ${isDone ? 'bg-zinc-950 border-white/5 opacity-40 grayscale' : 'bg-zinc-900 border-white/5 hover:border-blue-500/40 hover:bg-zinc-800 shadow-xl'}`}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full transition-colors ${isDone ? 'bg-zinc-800' : 'bg-blue-600 group-hover:animate-pulse'}`}></div>
                                        <span className={`text-[11px] font-bold leading-relaxed ${isDone ? 'text-zinc-600' : 'text-zinc-300'}`}>{task}</span>
                                      </div>
                                      {!isDone && <span className="text-[9px] font-black text-blue-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">Launch</span>}
                                    </button>
                                 </div>
                               );
                             })}
                           </div>

                           <div className="flex flex-wrap gap-2 pt-2">
                             {module.resources.map((res, ridx) => (
                               <a 
                                 key={ridx} 
                                 href={`https://www.google.com/search?q=${encodeURIComponent(res.url_search)}`} 
                                 target="_blank"
                                 className="px-4 py-2 bg-black/40 border border-white/5 rounded-full text-[9px] font-black text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center gap-2 uppercase tracking-widest"
                               >
                                 <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101" /></svg>
                                 {res.title}
                               </a>
                             ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ENROLLMENT' && (
        <div className="space-y-12">
          {/* Predefined Paths Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
               <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Fast-Track Specializations</h3>
               <AcademyTooltip text="Industry-standard blueprints tailored for specific professional goals. Select one to bypass custom architecting.">
                 <div className="text-zinc-700 cursor-help"><svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg></div>
               </AcademyTooltip>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {INDUSTRY_PATHS.map(path => (
                <button 
                  key={path.id}
                  onClick={() => handleApplyTemplate(path)}
                  disabled={isGenerating}
                  className="text-left glass p-8 rounded-[2.5rem] border-white/5 hover:border-blue-500/40 transition-all group active:scale-95 disabled:opacity-50 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                    <RoleIcon role={path.role} className="w-20 h-20" />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black rounded-lg uppercase tracking-widest border border-blue-500/20">{path.days} DAYS Intensive</span>
                  </div>
                  <h4 className="text-xl font-black italic uppercase text-zinc-100 mb-3 group-hover:text-blue-400 transition-colors tracking-tight">{path.label}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium mb-6 italic">"{path.description}"</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{path.role}</span>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Enroll Now →</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Architect Area */}
          <div className="max-w-4xl mx-auto glass p-12 rounded-[3.5rem] border-white/10 space-y-12 relative overflow-visible shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
             <div className="text-center space-y-3">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Personalized Curricula</span>
                <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">Syllabus Architect</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto font-medium leading-relaxed italic opacity-80">Define a custom target. Our AI Professor will draft a multi-term industrial blueprint for your mastery.</p>
             </div>
             
             <div className="space-y-10">
                {/* Faculty Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {ACADEMY_DEPARTMENTS.map(dept => (
                    <div key={dept.id} className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-b border-white/5 pb-2">{dept.name}</h4>
                       <div className="flex flex-col gap-1.5">
                         {dept.roles.map(role => (
                           <button 
                             key={role}
                             onClick={() => {
                               setEnrollmentRole(role);
                               if (!enrollmentGoal) setEnrollmentGoal(`Industrial Proficiency in ${role}`);
                             }}
                             className={`text-left px-4 py-3 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tight ${enrollmentRole === role ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/10'}`}
                           >
                             {role}
                           </button>
                         ))}
                       </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Mastery Objective</label>
                      <AcademyTooltip text="High-specific goals yield high-precision results. Avoid generic terms. Try 'Master hard-surface vehicle texturing' instead of 'learn materials'.">
                        <div className="text-zinc-700 cursor-help"><svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg></div>
                      </AcademyTooltip>
                   </div>
                   <input 
                      type="text" 
                      value={enrollmentGoal}
                      onChange={e => setEnrollmentGoal(e.target.value)}
                      placeholder="e.g. Cinematic Lighting for Horror Sequences"
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-8 py-6 outline-none text-white font-black italic uppercase tracking-tight focus:ring-4 focus:ring-blue-500/10 transition-all text-xl placeholder:text-zinc-800"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Syllabus Length (Days)</label>
                      <input type="number" value={enrollmentDays} onChange={e => setEnrollmentDays(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-mono" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Daily Lab Hours</label>
                      <select value={enrollmentHours} onChange={e => setEnrollmentHours(parseFloat(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none text-white font-mono appearance-none">
                        {[0.5, 1, 2, 4, 6, 8, 10].map(h => <option key={h} value={h}>{h} Hours</option>)}
                      </select>
                   </div>
                </div>

                <button 
                  onClick={() => handleEnroll()}
                  disabled={isGenerating || !enrollmentGoal}
                  className="w-full py-7 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] text-sm disabled:opacity-50"
                >
                  {isGenerating ? 'Compiling Syllabi...' : 'Finalize Academy Enrollment'}
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'WORKBENCH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-visible">
          <section className="lg:col-span-8 glass p-12 rounded-[4rem] border-white/10 flex flex-col items-center justify-center space-y-12 min-h-[600px] relative overflow-visible shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
             <div className="text-center w-full relative z-10">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-3 block">Live Production Lab</span>
                <h3 className="text-3xl font-black italic uppercase text-white mb-8 tracking-tight max-w-2xl mx-auto leading-tight">{sessionTarget}</h3>
                
                <div className="flex bg-zinc-950/80 p-2 rounded-[1.5rem] border border-white/5 w-fit mx-auto shadow-2xl backdrop-blur-xl">
                  <AcademyTooltip text="STUDY MODE (FOCUS): High-precision rendering, Slow Pace. Prioritize correctness, polish, and detail.">
                    <button onClick={() => setStudyMode('FOCUS')} className={`px-12 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${studyMode === 'FOCUS' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Study</button>
                  </AcademyTooltip>
                  <AcademyTooltip text="MILEAGE MODE (QUANTITY): High-volume gesture, Silhouettes. Prioritize flow, speed, and repetition.">
                    <button onClick={() => setStudyMode('MILEAGE')} className={`px-12 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${studyMode === 'MILEAGE' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Mileage</button>
                  </AcademyTooltip>
                </div>
             </div>

             <div className={`text-[10rem] font-black mono text-zinc-100 tabular-nums leading-none tracking-tighter drop-shadow-2xl transition-all duration-500 ${timerRunning ? 'text-blue-500 scale-105' : 'opacity-20'}`}>
                {formatTime(timeLeft)}
             </div>

             <div className="flex gap-4 w-full max-w-md relative z-10">
                <button 
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl active:scale-95 ${timerRunning ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-zinc-100 text-zinc-950 hover:bg-white'}`}
                >
                  {timerRunning ? 'Pause Session' : 'Ignite Flow'}
                </button>
                {timeLeft < 2700 && (
                  <button 
                    onClick={handleArchiveWork}
                    className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95"
                  >
                    Submit Entry
                  </button>
                )}
             </div>

             {timerRunning && (
               <div className="absolute top-10 right-10 flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Capture</span>
               </div>
             )}
          </section>

          <section className="lg:col-span-4 space-y-6">
             <div className="p-10 bg-zinc-900/50 rounded-[3rem] border border-white/5 space-y-8 shadow-xl">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Lab Resources</h4>
                <div className="space-y-4">
                   {activePlan?.modules[0]?.resources.map((res, i) => (
                      <a key={i} href={`https://www.google.com/search?q=${encodeURIComponent(res.url_search)}`} target="_blank" className="flex items-center justify-between p-5 bg-zinc-950 border border-white/5 rounded-2xl group hover:border-blue-500/50 transition-all shadow-lg">
                        <span className="text-xs font-bold text-zinc-400 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{res.title}</span>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-700 group-hover:text-blue-500" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                   ))}
                </div>
             </div>

             <div className="p-10 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] relative overflow-hidden group shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <svg viewBox="0 0 24 24" className="w-24 h-24" fill="currentColor"><path d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2-12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Academy Protocol
                </h4>
                <p className="text-[13px] text-blue-200/60 leading-relaxed italic relative z-10 font-medium">
                  "The gap between intermediate and master is filled with mileage. Don't fear the bad drawing; draw enough of them until the good ones have no choice but to emerge."
                </p>
             </div>
          </section>
        </div>
      )}

      {activeTab === 'ARCHIVE' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
             <div>
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tight">Student Archives</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Chronicle of Industrial Evolution</p>
             </div>
             <div className="flex gap-4">
               <div className="text-right">
                  <span className="text-[9px] font-black text-zinc-600 uppercase block tracking-widest mb-1">Total Lab Time</span>
                  <span className="text-lg font-black text-zinc-100 mono uppercase tabular-nums">
                    {Math.floor(submissions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600)}H {Math.floor((submissions.reduce((acc, s) => acc + s.durationSeconds, 0) % 3600) / 60)}M
                  </span>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {submissions.length === 0 ? (
               <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-white/10 opacity-50">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest">No entries recorded in the archives yet.</p>
               </div>
             ) : (
               submissions.map(entry => (
                 <div key={entry.id} className="glass p-8 rounded-[2.5rem] border-white/10 hover:border-blue-500/30 transition-all group shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString()}</span>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${entry.mode === 'FOCUS' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                         {entry.mode} Session
                       </span>
                    </div>
                    <h4 className="text-lg font-black italic uppercase text-zinc-200 mb-4 leading-tight group-hover:text-white transition-colors">
                      {entry.notes.replace('Completed Course Unit: ', '')}
                    </h4>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                       <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-zinc-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                          <span className="text-[10px] font-black text-zinc-500 mono uppercase">{formatTime(entry.durationSeconds)}</span>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthStudio;
