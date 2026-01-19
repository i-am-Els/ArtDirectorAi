import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase.ts';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut, User } from 'firebase/auth';
import { ArtRole, ExperienceLevel, ArtBrief, AppView } from './types.ts';
import RoleIcon from './components/RoleIcon.tsx';
import BriefDisplay from './components/BriefDisplay.tsx';
import GrowthStudio from './components/GrowthStudio.tsx';
import { generateBrief } from './services/geminiService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('GROWTH');
  const [selectedRole, setSelectedRole] = useState<ArtRole>(ArtRole.CONCEPT_CHAR);
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.INTERMEDIATE);
  const [brief, setBrief] = useState<ArtBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeDrill = {
    startDate: 1736899200000, // Jan 15, 2026
    durationDays: 45,
    title: "Environment Blockout Habit"
  };

  const calculateDrillDay = () => {
    const diff = Date.now() - activeDrill.startDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    getRedirectResult(auth).catch((error) => {
      console.error("Sign-in redirect error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithRedirect(auth, googleProvider).catch((error) => {
        console.error("Error initiating redirect sign-in:", error);
    });
  };
  const handleLogout = () => signOut(auth).catch(console.error);

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="glass max-w-sm w-full p-12 rounded-[3rem] text-center space-y-8 shadow-2xl border-white/5">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">ArtDirector Academy</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Enrollment Portal Access</p>
          </div>
          <button onClick={handleLogin} className="w-full bg-white text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' className='w-5 h-5'><path fill='#FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/><path fill='#FF3D00' d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/><path fill='#4CAF50' d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'/><path fill='#1976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.651,44,24C44,22.659,43.862,21.35,43.611,20.083z'/></svg>
            Sign In With Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 px-8 py-3 flex items-center justify-between no-print backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('GROWTH')}>
            <div className="w-9 h-9 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <h1 className="text-xs font-black italic uppercase tracking-tight leading-none">ArtDirector <span className="text-blue-500">Academy</span></h1>
              <p className="text-[6px] font-bold uppercase tracking-[0.4em] text-zinc-500 mt-0.5">Industrial Mastery Unit</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/5 mx-2 hidden lg:block"></div>
          
          <div className="hidden lg:flex items-center gap-3 bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-xl">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
               Habit Protocol: Day {calculateDrillDay()} of 45
             </p>
          </div>
        </div>

        <nav className="flex bg-black/60 p-1 rounded-2xl border border-white/5 shadow-inner">
          {[
            'Library', 
            'Academy', 
            'Briefs'
          ].map((label, idx) => {
             const views: AppView[] = ['REVIEW', 'GROWTH', 'GENERATOR'];
             return (
               <button 
                 key={label}
                 onClick={() => setCurrentView(views[idx])}
                 className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${currentView === views[idx] ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}>
                 {label}
               </button>
             )
          })}
        </nav>

        <div className="flex items-center gap-4 group cursor-pointer relative">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-tight">{user.displayName?.split(' ')[0]}</p>
            <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest leading-none mt-1">Status: Deployable</p>
          </div>
          <div className="relative">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl border border-white/10 object-cover shadow-2xl grayscale hover:grayscale-0 transition-all" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-950"></div>
          </div>
          
          <div className="absolute top-full right-0 mt-4 w-64 glass rounded-3xl border-white/10 p-6 opacity-0 pointer-events-none group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50">
            <div className="space-y-5">
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Artist Rank</span>
                 <span className="text-[9px] font-black text-blue-400 mono">SENIOR-4</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1 tracking-widest">Global XP</span>
                    <span className="text-sm font-black mono text-zinc-200">12,482</span>
                 </div>
                 <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black text-zinc-600 uppercase block mb-1 tracking-widest">Focus Level</span>
                    <span className="text-sm font-black mono text-purple-400">92%</span>
                 </div>
               </div>
               <button onClick={handleLogout} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors">Terminate Session</button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 px-8 max-w-7xl mx-auto pb-20 overflow-visible">
        {currentView === 'GROWTH' && <GrowthStudio currentRole={selectedRole} />}
        {currentView === 'GENERATOR' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <aside className="lg:col-span-4 space-y-8 no-print">
               <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 shadow-2xl">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Brief Configurator</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-2 tracking-widest">Pipeline Role</label>
                      <select 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value as ArtRole)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3.5 text-[11px] font-black uppercase outline-none focus:border-blue-500/50 transition-colors">
                        {Object.values(ArtRole).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-2 tracking-widest">Mastery Level</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(ExperienceLevel).map(l => (
                          <button 
                            key={l}
                            onClick={() => setExperience(l)}
                            className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${experience === l ? 'bg-zinc-100 text-black shadow-lg scale-105' : 'bg-zinc-900/50 text-zinc-500 border border-white/5 hover:border-white/10'}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const res = await generateBrief({ role: selectedRole, experience, theme: 'Cinematic Environment', complexity: 8 });
                          setBrief(res);
                        } finally { setIsLoading(false); }
                      }}
                      className="w-full py-5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl mt-4 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)]">
                      {isLoading ? 'Synthesizing...' : 'Initialize Assignment'}
                    </button>
                  </div>
               </section>
            </aside>
            <div className="lg:col-span-8">
               {brief ? (
                 <div className="glass p-10 rounded-[3rem] border-white/5 shadow-2xl">
                    <BriefDisplay brief={brief} />
                 </div>
               ) : (
                 <div className="h-full min-h-[500px] glass border-2 border-dashed border-white/5 rounded-[3.5rem] flex items-center justify-center opacity-30 text-center p-12">
                    <div>
                      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                         <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
                      </div>
                      <p className="text-xl font-black italic uppercase tracking-tighter">System Offline</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-2 italic">Awaiting Director Input for Assignment Registry</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
