
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from "firebase/auth";
import { ArtRole, ExperienceLevel, ArtBrief, AppView, ArtMedium, RolesByMedium, ProjectBreakdown } from './types';
import RoleIcon from './components/RoleIcon';
import BriefDisplay from './components/BriefDisplay';
import ProjectArchive from './components/ProjectArchive';
import CommunityFeed from './components/CommunityFeed';
import PortfolioReview from './components/PortfolioReview';
import { generateBrief, generateReferenceImage } from './services/geminiService';

// Your active Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtTpe52p_i2sJ7igPjcrl0Ojx6qkVaSOU",
  authDomain: "device-streaming-0e5375e3.firebaseapp.com",
  projectId: "device-streaming-0e5375e3",
  storageBucket: "device-streaming-0e5375e3.firebasestorage.app",
  messagingSenderId: "294069102529",
  appId: "1:294069102529:web:1f070d73122b30bb0f3140"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isKeyConnected, setIsKeyConnected] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>('GENERATOR');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const [selectedMedium, setSelectedMedium] = useState<ArtMedium>(ArtMedium.TWO_D);
  const [selectedRole, setSelectedRole] = useState<ArtRole>(ArtRole.CONCEPT_CHAR);
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.INTERMEDIATE);
  const [theme, setTheme] = useState('Forgotten Cyber-Sanctuary');
  const [complexity, setComplexity] = useState(7);
  const [useSearch, setUseSearch] = useState(true);
  const [proMode, setProMode] = useState(false);
  
  const [activeBrief, setActiveBrief] = useState<ArtBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  const [savedBriefs, setSavedBriefs] = useState<ArtBrief[]>([]);
  const [breakdowns, setBreakdowns] = useState<ProjectBreakdown[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Local Storage Persistence for brief history
  useEffect(() => {
    const localBriefs = localStorage.getItem('ad_briefs');
    const localBreakdowns = localStorage.getItem('ad_breakdowns');
    if (localBriefs) setSavedBriefs(JSON.parse(localBriefs));
    if (localBreakdowns) setBreakdowns(JSON.parse(localBreakdowns));
  }, []);

  useEffect(() => {
    localStorage.setItem('ad_briefs', JSON.stringify(savedBriefs));
    localStorage.setItem('ad_breakdowns', JSON.stringify(breakdowns));
  }, [savedBriefs, breakdowns]);

  const availableRoles = useMemo(() => RolesByMedium[selectedMedium], [selectedMedium]);

  const checkKeyStatus = useCallback(async () => {
    // @ts-ignore
    if (window.aistudio?.hasSelectedApiKey) {
      try {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyConnected(hasKey);
        return hasKey;
      } catch (e) { return true; }
    }
    return true; 
  }, []);

  useEffect(() => {
    checkKeyStatus();
  }, [checkKeyStatus]);

  const handleSignIn = async () => {
    setError(null);
    setShowSetupGuide(false);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain not whitelisted in Firebase.");
        setShowSetupGuide(true);
      } else {
        setError(`Sign-in failed: ${err.message}`);
      }
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleConnectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setIsKeyConnected(true);
    }
  };

  const handleGenerate = async () => {
    const connected = await checkKeyStatus();
    if (!connected) {
      setIsKeyConnected(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveBrief(null);
    setShowReview(false);

    try {
      const result = await generateBrief({ 
        role: selectedRole, 
        experience, 
        theme, 
        complexity, 
        useSearch,
        proMode
      });
      
      const newBrief: ArtBrief = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        role: selectedRole,
        experience: experience
      };

      setActiveBrief(newBrief);
      
      setIsLoadingImage(true);
      const imageUrl = await generateReferenceImage(newBrief, theme, proMode);
      
      const briefWithImage = { ...newBrief, refImage: imageUrl || undefined };
      setActiveBrief(briefWithImage);
      setSavedBriefs(prev => [briefWithImage, ...prev]);

    } catch (err: any) {
      setError(err.message || "Brief generation failed.");
    } finally {
      setIsLoading(false);
      setIsLoadingImage(false);
    }
  };

  const addBreakdown = (breakdown: ProjectBreakdown) => {
    setBreakdowns(prev => [breakdown, ...prev]);
    setTimeout(() => setCurrentView('COMMUNITY'), 500);
  };

  // Entry Handshake Screen
  if (!user || !isKeyConnected) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        
        <div className="glass p-12 rounded-[3rem] border-white/5 max-w-lg w-full text-center space-y-10 relative z-10 shadow-2xl">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-white rounded-[1.8rem] mx-auto flex items-center justify-center shadow-2xl text-black font-black italic text-2xl tracking-tighter">AD</div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">ArtDirector <span className="text-blue-500">AI</span></h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Studio Intelligence Node</p>
            </div>
          </div>

          {!user ? (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="text-left space-y-2 px-2">
                <h3 className="text-lg font-bold text-zinc-200">Creative Onboarding</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Connect with your studio account to sync your project vault and professional profile.</p>
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {error}
                </div>
              )}

              {showSetupGuide && (
                <div className="text-left bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Firebase Setup Required</h4>
                   <p className="text-[11px] text-zinc-400 leading-relaxed">
                     Your current domain <strong>{window.location.hostname}</strong> is not whitelisted. 
                   </p>
                   <ol className="text-[10px] text-zinc-500 space-y-1 list-decimal ml-4 uppercase font-bold tracking-tight">
                     <li>Go to Firebase Console</li>
                     <li>Auth > Settings > Authorized Domains</li>
                     <li>Add "{window.location.hostname}"</li>
                   </ol>
                </div>
              )}

              <button 
                onClick={handleSignIn}
                className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center justify-center space-x-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Log in to Studio</span>
              </button>
            </div>
          ) : !isKeyConnected ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center space-y-3">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.uid}`} className="w-16 h-16 rounded-2xl border border-white/10 p-1 bg-zinc-900 shadow-xl" />
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Authenticated: {user.displayName}</span>
              </div>
              
              <div className="bg-blue-600/5 p-6 rounded-2xl border border-blue-500/20 text-left">
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  Studio initialization requires a valid **Project Key** to process high-fidelity art direction logic.
                </p>
              </div>

              <button 
                onClick={handleConnectKey}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all"
              >
                Link Studio Key
              </button>
            </div>
          ) : null}
          
          <p className="text-[8px] text-zinc-800 uppercase font-black tracking-[0.5em] pt-4">Workspace v4.0 • Firebase Enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 selection:bg-blue-500/30">
      <header className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-8 py-5 flex items-center justify-between no-print">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => { setActiveBrief(null); setCurrentView('GENERATOR'); }}>
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-black font-black italic text-lg group-hover:scale-105 transition-transform">AD</div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-white">ArtDirector <span className="text-blue-500">AI</span></h1>
            <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 font-black mt-1">Assignment Node</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-full border border-white/10">
          {(['GENERATOR', 'ARCHIVE', 'COMMUNITY'] as AppView[]).map(v => (
            <button key={v} onClick={() => setCurrentView(v)} className={`px-5 py-2 rounded-full text-[9px] uppercase tracking-[0.2em] font-black transition-all ${currentView === v ? 'bg-zinc-100 text-zinc-900 shadow-xl' : 'text-zinc-500 hover:text-white'}`}>
              {v === 'ARCHIVE' ? 'Vault' : v}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-5">
          <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase font-black tracking-widest text-zinc-100">{user.displayName}</span>
             <button onClick={handleSignOut} className="text-[8px] uppercase font-black text-red-500/60 hover:text-red-400 mt-0.5">Logout</button>
          </div>
          <div className="w-10 h-10 rounded-2xl border border-white/10 bg-zinc-900 p-0.5 overflow-hidden">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.uid}`} alt="Avatar" className="rounded-xl h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {currentView === 'GENERATOR' && (
            <aside className="lg:col-span-4 space-y-8 no-print">
              <div className="glass rounded-[2.5rem] p-8 border border-white/5 space-y-8 sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar shadow-2xl">
                <section>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Engine Mode</label>
                  <button onClick={() => setProMode(!proMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${proMode ? 'bg-blue-600/10 border-blue-500/40' : 'bg-zinc-900/40 border-white/5'}`}>
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`p-1.5 rounded-lg ${proMode ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 22.5 12 13.5H3.75z" /></svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block">{proMode ? 'Pro Mode' : 'Standard'}</span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{proMode ? 'High Precision' : 'Free Tier Opt.'}</span>
                      </div>
                    </div>
                  </button>
                </section>

                <section>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Project Department</label>
                  <div className="flex bg-black p-1 rounded-2xl border border-white/5">
                    {Object.values(ArtMedium).map(m => (
                      <button key={m} onClick={() => setSelectedMedium(m)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${selectedMedium === m ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {m === ArtMedium.TWO_D ? '2D' : '3D'}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Specialized Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableRoles.map((role) => (
                      <button key={role} onClick={() => setSelectedRole(role)} className={`flex items-center space-x-3 p-3.5 rounded-2xl border transition-all duration-300 ${selectedRole === role ? 'bg-blue-600/10 border-blue-500 text-blue-100' : 'bg-zinc-900/30 border-white/5 text-zinc-600 hover:border-white/20'}`}>
                        <RoleIcon role={role} className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] font-black truncate uppercase tracking-tight">{role}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Assignment Theme</label>
                    <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Complexity</label>
                      <span className="text-blue-400 mono text-xs font-bold">{complexity}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={complexity} onChange={(e) => setComplexity(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  </div>
                </section>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 font-black uppercase tracking-[0.3em] py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-3 group active:scale-95 text-[11px]">
                  {isLoading ? <span className="animate-pulse">Synthesizing...</span> : <span>Initiate Project</span>}
                </button>
              </div>
            </aside>
          )}

          <section className={`${currentView !== 'GENERATOR' ? 'lg:col-span-12' : 'lg:col-span-8'} min-h-[600px]`}>
            {currentView === 'GENERATOR' && (
              <div className="flex-1 flex flex-col space-y-12">
                {isLoading ? (
                  <div className="flex-1 h-[700px] flex flex-col items-center justify-center space-y-10">
                    <div className="w-24 h-24 border-[3px] border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 animate-pulse">Compiling Technical Constraints...</p>
                  </div>
                ) : activeBrief ? (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="glass rounded-[3.5rem] p-12 md:p-16 border border-white/5 shadow-2xl">
                      <BriefDisplay brief={activeBrief} refImage={activeBrief.refImage || null} isLoadingImage={isLoadingImage} />
                      <div className="mt-12 flex space-x-4 no-print">
                         <button onClick={() => setShowReview(!showReview)} className="px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                            {showReview ? 'Hide Critique' : 'Request Portfolio Critique'}
                         </button>
                      </div>
                    </div>
                    {showReview && (
                      <div className="mt-12 glass rounded-[3rem] p-12 border border-blue-500/10">
                        <PortfolioReview role={activeBrief.role} experience={activeBrief.experience} proMode={proMode} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 h-[700px] flex flex-col items-center justify-center text-zinc-700 uppercase font-black tracking-widest text-[10px] space-y-4">
                    <RoleIcon role={selectedRole} className="w-12 h-12 opacity-20" />
                    <span>Awaiting Project Initiation</span>
                  </div>
                )}
              </div>
            )}

            {currentView === 'ARCHIVE' && <ProjectArchive briefs={savedBriefs} breakdowns={breakdowns} onAddBreakdown={addBreakdown} />}
            {currentView === 'COMMUNITY' && <CommunityFeed briefs={savedBriefs} breakdowns={breakdowns} />}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
