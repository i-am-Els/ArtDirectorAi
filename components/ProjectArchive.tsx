
import React, { useState, useRef } from 'react';
import { ArtBrief, ProjectBreakdown } from '../types';
import BriefDisplay from './BriefDisplay';

interface ProjectArchiveProps {
  briefs: ArtBrief[];
  breakdowns: ProjectBreakdown[];
  onAddBreakdown: (breakdown: ProjectBreakdown) => void;
}

const ProjectArchive: React.FC<ProjectArchiveProps> = ({ briefs, breakdowns, onAddBreakdown }) => {
  const [selectedBrief, setSelectedBrief] = useState<ArtBrief | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [finishedImage, setFinishedImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [technique, setTechnique] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFinishedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrief || !finishedImage) return;

    const breakdown: ProjectBreakdown = {
      id: crypto.randomUUID(),
      briefId: selectedBrief.id,
      finishedImage,
      productionNotes: notes,
      techniqueUsed: technique,
      timestamp: Date.now()
    };

    onAddBreakdown(breakdown);
    setShowForm(false);
    setFinishedImage(null);
    setNotes('');
    setTechnique('');
  };

  if (selectedBrief) {
    const briefBreakdown = breakdowns.find(b => b.briefId === selectedBrief.id);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <button onClick={() => setSelectedBrief(null)} className="flex items-center space-x-2 text-zinc-500 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          <span>Return to Archive</span>
        </button>

        <div className="glass rounded-3xl p-10 border border-white/10">
          <BriefDisplay brief={selectedBrief} refImage={selectedBrief.refImage || null} isLoadingImage={false} />

          {briefBreakdown ? (
            <div className="mt-12 pt-12 border-t border-white/5 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase tracking-tight">Production Result</h3>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Completed: {new Date(briefBreakdown.timestamp).toLocaleDateString()}</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black shadow-2xl">
                  <img src={briefBreakdown.finishedImage} alt="Final Art" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-2">Workflow & Tools</h4>
                    <p className="text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-xl border border-white/5">{briefBreakdown.techniqueUsed}</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-500 mb-2">Production Notes</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-purple-500/40 pl-4">"{briefBreakdown.productionNotes}"</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 pt-12 border-t border-white/5 text-center space-y-6">
              <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-[0.2em]">Assignment Pending Submission</h3>
              <p className="text-zinc-600 text-sm max-w-md mx-auto">Finished this project? Log your breakdown to share your progress with the community.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-zinc-100 text-zinc-900 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl"
              >
                Log Breakdown
              </button>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <div className="glass p-10 rounded-3xl border border-white/10 max-w-2xl w-full space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-tight">Log Production Breakdown</h3>
                <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-900/30 overflow-hidden"
                >
                  {finishedImage ? (
                    <img src={finishedImage} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Upload Finished Piece</span>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Workflow Used (e.g. Zbrush -> Substance -> Unreal)" 
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={technique}
                    onChange={(e) => setTechnique(e.target.value)}
                    required
                  />
                  <textarea 
                    placeholder="Production notes, challenges, or insights..." 
                    className="w-full h-32 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl hover:bg-blue-500 transition-all">
                  Submit Production Log
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-black uppercase tracking-tight">Project Log</h2>
        <p className="text-zinc-400">Your historical assignment archive and production history.</p>
      </div>

      {briefs.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 glass rounded-3xl border border-dashed border-white/10 opacity-60">
          <p className="text-zinc-600 font-bold uppercase tracking-widest">No Projects Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefs.map((brief) => {
            const hasBreakdown = breakdowns.some(b => b.briefId === brief.id);
            return (
              <div 
                key={brief.id} 
                onClick={() => setSelectedBrief(brief)}
                className="glass rounded-2xl overflow-hidden border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-900">
                  {brief.refImage ? (
                    <img src={brief.refImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={brief.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 font-black uppercase tracking-widest">No Ref Data</div>
                  )}
                  {hasBreakdown && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-black text-[8px] font-black uppercase tracking-widest rounded shadow-xl">Completed</div>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="text-[8px] uppercase font-black text-blue-500 tracking-[0.3em]">{brief.role}</div>
                  <h3 className="font-bold text-zinc-100 leading-tight group-hover:text-blue-400 transition-colors line-clamp-1 uppercase tracking-tight">{brief.title}</h3>
                  <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest pt-2 border-t border-white/5">
                    <span>{brief.experience}</span>
                    <span>{new Date(brief.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectArchive;
