import React, { useState } from 'react';
import { ArtRole, Enrollment, ActiveDrill, ACADEMY_FACULTIES, AcademyMajor } from '../types.ts';
import RoleIcon from './RoleIcon.tsx';

const GrowthStudio: React.FC<{ currentRole: ArtRole }> = () => {
  // Database State (Mocking Firestore)
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({
    'dept-char-concept': {
      majorId: 'dept-char-concept',
      status: 'active',
      enrolledAt: Date.now(),
      completedLessons: [],
      currentLessonIndex: 0
    },
    'dept-env-3d': {
      majorId: 'dept-env-3d',
      status: 'active',
      enrolledAt: Date.now(),
      completedLessons: [],
      currentLessonIndex: 0
    }
  });

  const [activeDrills] = useState<ActiveDrill[]>([
    {
      id: 'env_blockout_45',
      associatedMajor: '3D Environment Design',
      startDate: Date.now() - (4 * 24 * 60 * 60 * 1000), // Day 5
      durationDays: 45,
      dailyLog: { "2026-01-20": true }
    }
  ]);

  const [activeMajorId, setActiveMajorId] = useState<string>('dept-env-3d');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const getActiveMajor = () => {
    for (const faculty of ACADEMY_FACULTIES) {
      const found = faculty.majors.find(m => m.id === activeMajorId);
      if (found) return found;
    }
    return null;
  };

  const major = getActiveMajor();
  const enrollment = enrollments[activeMajorId];

  const handleCompleteLesson = (lessonId: string) => {
    const next = { ...enrollments };
    const current = next[activeMajorId];
    if (!current.completedLessons.includes(lessonId)) {
      current.completedLessons.push(lessonId);
      current.currentLessonIndex += 1;
    }
    setEnrollments(next);
    setSelectedLessonId(null);
  };

  const calculateDrillDay = (startDate: number) => {
    const diff = Date.now() - startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Global Habit Layer: Active Drills */}
      {activeDrills.length > 0 && (
        <div className="bg-zinc-950/80 border border-blue-500/20 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -mr-32 -mt-32"></div>
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 font-black text-xs shadow-inner">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              </div>
              <div>
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Global Mileage Habit</p>
                 <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-100">{activeDrills[0].associatedMajor} Intensive</h3>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Current Standing</p>
              <p className="text-2xl font-black mono italic text-zinc-100">Day {calculateDrillDay(activeDrills[0].startDate)} of 45</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 space-y-8">
           <div className="glass p-8 rounded-[3rem] border-white/10 space-y-8 shadow-2xl">
              <h3 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] text-center border-b border-white/5 pb-4">Enrollment Portals</h3>
              <div className="space-y-4">
                 {Object.keys(enrollments).map(id => {
                   const m = ACADEMY_FACULTIES.flatMap(f => f.majors).find(maj => maj.id === id);
                   if (!m) return null;
                   const progress = enrollments[id];
                   return (
                     <button 
                       key={id} 
                       onClick={() => setActiveMajorId(id)}
                       className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all group ${activeMajorId === id ? 'bg-zinc-100 border-white text-zinc-950 shadow-xl scale-105' : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/10'}`}
                     >
                       <div className="flex items-center gap-4">
                          <RoleIcon role={m.role} className={`w-5 h-5 ${activeMajorId === id ? 'text-zinc-950' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                          <div className="text-left">
                            <span className="text-[11px] font-black uppercase tracking-tight block leading-none">{m.title}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 block ${activeMajorId === id ? 'text-zinc-600' : 'text-zinc-700'}`}>
                              Phase {progress.currentLessonIndex + 1} Access
                            </span>
                          </div>
                       </div>
                       <span className={`text-[9px] font-black mono px-2.5 py-1 rounded-lg ${activeMajorId === id ? 'bg-zinc-950 text-white' : 'bg-black/50 text-zinc-600'}`}>
                         {progress.completedLessons.length}/10
                       </span>
                     </button>
                   );
                 })}
              </div>

              <div className="pt-8 border-t border-white/5">
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Database Sync Protocol</h4>
                 </div>
                 <pre className="bg-black/60 p-5 rounded-2xl text-[8px] mono text-blue-400/80 overflow-x-auto leading-relaxed border border-blue-500/10 shadow-inner">
{JSON.stringify({
  [`users/${"{uid}"}/enrollments/${activeMajorId}`]: {
    status: enrollment.status,
    currentLessonIndex: enrollment.currentLessonIndex,
    completedLessons: enrollment.completedLessons
  },
  [`users/${"{uid}"}/enrollments/${activeMajorId}/progress/${selectedLessonId || 'awaiting_selection'}`]: {
    status: selectedLessonId ? 'unlocked' : 'idle',
    updatedAt: Date.now()
  }
}, null, 2)}
                 </pre>
              </div>
           </div>
        </aside>

        <section className="lg:col-span-8 space-y-10">
           {major && (
             <div className="glass p-12 rounded-[3.5rem] border-white/10 space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                <div className="space-y-3 border-b border-white/5 pb-10">
                   <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Faculty: 3D Production</span>
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">Industrial ID: {major.id}</span>
                   </div>
                   <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter leading-none">{major.title}</h2>
                   <p className="text-base text-zinc-500 font-medium tracking-tight max-w-2xl leading-relaxed">{major.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {major.courses.slice(0, 3).map((course, idx) => {
                    const isLocked = idx > enrollment.currentLessonIndex;
                    const isComplete = idx < enrollment.currentLessonIndex;
                    return (
                      <div key={course.id} className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden flex flex-col ${
                        isComplete ? 'bg-green-500/5 border-green-500/20' : 
                        isLocked ? 'bg-zinc-950/50 border-white/5 opacity-50 grayscale' : 
                        'bg-zinc-900/40 border-blue-500/30 shadow-[0_20px_40px_rgba(59,130,246,0.1)]'
                      }`}>
                         <div className="flex justify-between items-start mb-6">
                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest ${
                              isComplete ? 'bg-green-500 text-black' : 
                              isLocked ? 'bg-zinc-800 text-zinc-500' : 
                              'bg-blue-600 text-white'
                            }`}>{course.tier}</span>
                            {isLocked && (
                              <svg className="w-5 h-5 text-zinc-800" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            )}
                            {isComplete && (
                              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            )}
                         </div>
                         <h4 className={`text-xl font-black italic uppercase mb-3 leading-none ${isLocked ? 'text-zinc-700' : 'text-zinc-100'}`}>{course.title}</h4>
                         <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3 mb-8">{course.description}</p>
                         
                         <div className="mt-auto">
                           <button 
                             onClick={() => !isLocked && setSelectedLessonId(course.lessons[0].id)}
                             disabled={isLocked}
                             className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                               isComplete ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 
                               isLocked ? 'bg-zinc-950 text-zinc-800 cursor-not-allowed' : 
                               'bg-zinc-100 text-black hover:bg-white shadow-xl hover:scale-105 active:scale-95'
                             }`}
                           >
                             {isComplete ? 'Review Blueprint' : isLocked ? 'Locked Priority' : 'Initiate Simulation'}
                           </button>
                         </div>
                      </div>
                    )
                  })}
                </div>
             </div>
           )}

           {selectedLessonId && (
             <div className="glass p-12 rounded-[4rem] border-blue-600/30 space-y-12 animate-in zoom-in-95 duration-500 shadow-[0_80px_160px_rgba(0,0,0,0.9)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -mr-64 -mt-64"></div>
                <div className="flex justify-between items-start border-b border-white/5 pb-10 relative z-10">
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Simulation Protocol Alpha</span>
                      </div>
                      <h3 className="text-5xl font-black italic uppercase text-white tracking-tighter">Lesson Blueprint</h3>
                   </div>
                   <button onClick={() => setSelectedLessonId(null)} className="p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-xl">
                      <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                   <div className="space-y-8">
                      <div className="bg-black/60 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                            <span className="w-5 h-px bg-blue-500/50"></span>
                            Lecture: Search Strings
                         </h4>
                         <ul className="space-y-4">
                           {["UE5 level design blockout workflow", "Composition in environment art", "Focal points environment design"].map(s => (
                             <li key={s} className="flex items-center gap-4 text-[12px] font-bold text-zinc-400 group cursor-pointer hover:text-white transition-all">
                                <div className="p-2 bg-red-600/10 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                                </div>
                                <span>{s}</span>
                             </li>
                           ))}
                         </ul>
                      </div>

                      <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] shadow-xl">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-4">Focus Mode: Production Task</h4>
                         <p className="text-base font-medium italic text-zinc-300 leading-relaxed">"Build a primary architectural blockout for 'The Desolate Temple Entrance'. Focus strictly on silhouette, massing, and functional scale."</p>
                         <div className="mt-6 flex items-center gap-3 pt-6 border-t border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Timeline:</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">14 Business Days</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="p-8 bg-purple-600/5 border border-purple-500/20 rounded-[2.5rem] shadow-xl">
                         <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-4">Mileage Mode: Habit Drill</h4>
                         <p className="text-base font-medium italic text-zinc-300 leading-relaxed">"Conduct 45-minute architectural volume studies daily using random street view references. Total volume: 30 sessions."</p>
                         <div className="mt-6 flex items-center gap-3 pt-6 border-t border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Intensity:</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Daily Routine</span>
                         </div>
                      </div>

                      <div className="p-8 bg-zinc-950/50 rounded-[2.5rem] border border-white/5">
                         <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-4">Mastery Threshold</h4>
                         <p className="text-xs font-medium text-zinc-500 leading-relaxed">Submit high-fidelity screenshots demonstrating clear structural hierarchy and scale metrics. Unlocks: **Modular Kit Logic**.</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10 pt-6">
                   <button 
                      onClick={() => setSelectedLessonId(null)}
                      className="py-6 bg-zinc-950 border border-white/10 text-zinc-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:border-white/20 transition-all"
                   >
                     Retain Draft
                   </button>
                   <button 
                      onClick={() => handleCompleteLesson(selectedLessonId)}
                      className="py-6 bg-zinc-100 text-black rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
                   >
                     Certify Simulation
                   </button>
                </div>
             </div>
           )}
        </section>
      </div>
    </div>
  );
};

export default GrowthStudio;