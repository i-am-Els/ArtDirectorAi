
import React from 'react';
import { CommunityPost } from '../types';

const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    artist: 'Aris_Render',
    avatar: 'https://i.pravatar.cc/150?u=aris',
    image: 'https://picsum.photos/seed/art1/800/450',
    briefTitle: 'Neon Underground - Environment',
    likes: 124,
    comments: 12
  },
  {
    id: '2',
    artist: 'Elena_Draws',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    image: 'https://picsum.photos/seed/art2/800/450',
    briefTitle: 'Cursed Relic Concept',
    likes: 89,
    comments: 5
  },
  {
    id: '3',
    artist: '3D_Forge',
    avatar: 'https://i.pravatar.cc/150?u=forge',
    image: 'https://picsum.photos/seed/art3/800/450',
    briefTitle: 'Mecha-Orc Sculpt',
    likes: 256,
    comments: 42
  }
];

const CommunityFeed: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Community Hub</h2>
          <p className="text-zinc-400">See what other artists are creating from their briefs.</p>
        </div>
        <button className="bg-blue-600 px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
          Weekly Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_POSTS.map((post) => (
          <div key={post.id} className="glass rounded-2xl overflow-hidden border-white/5 hover:border-white/20 transition-all group">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img src={post.image} alt={post.briefTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-zinc-300 uppercase tracking-widest border border-white/10">
                {post.briefTitle.split(' - ')[1] || 'Project'}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <img src={post.avatar} className="w-6 h-6 rounded-full grayscale hover:grayscale-0 transition-all cursor-pointer" alt={post.artist} />
                <span className="text-sm font-bold text-zinc-200">{post.artist}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium truncate">{post.briefTitle}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-zinc-500 hover:text-red-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span className="text-[10px] font-bold">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-zinc-500 hover:text-blue-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 0.592 0.592 0 00.41.977c.865.006 1.721-.21 2.45-.63.576-.331 1.065-.357 1.64-.131A8.91 8.91 0 0012 20.25z" />
                    </svg>
                    <span className="text-[10px] font-bold">{post.comments}</span>
                  </button>
                </div>
                <button className="text-[10px] font-bold text-blue-500 hover:underline">View Brief</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 glass rounded-3xl border-white/5 bg-gradient-to-r from-blue-600/5 to-purple-600/5 flex flex-col items-center text-center space-y-4">
        <h3 className="text-xl font-bold">Studio Takeover: Industrial Wasteland</h3>
        <p className="text-sm text-zinc-400 max-w-lg">Join the official Studio Challenge. Top submissions get reviewed by Senior Concept Artists from leading game studios.</p>
        <button className="px-8 py-3 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-white transition-all shadow-xl">Join Challenge</button>
      </div>
    </div>
  );
};

export default CommunityFeed;
