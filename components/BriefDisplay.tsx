
import React from 'react';
import { ArtBrief } from '../types';

interface BriefDisplayProps {
  brief: ArtBrief;
  refImage: string | null;
  isLoadingImage: boolean;
}

const BriefDisplay: React.FC<BriefDisplayProps> = ({ brief, refImage, isLoadingImage }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">{brief.title}</h2>
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
          <div className="glass rounded-xl overflow-hidden border border-white/10 shadow-2xl aspect-video relative flex items-center justify-center bg-black">
            {isLoadingImage ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">Generating Visualization...</p>
              </div>
            ) : refImage ? (
              <img src={refImage} alt="Reference" className="w-full h-full object-cover" />
            ) : (
              <p className="text-zinc-600 text-sm">Visual reference generation ready.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass rounded-lg">
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Mood & Lighting</h4>
              <p className="text-sm text-zinc-300">{brief.lightingMood}</p>
            </div>
            <div className="p-4 glass rounded-lg">
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Composition/Setup</h4>
              <p className="text-sm text-zinc-300">{brief.compositionNotes || brief.materialNotes || "Dynamic setup recommended."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Factor */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-blue-500/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 22.5 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-blue-100 italic">The Challenge</h3>
        </div>
        <p className="text-zinc-400 leading-relaxed italic border-l-2 border-blue-500/50 pl-4">
          "{brief.challengeFactor}"
        </p>
      </div>
    </div>
  );
};

export default BriefDisplay;
