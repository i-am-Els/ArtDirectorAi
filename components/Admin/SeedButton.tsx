import React, { useState } from 'react';
import { replaceCurriculumFromJSON } from '../../services/academyService';

const SeedButton: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSeed = async () => {
        setStatus('loading');
        try {
            const result = await replaceCurriculumFromJSON();
            console.log(`Curriculum replaced. Faculties: ${result.faculties}, Majors: ${result.majors}`);
            setStatus('success');
        } catch (error) {
            console.error('Curriculum reseed failed:', error);
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
                {status === 'idle' && 'Reseed Curriculum DB'}
                {status === 'loading' && 'Reseeding...'}
                {status === 'success' && 'Curriculum Replaced'}
                {status === 'error' && 'Reseed Failed'}
            </button>
        </div>
    );
};

export default SeedButton;
