import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase.ts';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setIsOpen(false);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <div className="relative">
            {!user ? (
                <button
                    onClick={handleSignIn}
                    className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em] border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    <span className="hidden sm:inline">Sign In</span>
                </button>
            ) : (
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 p-1.5 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-800/50 transition-all hover:border-blue-500/30 group"
                    >
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-lg shadow-sm" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                {user.displayName?.[0] || 'U'}
                            </div>
                        )}
                        <div className="hidden sm:block text-left mr-2">
                            <div className="text-[10px] font-bold text-zinc-200 leading-none truncate max-w-[100px]">{user.displayName}</div>
                            <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Artist</div>
                        </div>
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-3 border-b border-white/5">
                                    <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                                    <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserProfile;
