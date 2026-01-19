import React, { useState, useEffect } from 'react';
import { ArtRole, ExperienceLevel, ArtBrief, AppView, ACADEMY_FACULTIES } from './types.ts';
import RoleIcon from './components/RoleIcon.tsx';
import BriefDisplay from './components/BriefDisplay.tsx';
import PortfolioReview from './components/PortfolioReview.tsx';
import GrowthStudio from './components/GrowthStudio.tsx';
import { generateBrief } from './services/geminiService.ts';
import { auth, googleProvider } from './firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

const RoleTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative w-full">
    {children}
    <div className="pointer-events-none fixed z-[9999] w-64 -translate-y-[calc(100%+10px)] rounded-xl bg-zinc-900 border border-white/20 p-4 text-[10px] text-zinc-200 opacity-0 transition-all duration-300 group-hover:opacity-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-relaxed">
      <div className="relative">
        <h4 className="font-black text-blue-400 uppercase tracking-widest mb-1">Industrial Insight</h4>
        {text}
        <div className="absolute top-full left-4 border-8 border-transparent border-t-zinc-900"></div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('GENERATOR');
  const [selectedRole, setSelectedRole] = useState<ArtRole>(ArtRole.CONCEPT_CHAR);
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.INTERMEDIATE);
  const [theme, setTheme] = useState('Dystopian Sky-City');
  const [complexity, setComplexity] = useState(7);
  const [brief, setBrief] = useState<ArtBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set([ACADEMY_FACULTIES[0].id]));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Failed to sign in with Google.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const toggleFaculty = (id: string) => {
    const next = new Set(expandedFaculties);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFaculties(next);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setBrief(null);
    try {
      const result = await generateBrief({ role: selectedRole, experience, theme, complexity });
      setBrief(result);
    } catch (err) {
      setError("Brief generation failed. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePDF = () => {
    if (!brief) return;
    setIsExportingPDF(true);
    setTimeout(() => {
      window.print();
      setIsExportingPDF(false);
    }, 500);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="glass max-w-md w-full p-12 rounded-[3rem] border-white/10 text-center space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto">
            <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" /></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">ArtDirector Academy</h2>
            <p className="text-zinc-500 text-sm font-medium tracking-tight">Industrial Mastery Portal Authentication</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-zinc-950 font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>
          <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Authorized Personnel Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-blue-500/30 overflow-x-hidden">
      <header className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-6 py-3.5 flex items-center justify-between no-print shadow-2xl backdrop-blur-3xl">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setCurrentView('GENERATOR')}>
          <div className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-xl flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform group-hover:border-blue-500/30">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" /></svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">ArtDirector <span className="text-blue-500 text-[11px] not-italic ml-1">v4.0.2</span></h1>
            <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-500 font-black mt-1">Industrial Intelligence Unit</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5 bg-zinc-950/90 p-1 rounded-2xl border border-white/5 shadow-inner">
          {[
            { id: 'GENERATOR', label: 'Briefs' },
            { id: 'REVIEW', label: 'Review' },
            { id: 'GROWTH', label: 'Academy' }
          ].map(v => (
            <button key={v.id} onClick={() => setCurrentView(v.id as AppView)} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${currentView === v.id ? 'bg-zinc-100 text-zinc-950 shadow-md scale-105' : 'text-zinc-500 hover:text-white'}`}>
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <div className="flex items-center bg-zinc-900/40 p-1.5 rounded-2xl border border-white/5 group relative hover:border-blue-500/20 transition-all">
            <div className="relative">
              <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-xl border border-white/10 object-cover grayscale group-hover:grayscale-0 transition-all shadow-xl" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full shadow-glow-green"></div>
            </div>
            
            <div className="mx-4 hidden lg:flex flex-col border-l border-white/5 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase text-zinc-100 tracking-tight leading-none">{user.displayName?.split(' ')[0]}</span>
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[7px] font-black rounded uppercase tracking-widest border border-blue-500/20">Active ID</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-pulse"></div>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{experience} {selectedRole.split(' ')[0]}</span>
              </div>
            </div>

            <div className="h-10 w-px bg-white/5 mx-2 hidden lg:block"></div>

            <button 
              onClick={handleLogout} 
              className="p-2.5 hover:bg-red-500/10 rounded-xl group/logout transition-all ml-1"
              title="Secure Sign Out"
            >
              <svg className="w-4 h-4 text-zinc-500 group-hover/logout:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>

            {/* Hidden Stats / ID Detail on hover */}
            <div className="absolute top-[calc(100%+12px)] right-0 w-64 glass rounded-2xl border border-white/10 p-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50">
               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Artist Status</span>
                     <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Deployable</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1">XP Points</span>
                        <span className="text-sm font-black text-blue-400 mono italic tabular-nums">12,480</span>
                     </div>
                     <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1">Mastery</span>
                        <span className="text-sm font-black text-purple-400 mono italic tabular-nums">Lvl 4</span>
                     </div>
                  </div>
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <p className="text-[8px] text-zinc-400 leading-relaxed font-medium italic">"The eye is a muscle. Train it by looking at the world, not just the screen."</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-visible">
          {currentView !== 'GROWTH' && (
            <aside className="lg:col-span-4 space-y-6 no-print overflow-visible">
              <div className="glass rounded-[2rem] p-6 border border-white/10 space-y-8 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar overflow-x-visible">
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 block text-center">Pipeline Departments</label>
                  <div className="space-y-4">
                    {ACADEMY_FACULTIES.map(faculty => (
                      <div key={faculty.id} className="space-y-2">
                        <button 
                          onClick={() => toggleFaculty(faculty.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{faculty.icon}</span>
                            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-tight group-hover:text-zinc-200">{faculty.name}</span>
                          </div>
                          <svg className={`w-3 h-3 text-zinc-600 transition-transform ${expandedFaculties.has(faculty.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        
                        {expandedFaculties.has(faculty.id) && (
                          <div className="grid grid-cols-1 gap-1.5 pl-2 animate-in slide-in-from-top-2 duration-300">
                            {faculty.majors.map(major => (
                              <RoleTooltip key={major.id} text={major.description}>
                                <button 
                                  onClick={() => setSelectedRole(major.role)} 
                                  className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all ${selectedRole === major.role ? 'bg-blue-600/10 border-blue-500/50 text-blue-100' : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <RoleIcon role={major.role} className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-tight truncate">{major.title}</span>
                                  </div>
                                </button>
                              </RoleTooltip>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="pt-6 border-t border-white/5">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 block">Professional Standing</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ExperienceLevel).map(lvl => (
                      <button key={lvl} onClick={() => setExperience(lvl)} className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl text-[9px] font-black transition-all uppercase tracking-tighter ${experience === lvl ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-500 border border-white/10 hover:border-white/20'}`}>{lvl}</button>
                    ))}
                  </div>
                </section>

                {currentView === 'GENERATOR' && (
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <section><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 block">Theme Focus</label><input type="text" value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" /></section>
                    <section><div className="flex justify-between items-center mb-3"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Complexity Curve</label><span className="mono text-blue-500 font-black text-xs tabular-nums">{complexity}/10</span></div><input type="range" min="1" max="10" value={complexity} onChange={e => setComplexity(parseInt(e.target.value))} className="w-full h-2 bg-zinc-900 rounded-lg appearance-none accent-blue-600 cursor-pointer" /></section>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 disabled:opacity-50">{isLoading ? 'Drafting Blueprint...' : 'Generate Studio Brief'}</button>
                  </div>
                )}
              </div>
            </aside>
          )}

          <section className={`${currentView === 'GROWTH' ? 'lg:col-span-12' : 'lg:col-span-8'} min-h-[600px] flex flex-col overflow-visible`}>
            {error && <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between no-print text-red-400 text-xs font-bold uppercase tracking-widest"><span>{error}</span></div>}
            {currentView === 'GENERATOR' && (
              <>
                {!brief && !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 glass border-dashed border-white/10 rounded-[3.5rem] opacity-60 text-center animate-pulse">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/5">
                      <svg viewBox="0 0 24 24" className="w-12 h-12 text-zinc-700" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-zinc-300 tracking-tighter uppercase italic">Assignment Registry</h3>
                    <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed">Select a pipeline department and your professional standing to receive an industrial-grade assignment.</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 border-t-4 border-blue-600 rounded-full animate-spin shadow-2xl"></div>
                    <p className="text-zinc-500 mono text-[10px] font-black tracking-[0.4em] uppercase">Simulating Director Protocols...</p>
                  </div>
                )}
                {brief && (
                  <div className="print:p-0 glass rounded-[3.5rem] p-6 md:p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-visible">
                    <BriefDisplay brief={brief} />
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-10 no-print gap-8">
                      <div className="flex items-center space-x-5">
                        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em]">Industrial Target:</div>
                        <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest">{selectedRole}</div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={handleSavePDF} disabled={isExportingPDF} className="px-8 py-3.5 bg-zinc-100 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white shadow-2xl active:scale-95 transition-all">{isExportingPDF ? 'Exporting...' : 'Export Brief PDF'}</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {currentView === 'REVIEW' && <div className="glass rounded-[3.5rem] p-10 border border-white/10 min-h-[650px] no-print shadow-2xl"><PortfolioReview role={selectedRole} experience={experience} /></div>}
            {currentView === 'GROWTH' && <GrowthStudio currentRole={selectedRole} />}
          </section>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center no-print opacity-50">
        <p className="text-zinc-700 text-[9px] tracking-[0.8em] font-black uppercase">ArtDirector AI Unit • Zero to Hero • Authorized Production Pipeline</p>
      </footer>
    </div>
  );
};

export default App;