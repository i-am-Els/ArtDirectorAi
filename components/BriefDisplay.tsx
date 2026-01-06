
import React from 'react';
import { ArtBrief } from '../types';

interface BriefDisplayProps {
  brief: ArtBrief;
  refImage: string | null;
  isLoadingImage: boolean;
}

const BriefDisplay: React.FC<BriefDisplayProps> = ({ brief, refImage, isLoadingImage }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-8">
        <div className="flex items-center space-x-2 mb-4 no-print">
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-widest rounded">Official Assignment</span>
          <span className="px-2 py-0.5 bg-zinc-800 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest rounded">Confidential</span>
        </div>
        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">{brief.title}</h2>
        <p className="text-zinc-400 leading-relaxed text-lg max-w-3xl">{brief.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Deliverables & Technicals */}
        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-5 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
              Core Deliverables
            </h3>
            <ul className="space-y-4">
              {brief.keyDeliverables.map((item, i) => (
                <li key={i} className="flex items-start text-zinc-300 group">
                  <span className="text-blue-500/50 mr-3 mt-1 text-xs transition-colors group-hover:text-blue-400 font-mono">0{i+1}</span>
                  <span className="text-sm md:text-base leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-5 flex items-center">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-3 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
              Technical Constraints
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {brief.technicalConstraints.map((item, i) => (
                <div key={i} className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl text-sm text-zinc-400 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-500 mr-3 mt-0.5 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Art Direction Section */}
        <div className="space-y-8">
          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-5">Visual Key Reference</h3>
             <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-video relative flex items-center justify-center bg-[#050505]">
               {isLoadingImage ? (
                 <div className="flex flex-col items-center space-y-4">
                   <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                   <p className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] animate-pulse">Rendering Keyframe Reference...</p>
                 </div>
               ) : refImage ? (
                 <img src={refImage} alt="Art Reference" className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
               ) : (
                 <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-widest">Reference Offline</p>
               )}
               <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center no-print">
                 <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-bold text-zinc-400 border border-white/5 uppercase tracking-widest">Studio Asset Ref. 4402</span>
               </div>
             </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 glass rounded-2xl border-white/5 hover:border-white/10 transition-colors">
              <h4 className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-2">Lighting Key</h4>
              <p className="text-sm text-zinc-300 leading-relaxed italic">"{brief.lightingMood}"</p>
            </div>
            <div className="p-5 glass rounded-2xl border-white/5 hover:border-white/10 transition-colors">
              <h4 className="text-[9px] font-black text-purple-500/60 uppercase tracking-[0.2em] mb-2">Technical Note</h4>
              <p className="text-sm text-zinc-300 leading-relaxed italic">"{brief.compositionNotes || brief.materialNotes || "Ensure optimal silhouette and material separation."}"</p>
            </div>
          </div>

          {/* Fix: Added Grounding Reference Links as required by Search Grounding guidelines */}
          {brief.groundingUrls && brief.groundingUrls.length > 0 && (
            <div className="p-5 glass rounded-2xl border border-blue-500/20 animate-in slide-in-from-right-2 duration-500">
              <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                Industry Reference Sources
              </h4>
              <ul className="space-y-2">
                {brief.groundingUrls.map((url, i) => (
                  <li key={i}>
                    <a href={url.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-400 hover:text-blue-400 transition-colors underline decoration-blue-500/30 truncate block">
                      {url.title || url.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Challenge Note from the Director */}
      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-[#0f1115] to-[#07080a] border border-blue-500/10 shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
        <div className="flex items-center space-x-4 mb-5">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 22.5 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-zinc-200 uppercase tracking-[0.3em]">Director's Growth Strategy</h3>
        </div>
        <p className="text-zinc-400 leading-relaxed italic border-l-2 border-blue-500/40 pl-6 text-base md:text-lg">
          "{brief.challengeFactor}"
        </p>
      </div>
    </div>
  );
};

export default BriefDisplay;
