
import React from 'react';
import { ArtBrief, ProjectBreakdown, CommunityPost } from '../types';

interface CommunityFeedProps {
  briefs: ArtBrief[];
  breakdowns: ProjectBreakdown[];
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ briefs, breakdowns }) => {
  // Merge user's actual data with some fake filler for visual density
  const userPosts: CommunityPost[] = breakdowns.map(b => ({
    id: b.id,
    artist: "You",
    avatar: "https://i.pravatar.cc/100?u=me",
    brief: briefs.find(br => br.id === b.briefId)!,
    breakdown: b,
    likes: 0,
    comments: 0
  })).filter(p => p.brief);

  const mockPosts: CommunityPost[] = [
    {
      id: 'm1',
      artist: 'Aris_Render',
      avatar: 'https://i.pravatar.cc/150?u=aris',
      brief: { title: 'Neon Subterrania', role: 'Environment Artist' } as any,
      breakdown: { finishedImage: 'https://picsum.photos/seed/art1/800/450', productionNotes: 'Focus on volumetric fog and neon glow using Lumen in Unreal Engine 5.', techniqueUsed: 'UE5, Blender' } as any,
      likes: 142,
      comments: 8
    },
    {
      id: 'm2',
      artist: 'Elena_Sculpt',
      avatar: 'https://i.pravatar.cc/150?u=elena',
      brief: { title: 'Elder Guardian', role: 'Character Artist' } as any,
      breakdown: { finishedImage: 'https://picsum.photos/seed/art2/800/450', productionNotes: 'Used micro-skin textures and hair grooming in Houdini.', techniqueUsed: 'Zbrush, Houdini' } as any,
      likes: 89,
      comments: 4
    }
  ];

  const allPosts = [...userPosts, ...mockPosts];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/10 pb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Studio Feed</h2>
          <p className="text-zinc-400">Latest production breakdowns from the global artist community.</p>
        </div>
        <div className="hidden sm:flex space-x-2">
          <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trending</div>
          <div className="px-4 py-2 bg-blue-600 rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-lg shadow-blue-500/20 cursor-pointer">Live Challenge</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {allPosts.map((post) => (
          <div key={post.id} className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl group flex flex-col">
            <div className="relative aspect-video bg-zinc-900 overflow-hidden">
              <img src={post.breakdown.finishedImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Result" />
              <div className="absolute top-6 left-6 flex items-center space-x-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                <img src={post.avatar} className="w-6 h-6 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{post.artist}</span>
              </div>
              <div className="absolute top-6 right-6">
                 <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">Final Submission</span>
              </div>
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col">
              <div className="space-y-2">
                <div className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.3em]">{post.brief.role}</div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{post.brief.title}</h3>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex-1">
                 <h4 className="text-[8px] font-black uppercase text-blue-500 tracking-widest mb-3">Director's Insight</h4>
                 <p className="text-sm text-zinc-400 italic line-clamp-3">"{post.breakdown.productionNotes}"</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-zinc-500 hover:text-red-400 cursor-pointer transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                    <span className="text-[10px] font-black">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-500 hover:text-blue-400 cursor-pointer transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 0.592 0.592 0 00.41.977c.865.006 1.721-.21 2.45-.63.576-.331 1.065-.357 1.64-.131A8.91 8.91 0 0012 20.25z" /></svg>
                    <span className="text-[10px] font-black">{post.comments}</span>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase text-blue-500 hover:underline cursor-pointer tracking-widest">Read Brief</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;
