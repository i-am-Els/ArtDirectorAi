
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArtRole, ExperienceLevel, ArtBrief, AppView } from './types.ts';
import RoleIcon from './components/RoleIcon.tsx';
import BriefDisplay from './components/BriefDisplay.tsx';
import PortfolioReview from './components/PortfolioReview.tsx';
import GrowthStudio from './components/GrowthStudio.tsx';
import RitualStudio from './components/RitualStudio.tsx';
import UserProfile from './components/UserProfile.tsx';
import LoginPage from './components/LoginPage.tsx';
import { generateBrief } from './services/geminiService.ts';
import { ACADEMY_FACULTIES } from './data/curriculum.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase.ts';
import { AppDialogProvider } from './components/ui/AppDialogProvider.tsx';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        <div className="w-16 h-16 border-t-4 border-blue-600 rounded-full animate-spin shadow-2xl shadow-blue-500/20"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppDialogProvider>
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-blue-500/30 overflow-x-hidden">
      <header className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-6 py-5 flex items-center justify-between no-print shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setCurrentView('GENERATOR')}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" /></svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">ArtDirector <span className="text-blue-500">Hub</span></h1>
            <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-black mt-1">Industrial Pipeline</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          {[
            { id: 'GROWTH', label: 'Academy' },
            { id: 'RITUALS', label: 'Rituals' },
            { id: 'GENERATOR', label: 'Brief' },
            { id: 'REVIEW', label: 'Review' }
          ].map(v => (
            <button key={v.id} onClick={() => setCurrentView(v.id as AppView)} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${currentView === v.id ? 'bg-zinc-100 text-zinc-950 shadow-md scale-105' : 'text-zinc-500 hover:text-white'}`}>
              {v.label}
            </button>
          ))}
        </div>

        <UserProfile />
      </header>

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-visible">
          {currentView !== 'GROWTH' && currentView !== 'RITUALS' && (
            <aside className="lg:col-span-4 space-y-6 no-print overflow-visible">
              <div className="glass rounded-[2rem] p-6 border border-white/10 space-y-8 sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar overflow-x-visible">
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

          <section className={`${currentView === 'GROWTH' || currentView === 'RITUALS' ? 'lg:col-span-12' : 'lg:col-span-8'} min-h-[600px] flex flex-col overflow-visible`}>
            {error && <div className="mb-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between no-print text-red-400 text-xs font-bold uppercase tracking-widest"><span>{error}</span></div>}
            {currentView === 'GENERATOR' && (
              <>
                {!brief && !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 glass border-dashed border-white/10 rounded-[3.5rem] opacity-60 text-center animate-pulse">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/5">
                      <svg viewBox="0 0 24 24" className="w-12 h-12 text-zinc-700" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
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
            {currentView === 'GROWTH' && <GrowthStudio currentRole={selectedRole} userId={user.uid} />}
            {currentView === 'RITUALS' && <RitualStudio userId={user.uid} />}
          </section>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center no-print opacity-50">
        <p className="text-zinc-700 text-[9px] tracking-[0.8em] font-black uppercase">ArtDirector AI • Zero to Hero Pipeline • Industrial Training Hub</p>
      </footer>
    </div>
    </AppDialogProvider>
  );
};

export default App;
