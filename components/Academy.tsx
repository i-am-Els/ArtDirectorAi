
import React, { useEffect, useState } from 'react';
import { ACADEMY_FACULTIES, AcademyMajor, Course, Lesson, UserProgress } from '../types';
import { auth } from '../services/firebase';
import { getUserProgress, enrollInMajor, completeLesson, updateDrill, getNextLesson } from '../services/academyService';
import { generateBrief } from '../services/geminiService';

const Academy: React.FC = () => {
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [selectedMajor, setSelectedMajor] = useState<AcademyMajor | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [generating, setGenerating] = useState(false);
    const [blueprint, setBlueprint] = useState<any>(null); // Dynamic blueprint from AI

    useEffect(() => {
        if (auth.currentUser) {
            loadProgress();
        }
    }, [auth.currentUser]);

    const loadProgress = async () => {
        if (!auth.currentUser) return;
        const p = await getUserProgress(auth.currentUser.uid);
        setProgress(p);
        setLoading(false);
    };

    const handleEnroll = async (major: AcademyMajor) => {
        if (!auth.currentUser) return;
        setLoading(true);
        await enrollInMajor(auth.currentUser.uid, major.id);
        await loadProgress();
        setSelectedMajor(major);
    };

    const handleLessonSelect = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setBlueprint(null);
    };

    const generateSimulation = async (mode: 'FOCUS' | 'MILEAGE') => {
        if (!activeLesson || !selectedMajor) return;
        setGenerating(true);
        // Simulation of AI call - in real app would use geminiService with specific prompts
        // For now we will just use the brief generator as a placeholder or mock it slightly
        // to match the "Dean" description.

        // We can use the generateBrief but tailored. Since the function signature is specific,
        // let's just mock the 'Blueprint' structure for UI demonstration as per request "Simulation Blueprint"
        // In a real implementation we would add a specific method to geminiService.

        setTimeout(() => {
            setBlueprint({
                title: `Simulation: ${activeLesson.title}`,
                mode: mode,
                constraints: [
                    "Must use only 3 values",
                    "Time limit: 45 minutes",
                    "Focus on the silhouette"
                ],
                objective: mode === 'FOCUS' ? "Create one polished portfolio piece demonstrating mastery of the concept." : `Complete ${activeLesson.suggestedMileage} to build muscle memory.`
            });
            setGenerating(false);
        }, 1500);
    };

    const markComplete = async () => {
        if (!auth.currentUser || !activeLesson) return;
        await completeLesson(auth.currentUser.uid, activeLesson.id);
        await loadProgress();
        setBlueprint(null);
        setActiveLesson(null); // Go back to map
    };

    if (loading) return <div className="p-10 text-center uppercase tracking-widest text-zinc-500 font-black animate-pulse">Connecting to Registrar...</div>;

    if (!selectedMajor) {
        // Registrar View
        return (
            <div className="space-y-12">
                <header className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Academy <span className="text-blue-500">Registrar</span></h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-sm font-medium">Select a Major to begin your industrial training path. Courses are locked by default and require sequential completion.</p>
                </header>

                <div className="grid grid-cols-1 gap-12">
                    {ACADEMY_FACULTIES.map(faculty => (
                        <div key={faculty.id} className="space-y-6">
                            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                <span className="text-3xl">{faculty.icon}</span>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-200 uppercase tracking-wide">{faculty.name}</h3>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{faculty.description}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {faculty.majors.map(major => {
                                    const isEnrolled = progress?.enrolledMajors.includes(major.id);
                                    return (
                                        <button
                                            key={major.id}
                                            onClick={() => isEnrolled ? setSelectedMajor(major) : handleEnroll(major)}
                                            className={`text-left group relative p-6 rounded-3xl border transition-all hover:-translate-y-1 overflow-visible ${isEnrolled ? 'bg-zinc-900 border-blue-500/30' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
                                        >
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-black uppercase tracking-wider ${isEnrolled ? 'text-blue-400' : 'text-zinc-300'}`}>{major.title}</h4>
                                                    {isEnrolled && <span className="text-[9px] bg-blue-500 text-white px-2 py-1 rounded-lg font-bold uppercase tracking-widest">Enrolled</span>}
                                                </div>
                                                <p className="text-xs text-zinc-500 leading-relaxed min-h-[3rem]">{major.description}</p>
                                                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                                    {major.outcomes.slice(0, 2).map(o => (
                                                        <span key={o} className="text-[8px] px-2 py-1 rounded-md bg-white/5 text-zinc-400 uppercase tracking-wider font-bold">{o}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Course Map View
    if (!activeLesson) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <button onClick={() => setSelectedMajor(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Registrar
                </button>
                <div className="border-l-4 border-blue-600 pl-6 py-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{selectedMajor.title}</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Curriculum Map</p>
                </div>

                <div className="space-y-16 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-0.5 before:bg-white/5 before:z-0">
                    {selectedMajor.courses.map((course, idx) => (
                        <div key={course.id} className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-zinc-500 shadow-xl">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-200 uppercase tracking-widest">{course.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-black ${course.tier === 'Foundations' ? 'bg-emerald-500/10 text-emerald-400' : course.tier === 'Production' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>{course.tier}</span>
                                        <span className="text-[10px] text-zinc-600 font-medium">{course.description}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-14">
                                {course.lessons.map((lesson, lIdx) => {
                                    const isCompleted = progress?.completedLessons.includes(lesson.id);
                                    const isLocked = false; // TODO: Implement strict locking based on previous lesson completion

                                    return (
                                        <button
                                            key={lesson.id}
                                            disabled={isLocked}
                                            onClick={() => handleLessonSelect(lesson)}
                                            className={`text-left p-5 rounded-2xl border transition-all ${isCompleted ? 'bg-zinc-900/50 border-green-500/30 opacity-50 hover:opacity-100' : isLocked ? 'bg-zinc-950 border-white/5 opacity-50 cursor-not-allowed' : 'bg-zinc-900 border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Lesson {idx + 1}.{lIdx + 1}</span>
                                                {isCompleted && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wide leading-tight mb-2">{lesson.title}</h4>
                                            <p className="text-[10px] text-zinc-500">{lesson.focusDescription}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Active Lesson View
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
            <button onClick={() => setActiveLesson(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back to Map
            </button>

            <header className="border-b border-white/5 pb-8">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">{activeLesson.title}</h1>
                <p className="text-zinc-500 text-lg">{activeLesson.focusDescription}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-8 space-y-8">
                    {/* No-Lecture Interface */}
                    <section className="glass p-8 rounded-3xl border border-white/10">
                        <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Curated Research
                        </h3>
                        <div className="space-y-3">
                            {activeLesson.searchQueries && activeLesson.searchQueries.map((query, i) => (
                                <a
                                    key={i}
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block p-4 rounded-xl bg-zinc-950 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-400 group-hover:text-blue-300 uppercase tracking-wider">{query}</span>
                                        <svg className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>

                    {blueprint && (
                        <div className="glass p-8 rounded-3xl border border-blue-500/30 bg-blue-500/5 animate-in slide-in-from-bottom-4">
                            <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-blue-400">Simulation Blueprint</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 border-b border-white/5 pb-4">Generated by The Dean</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Objective</label>
                                    <p className="text-lg font-medium text-white">{blueprint.objective}</p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Technical Constraints</label>
                                    <ul className="list-disc pl-4 space-y-1 text-sm text-zinc-400">
                                        {blueprint.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                    </ul>
                                </div>

                                <button
                                    onClick={markComplete}
                                    className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-xl font-black uppercase tracking-widest hover:bg-white shadow-lg active:scale-95 transition-all mt-4"
                                >
                                    Submit Assignment & Complete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-4 space-y-6">
                    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Simulation Mode</h4>
                        <div className="space-y-3">
                            <button
                                disabled={generating}
                                onClick={() => generateSimulation('FOCUS')}
                                className="w-full p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 text-left transition-all group active:scale-95 disabled:opacity-50"
                            >
                                <span className="block text-sm font-black text-zinc-200 uppercase tracking-wider mb-1 group-hover:text-blue-400">Focus Mode</span>
                                <span className="block text-[10px] text-zinc-500">One high-quality portfolio piece. 7-14 Days.</span>
                            </button>
                            <button
                                disabled={generating}
                                onClick={() => generateSimulation('MILEAGE')}
                                className="w-full p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 text-left transition-all group active:scale-95 disabled:opacity-50"
                            >
                                <span className="block text-sm font-black text-zinc-200 uppercase tracking-wider mb-1 group-hover:text-emerald-400">Mileage Mode</span>
                                <span className="block text-[10px] text-zinc-500">High repetition muscle memory. {activeLesson.suggestedMileage}.</span>
                            </button>
                        </div>
                        {generating && <div className="mt-4 text-center text-[10px] font-bold text-blue-400 animate-pulse uppercase tracking-widest">The Dean is Drafting...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Academy;
