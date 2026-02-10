
import React, { useState, useEffect } from 'react';
import {
  ArtRole,
  UserProgress,
  StudyMode,
  LessonStatus,
  AcademyMajor,
  Course,
  Subject,
  Lesson,
  Faculty
} from '../types';
import { ACADEMY_FACULTIES } from '../data/curriculum';
import {
  getUserProgress,
  enrollInMajor,
  enrollInMinor,
  unenrollFromMajor,
  getMajorCurriculum,
  updateLessonProgress
} from '../services/academyService';
import RoleIcon from './RoleIcon';
import SeedButton from './Admin/SeedButton';

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

const GrowthStudio: React.FC<{ currentRole: ArtRole; userId: string }> = ({ currentRole, userId }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'STATUS' | 'ENROLLMENT' | 'CURRICULUM' | 'WORKBENCH'>('STATUS');

  // Data State
  const [activeMajor, setActiveMajor] = useState<AcademyMajor | null>(null);
  const [loadingMajor, setLoadingMajor] = useState(false);
  const [viewingMajor, setViewingMajor] = useState<{ faculty: Faculty, major: AcademyMajor } | null>(null);

  // Navigation State
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Workbench State
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700);
  const [sessionMode, setSessionMode] = useState<StudyMode>(StudyMode.FOCUS);
  const [sessionObjective, setSessionObjective] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchProgress();
  }, [userId]);

  // Fetch Major Data when enrolled
  useEffect(() => {
    if (progress?.enrolledMajorId) {
      loadMajorData(progress.enrolledMajorId);
    }
  }, [progress, userId]);

  // Auto-switch to curriculum only if actively enrolled and data loaded
  useEffect(() => {
    if (progress?.enrolledMajorId && activeMajor && activeTab === 'ENROLLMENT') {
      setActiveTab('CURRICULUM');
    }
  }, [activeMajor]);

  const fetchProgress = async () => {
    const p = await getUserProgress(userId);
    setProgress(p);
  };

  const loadMajorData = async (majorId: string) => {
    setLoadingMajor(true);
    const major = await getMajorCurriculum(majorId);
    if (major) {
      setActiveMajor(major);
    } else {
      console.warn(`Major data not found for ID: ${majorId}. Check seeding.`);
    }
    setLoadingMajor(false);
  };

  const handleEnroll = async (majorId: string) => {
    if (progress?.enrolledMajorId) {
      if (!window.confirm("You are already enrolled in a Major. Switching Majors will archive your current progress but you may lose momentum. Are you sure?")) {
        return;
      }
    }
    await enrollInMajor(userId, majorId);
    await fetchProgress();
    setViewingMajor(null);
    setActiveTab('CURRICULUM');
  };

  const handleEnrollMinor = async (minorId: string) => {
    if (progress?.enrolledMinorId === minorId) return;
    await enrollInMinor(userId, minorId);
    await fetchProgress();
  };

  const handleWithdraw = async () => {
    if (!activeMajor) return;
    if (window.confirm("Are you sure you want to withdraw? Your progress record will be retained but your enrollment slot will be freed.")) {
      await unenrollFromMajor(userId, activeMajor.id);
      await fetchProgress();
      setActiveMajor(null);
      setActiveTab('ENROLLMENT');
    }
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSessionMode(lesson.defaultStudyMode || lesson.default_study_mode || StudyMode.FOCUS);
    setSessionObjective(lesson.objective);
    setTimeLeft((lesson.estimatedEffort || lesson.estimated_effort_minutes || 45) * 60);
    setActiveTab('WORKBENCH');
  };

  const completeSession = async () => {
    if (!activeLesson) return;
    await updateLessonProgress(userId, activeLesson.id, LessonStatus.COMPLETED, sessionMode);
    await fetchProgress();
    setTimerRunning(false);
    setActiveTab('CURRICULUM');
  };

  const handleSearchLesson = (query: string) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " tutorial art")}`;
    window.open(searchUrl, '_blank');
  };

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalXP = (progress?.completedLessonIds.length || 0) * 250;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl shadow-inner">🏛️</div>
          <div>
            <h2 className="text-3xl font-black gradient-text tracking-tighter uppercase italic leading-none mb-1">Academy Studio</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">Static Content Model v1.0</p>
          </div>
        </div>

        <div className="flex bg-zinc-950/80 p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
          {(['STATUS', 'ENROLLMENT', 'CURRICULUM', 'WORKBENCH'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setViewingMajor(null); }}
              // Disable tabs if not relevant
              disabled={t === 'WORKBENCH' && !activeLesson || (t === 'CURRICULUM' && !activeMajor)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest 
                ${activeTab === t ? 'bg-zinc-100 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}
                ${(t === 'WORKBENCH' && !activeLesson) || (t === 'CURRICULUM' && !activeMajor) ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* STATUS TAB */}
      {activeTab === 'STATUS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl space-y-8">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-2xl shadow-xl">🎓</div>
                <div>
                  <h3 className="font-black text-white text-xl tracking-tight uppercase italic leading-none">Student Card</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">ID: {userId.substring(0, 8)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Academy XP</span>
                  <span className="text-blue-400">{totalXP} XP</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${Math.min(100, totalXP / 100)}%` }}></div>
                </div>
              </div>
            </div>

            {activeMajor && (
              <div className="glass p-8 rounded-[2rem] border-blue-500/20 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest relative z-10">Generative Enrollment</h4>
                <div className="space-y-2 relative z-10">
                  <h3 className="text-2xl font-black italic uppercase text-white leading-none">{activeMajor.title}</h3>
                  <p className="text-xs text-zinc-400 font-medium">{activeMajor.code}</p>
                </div>
                <button
                  onClick={handleWithdraw}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Withdraw Major
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            {!activeMajor ? (
              <div className="h-[400px] flex flex-col items-center justify-center p-12 glass border-dashed border-white/10 rounded-[3rem] text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner border border-white/5">📜</div>
                <h3 className="text-xl font-black text-white italic uppercase mb-4 tracking-tight">No Active Major</h3>
                <button onClick={() => setActiveTab('ENROLLMENT')} className="px-12 py-5 bg-zinc-100 text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">Browse Catalog</button>
              </div>
            ) : (
              <div className="glass p-10 rounded-[3rem] border-white/10 text-center">
                <h3 className="text-2xl font-black text-white italic uppercase mb-4">You are Enrolled!</h3>
                <p className="text-zinc-400 mb-8">Go to the Curriculum tab to start your courses.</p>
                <button onClick={() => setActiveTab('CURRICULUM')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">Open Curriculum</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ENROLLMENT TAB */}
      {activeTab === 'ENROLLMENT' && !viewingMajor && (
        <div className="space-y-12 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">Academy Catalog</h2>
            <p className="text-zinc-500 text-sm italic">Select a Major to begin your journey.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {ACADEMY_FACULTIES.map(faculty => (
              <div key={faculty.id} className="glass rounded-[3rem] border-white/10 p-8 space-y-8">
                <div className="flex items-center gap-6 border-b border-white/5 pb-6">
                  <span className="text-4xl">{faculty.icon}</span>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-white">{faculty.name}</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{faculty.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {faculty.majors.map(major => (
                    <button
                      key={major.id}
                      onClick={() => setViewingMajor({ faculty, major })}
                      className={`text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden group
                        ${progress?.enrolledMajorIds?.includes(major.id)
                          ? 'bg-blue-600/10 border-blue-500/50'
                          : 'bg-zinc-900/50 border-white/5 hover:border-white/20 hover:bg-zinc-800'
                        }`}
                    >
                      <div className="space-y-4 relative z-10">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{major.role}</span>
                        <h4 className="text-lg font-black italic uppercase text-white leading-tight">{major.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          {major.software.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-1 bg-black/40 rounded-lg text-[8px] text-zinc-400 font-medium uppercase">{s}</span>
                          ))}
                        </div>
                        <div className="text-[10px] font-black text-zinc-600 uppercase group-hover:text-white transition-colors">
                          {progress?.enrolledMajorIds?.includes(major.id) ? 'View Enrolled Major →' : 'View Details →'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED ENROLLMENT VIEW */}
      {activeTab === 'ENROLLMENT' && viewingMajor && (
        <div className="max-w-6xl mx-auto space-y-12 animate-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => setViewingMajor(null)}
            className="flex items-center gap-3 text-zinc-500 hover:text-white transition-all group mb-8"
          >
            <div className="p-2 bg-zinc-900 rounded-full border border-white/5 group-hover:border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Catalog</span>
          </button>

          <div className="glass rounded-[4rem] border-white/10 p-12 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/5 to-transparent blur-3xl -mr-32 -mt-32"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-12 items-start border-b border-white/5 pb-12 mb-12">
                <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-5xl shadow-2xl">{viewingMajor.faculty.icon}</div>
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{viewingMajor.faculty.name}</span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">{viewingMajor.major.code}</span>
                  </div>
                  <h2 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none">{viewingMajor.major.title}</h2>
                  <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-3xl">{viewingMajor.major.description}</p>
                </div>

                <div>
                  {progress?.enrolledMajorId === viewingMajor.major.id ? (
                    <div className="px-8 py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black uppercase tracking-widest text-xs">Currently Enrolled</div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(viewingMajor.major.id)}
                      className="px-12 py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 shadow-2xl transition-all"
                    >
                      Enroll in Major
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Career Outcomes</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingMajor.major.outcomes.map(o => (
                      <span key={o} className="px-3 py-1.5 bg-zinc-950 border border-white/5 rounded-xl text-[10px] font-bold text-zinc-300">{o}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Core Software Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingMajor.major.software.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black tracking-widest text-blue-300 uppercase italic">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Select Minor (Secondary Skill)</h4>
                  <div className="flex flex-wrap gap-2">
                    {ACADEMY_FACULTIES.flatMap(f => f.majors)
                      .filter(m => m.id !== viewingMajor.major.id)
                      .map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleEnrollMinor(m.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase italic transition-all border ${progress?.enrolledMinorId === m.id
                            ? 'bg-purple-500 text-white border-purple-400'
                            : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                            }`}
                        >
                          {m.title}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-2xl font-black italic uppercase text-white border-l-4 border-blue-500 pl-6">Industrial Syllabus Preview</h3>
                <div className="grid grid-cols-1 gap-6">
                  {viewingMajor.major.courses.map(course => (
                    <div key={course.id} className="group glass p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all shadow-xl">
                      <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="lg:w-1/4 space-y-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${course.tier === 'Foundations' ? 'bg-zinc-800 text-zinc-400' :
                            course.tier === 'Production' ? 'bg-blue-600/20 text-blue-400' :
                              'bg-purple-600/20 text-purple-400'
                            }`}>{course.tier}</span>
                          <h4 className="text-2xl font-black italic uppercase text-white leading-tight tracking-tight">{course.title}</h4>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{(course.subjects || []).length} Subjects • {(course.lessons || []).length + (course.subjects || []).flatMap(s => s.lessons).length} Lessons</p>
                        </div>
                        <div className="lg:w-3/4">
                          <p className="text-sm text-zinc-400 font-medium italic leading-relaxed mb-6">{course.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(course.subjects || []).slice(0, 4).map(sub => (
                              <div key={sub.id} className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                <h5 className="text-xs font-bold text-zinc-200">{sub.title}</h5>
                                <p className="text-[10px] text-zinc-500 mt-1 truncate">{sub.description}</p>
                              </div>
                            ))}
                            {(course.subjects || []).length > 4 && (
                              <div className="p-4 flex items-center justify-center text-[10px] font-black uppercase text-zinc-600">
                                + {(course.subjects || []).length - 4} More Subjects
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CURRICULUM TAB */}
      {activeTab === 'CURRICULUM' && activeMajor && (
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex items-end justify-between border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Active Major</span>
                {progress?.enrolledMinorId && (
                  <>
                    <span className="text-zinc-700 font-bold text-xs">•</span>
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Secondary: {ACADEMY_FACULTIES.flatMap(f => f.majors).find(m => m.id === progress.enrolledMinorId)?.title}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">{activeMajor.title}</h2>
              <p className="text-lg text-zinc-400 font-medium mt-4 max-w-2xl">{activeMajor.description}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Completion</span>
              <span className="text-4xl font-black text-zinc-200 mono">
                {Math.round((progress?.completedLessonIds.length || 0) / Math.max(1, activeMajor.courses.flatMap(c => (c.subjects || []).flatMap(s => s.lessons).concat(c.lessons || [])).length) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-8">
            {activeMajor.courses.map(course => (
              <div key={course.id} className="glass rounded-[2.5rem] border-white/5 overflow-hidden">
                <div
                  className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                >
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${course.isCore ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {course.code}
                    </span>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase text-white">{course.title}</h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{(course.subjects || []).length} Subjects</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center transition-transform ${expandedCourseId === course.id ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </div>

                {expandedCourseId === course.id && (
                  <div className="bg-black/20 p-8 pt-0 space-y-4">
                    {(course.subjects || []).map(subject => (
                      <div key={subject.id} className="border-l-2 border-white/10 pl-6 ml-4 space-y-4 py-4">
                        <div
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}
                        >
                          <div>
                            <h4 className="text-lg font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">{subject.title}</h4>
                            <p className="text-xs text-zinc-500 italic mt-1">{subject.description}</p>
                          </div>
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">{subject.lessons.length} Lessons</span>
                        </div>

                        {expandedSubjectId === subject.id && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                            {subject.lessons.map(lesson => {
                              const isCompleted = progress?.completedLessonIds.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => startLesson(lesson)}
                                  className={`text-left p-4 rounded-xl border flex items-center gap-4 transition-all
                                     ${isCompleted
                                      ? 'bg-green-900/10 border-green-500/20 opacity-50'
                                      : 'bg-zinc-800/50 border-white/5 hover:bg-zinc-800 hover:border-white/10 shadow-lg'
                                    }`}
                                >
                                  <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${lesson.defaultStudyMode === StudyMode.FOCUS ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>{lesson.defaultStudyMode}</span>
                                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{lesson.type}</span>
                                    </div>
                                    <h5 className="text-xs font-bold text-zinc-300 leading-tight">{lesson.title}</h5>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKBENCH TAB */}
      {activeTab === 'WORKBENCH' && activeLesson && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-10 rounded-[3rem] border-white/10 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] block">Active Session</span>
              <h2 className="text-3xl font-black italic uppercase text-white leading-tight">{activeLesson.title}</h2>
              <p className="text-zinc-400 text-sm font-medium max-w-md mx-auto">{sessionObjective}</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setSessionMode(StudyMode.FOCUS)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${sessionMode === StudyMode.FOCUS ? 'bg-blue-600 text-white border-blue-500' : 'bg-zinc-900 text-zinc-500 border-white/10'}`}
              >
                Focus Mode
              </button>
              <button
                onClick={() => setSessionMode(StudyMode.MILEAGE)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${sessionMode === StudyMode.MILEAGE ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-500 border-white/10'}`}
              >
                Mileage Mode
              </button>
            </div>

            <div className={`text-center transition-all duration-700 ${timerRunning ? 'scale-110' : ''}`}>
              <div className="text-[8rem] font-black mono text-zinc-100 tabular-nums leading-none tracking-tighter shadow-black drop-shadow-2xl">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`flex-1 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${timerRunning ? 'bg-red-500/10 text-red-500' : 'bg-zinc-100 text-zinc-950 hover:bg-white'}`}
              >
                {timerRunning ? 'Pause' : 'Start Timer'}
              </button>
              <button
                onClick={completeSession}
                className="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-green-500 transition-all"
              >
                Complete
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-8 rounded-[2rem] border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Resources</h4>
              <div className="space-y-3">
                {activeLesson.searchQueries.map((query, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearchLesson(query)}
                    className="w-full p-4 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-all flex items-center gap-3 text-left"
                  >
                    <span className="text-zinc-600">↗</span>
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GrowthStudio;
