
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, onAuthStateChanged, signOut, User, setPersistence, browserLocalPersistence } from "firebase/auth";
import { ArtRole, ExperienceLevel, ArtBrief, AppView, ArtMedium, RolesByMedium, ProjectBreakdown } from './types';
import RoleIcon from './components/RoleIcon';
import BriefDisplay from './components/BriefDisplay';
import ProjectArchive from './components/ProjectArchive';
import CommunityFeed from './components/CommunityFeed';
import PortfolioReview from './components/PortfolioReview';
import { generateBrief, generateReferenceImage } from './services/geminiService';

// Firebase Configuration
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    return localStorage.getItem('ad_terms_accepted') === 'true';
  });
  const [isKeyConnected, setIsKeyConnected] = useState<boolean>(() => {
    return localStorage.getItem('ad_key_connected') !== 'false';
  });
  const [keySource, setKeySource] = useState<'bridge'|'manual'|'emulator'|'none'>('none');
  const [currentView, setCurrentView] = useState<AppView>('GENERATOR');
  
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
  const [keyStoreStatus, setKeyStoreStatus] = useState<'idle'|'saving'|'ok'|'fail'>('idle');
  const [serverKeyExists, setServerKeyExists] = useState<boolean>(false);
  const [serverProjectId, setServerProjectId] = useState<string | null>(null);
  const [showByokHelp, setShowByokHelp] = useState(false);
  const [byokCopyStatus, setByokCopyStatus] = useState<'idle'|'copied'|'fail'>('idle');
  const [showByokQuick, setShowByokQuick] = useState(false);
  const [authDomainStatus, setAuthDomainStatus] = useState<'unknown'|'ok'|'fail'>('unknown');
  const [showReview, setShowReview] = useState(false);
  const [savedBriefs, setSavedBriefs] = useState<ArtBrief[]>([]);
  const [breakdowns, setBreakdowns] = useState<ProjectBreakdown[]>([]);

  // 1. Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Local Storage Persistence
  useEffect(() => {
    const localBriefs = localStorage.getItem('ad_briefs');
    const localBreakdowns = localStorage.getItem('ad_breakdowns');
    if (localBriefs) setSavedBriefs(JSON.parse(localBriefs));
    if (localBreakdowns) setBreakdowns(JSON.parse(localBreakdowns));
  }, []);

  useEffect(() => {
    localStorage.setItem('ad_briefs', JSON.stringify(savedBriefs));
    localStorage.setItem('ad_breakdowns', JSON.stringify(breakdowns));
    localStorage.setItem('ad_terms_accepted', String(hasAcceptedTerms));
    localStorage.setItem('ad_key_connected', String(isKeyConnected));
  }, [savedBriefs, breakdowns, hasAcceptedTerms, isKeyConnected]);

  const availableRoles = useMemo(() => RolesByMedium[selectedMedium], [selectedMedium]);
  const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // BYOK helper modal data and actions (rendered via portal)
  const byokCreateCommands = `# One-paste Cloud Shell script (creates project + key in YOUR account)
# Note: Google will ask you to attach billing if required. This script runs in your account.
PROJECT_ID="artdirectorai-$(date +%s)"
echo "Creating project: $PROJECT_ID"
gcloud projects create $PROJECT_ID
gcloud config set project $PROJECT_ID
echo "Project set to $PROJECT_ID"

# Enable required API for Generative AI
gcloud services enable generativelanguage.googleapis.com

# Create an API key and print only the key string
API_KEY=$(gcloud alpha services api-keys create \
  --display-name="ArtDirectorAI BYOK" \
  --format="get(key)")

echo ""
echo "=============================="
echo "PROJECT ID:"
echo $PROJECT_ID
echo ""
echo "GOOGLE GENAI API KEY:"
echo $API_KEY
echo "=============================="
echo ""
echo "⚠️ If this is your first project, you may need to enable billing in the Cloud Console."`;

  const copyByokCommands = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(byokCreateCommands);
      } else {
        const ta = document.createElement('textarea');
        ta.value = byokCreateCommands;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setByokCopyStatus('copied');
      setTimeout(() => setByokCopyStatus('idle'), 2500);
    } catch (e) {
      setByokCopyStatus('fail');
      setTimeout(() => setByokCopyStatus('idle'), 2500);
    }
  };

  const handleCloseByok = () => setShowByokHelp(false);

  const [byokPanel, setByokPanel] = useState<'non' | 'tech' | null>(null);

  const byokModal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleCloseByok}></div>
      <div className="relative z-10 w-full max-w-2xl mx-4 glass p-4 rounded-2xl border border-white/5 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between sticky top-0 bg-transparent pt-2">
          <div>
            <h3 className="text-lg font-black">Get help: Create a BYOK API Key</h3>
            <p className="text-zinc-400 text-sm mt-1">Choose an option below — non-technical (Console UI) or technical (Cloud Shell script).</p>
          </div>
          <div className="flex items-start space-x-3">
            <button onClick={handleCloseByok} className="text-zinc-400 hover:text-white">Close</button>
            <button onClick={() => setShowByokQuick(s => !s)} className="text-[11px] text-blue-400 underline">{showByokQuick ? 'Hide quick steps' : 'Quick steps'}</button>
          </div>
        </div>

        {showByokQuick && (
          <div className="mt-3 p-3 bg-zinc-900/20 rounded text-sm text-zinc-200">
            <strong>Quick steps</strong>
            <ol className="list-decimal list-inside mt-2 text-zinc-400">
              <li>Open Cloud Shell or Cloud Console.</li>
              <li>Create an API key (we recommend the Console UI).</li>
              <li>Copy only the key string and paste it into the app when asked.</li>
            </ol>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex flex-col space-y-2">
            <button onClick={() => setByokPanel(byokPanel === 'non' ? null : 'non')} className="w-full text-left p-4 bg-zinc-950/40 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold">Non-Technical: Google Cloud Console</p>
                <p className="text-zinc-400 text-sm mt-1">Recommended for most users — create an API key using the credentials UI.</p>
              </div>
              <div className="text-zinc-400">{byokPanel === 'non' ? '▾' : '▸'}</div>
            </button>
            {byokPanel === 'non' && (
              <div className="p-4 bg-zinc-950/20 rounded text-sm space-y-3">
                <p className="text-zinc-300 font-semibold">Step-by-step (non-technical)</p>
                <ol className="list-decimal list-inside text-zinc-400">
                  <li><strong>Select or create a GCP project:</strong> Open <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="underline text-blue-400">Google Cloud Console</a>. If you don't see a project selected, click <em>Create project</em> (top-right) and follow the prompts. Note: you may be asked to enable billing for a new project.</li>
                  <li><strong>Enable the Generative AI API:</strong> In the console go to <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noreferrer" className="underline text-blue-400">APIs & Services → Library</a>, search for <em>Generative AI</em> (or Gemini), and click <em>Enable</em>.</li>
                  <li><strong>Create an API key:</strong> After the API is enabled, go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline text-blue-400">APIs & Services → Credentials</a> → <em>Create credentials → API key</em>. The console will show a short string — copy only that string.</li>
                  <li><strong>Paste the key into this app:</strong> Return to ArtDirector AI and use <em>Link Project Key</em> to paste the key string. Do NOT paste project JSON or other outputs — only the key string.</li>
                </ol>
                <div className="mt-2 text-zinc-400 text-sm">
                  <p><strong>Tip:</strong> Keep the Project ID (top-left) if you later want to revoke the key or check billing.</p>
                </div>
              </div>
            )}

            <button onClick={() => setByokPanel(byokPanel === 'tech' ? null : 'tech')} className="w-full text-left p-4 bg-zinc-900/40 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold">Technical: Cloud Shell one-paste script</p>
                <p className="text-zinc-400 text-sm mt-1">Power-user option: run the script in Cloud Shell to create a project, enable the API, and print the key.</p>
              </div>
              <div className="text-zinc-400">{byokPanel === 'tech' ? '▾' : '▸'}</div>
            </button>
            {byokPanel === 'tech' && (
              <div className="p-4 bg-zinc-900 rounded text-sm">
                <pre className="bg-black/50 rounded p-3 mt-3 overflow-auto text-xs"><code>{byokCreateCommands}</code></pre>
                <div className="mt-3 flex items-center space-x-3">
                  <button type="button" onClick={copyByokCommands} className="px-4 py-2 bg-blue-600 text-white rounded">Copy script</button>
                  <a className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded" target="_blank" rel="noopener noreferrer" href={`https://console.cloud.google.com/cloudshell?project=${firebaseConfig.projectId}`}>Open Cloud Shell</a>
                  <button type="button" onClick={() => { setByokPanel(null); handleCloseByok(); }} className="px-4 py-2 border rounded border-white/10">Done</button>
                </div>
                {byokCopyStatus === 'copied' && <div className="text-green-400 text-sm mt-2">Script copied to clipboard.</div>}
                {byokCopyStatus === 'fail' && <div className="text-red-400 text-sm mt-2">Copy failed. Select the script and press Ctrl+C.</div>}
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            <p className="font-semibold">Important:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Billing may be required — you must approve billing in Google Cloud Console.</li>
              <li>Deleting the project will revoke the key. Keep the Project ID if you want to manage or delete the key later.</li>
              <li>Only paste the API key string into the app when prompted — do not paste project or script output.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const byokPortal = showByokHelp ? createPortal(byokModal, document.body) : null;

  // 3. API Key Handshake
  const checkKeyStatus = useCallback(async () => {
    // If running inside the AI Studio platform, query its selected key state.
    // @ts-ignore
    if (window.aistudio?.hasSelectedApiKey) {
      try {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyConnected(hasKey);
        setKeySource(hasKey ? 'bridge' : 'none');
        return hasKey;
      } catch (e) {
        return false;
      }
    }

    // Fallback: check if the user has manually provided an API key (local dev)
    try {
      const stored = localStorage.getItem('ad_api_key');
      const hasKey = Boolean(stored && stored.length > 8);
      setIsKeyConnected(hasKey);
      setKeySource(hasKey ? 'manual' : 'none');
      return hasKey;
    } catch (e) {
      setKeySource('none');
      return false;
    }
  }, []);

  useEffect(() => {
    if (user && hasAcceptedTerms && isKeyConnected) {
      checkKeyStatus();
      // check whether user has server-stored key
      checkServerKey().catch(() => {});
    }
  }, [user, hasAcceptedTerms, isKeyConnected, checkKeyStatus]);

  const checkServerKey = useCallback(async () => {
    if (!user) { setServerKeyExists(false); return false; }
    try {
      const idToken = await user.getIdToken();
      const resp = await fetch('/api/key-status', { headers: { Authorization: `Bearer ${idToken}` } });
      if (resp.ok) {
        const body = await resp.json();
        setServerKeyExists(Boolean(body?.hasKey));
        setServerProjectId(body?.projectId || null);
        return Boolean(body?.hasKey);
      }
    } catch (e) {
      console.warn('Failed to fetch key status', e);
    }
    setServerKeyExists(false);
    setServerProjectId(null);
    return false;
  }, [user]);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign-in popup failed:', err);
      const code = err?.code || '';
      const message = err?.message || String(err);

      if (code === 'auth/network-request-failed') {
        setError('Network error: Unable to reach Firebase auth endpoint. Check your internet, firewall, or proxy settings.');
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setError('Unauthorized domain: Add your development host to Firebase Console → Authentication → Authorized domains.');
        return;
      }

      // If popup blocked or environment doesn't support popup, fall back to redirect
      if (code === 'auth/popup-blocked' || message.toLowerCase().includes('blocked') || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          setError('Popup blocked — falling back to redirect sign-in.');
          // Persist auth state to localStorage so the redirect handler can restore state
          await setPersistence(auth, browserLocalPersistence);
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirErr: any) {
          console.error('Redirect sign-in also failed:', redirErr);
          setError(redirErr?.message || 'Sign-in failed. Check popup settings and authorized domains.');
          return;
        }
      }

      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled: popup was closed. Try again.');
        return;
      }

      // Default fallback: show raw message (already logged)
      setError(message);
    }
  };

  const testAuthDomain = async () => {
    setAuthDomainStatus('unknown');
    setError(null);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`https://${firebaseConfig.authDomain}/`, { signal: controller.signal, cache: 'no-store', mode: 'cors' });
      clearTimeout(id);
      if (res.ok) {
        setAuthDomainStatus('ok');
      } else {
        setAuthDomainStatus('fail');
        setError(`Auth domain responded with ${res.status}`);
      }
    } catch (err: any) {
      setAuthDomainStatus('fail');
      setError('Network error: unable to reach auth domain. Check firewall, proxy, or DNS.');
      console.error('Auth domain test failed:', err);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
    setShowUserMenu(false);
  };

  const handleResetSession = () => {
    setHasAcceptedTerms(false);
    setIsKeyConnected(false);
    localStorage.removeItem('ad_terms_accepted');
    localStorage.setItem('ad_key_connected', 'false');
    // Also remove any manually stored API key used for local development
    try { localStorage.removeItem('ad_api_key'); } catch (e) { /* ignore */ }
    setShowUserMenu(false);
    signOut(auth);
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
  };

  const handleOpenByok = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // debug visibility
      // eslint-disable-next-line no-console
      console.log('BYOK help opened');
    } catch {}
    setShowByokHelp(true);
  };

  const handleConnectKey = async () => {
    // Trigger the mandatory platform handshake
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      try {
        // Open the platform key selector UI
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // After user selects, re-check status
        await checkKeyStatus();
        setError(null);
        return;
      } catch (e) {
        console.warn('Handshake bridge interrupted.');
      }
    }

    // Fallback: prompt user to paste an API key. Allow authenticated users to store remotely.
    try {
      const key = window.prompt('AI Studio bridge not found. Paste your Google AI Studio API key here. It will be stored encrypted on the server for your account.');
      if (key && key.length > 10) {
        const projectIdPrompt = window.prompt('Optional: enter the GCP Project ID that will be billed for this key (leave blank to skip)');
        const projectId = projectIdPrompt && projectIdPrompt.trim().length > 0 ? projectIdPrompt.trim() : undefined;
        // If the user is not signed in and not local dev, instruct them to sign in first
        if (!user && !isLocalDev) {
          setError('Please sign in first (Step 1) before linking a project key.');
          return;
        }
        // Attempt to POST the key to the server-side store if user is authenticated
        let storedRemotely = false;
        setKeyStoreStatus('saving');
        try {
          if (user) {
            const idToken = await user.getIdToken();
            const resp = await fetch('/api/store-key', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ key: key.trim(), projectId }),
            });
            if (resp.ok) {
              const body = await resp.json().catch(() => ({}));
              storedRemotely = true;
              setKeyStoreStatus('ok');
              setServerKeyExists(true);
              setServerProjectId(body?.projectId || null);
            } else {
              setKeyStoreStatus('fail');
              const body = await resp.json().catch(() => ({}));
              console.warn('Remote store-key failed', body);
            }
          } else if (isLocalDev) {
            // For local dev, allow storing locally only
            storedRemotely = false;
            setKeyStoreStatus('ok');
          } else {
            setKeyStoreStatus('fail');
          }
        } catch (err) {
          setKeyStoreStatus('fail');
          console.warn('Error storing key remotely:', err);
        }

        // Only store locally when explicitly running in local development.
        if (isLocalDev) {
          try { localStorage.setItem('ad_api_key', key.trim()); } catch (e) { /* ignore */ }
        }
        setIsKeyConnected(true);
        setKeySource('manual');
        localStorage.setItem('ad_key_connected', 'true');
        if (storedRemotely) setError(null);
      } else if (key !== null) {
        setError('Invalid key provided. Key not stored.');
      }
    } catch (err) {
      console.error('Local key entry failed:', err);
      setError('Failed to store API key. Check browser settings.');
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
      console.error("Generation error:", err);
      if (err.message?.toLowerCase().includes("api key") || err.message?.includes("404")) {
        setError("AUTHENTICATION ERROR: Project Key not detected in environment.");
      } else {
        setError(err.message || "SYNTHESIS FAILED: Critical core error.");
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

  const handleRemoveServerKey = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const resp = await fetch('/api/remove-key', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } });
      if (resp.ok) {
        setServerKeyExists(false);
        setKeyStoreStatus('idle');
        setError(null);
      } else {
        const body = await resp.json().catch(() => ({}));
        setError(body?.error || 'Failed to remove key');
      }
    } catch (e) {
      console.error('remove key failed', e);
      setError('Failed to remove key');
    }
  };

  // --- ONBOARDING SCREENS ---
  if (!user || !hasAcceptedTerms || !isKeyConnected) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        <div className="glass p-10 md:p-14 rounded-[2.5rem] border-white/5 max-w-xl w-full text-center space-y-12 relative z-10 shadow-2xl">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white rounded-[1.8rem] mx-auto flex items-center justify-center shadow-[0_25px_60px_rgba(255,255,255,0.15)] text-black font-black italic text-4xl">AD</div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tight text-white">ArtDirector <span className="text-blue-500">AI</span></h2>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Creative Management Protocol</p>
            </div>
          </div>

          {!user ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-left space-y-3 px-4 border-l border-white/10">
                <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">Step 1: Identity Sync</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Securely authenticate with Google to access your private studio vault.</p>
              </div>
              <button onClick={handleSignIn} className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center justify-center space-x-4 group">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Google Account Sync</span>
              </button>
              <div className="mt-4 flex items-center justify-between text-[10px]">
                <button onClick={testAuthDomain} className="px-4 py-2 bg-zinc-900/60 border border-white/5 rounded-xl text-zinc-300 hover:bg-zinc-800">Test Auth Domain</button>
                <div className="text-zinc-500">
                  {authDomainStatus === 'unknown' && <span>Status: Unknown</span>}
                  {authDomainStatus === 'ok' && <span className="text-green-400">Status: Reachable</span>}
                  {authDomainStatus === 'fail' && <span className="text-red-400">Status: Unreachable</span>}
                </div>
              </div>
            </div>
          ) : !hasAcceptedTerms ? (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-left space-y-4 px-4 border-l border-white/10">
                <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">Terms of Production</h3>
                <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-6 max-h-[250px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-4 text-zinc-500 text-[10px] leading-relaxed font-black uppercase tracking-widest">
                    <div className="space-y-2">
                      <p className="text-blue-500">01. BYOK Policy</p>
                      <p className="font-normal normal-case text-xs text-zinc-400">ArtDirector AI is a "Bring Your Own Key" platform. You provide the processing power via your own Google AI Studio API key.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-blue-500">02. Billing</p>
                      <p className="font-normal normal-case text-xs text-zinc-400">Users must select an API key from a paid GCP project. Refer to <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 underline">billing documentation</a>.</p>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={handleAcceptTerms} className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl">
                Accept & Proceed
              </button>
            </div>
          ) : !isKeyConnected ? (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.uid}`} className="w-20 h-20 rounded-3xl border border-white/10 p-1 bg-zinc-900 shadow-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#050505] rounded-full"></div>
                </div>
                <div className="text-center">
                  <span className="text-[14px] font-black uppercase tracking-widest text-white block">{user.displayName}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-500 block mt-1">Identity Verified</span>
                </div>
              </div>
              
              <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 text-left space-y-5 mx-4">
                <div className="flex items-center space-x-3 text-blue-500">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-zinc-100">Step 3: Key Bridge</h4>
                </div>
                <p className="text-zinc-500 text-[13px] leading-relaxed">Select your production API key to initialize the generation engine.</p>
              </div>

              <button onClick={handleConnectKey} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all active:scale-95">
                Link Project Key
              </button>
              {serverKeyExists && (
                <div className="mt-3 p-3 bg-zinc-900/30 rounded-xl border border-white/5 text-center text-sm">
                  <div className="font-black text-zinc-200 tracking-widest">A project key is stored for your account on the server.</div>
                  {serverProjectId && <div className="text-xs text-zinc-400 mt-2">Billed to: <span className="font-bold text-zinc-100">{serverProjectId}</span></div>}
                  <div className="mt-2">
                    <button onClick={handleRemoveServerKey} className="px-4 py-2 bg-red-600 text-white rounded-md">Remove stored key</button>
                  </div>
                </div>
              )}
                <div className="mt-3 text-center">
                    <button type="button" onClick={handleOpenByok} className="text-[11px] text-blue-400 underline" aria-haspopup="dialog">Get help with BYOK API KEY</button>
                  <span className="mx-2 text-zinc-600">•</span>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 underline">Get an API key (Google Cloud Console)</a>
                </div>
            </div>
          ) : null}
          
          <p className="text-[9px] text-zinc-800 uppercase font-black tracking-[0.6em]">System Protocol v4.2 • Secured</p>

          {byokPortal}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 selection:bg-blue-500/30">
      <header className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-8 py-6 flex items-center justify-between no-print">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => { setActiveBrief(null); setCurrentView('GENERATOR'); }}>
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-black font-black italic text-lg group-hover:scale-105 transition-transform">AD</div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-white">ArtDirector <span className="text-blue-500">AI</span></h1>
            <div className="flex items-center space-x-3">
              <p className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 font-black mt-1">Assignment Node</p>
              <div className="text-[9px] px-2 py-1 rounded-full bg-zinc-900/40 border border-white/5 text-zinc-400 font-black uppercase tracking-widest mt-1">
                Key: {keySource === 'bridge' ? 'Bridge' : keySource === 'manual' ? 'Manual' : keySource === 'emulator' ? 'Emulator' : 'None'}
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex items-center space-x-1 bg-zinc-900/80 p-1.5 rounded-full border border-white/10 shadow-inner">
          {(['GENERATOR', 'VAULT', 'COMMUNITY'] as any[]).map(v => (
            <button key={v} onClick={() => setCurrentView(v === 'VAULT' ? 'ARCHIVE' : v)} className={`px-6 py-2.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-black transition-all ${((v === 'VAULT' && currentView === 'ARCHIVE') || currentView === v) ? 'bg-zinc-100 text-zinc-900 shadow-xl' : 'text-zinc-500 hover:text-white'}`}>
              {v}
            </button>
          ))}
        </nav>

        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-4 p-1 rounded-2xl border border-white/5 bg-zinc-900/50 hover:bg-zinc-800 transition-all">
            <div className="flex flex-col items-end px-2 hidden md:flex">
               <span className="text-[10px] uppercase font-black tracking-widest text-zinc-100">{user.displayName}</span>
               <span className="text-[8px] uppercase font-black text-blue-500/60 mt-0.5 tracking-widest">Operator Active</span>
            </div>
            <div className="w-11 h-11 rounded-xl border border-white/10 overflow-hidden shadow-xl">
              <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.uid}`} alt="Avatar" className="h-full w-full object-cover" />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-4 w-64 glass rounded-[2rem] border border-white/5 shadow-2xl p-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 border-b border-white/5 space-y-1">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol ID</p>
                <p className="text-xs font-bold text-zinc-100 truncate">{user.email}</p>
              </div>
              <button onClick={handleConnectKey} className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-colors flex items-center space-x-3 text-blue-400/70 hover:text-blue-400 group">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Relink Key Bridge</span>
              </button>
              <div className="mt-2">
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 underline">Where to get an API key</a>
              </div>
              {serverKeyExists && (
                <div className="p-3 mt-2 bg-zinc-900/30 rounded-xl border border-white/5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-black uppercase tracking-widest text-zinc-300">Server Key: Stored</div>
                      {serverProjectId && <div className="text-xs text-zinc-400 mt-1">Billed to: <span className="font-bold text-zinc-100">{serverProjectId}</span></div>}
                    </div>
                    <button onClick={handleRemoveServerKey} className="text-[10px] text-red-400 hover:underline">Remove key</button>
                  </div>
                </div>
              )}
              <button onClick={handleSignOut} className="w-full text-left p-4 hover:bg-white/5 rounded-xl transition-colors flex items-center space-x-3 text-zinc-500 hover:text-white group">
                <svg className="w-4 h-4 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Logout Session</span>
              </button>
              <button onClick={handleResetSession} className="w-full text-left p-4 hover:bg-red-600/10 rounded-xl transition-colors flex items-center space-x-3 text-red-500/60 hover:text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Factory Reset</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-36 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {currentView === 'GENERATOR' && (
            <aside className="lg:col-span-4 space-y-8 no-print">
              <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 space-y-12 sticky top-36 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar shadow-2xl relative">
                <div className="absolute top-6 right-8 flex items-center space-x-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Health</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block">Core Processor</label>
                  <button onClick={() => setProMode(!proMode)} className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${proMode ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center space-x-4 text-left">
                      <div className={`p-2.5 rounded-xl transition-colors duration-500 ${proMode ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 22.5 12 13.5H3.75z" /></svg>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest block leading-none mb-1">{proMode ? 'Gemini 3 Pro' : 'Standard Node'}</span>
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{proMode ? 'High Precision' : 'Flash Latency'}</span>
                      </div>
                    </div>
                  </button>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block">Artist Proficiency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(ExperienceLevel).map(level => (
                      <button key={level} onClick={() => setExperience(level)} className={`py-4 text-[9px] font-black rounded-xl border transition-all uppercase tracking-widest ${experience === level ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}`}>
                        {level}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block">Studio Discipline</label>
                  <div className="flex bg-black/60 p-1 rounded-2xl border border-white/5 shadow-inner">
                    {Object.values(ArtMedium).map(m => ( m &&
                      <button key={m} onClick={() => setSelectedMedium(m)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] ${selectedMedium === m ? 'bg-zinc-100 text-zinc-900 shadow-xl scale-[1.02]' : 'text-zinc-600 hover:text-zinc-400'}`}>
                        {m === ArtMedium.TWO_D ? '2D Art' : '3D Art'}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block">Operational Role</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {availableRoles.map((role) => (
                      <button key={role} onClick={() => setSelectedRole(role)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-center space-y-2.5 ${selectedRole === role ? 'bg-blue-600/10 border-blue-500 text-blue-100 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-zinc-950 border-white/5 text-zinc-600 hover:border-white/20 hover:bg-zinc-900'}`}>
                        <div className={`p-2 rounded-lg transition-colors ${selectedRole === role ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-900 text-zinc-700'}`}>
                          <RoleIcon role={role} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tight leading-tight h-4 line-clamp-2">{role}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block">Project Theme</label>
                    <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-xl px-5 py-5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-white transition-all uppercase font-bold tracking-[0.1em]" placeholder="Identify Theme..." />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Complexity</label>
                      <span className="text-blue-400 mono text-[10px] font-bold tracking-widest">{complexity}/10</span>
                    </div>
                    <div className="px-1">
                      <input type="range" min="1" max="10" value={complexity} onChange={(e) => setComplexity(parseInt(e.target.value))} className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl space-y-4 animate-in slide-in-from-top-2">
                    <p className="text-red-400 text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed text-center">{error}</p>
                    <button onClick={handleConnectKey} className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-[8px] font-black uppercase tracking-widest border border-red-500/20 transition-all">Relink Core Key</button>
                  </div>
                )}

                <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 font-black uppercase tracking-[0.4em] py-6 rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.2)] transition-all flex items-center justify-center space-x-4 active:scale-[0.98] text-[11px] group">
                  {isLoading ? (
                    <div className="flex items-center space-x-3"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div><span className="animate-pulse">Compiling...</span></div>
                  ) : (
                    <span className="group-hover:tracking-[0.5em] transition-all duration-500">Initiate Protocol</span>
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
                      <div className="w-32 h-32 border-[2px] border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-blue-500/5 rounded-full animate-pulse blur-2xl"></div></div>
                    </div>
                    <div className="text-center space-y-4">
                      <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white">System Synthesis</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-700">Accessing Industrial Neural Links...</p>
                    </div>
                  </div>
                ) : activeBrief ? (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="glass rounded-[2.5rem] p-12 md:p-16 border border-white/5 shadow-2xl">
                      <BriefDisplay brief={activeBrief} refImage={activeBrief.refImage || null} isLoadingImage={isLoadingImage} />
                      <div className="mt-16 pt-12 border-t border-white/5 flex flex-wrap gap-4 no-print">
                         <button onClick={() => setShowReview(!showReview)} className="px-8 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center space-x-3">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{showReview ? 'End Critique' : 'Request Lead Review'}</span>
                         </button>
                         <button onClick={() => window.print()} className="px-8 py-4 bg-zinc-950 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all">Print Protocol</button>
                      </div>
                    </div>
                    {showReview && (
                      <div className="mt-12 glass rounded-[2.5rem] p-12 md:p-16 border border-blue-500/10 animate-in slide-in-from-bottom-12 duration-700">
                        <PortfolioReview role={activeBrief.role} experience={activeBrief.experience} proMode={proMode} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 h-[700px] flex flex-col items-center justify-center text-zinc-800 uppercase font-black tracking-[0.6em] text-[11px] space-y-8">
                    <div className="p-12 rounded-full bg-zinc-900/10 border border-white/5 opacity-20 relative">
                       <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-10"></div>
                       <RoleIcon role={selectedRole} className="w-24 h-24" />
                    </div>
                    <div className="text-center space-y-3">
                      <p>Awaiting Operational Directives</p>
                      <p className="text-[8px] opacity-30 tracking-[0.2em]">Select Discipline & Role to Begin</p>
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
