
import React, { useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

const LoginPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            console.error("Login Error:", err);
            // Firebase auth errors have a 'code' and 'message'
            const errorMessage = err.code ? `Error: ${err.code} - ${err.message}` : "Unable to sign in. Please check your console.";
            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-app-dark text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-accent-cyan/30">
            <div className="glass max-w-md w-full p-8 md:p-12 rounded-[3.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-accent-cyan/20 rotate-3 overflow-hidden border border-white/10">
                    <img src="/favicon.png" alt="ArtDirector Logo" className="w-full h-full object-cover" />
                </div>

                <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-3">ArtDirector <span className="text-accent-cyan">Hub</span></h1>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold mb-10">Industrial Pipeline Access</p>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-[10px] font-bold uppercase tracking-widest w-full">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSignIn}
                    className="w-full bg-white text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3 group"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Enter Studio
                </button>

                <p className="mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                    Authentication Required for Access
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
