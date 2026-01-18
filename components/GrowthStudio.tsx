
import React, { useState, useEffect } from 'react';
import { 
  ArtRole, 
  GrowthPlan, 
  StudyMode, 
  DailyHabit, 
  ACADEMY_FACULTIES, 
  Submission,
  Lesson,
  Course,
  AcademyMajor
} from '../types.ts';
import { generateGrowthPlan } from '../services/geminiService.ts';
import RoleIcon from './RoleIcon.tsx';

const DEFAULT_HABITS: DailyHabit[] = [
  { id: '1', label: 'Draw/Model 30 mins', streak: 0, lastDone: 0 },
  { id: '2', label: 'Reference Mining', streak: 0, lastDone: 0 },
  { id: '3', label: 'Industry Research', streak: 0, lastDone: 0 },
];

const AcademyTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="pointer-events-none fixed z-[9999] w-64 -translate-y-[calc(100%+10px)] rounded-xl bg-zinc-900 border border-white/20 p-4 text-[11px] text-zinc-200 opacity-0 transition-all duration-200 group-hover:opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-relaxed text-center">
      <div className="relative">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900"></div>
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

  // Nested Catalog State
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);
  const [expandedMajor, setExpandedMajor] = useState<string | null>(null);
  
  // Workbench State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700); 
  const [studyMode, setStudyMode] = useState<StudyMode>('FOCUS');
  const [sessionObjective, setSessionObjective] = useState('');
  const [activeLessonName, setActiveLessonName] = useState('Select an Academy Lesson');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Custom Architect Form
  const [enrollmentGoal, setEnrollmentGoal] = useState('');
  const [enrollmentRole, setEnrollmentRole] = useState<ArtRole>(currentRole);
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

  const handleEnrollCustom = async () => {
    setIsGenerating(true);
    try {
      const plan = await generateGrowthPlan(enrollmentGoal, enrollmentRole, 30, enrollmentHours);
      setPlans([plan, ...plans]);
      setActivePlanId(plan.id);
      setActiveTab('STATUS');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnrollCourse = (major: AcademyMajor, course: Course) => {
    const plan: GrowthPlan = {
      id: Math.random().toString(36).substr(2, 9),
      goal: `${course.title} (${major.title})`,
      specialization: major.role,
      durationDays: course.lessons.length * 2,
      dailyHours: 2,
      modules: [{
        week: 1,
        focusTitle: course.title,
        dailyTasks: course.lessons.map(l => l.title),
        resources: [{ title: 'Academic References', url_search: `${course.title} reference` }]
      }],
      createdAt: Date.now(),
      completedTasks: []
    };
    setPlans([plan, ...plans]);
    setActivePlanId(plan.id);
    setActiveTab('STATUS');
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

  const startLessonSession = (lessonTitle: string, lessonId: string) => {
    setActiveLessonName(lessonTitle);
    setActiveTaskId(lessonId);
    setSessionObjective('');
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
      notes: `Objective: ${sessionObjective || 'General Practice'} (Lesson: ${activeLessonName})`,
      mode: studyMode,
      durationSeconds: 2700 - timeLeft
    };

    setSubmissions([newSubmission, ...submissions]);
    setPlans(prev => prev.map(p => {
      if (p.id !== activePlanId) return p;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 no-print overflow-visible">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl shadow-inner">🏫</div>
          <div>
            <h2 className="text-3xl font-black gradient-text tracking-tighter uppercase italic leading-none mb-1">Academy Studio</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">Industrial Mastery Hub</p>
          </div>
        </div>

        <div className="flex bg-zinc-950/80 p-1.5 rounded-2xl border border-white/10 shadow-2xl overflow-visible backdrop-blur-xl">
          {(['STATUS', 'ENROLLMENT', 'WORKBENCH', 'ARCHIVE'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === t ? 'bg-zinc-100 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              {t === 'ENROLLMENT' ? 'Course Catalog' : t === 'STATUS' ? 'Academy ID' : t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'STATUS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl space-y-8">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-2xl shadow-xl">🎓</div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight uppercase italic leading-none">Student Profile</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Tier I Artist</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Credibility XP</span>
                  <span className="text-blue-400">XP {submissions.length * 250}</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(100, (submissions.length * 250) / 100)}%` }}></div>
                </div>
              </div>
            </div>

            <section className="glass p-7 rounded-[2rem] border-white/5 shadow-xl relative overflow-visible">
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
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isDone ? 'bg-blue-500/10 border-blue-500/40 shadow-inner' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                    >
                      <span className={`text-xs font-bold ${isDone ? 'text-blue-200/50 line-through' : 'text-zinc-300'}`}>{h.label}</span>
                      <span className="text-[10px] font-black text-zinc-600 uppercase tabular-nums">{h.streak}🔥</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {!activePlan ? (
              <div className="h-[400px] flex flex-col items-center justify-center p-12 glass border-dashed border-white/10 rounded-[3rem] text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner border border-white/5">📓</div>
                <h3 className="text-xl font-black text-white italic uppercase mb-4 tracking-tight">Industrial Registry Incomplete</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-10 leading-relaxed font-medium italic opacity-70">Enroll in a specific course from the catalog to build your mastery syllabus.</p>
                <button onClick={() => setActiveTab('ENROLLMENT')} className="px-12 py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Browse Catalog</button>
              </div>
            ) : (
              <div className="glass p-10 rounded-[3rem] border-white/10 space-y-10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-8">
                   <div className="space-y-2">
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Active Curriculum</span>
                      <h3 className="text-3xl font-black italic uppercase text-white leading-tight tracking-tight">{activePlan.goal}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                         <span className="flex items-center gap-1.5"><RoleIcon role={activePlan.specialization} className="w-3 h-3" /> {activePlan.specialization}</span>
                      </div>
                   </div>
                   <div className="bg-black/40 border border-white/5 p-5 rounded-[2rem] text-center min-w-[140px] shadow-inner">
                      <span className="text-[10px] text-zinc-600 font-black uppercase block mb-1 tracking-widest">Program Mastery</span>
                      <span className="text-4xl font-black text-blue-500 italic tabular-nums">
                        {Math.round((activePlan.completedTasks.length / activePlan.modules.reduce((acc, m) => acc + m.dailyTasks.length, 0)) * 100)}%
                      </span>
                   </div>
                </div>

                <div className="space-y-12">
                  {activePlan.modules.map(module => (
                    <div key={module.week} className="space-y-6">
                       <h4 className="text-lg font-black text-zinc-200 uppercase tracking-tighter italic border-b border-white/5 pb-3">Course Units</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {module.dailyTasks.map((task, idx) => {
                           const taskId = `${module.week}-${idx}`;
                           const isDone = activePlan.completedTasks.includes(taskId);
                           return (
                             <button 
                               key={idx}
                               onClick={() => startLessonSession(task, taskId)}
                               className={`w-full text-left p-6 rounded-[1.8rem] border flex items-center justify-between transition-all group ${isDone ? 'bg-zinc-950 border-white/5 opacity-30 grayscale shadow-none' : 'bg-zinc-900 border-white/5 hover:border-blue-500/40 hover:bg-zinc-800 shadow-xl'}`}
                             >
                               <div className="flex items-center gap-4">
                                 <div className={`w-2.5 h-2.5 rounded-full ${isDone ? 'bg-zinc-700' : 'bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:animate-pulse'}`}></div>
                                 <span className={`text-[11px] font-black leading-relaxed uppercase tracking-tight ${isDone ? 'text-zinc-600' : 'text-zinc-300'}`}>{task}</span>
                               </div>
                               {!isDone && <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Launch Lab</span>}
                             </button>
                           );
                         })}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ENROLLMENT' && (
        <div className="space-y-12 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em]">Academic Directory</span>
             <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Art Academy Catalog</h2>
             <p className="text-zinc-500 text-sm max-w-lg mx-auto leading-relaxed font-medium italic opacity-80">"Structured repetition is the bridge between raw talent and industrial mastery." Choose your Major below.</p>
          </div>

          <div className="space-y-6">
            {ACADEMY_FACULTIES.map(faculty => (
              <div key={faculty.id} className="glass rounded-[3rem] border-white/10 overflow-hidden shadow-2xl relative">
                <button 
                  onClick={() => setExpandedFaculty(expandedFaculty === faculty.id ? null : faculty.id)}
                  className="w-full flex items-center justify-between p-10 hover:bg-white/[0.02] transition-colors group relative z-10"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">{faculty.icon}</div>
                    <div className="text-left">
                       <h3 className="text-2xl font-black italic uppercase text-white leading-none tracking-tight">{faculty.name}</h3>
                       <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">{faculty.description}</p>
                    </div>
                  </div>
                  <div className={`transition-transform duration-500 p-4 rounded-full border border-white/10 ${expandedFaculty === faculty.id ? 'rotate-180 bg-zinc-100 text-zinc-950' : 'text-zinc-700 hover:text-white'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                {expandedFaculty === faculty.id && (
                  <div className="p-10 pt-0 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 border-b border-white/10 pb-4">Major Specializations</h4>
                    {faculty.majors.map(major => (
                      <div key={major.id} className="bg-zinc-950/50 rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-inner">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                               <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
                                 <RoleIcon role={major.role} className="w-6 h-6" />
                               </div>
                               <div>
                                 <h4 className="text-xl font-black italic uppercase text-zinc-100 tracking-tight">{major.title}</h4>
                                 <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mt-1 italic opacity-70">{major.description}</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => setExpandedMajor(expandedMajor === major.id ? null : major.id)}
                              className="px-6 py-3 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-95 shadow-lg"
                            >
                              {expandedMajor === major.id ? 'Hide Courses' : `Explore ${major.courses.length} Courses`}
                            </button>
                         </div>

                         {expandedMajor === major.id && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in duration-500">
                             {major.courses.map(course => (
                               <div key={course.id} className="glass p-8 rounded-[2rem] border-white/5 space-y-6 hover:border-blue-500/30 transition-all group relative overflow-visible shadow-xl">
                                  <div className="space-y-2">
                                     <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Mastery Course</span>
                                        <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">ID: {course.id.toUpperCase()}</span>
                                     </div>
                                     <h5 className="text-xl font-black text-white italic uppercase leading-none tracking-tight">{course.title}</h5>
                                     <p className="text-[11px] text-zinc-500 font-medium italic leading-relaxed opacity-80">{course.description}</p>
                                  </div>
                                  <div className="space-y-4">
                                     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block border-b border-white/5 pb-2">Course Syllabus</span>
                                     <div className="space-y-3">
                                       {course.lessons.map((lesson, li) => (
                                         <div key={li} className="flex flex-col gap-1 border-l-2 border-white/5 pl-4 py-1">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-black text-zinc-300 italic">Topic {li + 1}: {lesson.title}</span>
                                              <span className="text-blue-500/60 uppercase text-[8px] font-black tracking-widest">{lesson.suggestedMileage}</span>
                                            </div>
                                            <p className="text-[9px] text-zinc-600 italic font-medium">Focus: {lesson.focusDescription}</p>
                                         </div>
                                       ))}
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => handleEnrollCourse(major, course)}
                                    className="w-full py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl group-hover:scale-105 active:scale-95 transition-all"
                                  >
                                    Enroll in Course Unit
                                  </button>
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 glass p-12 rounded-[3.5rem] border-white/10 space-y-12 shadow-2xl relative overflow-visible">
             <div className="text-center">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 block">Personalized Syllabi</span>
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tight">Custom Thesis Architect</h3>
                <p className="text-zinc-500 text-xs font-medium italic opacity-70 max-w-md mx-auto mt-2">Define a niche industrial goal for a custom-generated curriculum blueprint.</p>
             </div>
             <div className="max-w-2xl mx-auto space-y-8">
                <input 
                  type="text" 
                  value={enrollmentGoal}
                  onChange={e => setEnrollmentGoal(e.target.value)}
                  placeholder="e.g. Master Realistic Skin Shaders in Unreal Engine 5"
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-8 py-6 outline-none text-white font-black italic uppercase tracking-tight focus:ring-4 focus:ring-blue-500/20 text-xl shadow-inner placeholder:text-zinc-900"
                />
                <button 
                  onClick={handleEnrollCustom}
                  disabled={isGenerating || !enrollmentGoal}
                  className="w-full py-7 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] text-[11px] disabled:opacity-50"
                >
                  {isGenerating ? 'Drafting Industrial Syllabus...' : 'Architect Academy Course'}
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'WORKBENCH' && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start overflow-visible">
          <section className="lg:col-span-8 glass p-12 rounded-[4rem] border-white/10 flex flex-col items-center justify-center space-y-10 min-h-[650px] shadow-2xl relative overflow-visible">
             <div className="text-center w-full space-y-8 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] block">Academy Session Unit</span>
                  <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-tight max-w-2xl mx-auto">{activeLessonName}</h3>
                </div>

                <div className="max-w-lg mx-auto space-y-3">
                   <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Mastery Objective (Session Goal)</label>
                    <AcademyTooltip text="SETTING A SPECIFIC GOAL: Avoid generic terms. Instead of 'drawing heads', try 'Render 5 skeletal skulls from a 45-degree low angle'. Precision breeds speed.">
                      <div className="text-zinc-700 cursor-help"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg></div>
                    </AcademyTooltip>
                   </div>
                   <input 
                      type="text" 
                      value={sessionObjective}
                      onChange={e => setSessionObjective(e.target.value)}
                      placeholder="e.g. Render 5 skeletal heads in profile..."
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:ring-4 focus:ring-blue-500/10 outline-none text-center shadow-inner italic"
                   />
                </div>

                <div className="flex bg-zinc-950/80 p-2 rounded-2xl border border-white/5 w-fit mx-auto shadow-2xl backdrop-blur-xl">
                  <button onClick={() => setStudyMode('FOCUS')} className={`px-12 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studyMode === 'FOCUS' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Focus Study</button>
                  <button onClick={() => setStudyMode('MILEAGE')} className={`px-12 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${studyMode === 'MILEAGE' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Mileage Lab</button>
                </div>
             </div>

             <div className={`text-[11rem] font-black mono text-zinc-100 tabular-nums leading-none tracking-tighter drop-shadow-[0_20px_30px_rgba(255,255,255,0.05)] transition-all duration-700 ${timerRunning ? 'text-blue-500 scale-105' : 'opacity-10 scale-95'}`}>
                {formatTime(timeLeft)}
             </div>

             <div className="flex gap-4 w-full max-w-md relative z-10">
                <button 
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`flex-1 py-6 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-2xl ${timerRunning ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-zinc-100 text-zinc-950 hover:bg-white'}`}
                >
                  {timerRunning ? 'Pause Lab' : 'Ignite Flow'}
                </button>
                {timeLeft < 2700 && (
                  <button 
                    onClick={handleArchiveWork}
                    className="flex-1 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-500 active:scale-95 transition-all shadow-2xl"
                  >
                    Complete Session
                  </button>
                )}
             </div>
          </section>

          <section className="lg:col-span-4 space-y-6">
             <div className="p-10 bg-zinc-900/50 rounded-[3rem] border border-white/5 space-y-8 shadow-xl">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Lab Context</h4>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Protocol</span>
                      <p className="text-xs text-zinc-400 leading-relaxed italic font-medium">"Focus on the underlying machine first. If the perspective is broken, the detail will never save it."</p>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-white/5">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Industrial Benchmarks</span>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                           <span>Anatomical Accuracy</span>
                           <span>8.5/10</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                           <span>Edge Management</span>
                           <span>7.0/10</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        </div>
      )}

      {activeTab === 'ARCHIVE' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
             <div>
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tight leading-none">Academy Archives</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Chronicle of Industrial Evolution</p>
             </div>
             <div className="text-right">
                <span className="text-[9px] font-black text-zinc-600 uppercase block tracking-widest mb-1">Total Training Time</span>
                <span className="text-2xl font-black text-zinc-100 mono uppercase tabular-nums tracking-tighter italic">
                  {Math.floor(submissions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600)}H {Math.floor((submissions.reduce((acc, s) => acc + s.durationSeconds, 0) % 3600) / 60)}M
                </span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {submissions.length === 0 ? (
               <div className="col-span-full py-28 text-center glass rounded-[3rem] border-dashed border-white/10 opacity-30 italic font-medium uppercase tracking-[0.2em]">Registry waiting for archival entries.</div>
             ) : (
               submissions.map(entry => (
                 <div key={entry.id} className="glass p-8 rounded-[2.5rem] border-white/10 hover:border-blue-500/30 transition-all group shadow-xl hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-6">
                       <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleDateString()}</span>
                       <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-[0.2em] ${entry.mode === 'FOCUS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                         {entry.mode} LAB
                       </span>
                    </div>
                    <h4 className="text-lg font-black italic uppercase text-zinc-200 mb-6 leading-tight group-hover:text-white transition-colors">{entry.notes}</h4>
                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                       <svg className="w-4 h-4 text-zinc-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                       <span className="text-[10px] font-black text-zinc-500 mono uppercase tabular-nums tracking-widest">{formatTime(entry.durationSeconds)} Logged</span>
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
