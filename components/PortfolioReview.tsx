import React, { useState, useRef } from 'react';
import { analyzePortfolio } from '../services/geminiService.ts';
import { ArtRole, ExperienceLevel, PortfolioFeedback } from '../types.ts';

interface PortfolioReviewProps {
  role: ArtRole;
  experience: ExperienceLevel;
}

const PortfolioReview: React.FC<PortfolioReviewProps> = ({ role, experience }) => {
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
      const result = await analyzePortfolio(image, role, experience);
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
        <h2 className="text-3xl font-bold gradient-text mb-2">Portfolio Review</h2>
        <p className="text-zinc-400">Upload your work for industry-standard feedback as a <span className="text-blue-400 font-semibold">{experience} {role}</span>.</p>
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
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-zinc-400 font-medium">Click or drag to upload artwork</p>
                <p className="text-zinc-600 text-xs mt-2">JPG, PNG or TIFF (Max 5MB)</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="w-full py-4 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-white disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
                <span>Reviewing Technicals...</span>
              </>
            ) : (
              <>
                <span>Request Review</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {!feedback && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 glass rounded-2xl border-white/5 opacity-50">
              <p className="text-zinc-500 italic">"Good feedback is the shortcut to mastery."</p>
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
                <h3 className="text-xl font-bold text-white">Director's Verdict</h3>
                <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-blue-400 uppercase">Score</span>
                  <span className="text-lg font-black text-blue-400 mono">{feedback.overallScore}/10</span>
                </div>
              </div>

              <section>
                <h4 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">Key Strengths</h4>
                <ul className="grid grid-cols-1 gap-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="bg-green-500/5 border border-green-500/10 p-3 rounded-lg text-sm text-zinc-300 flex items-start">
                      <span className="text-green-500 mr-2">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Target Improvements</h4>
                <ul className="grid grid-cols-1 gap-2">
                  {feedback.areasToImprove.map((a, i) => (
                    <li key={i} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-sm text-zinc-300 flex items-start">
                      <span className="text-amber-500 mr-2">!</span> {a}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="p-4 glass rounded-xl border-blue-500/20">
                <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Technical Insight</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{feedback.technicalAdvice}</p>
              </div>

              <div className="p-4 bg-zinc-900 rounded-xl">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Next Steps</h4>
                <p className="text-sm text-zinc-300 italic">"{feedback.nextSteps}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioReview;