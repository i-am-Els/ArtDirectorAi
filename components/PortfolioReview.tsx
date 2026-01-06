
import React, { useState, useRef } from 'react';
import { analyzePortfolio } from '../services/geminiService';
import { ArtRole, ExperienceLevel, PortfolioFeedback } from '../types';

interface PortfolioReviewProps {
  role: ArtRole;
  experience: ExperienceLevel;
  proMode?: boolean;
}

const PortfolioReview: React.FC<PortfolioReviewProps> = ({ role, experience, proMode }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<PortfolioFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setFeedback(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzePortfolio(image, role, experience, proMode);
      setFeedback(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Technical Review</h2>
        <p className="text-zinc-400">Submit your current draft for a senior-level critique as a <span className="text-blue-400 font-semibold">{experience} {role}</span>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-zinc-900/30 ${
              image ? 'border-blue-500/50' : 'border-white/10 hover:border-white/20'
            }`}
          >
            {image ? (
              <img src={image} alt="Upload" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest">Upload Work-in-Progress</p>
                <p className="text-zinc-600 text-[9px] uppercase font-bold mt-2 tracking-widest">JPG or PNG</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="w-full py-4 bg-zinc-100 text-zinc-900 font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-2xl"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                <span>Analyzing Asset...</span>
              </>
            ) : (
              <>
                <span>Request Critique</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {!feedback && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 glass rounded-2xl border-white/5 opacity-50">
              <p className="text-zinc-500 italic text-sm">"Expert critique identifies technical debt before it becomes a problem."</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-32 bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-800 rounded"></div>
              <div className="h-24 bg-zinc-800 rounded"></div>
            </div>
          )}

          {feedback && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Director's Verdict</h3>
                <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Score</span>
                  <span className="text-lg font-black text-blue-400 mono">{feedback.overallScore}/10</span>
                </div>
              </div>

              <section>
                <h4 className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-3">Key Strengths</h4>
                <ul className="grid grid-cols-1 gap-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="bg-green-500/5 border border-green-500/10 p-3 rounded-lg text-sm text-zinc-300 flex items-start">
                      <span className="text-green-500 mr-3">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3">Target Improvements</h4>
                <ul className="grid grid-cols-1 gap-2">
                  {feedback.areasToImprove.map((a, i) => (
                    <li key={i} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-sm text-zinc-300 flex items-start">
                      <span className="text-amber-500 mr-3">!</span> {a}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="p-4 glass rounded-xl border-blue-500/20">
                <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Technical Insight</h4>
                <p className="text-sm text-zinc-400 leading-relaxed italic">"{feedback.technicalAdvice}"</p>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl">
                <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Next Steps</h4>
                <p className="text-sm text-zinc-300">"{feedback.nextSteps}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioReview;
