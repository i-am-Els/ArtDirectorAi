
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArtRole, ExperienceLevel, ArtBrief, AppView, ArtMedium, RolesByMedium } from './types.ts';
import RoleIcon from './components/RoleIcon.tsx';
import BriefDisplay from './components/BriefDisplay.tsx';
import PortfolioReview from './components/PortfolioReview.tsx';
import GrowthStudio from './components/GrowthStudio.tsx';
import { generateBrief } from './services/geminiService.ts';

const RoleTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative w-full">
    {children}
    <div className="pointer-events-none absolute left-full ml-4 top-0 w-56 rounded-xl bg-zinc-900 border border-white/20 p-4 text-[10px] text-zinc-200 opacity-0 transition-all duration-300 group-hover:opacity-100 z-[9999] shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-relaxed">
      <div className="relative">
        <h4 className="font-black text-blue-400 uppercase tracking-widest mb-1">Industrial Role</h4>
        {text}
        <div className="absolute right-full top-2 -mr-1 border-8 border-transparent border-r-zinc-900"></div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('GENERATOR');
  const [selectedMedium, setSelectedMedium] = useState<ArtMedium>(ArtMedium.TWO_D);
  const [selectedRole, setSelectedRole] = useState<ArtRole>(ArtRole.CONCEPT_CHAR);
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.INTERMEDIATE);
  const [theme, setTheme] = useState('Cyberpunk Favela');
  const [complexity, setComplexity] = useState(8);
  const [brief, setBrief] = useState<ArtBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = useMemo(() => RolesByMedium[selectedMedium], [selectedMedium]);

  useEffect(() => {
    if (!availableRoles.includes(selectedRole)) {
      setSelectedRole(availableRoles[0]);
    }
  }, [selectedMedium, availableRoles]);

  const handleOpenKeySelection = async () => {
    try {
      if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setError(null);
      }
    } catch (err) { console.error(err); }
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

  const getRoleDescription = (role: ArtRole) => {
    switch(role) {
      case ArtRole.CONCEPT_CHAR: return "Design unique character archetypes, outfits, and anatomy for game/film production.";
      case ArtRole.CONCEPT_ENV: return "Create immersive worlds, architecture, and lighting keys for environment teams.";
      case ArtRole.CHARACTER_3D: return "High-fidelity digital sculpting, retopology, and game-ready character creation.";
      case ArtRole.ENVIRONMENT_3D: return "World building, modular kitbash sets, and large-scale scene assembly in engine.";
      case ArtRole.SURFACING_ARTIST: return "Physically-based rendering (PBR) texture creation and material lookdev.";
      case ArtRole.TECH_ART: return "Bridge between art and engineering. Tool creation, shaders, and optimization.";
      case ArtRole.LIGHTING_LOOKDEV: return "Define mood through cinematic lighting, shadows, and post-processing effects.";
      default: return `Professional specialization focused on ${role.toLowerCase()}.`;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-blue-500/30 overflow-x-hidden">
      <header className="fixed top-0 w-full z-[100] glass border-b border-white/5 px-6 py-5 flex items-center justify-between no-print shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setCurrentView('GENERATOR')}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" /></svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter uppercase italic">ArtDirector <span className="text-blue-500">Academy</span></h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-black">Industrial Training Hub</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-5 bg-zinc-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          {[
            { id: 'GENERATOR', label: 'Briefs' },
            { id: 'REVIEW', label: 'Review' },
            { id: 'GROWTH', label: 'Academy' }
          ].map(v => (
            <button key={v.id} onClick={() => setCurrentView(v.id as AppView)} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${currentView === v.id ? 'bg-zinc-100 text-zinc-950 shadow-md scale-105' : 'text-zinc-500 hover:text-white'}`}>
              {v.label}
            </button>
          ))}
        </div>

        <button onClick={handleOpenKeySelection} className="text-[10px] font-black text-zinc-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em] border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5">Studio Key</button>
      </header>

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-visible">
          {currentView !== 'GROWTH' && (
            <aside className="lg:col-span-4 space-y-6 no-print overflow-visible">
              <div className="glass rounded-[2rem] p-8 border border-white/10 space-y-8 sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar overflow-x-visible">
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 block text-center">Industry Pipeline</label>
                  <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 shadow-inner">
                    {Object.values(ArtMedium).map(m => (
                      <button key={m} onClick={() => setSelectedMedium(m)} className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all uppercase tracking-widest ${selectedMedium === m ? 'bg-zinc-100 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{m === ArtMedium.TWO_D ? '2D VisDev' : '3D Assets'}</button>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-5 block">Production Role</label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableRoles.map(role => (
                      <RoleTooltip key={role} text={getRoleDescription(role)}>
                        <button onClick={() => setSelectedRole(role)} className={`w-full flex items-center space-x-4 p-3.5 rounded-2xl border transition-all ${selectedRole === role ? 'bg-blue-600/10 border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:border-white/20'}`}>
                          <RoleIcon role={role} className="w-4 h-4" />
                          <span className="text-[11px] font-black truncate uppercase tracking-tight">{role}</span>
                        </button>
                      </RoleTooltip>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-5 block">Artist Standing</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ExperienceLevel).map(lvl => (
                      <button key={lvl} onClick={() => setExperience(lvl)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter ${experience === lvl ? 'bg-zinc-100 text-zinc-900 shadow-md' : 'bg-zinc-900/50 text-zinc-500 border border-white/10 hover:border-white/20'}`}>{lvl}</button>
                    ))}
                  </div>
                </section>
                {currentView === 'GENERATOR' && (
                  <div className="space-y-8 pt-4 border-t border-white/5">
                    <section><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 block">Theme Spectrum</label><input type="text" value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" /></section>
                    <section><div className="flex justify-between items-center mb-3"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Difficulty Curve</label><span className="mono text-blue-500 font-black text-xs tabular-nums">{complexity}/10</span></div><input type="range" min="1" max="10" value={complexity} onChange={e => setComplexity(parseInt(e.target.value))} className="w-full h-2 bg-zinc-900 rounded-lg appearance-none accent-blue-600 cursor-pointer" /></section>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-[0.3em] text-[11px] shadow-2xl active:scale-95 disabled:opacity-50">{isLoading ? 'Constructing Blueprint...' : 'Accept Assignment'}</button>
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
                  <div className="flex-1 flex flex-col items-center justify-center p-12 glass border-dashed border-white/10 rounded-[3rem] opacity-60 text-center animate-pulse">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/5">
                      <svg viewBox="0 0 24 24" className="w-12 h-12 text-zinc-700" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-zinc-300 tracking-tighter uppercase italic">Registry Awaiting Selection</h3>
                    <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed">Select your industry specialization and artistic standing to receive a professional-grade assignment blueprint.</p>
                  </div>
                )}
                {isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 border-t-4 border-blue-600 rounded-full animate-spin shadow-2xl"></div>
                    <p className="text-zinc-500 mono text-[11px] font-black tracking-[0.4em] uppercase">Processing Lab Protocols...</p>
                  </div>
                )}
                {brief && (
                  <div className="print:p-0 glass rounded-[3rem] p-6 md:p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-visible">
                    <BriefDisplay brief={brief} />
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-10 no-print gap-8">
                      <div className="flex items-center space-x-5">
                        <div className="text-[11px] text-zinc-500 uppercase font-black tracking-[0.3em]">Industry Active:</div>
                        <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{selectedRole}</div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={handleSavePDF} disabled={isExportingPDF} className="px-8 py-3.5 bg-zinc-100 text-zinc-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white shadow-2xl active:scale-95 transition-all">{isExportingPDF ? 'Exporting...' : 'Export PDF'}</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {currentView === 'REVIEW' && <div className="glass rounded-[3rem] p-10 border border-white/10 min-h-[650px] no-print shadow-2xl"><PortfolioReview role={selectedRole} experience={experience} /></div>}
            {currentView === 'GROWTH' && <GrowthStudio currentRole={selectedRole} />}
          </section>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center no-print">
        <p className="text-zinc-700 text-[10px] tracking-[0.8em] font-black uppercase">ArtDirector Academy • Zero to Industrial Hero • 2025</p>
      </footer>
    </div>
  );
};

export default App;
