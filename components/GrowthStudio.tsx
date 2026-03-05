import React, { useEffect, useMemo, useState } from 'react';
import {
  AcademyMajor,
  ArtRole,
  Faculty,
  Lesson,
  LessonStatus,
  StudyMode,
  Subject,
  UserProgress
} from '../types';
import {
  archiveCompletedMajor,
  enrollInMajor,
  getFacultiesCatalog,
  getMajorCurriculum,
  getUserProgress,
  unenrollFromMajor,
  updateLessonProgress
} from '../services/academyService';

const MAX_ENROLLED_MAJORS = 3;

const GrowthStudio: React.FC<{ currentRole: ArtRole; userId: string }> = ({ userId }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [activeTab, setActiveTab] = useState<'STATUS' | 'ENROLLMENT' | 'CURRICULUM' | 'WORKBENCH'>('STATUS');

  const [activeMajor, setActiveMajor] = useState<AcademyMajor | null>(null);
  const [viewingMajor, setViewingMajor] = useState<{ faculty: Faculty; major: AcademyMajor } | null>(null);

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [sessionMode, setSessionMode] = useState<StudyMode>(StudyMode.FOCUS);

  const completedLessonIds = useMemo(() => new Set(progress?.completedLessonIds || []), [progress?.completedLessonIds]);

  const fetchProgress = async () => {
    const p = await getUserProgress(userId);
    setProgress(p);
  };

  const fetchFaculties = async () => {
    const data = await getFacultiesCatalog();
    setFaculties(data);
  };

  const loadMajorData = async (majorId: string) => {
    const major = await getMajorCurriculum(majorId);
    if (major) {
      setActiveMajor(major);
    }
  };

  const getCourseLessons = (course: AcademyMajor['courses'][number]) => {
    const subjectLessons = (course.subjects || []).flatMap((subject) => subject.lessons || []);
    return subjectLessons.concat(course.lessons || []);
  };

  const isSubjectComplete = (subject: Subject) => {
    const lessonIds = (subject.lessons || []).map((lesson) => lesson.id);
    return lessonIds.length === 0 || lessonIds.every((lessonId) => completedLessonIds.has(lessonId));
  };

  const isCourseComplete = (course: AcademyMajor['courses'][number]) => {
    const lessons = getCourseLessons(course);
    return lessons.length === 0 || lessons.every((lesson) => completedLessonIds.has(lesson.id));
  };

  const isMajorComplete = (major: AcademyMajor) => {
    return major.courses.length > 0 && major.courses.every((course) => isCourseComplete(course));
  };

  useEffect(() => {
    fetchProgress();
    fetchFaculties();
  }, [userId]);

  useEffect(() => {
    if (!progress?.enrolledMajorIds?.length) {
      setActiveMajor(null);
      return;
    }

    if (!activeMajor || !progress.enrolledMajorIds.includes(activeMajor.id)) {
      loadMajorData(progress.enrolledMajorIds[0]);
    }
  }, [progress?.enrolledMajorIds?.join('|')]);

  useEffect(() => {
    const archiveFinishedMajors = async () => {
      if (!progress?.enrolledMajorIds?.length || !progress.completedLessonIds.length) {
        return;
      }

      const done: string[] = [];

      for (const majorId of progress.enrolledMajorIds) {
        const major = await getMajorCurriculum(majorId);
        if (major && isMajorComplete(major)) {
          done.push(majorId);
        }
      }

      if (!done.length) {
        return;
      }

      for (const majorId of done) {
        await archiveCompletedMajor(userId, majorId);
      }

      await fetchProgress();
      if (activeMajor && done.includes(activeMajor.id)) {
        setActiveMajor(null);
        setActiveTab('STATUS');
      }
    };

    archiveFinishedMajors();
  }, [progress?.completedLessonIds?.length, progress?.enrolledMajorIds?.join('|')]);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const handleEnroll = async (majorId: string) => {
    const activeEnrolledCount = progress?.enrolledMajorIds?.length || 0;
    const alreadyEnrolled = !!progress?.enrolledMajorIds?.includes(majorId);

    if (!alreadyEnrolled && activeEnrolledCount >= MAX_ENROLLED_MAJORS) {
      window.alert(`You can only enroll in ${MAX_ENROLLED_MAJORS} majors at a time.`);
      return;
    }

    await enrollInMajor(userId, majorId);
    await fetchProgress();
    await loadMajorData(majorId);
    setViewingMajor(null);
    setActiveTab('CURRICULUM');
  };

  const handleWithdraw = async (majorId: string) => {
    if (!window.confirm('Withdraw from this major?')) return;
    await unenrollFromMajor(userId, majorId);
    await fetchProgress();
    if (activeMajor?.id === majorId) {
      setActiveMajor(null);
      setActiveTab('ENROLLMENT');
    }
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSessionMode(lesson.defaultStudyMode || lesson.default_study_mode || StudyMode.FOCUS);
    setTimeLeft((lesson.estimatedEffort || lesson.estimated_effort_minutes || 45) * 60);
    setActiveTab('WORKBENCH');
  };

  const markLessonComplete = async () => {
    if (!activeLesson) return;
    await updateLessonProgress(userId, activeLesson.id, LessonStatus.COMPLETED, sessionMode);
    await fetchProgress();
    setTimerRunning(false);
    setActiveTab('CURRICULUM');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalXP = (progress?.completedLessonIds.length || 0) * 250;
  const enrolledMajorIds = progress?.enrolledMajorIds || [];
  const emptySlotCount = Math.max(0, MAX_ENROLLED_MAJORS - enrolledMajorIds.length);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black uppercase italic">Academy Studio</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Roadmap Progression</p>
        </div>
        <div className="flex bg-zinc-950/80 p-1.5 rounded-2xl border border-white/10">
          {(['STATUS', 'ENROLLMENT', 'CURRICULUM', 'WORKBENCH'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                setViewingMajor(null);
              }}
              disabled={(t === 'CURRICULUM' && !activeMajor) || (t === 'WORKBENCH' && !activeLesson)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                activeTab === t ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'STATUS' && (
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2rem] border-white/10 space-y-4 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/10">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <span>Academy XP</span>
              <span className="text-blue-400">{totalXP}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <span>Major Slots</span>
              <span>{enrolledMajorIds.length}/{MAX_ENROLLED_MAJORS}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrolledMajorIds.map((majorId) => {
              const faculty = faculties.find((f) => f.majors.some((m) => m.id === majorId));
              const major = faculty?.majors.find((m) => m.id === majorId);
              if (!major) return null;
              return (
                <div key={majorId} className="glass p-6 rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Enrolled Major</h4>
                  <div className="text-white font-black uppercase italic">{major.title}</div>
                  <div className="text-xs text-zinc-500">{major.code}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(major.softwares || major.software || []).slice(0, 4).map((sw) => (
                      <span key={sw} className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-500/15 text-blue-200 border border-blue-500/30">
                        {sw}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-[10px] bg-blue-600 rounded-lg uppercase font-black" onClick={() => { loadMajorData(majorId); setActiveTab('CURRICULUM'); }}>Open</button>
                    <button className="px-3 py-2 text-[10px] bg-zinc-800 rounded-lg uppercase font-black" onClick={() => handleWithdraw(majorId)}>Withdraw</button>
                  </div>
                </div>
              );
            })}

            {Array.from({ length: emptySlotCount }).map((_, idx) => (
              <div key={`empty-slot-${idx}`} className="glass p-6 rounded-[2rem] border border-dashed border-zinc-700/70 bg-zinc-900/30 space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Open Slot</h4>
                <div className="text-zinc-400 font-black uppercase italic">Available</div>
                <div className="text-xs text-zinc-600">Use this slot to enroll in another major.</div>
              </div>
            ))}
          </div>

          {!!progress?.archivedMajorIds?.length && (
            <div className="glass p-6 rounded-[2rem] border border-white/10 space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Archived Majors</h4>
              {progress.archivedMajorIds.map((majorId) => {
                const faculty = faculties.find((f) => f.majors.some((m) => m.id === majorId));
                const major = faculty?.majors.find((m) => m.id === majorId);
                if (!major) return null;
                return <div key={majorId} className="text-sm text-zinc-300">{major.title}</div>;
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ENROLLMENT' && !viewingMajor && (
        <div className="space-y-8 max-w-6xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black italic uppercase">Academy Catalog</h2>
            <p className="text-zinc-500">Select up to 3 majors. Roadmaps progress sequentially.</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Slots Used: {progress?.enrolledMajorIds?.length || 0}/{MAX_ENROLLED_MAJORS}</p>
          </div>

          {faculties.map((faculty) => (
            <div key={faculty.id} className="glass rounded-[2rem] border-white/10 p-8 space-y-6">
              <h3 className="text-2xl font-black uppercase italic">{faculty.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faculty.majors.map((major) => (
                  <button key={major.id} onClick={() => setViewingMajor({ faculty, major })} className="text-left p-5 rounded-2xl border border-white/10 hover:border-white/30">
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500">{major.role}</div>
                    <h4 className="text-lg font-black uppercase italic mt-2">{major.title}</h4>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ENROLLMENT' && viewingMajor && (
        <div className="max-w-5xl mx-auto space-y-8">
          <button className="text-zinc-400 text-xs uppercase tracking-widest" onClick={() => setViewingMajor(null)}>Back to catalog</button>
          <div className="glass p-10 rounded-[3rem] border-white/10 space-y-6">
            <h2 className="text-4xl font-black italic uppercase">{viewingMajor.major.title}</h2>
            <p className="text-zinc-400">{viewingMajor.major.description}</p>
            <div className="flex flex-wrap gap-2">
              {(viewingMajor.major.softwares || viewingMajor.major.software || []).map((sw) => (
                <span key={sw} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-200 border border-emerald-500/30">
                  {sw}
                </span>
              ))}
            </div>
            {progress?.enrolledMajorIds?.includes(viewingMajor.major.id) ? (
              <div className="px-6 py-3 bg-green-600/20 border border-green-500/40 rounded-xl text-xs uppercase font-black">Currently Enrolled</div>
            ) : (
              <button
                onClick={() => handleEnroll(viewingMajor.major.id)}
                disabled={(progress?.enrolledMajorIds?.length || 0) >= MAX_ENROLLED_MAJORS}
                className={`px-8 py-4 rounded-xl uppercase text-xs font-black ${(progress?.enrolledMajorIds?.length || 0) >= MAX_ENROLLED_MAJORS ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
              >
                {(progress?.enrolledMajorIds?.length || 0) >= MAX_ENROLLED_MAJORS ? 'Slots Full (3/3)' : 'Enroll in Major'}
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'CURRICULUM' && activeMajor && (
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-4xl font-black uppercase italic">{activeMajor.title}</h2>
          <div className="flex flex-wrap gap-2">
            {(activeMajor.softwares || activeMajor.software || []).map((sw) => (
              <span key={sw} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-500/30">
                {sw}
              </span>
            ))}
          </div>

          <div className="space-y-5">
            {activeMajor.courses.map((course, courseIndex) => {
              const courseUnlocked = courseIndex === 0 || isCourseComplete(activeMajor.courses[courseIndex - 1]);
              const courseComplete = isCourseComplete(course);
              const courseLessons = getCourseLessons(course);
              const courseCompletedLessons = courseLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
              const courseProgressPct = courseLessons.length ? Math.round((courseCompletedLessons / courseLessons.length) * 100) : 0;

              return (
                <div key={course.id} className={`glass rounded-[2rem] border ${courseUnlocked ? 'border-white/10' : 'border-zinc-800 opacity-60'}`}>
                  <button
                    className={`w-full p-6 flex justify-between items-center text-left transition-all ${courseUnlocked ? 'hover:bg-white/5' : 'cursor-not-allowed'}`}
                    onClick={() => courseUnlocked && setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{course.code}</span>
                        <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${courseComplete ? 'bg-green-500/20 text-green-300' : courseUnlocked ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-500'}`}>
                          {courseComplete ? 'Completed' : courseUnlocked ? 'In Progress' : 'Locked'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black uppercase italic">{course.title}</h3>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                        {courseCompletedLessons}/{courseLessons.length || 0} lessons complete
                      </div>
                      {!!course.softwares?.length && (
                        <div className="flex flex-wrap gap-1.5">
                          {course.softwares.slice(0, 5).map((sw) => (
                            <span key={sw} className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-500/15 text-indigo-200 border border-indigo-500/30">
                              {sw}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="h-1.5 w-56 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${courseProgressPct}%` }}></div>
                      </div>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{courseUnlocked ? 'Open' : 'Lock'}</span>
                  </button>

                  {expandedCourseId === course.id && courseUnlocked && (
                    <div className="px-6 pb-6 space-y-4">
                      {course.subjects.map((subject, subjectIndex) => {
                        const subjectUnlocked = subjectIndex === 0 || isSubjectComplete(course.subjects[subjectIndex - 1]);
                        const subjectComplete = isSubjectComplete(subject);
                        const subjectCompletedLessons = subject.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
                        const subjectProgressPct = subject.lessons.length ? Math.round((subjectCompletedLessons / subject.lessons.length) * 100) : 0;

                        return (
                          <div key={subject.id} className={`rounded-xl border p-4 ${subjectUnlocked ? 'border-white/10' : 'border-zinc-800 opacity-60'}`}>
                            <button
                              className={`w-full text-left flex justify-between items-center ${subjectUnlocked ? '' : 'cursor-not-allowed'}`}
                              onClick={() => subjectUnlocked && setExpandedSubjectId(expandedSubjectId === subject.id ? null : subject.id)}
                            >
                              <div className="space-y-2">
                                <h4 className="font-bold text-zinc-200">{subject.title}</h4>
                                <p className="text-xs text-zinc-500 mt-1">{subject.description}</p>
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                                  {subjectCompletedLessons}/{subject.lessons.length || 0} lessons
                                </div>
                                <div className="h-1.5 w-44 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
                                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${subjectProgressPct}%` }}></div>
                                </div>
                              </div>
                              <span className={`text-[10px] uppercase font-black tracking-widest ${subjectComplete ? 'text-green-400' : subjectUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                {subjectComplete ? 'Completed' : subjectUnlocked ? `${subject.lessons.length} Lessons` : 'Locked'}
                              </span>
                            </button>

                            {expandedSubjectId === subject.id && subjectUnlocked && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                {subject.lessons.map((lesson) => {
                                  const lessonCompleted = completedLessonIds.has(lesson.id);
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => startLesson(lesson)}
                                      className={`text-left p-4 rounded-xl border flex items-center justify-between gap-3 ${lessonCompleted ? 'bg-green-900/10 border-green-500/20 opacity-75' : 'bg-zinc-900/60 border-white/10 hover:border-white/30'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${lessonCompleted ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                                        <div>
                                          <div className="text-[9px] uppercase font-black tracking-widest text-zinc-500">{lesson.type}</div>
                                          <div className="text-sm font-bold text-zinc-200">{lesson.title}</div>
                                        </div>
                                      </div>
                                      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                        {lessonCompleted ? 'Done' : 'Start'}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'WORKBENCH' && activeLesson && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-10 rounded-[3rem] border-white/10 space-y-8">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] block">Active Session</span>
              <h2 className="text-3xl font-black italic uppercase text-white leading-tight">{activeLesson.title}</h2>
              <p className="text-zinc-400 text-sm">Manual completion is required to advance roadmap unlocks.</p>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={() => setSessionMode(StudyMode.FOCUS)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sessionMode === StudyMode.FOCUS ? 'bg-blue-600 text-white border-blue-500' : 'bg-zinc-900 text-zinc-500 border-white/10'}`}>Focus Mode</button>
              <button onClick={() => setSessionMode(StudyMode.MILEAGE)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sessionMode === StudyMode.MILEAGE ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-500 border-white/10'}`}>Mileage Mode</button>
            </div>

            <div className="text-center">
              <div className="text-[6rem] font-black mono text-zinc-100 tabular-nums leading-none">{formatTime(timeLeft)}</div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setTimerRunning(!timerRunning)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest ${timerRunning ? 'bg-red-500/10 text-red-500' : 'bg-zinc-100 text-zinc-950'}`}>
                {timerRunning ? 'Pause' : 'Start Timer'}
              </button>
              <button onClick={markLessonComplete} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthStudio;
