import React, { forwardRef, useState } from 'react';
import { ArtBrief } from '../types.ts';

interface BriefDisplayProps {
  brief: ArtBrief;
}

const BriefDisplay = forwardRef<HTMLDivElement, BriefDisplayProps>(({ 
  brief
}, ref) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(brief.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={ref} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#0a0a0a] p-2 md:p-4 rounded-2xl">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3 group">
            <h2 className="text-3xl font-bold gradient-text">{brief.title}</h2>
            <button 
              onClick={handleCopyTitle}
              title="Copy Title"
              className="no-print p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-green-500">Copied</span>
                </>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              )}
            </button>
          </div>
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-bold text-blue-400 uppercase tracking-tighter shrink-0 h-fit w-fit">
            Studio Assignment v4.0
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed text-lg">{brief.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deliverables & Constraints */}
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Key Deliverables
            </h3>
            <ul className="space-y-2">
              {brief.keyDeliverables.map((item, i) => (
                <li key={i} className="flex items-start text-zinc-300">
                  <span className="text-blue-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Technical Constraints
            </h3>
            <ul className="space-y-2">
              {brief.technicalConstraints.map((item, i) => (
                <li key={i} className="flex items-start text-zinc-300">
                  <span className="text-purple-500 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Visual References / Mood */}
        <div className="space-y-6">
          <section>
             <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center">
              <span className="w-2 h-2 bg-zinc-500 rounded-full mr-2"></span>
              Aesthetic Direction
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 glass rounded-xl border border-white/5">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Mood & Lighting</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{brief.lightingMood}</p>
              </div>
              <div className="p-4 glass rounded-xl border border-white/5">
                <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-2 tracking-widest">Composition & Setup</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{brief.compositionNotes || brief.materialNotes || "Cinematic 16:9 setup with dynamic focal points."}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Challenge Factor */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-blue-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 22.5 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-blue-100 italic">The Director's Challenge</h3>
        </div>
        <p className="text-zinc-400 leading-relaxed italic border-l-2 border-blue-500/50 pl-4 relative z-10">
          "{brief.challengeFactor}"
        </p>
      </div>
    </div>
  );
});

export default BriefDisplay;