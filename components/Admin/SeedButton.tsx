
import React, { useState } from 'react';
import { saveMajorCurriculum } from '../../services/academyService';
import { CHARACTER_DESIGN_MAJOR } from '../../data/static_academy/visual_dev/character_design';
import { ArtRole } from '../../types';

const SeedButton: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSeed = async () => {
        setStatus('loading');
        try {
            console.log('Seeding Character Design Major...', CHARACTER_DESIGN_MAJOR);
            await saveMajorCurriculum(CHARACTER_DESIGN_MAJOR);
            setStatus('success');
        } catch (error) {
            console.error('Seeding failed:', error);
            setStatus('error');
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <button
                onClick={handleSeed}
                disabled={status === 'loading'}
                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-xl transition-all
          ${status === 'idle' ? 'bg-zinc-800 text-zinc-400 hover:text-white' : ''}
          ${status === 'loading' ? 'bg-blue-600 text-white animate-pulse' : ''}
          ${status === 'success' ? 'bg-green-600 text-white' : ''}
          ${status === 'error' ? 'bg-red-600 text-white' : ''}
        `}
            >
                {status === 'idle' && '⚡ Seed DB: Char Design'}
                {status === 'loading' && 'Seeding...'}
                {status === 'success' && 'DB Seeded!'}
                {status === 'error' && 'Error Seeding'}
            </button>
        </div>
    );
};

export default SeedButton;
