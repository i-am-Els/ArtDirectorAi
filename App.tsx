
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

// Firebase Configuration - Used for user identity and storage
const firebaseConfig = {
  apiKey: "AIzaSyCtTpe52p_i2sJ7igPjcrl0Ojx6qkVaSOU",
  authDomain: "device-streaming-0e5375e3.firebaseapp.com",
  projectId: "device-streaming-0e5375e3",
  storageBucket: "device-streaming-0e5375e3.firebasestorage.app",
  messagingSenderId: "294069102529",
  appId: "1:294069102529:web:1f070d73122b30bb0f3140"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isKeyConnected, setIsKeyConnected] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>('GENERATOR');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  // Generator State
  const [selectedMedium, setSelectedMedium] = useState<ArtMedium>(ArtMedium.TWO_D);
  const [selectedRole, setSelectedRole] = useState<ArtRole>(ArtRole.CONCEPT_CHAR);
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.INTERMEDIATE);
  const [theme, setTheme] = useState('Forgotten Cyber-Sanctuary');
  const [complexity, setComplexity] = useState(7);
  const [useSearch, setUseSearch] = useState(true);
  const [proMode, setProMode] = useState(false);
  
  // UI & Data State
  const [activeBrief, setActiveBrief] = useState<ArtBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [savedBriefs, setSavedBriefs] = useState<ArtBrief[]>([]);
  const [breakdowns, setBreakdowns] = useState<ProjectBreakdown[]>([]);

  // 1. Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Persist Brief History
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

  // 3. Check for User-Specific API Key (Quota/Billing)
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
    if (user) checkKeyStatus();
  }, [user, checkKeyStatus]);

  const handleSignIn = async () => {
    setError(null);
    setShowSetupGuide(false);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError("Vercel Domain Whitelist Required");
        setShowSetupGuide(true);
      } else {
        setError(err.message);
      }
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleConnectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per racing condition documentation
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
      if (err.message.includes("entity was not found") || err.message.includes("API key")) {
        setIsKeyConnected(false);
        setError("Project Key session expired or invalid. Please re-link.");
      } else {
        setError(err.message || "Brief generation failed.");
      }
    } finally {
      setIsLoading(false);
      setIsLoadingImage(false);
    }
  };

  const addBreakdown = (breakdown: ProjectBreakdown) => {
    setBreakdowns(prev => [breakdown, ...prev]);
    setTimeout(() => setCurrentView('COMMUNITY'), 500);
  };

  // --- RENDERING HANDSHAKE SCREEN ---
  if (!user || !isKeyConnected) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="glass p-10 md:p-14 rounded-[3.5rem] border-white/5 max-w-xl w-full text-center space-y-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2.2rem] mx-auto flex items-center justify-center shadow-[0_25px_60px_rgba(255,255,255,0.15)] text-black font-black italic text-4xl tracking-tighter">AD</div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tight text-white">ArtDirector <span className="text-blue-500">AI</span></h2>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.5em]">Creative Management Protocol</p>
            </div>
          </div>

          {!user ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-left space-y-3 px-2">
                <h3 className="text-xl font-bold text-zinc-100">Step 1: Identity Sync</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Securely authenticate to access your project vault and personalized artist profile across devices.</p>
              </div>
              
              {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed text-left">
                  <span className="block mb-1 text-red-300">Deployment Error:</span>
                  {error}
                </div>
              )}

              {showSetupGuide && (
                <div className="text-left bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl space-y-4 animate-in zoom-in-95 duration-500">
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-400">Firebase Domain Setup</h4>
                   <p className="text-[12px] text-zinc-400 leading-relaxed">
                     Your current Vercel domain must be authorized in Firebase Console:
                   </p>
                   <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-blue-300 break-all select-all cursor-pointer">
                     {window.location.hostname}
                   </div>
                </div>
              )}

              <button 
                onClick={handleSignIn}
                className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center justify-center space-x-4 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Google Workspace Login</span>
              </button>
            </div>
          ) : !isKeyConnected ? (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.uid}`} className="w-20 h-20 rounded-[2rem] border border-white/10 p-1 bg-zinc-900 shadow-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#050505] rounded-full"></div>
                </div>
                <div className="text-center">
                  <span className="text-[13px] font-black uppercase tracking-widest text-white block">{user.displayName}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 block mt-1">Authorized Node</span>
                </div>
              </div>
              
              <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 text-left space-y-5">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-zinc-100">Step 2: Link Project Quota</h4>
                </div>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  To access High-Fidelity Gemini models and 1K Image Synthesis, you must link your own Studio Project Key. This ensures you maintain control over your own billing and quota.
                </p>
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center">
                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Generate Free Studio Key
                  </a>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-blue-400 transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    View Billing & Usage Guide
                  </a>
                </div>
              </div>

              <button 
                onClick={handleConnectKey}
                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all active:scale-95"
              >
                Link Project Key
              </button>
            </div>
          ) : null}
          
          <p className="text-[9px] text-zinc-800 uppercase font-black tracking-[0.6em]">Studio Node v4.1 • Secure Handshake Enabled</p>
        </div>
      </div>
    );
  }

  // --- MAIN APP UI ---
  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 selection:bg-blue-500/30">
      <header className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-8 py-6 flex items-center justify-between no-print">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => { setActiveBrief(null); setCurrentView('GENERATOR'); }}>
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-black font-black italic text-lg group-hover:scale-105 transition-transform">AD</div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-white">ArtDirector <span className="text-blue-500">AI</span></h1>
            <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 font-black mt-1">Assignment Node</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-1 bg-zinc-900/80 p-1.5 rounded-full border border-white/10">
          {(['GENERATOR', 'ARCHIVE', 'COMMUNITY'] as AppView[]).map(v => (
            <button key={v} onClick={() => setCurrentView(v)} className={`px-6 py-2.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-black transition-all ${currentView === v ? 'bg-zinc-100 text-zinc-900 shadow-xl' : 'text-zinc-500 hover:text-white'}`}>
              {v === 'ARCHIVE' ? 'Vault' : v}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-5">
          <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase font-black tracking-widest text-zinc-100">{user.displayName}</span>
             <button onClick={handleSignOut} className="text-[8px] uppercase font-black text-red-500/60 hover:text-red-400 mt-0.5">Logout</button>
          </div>
          <div className="w-11 h-11 rounded-2xl border border-white/10 bg-zinc-900 p-0.5 overflow-hidden shadow-xl">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.uid}`} alt="Avatar" className="rounded-xl h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <main className="pt-36 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {currentView === 'GENERATOR' && (
            <aside className="lg:col-span-4 space-y-8 no-print">
              <div className="glass rounded-[3rem] p-8 md:p-10 border border-white/5 space-y-8 sticky top-36 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar shadow-2xl">
                <section>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Engine Mode</label>
                  <button onClick={() => setProMode(!proMode)} className={`w-full flex items-center justify-between p-5 rounded-[1.8rem] border transition-all duration-500 ${proMode ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-zinc-900/40 border-white/5'}`}>
                    <div className="flex items-center space-x-4 text-left">
                      <div className={`p-2.5 rounded-xl transition-colors duration-500 ${proMode ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 22.5 12 13.5H3.75z" /></svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest block transition-colors duration-500">{proMode ? 'High Fidelity' : 'Standard'}</span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{proMode ? 'Gemini Pro Logic' : 'Flash Processing'}</span>
                      </div>
                    </div>
                  </button>
                </section>

                <section>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Project Department</label>
                  <div className="flex bg-black/50 p-1.5 rounded-[1.8rem] border border-white/5">
                    {Object.values(ArtMedium).map(m => ( m &&
                      <button key={m} onClick={() => setSelectedMedium(m)} className={`flex-1 py-3.5 text-[10px] font-black rounded-[1.2rem] transition-all uppercase tracking-[0.2em] ${selectedMedium === m ? 'bg-white text-black shadow-2xl' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {m === ArtMedium.TWO_D ? '2D Art' : '3D Art'}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 block">Specialized Role</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {availableRoles.map((role) => (
                      <button key={role} onClick={() => setSelectedRole(role)} className={`flex items-center space-x-4 p-4 rounded-[1.5rem] border transition-all duration-300 ${selectedRole === role ? 'bg-blue-600/10 border-blue-500 text-blue-100 shadow-[0_10px_30px_rgba(59,130,246,0.05)]' : 'bg-zinc-900/30 border-white/5 text-zinc-600 hover:border-white/20'}`}>
                        <div className={`p-2 rounded-lg ${selectedRole === role ? 'bg-blue-600/20' : 'bg-zinc-800/50'}`}>
                          <RoleIcon role={role} className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-[11px] font-black truncate uppercase tracking-tight">{role}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">Assignment Theme</label>
                    <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-zinc-700 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Complexity</label>
                      <span className="text-blue-400 mono text-xs font-bold">{complexity}/10</span>
                    </div>
                    <input type="range" min="1" max="10" value={complexity} onChange={(e) => setComplexity(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  </div>
                </section>

                <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 font-black uppercase tracking-[0.4em] py-6 rounded-[2rem] shadow-[0_20px_50px_rgba(59,130,246,0.2)] transition-all flex items-center justify-center space-x-4 group active:scale-[0.98] text-[12px]">
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="animate-pulse">Synthesizing...</span>
                    </div>
                  ) : (
                    <span>Initiate Project</span>
                  )}
                </button>
              </div>
            </aside>
          )}

          <section className={`${currentView !== 'GENERATOR' ? 'lg:col-span-12' : 'lg:col-span-8'} min-h-[600px]`}>
            {currentView === 'GENERATOR' && (
              <div className="flex-1 flex flex-col space-y-12">
                {isLoading ? (
                  <div className="flex-1 h-[700px] flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="w-32 h-32 border-[4px] border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full animate-pulse blur-xl"></div>
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <p className="text-[12px] font-black uppercase tracking-[0.5em] text-white">Compiling Constraints</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Syncing with Industry Nodes...</p>
                    </div>
                  </div>
                ) : activeBrief ? (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="glass rounded-[4rem] p-12 md:p-20 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                      <BriefDisplay brief={activeBrief} refImage={activeBrief.refImage || null} isLoadingImage={isLoadingImage} />
                      <div className="mt-16 pt-16 border-t border-white/5 flex flex-wrap gap-4 no-print">
                         <button onClick={() => setShowReview(!showReview)} className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl flex items-center space-x-3">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{showReview ? 'Exit Review Mode' : 'Request Lead Critique'}</span>
                         </button>
                         <button onClick={() => window.print()} className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl">
                            Print Hardcopy
                         </button>
                      </div>
                    </div>
                    {showReview && (
                      <div className="mt-12 glass rounded-[4rem] p-12 md:p-16 border border-blue-500/10 animate-in slide-in-from-bottom-12 duration-700">
                        <PortfolioReview role={activeBrief.role} experience={activeBrief.experience} proMode={proMode} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 h-[700px] flex flex-col items-center justify-center text-zinc-800 uppercase font-black tracking-[0.5em] text-[11px] space-y-6">
                    <div className="p-8 rounded-[3rem] bg-zinc-900/20 border border-white/5 opacity-40">
                      <RoleIcon role={selectedRole} className="w-16 h-16" />
                    </div>
                    <div className="text-center space-y-2">
                      <p>Awaiting Project Initiation</p>
                      <p className="text-[8px] opacity-40">Configure Parameters in the Sidebar</p>
                    </div>
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
