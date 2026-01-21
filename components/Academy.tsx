
import React, { useEffect, useState } from 'react';
import { AcademyMajor, Course, Lesson, UserProgress } from '../types';
import { ACADEMY_FACULTIES } from '../data/curriculum';
import { auth } from '../services/firebase';
import { getUserProgress, enrollInMajor, unenrollFromMajor, completeLesson, updateDrill, getNextLesson, getMajorCurriculum, saveMajorCurriculum } from '../services/academyService';
import { generateBrief, generateDrill, generateCourseList, generateLessonOutlines } from '../services/geminiService';

const Academy: React.FC = () => {
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [selectedMajor, setSelectedMajor] = useState<AcademyMajor | null>(null);
    // Combined curriculum state: Map of majorId -> Course[]
    const [dynamicCurriculum, setDynamicCurriculum] = useState<Record<string, Course[]>>({});

    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [generating, setGenerating] = useState(false);
    const [blueprint, setBlueprint] = useState<any>(null); // Dynamic blueprint from AI

    // Admin / Dean Mode
    const [isDean, setIsDean] = useState(false); // Secret toggle

    // Toggle Dean Mode with Secret Key (e.g. holding Alt + Shift + D) -> For now just a hidden click
    const toggleDean = () => setIsDean(!isDean);

    useEffect(() => {
        if (auth.currentUser) {
            loadProgress();
        }
    }, [auth.currentUser]);

    // Load dynamic curriculum for a major when selected
    useEffect(() => {
        if (selectedMajor) {
            loadMajorCourses(selectedMajor.id);
        }
    }, [selectedMajor]);

    const loadMajorCourses = async (majorId: string) => {
        const storedCourses = await getMajorCurriculum(majorId);
        if (storedCourses) {
            setDynamicCurriculum(prev => ({ ...prev, [majorId]: storedCourses }));
        }
    };


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
        try {
            await enrollInMajor(auth.currentUser.uid, major.id);
            await loadProgress();
            setSelectedMajor(major);
        } catch (error: any) {
            console.error("Enrollment failed:", error);
            alert(`Enrollment Failed: ${error.message || "Unknown Error"}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSelect = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setBlueprint(null);
    };

    const generateSimulation = async (mode: 'FOCUS' | 'MILEAGE') => {
        if (!activeLesson || !selectedMajor) return;
        setGenerating(true);
        try {
            const result = await generateDrill(activeLesson.title, mode, selectedMajor.title);
            setBlueprint(result);
        } catch (error) {
            console.error("Failed to generate drill:", error);
            alert("The Dean is busy. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const markComplete = async () => {
        if (!auth.currentUser || !activeLesson) return;
        await completeLesson(auth.currentUser.uid, activeLesson.id);
        await loadProgress();
        setBlueprint(null);
        setActiveLesson(null); // Go back to map
    };

    // Dean Handlers
    const handleGenerateCurriculum = async (major: AcademyMajor) => {
        if (!confirm(`Generate FULL Zero-to-Hero curriculum for ${major.title}? This may overwrite existing data.`)) return;
        setGenerating(true);
        try {
            const rawCourses = await generateCourseList(major.title, major.role);

            // Map raw JSON to Course objects with IDs
            const newCourses: Course[] = rawCourses.map((c, i) => ({
                id: `${major.id}-c-${i}`,
                title: c.title,
                tier: c.tier, // Foundation, Production, Mastery
                description: c.description,
                lessons: [] // Empty initially
            }));

            await saveMajorCurriculum(major.id, newCourses);
            await loadMajorCourses(major.id); // Refresh
        } catch (error: any) {
            console.error(error);
            alert(`Dean failed to draft curriculum: ${error?.message || error}`);
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateSyllabus = async (course: Course, majorId: string) => {
        setGenerating(true);
        try {
            // Get current courses for this major
            const currentCourses = dynamicCurriculum[majorId] || selectedMajor?.courses || [];

            // Generate lessons
            const rawLessons = await generateLessonOutlines(course.title, course.tier);
            const newLessons: Lesson[] = rawLessons.map((l, i) => ({
                id: `${course.id}-l-${i}`,
                title: l.title,
                focusDescription: l.focusDescription,
                suggestedMileage: l.suggestedMileage,
                searchQueries: l.searchQueries
            }));

            // Update specific course in the list
            const updatedCourses = currentCourses.map(c =>
                c.id === course.id ? { ...c, lessons: newLessons } : c
            );

            await saveMajorCurriculum(majorId, updatedCourses);
            await loadMajorCourses(majorId); // Refresh
        } catch (error: any) {
            console.error(error);
            alert(`Dean failed to draft syllabus: ${error?.message || error}`);
        } finally {
            setGenerating(false);
        }
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
                                            onClick={() => setSelectedMajor(major)}
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

    // Determine Enrollment Status for the selected major
    const isEnrolled = progress?.enrolledMajors.includes(selectedMajor.id);

    // Prospectus View (Not Enrolled)
    if (!isEnrolled) {
        return (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
                <button onClick={() => setSelectedMajor(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Registrar
                </button>

                <header className="space-y-6 pt-8">
                    <div className="inline-block px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        Major Prospectus
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">{selectedMajor.title}</h1>
                    <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">{selectedMajor.description}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-b border-white/10 py-12">
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">🎓</span> Career Outcomes
                        </h3>
                        <ul className="space-y-3">
                            {selectedMajor.outcomes.map(outcome => (
                                <li key={outcome} className="flex items-center gap-3 text-zinc-400 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    {outcome}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-sm font-black text-zinc-200 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">🛠️</span> Industry Standard Software
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedMajor.software.map(tool => (
                                <span key={tool} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-xs font-bold uppercase tracking-wider">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 space-y-8 text-center">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Ready to commit?</h3>
                        <p className="text-zinc-500 text-sm">Enrollment begins your tracking for this major. This action is tied to your student ID.</p>
                    </div>
                    <button
                        onClick={() => handleEnroll(selectedMajor)}
                        className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 active:scale-95 transition-all"
                    >
                        Enroll in Major
                    </button>

                    {/* Dean Secret Access */}
                    <div className="pt-10 opacity-30 hover:opacity-100 transition-opacity">
                        <button onClick={toggleDean} className="text-[9px] font-black uppercase tracking-widest text-zinc-700">
                            {isDean ? "Exit Dean's Office" : "Authorized Personnel Only"}
                        </button>
                    </div>

                    {isDean && (
                        <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl animate-in slide-in-from-bottom-2">
                            <h4 className="text-yellow-500 font-black uppercase tracking-widest text-xs mb-4">Dean's Control Panel</h4>
                            <button
                                onClick={() => handleGenerateCurriculum(selectedMajor)}
                                disabled={generating}
                                className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-yellow-400 disabled:opacity-50"
                            >
                                {generating ? "Drafting..." : "Re-Generate Full Curriculum (Zero to Hero)"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const handleUnenroll = async () => {
        if (!auth.currentUser || !selectedMajor) return;
        if (confirm("DANGER: Are you sure you want to drop this Major? This will WIPE ALL PROGRESS and completed lessons for this major. This cannot be undone.")) {
            setLoading(true);
            try {
                await unenrollFromMajor(auth.currentUser.uid, selectedMajor.id);
                await loadProgress();
                setSelectedMajor(null);
            } catch (error) {
                console.error("Unenrollment failed:", error);
                alert("Failed to drop major.");
            } finally {
                setLoading(false);
            }
        }
    };

    // Course Map View
    if (!activeLesson) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <button onClick={() => setSelectedMajor(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Back to Registrar
                    </button>
                </div>
                <div className="border-l-4 border-blue-600 pl-6 py-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{selectedMajor.title}</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Curriculum Map</p>
                </div>

                <div className="space-y-16 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-0.5 before:bg-white/5 before:z-0">
                    {(dynamicCurriculum[selectedMajor.id] || selectedMajor.courses).map((course, idx) => (
                        <div key={course.id || idx} className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-black text-zinc-500 shadow-xl relative">
                                    {idx + 1}
                                    {/* Yellow Dot for incomplete courses */}
                                    {(course.lessons.length === 0 || isDean) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse border border-black" title="Incomplete / Dean Mode"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-zinc-200 uppercase tracking-widest flex items-center gap-3">
                                        {course.title}
                                        {isDean && (
                                            <button
                                                onClick={() => handleGenerateSyllabus(course, selectedMajor.id)}
                                                className="text-[8px] bg-zinc-800 px-2 py-1 rounded text-zinc-400 hover:text-white"
                                            >
                                                {generating ? "..." : "Generate Syllabus 🪄"}
                                            </button>
                                        )}
                                    </h3>
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

                <div className="pt-24 pb-12 border-t border-white/5 mt-12 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleUnenroll}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Withdraw from Major
                    </button>
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
