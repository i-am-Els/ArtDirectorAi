import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  saveTutorSession,
  updateLessonProgress
} from '../services/academyService';
import { useAppDialog } from './ui/AppDialogProvider';
import { explainLessonConcept } from '../services/geminiService';

const MAX_ENROLLED_MAJORS = 3;
type TutorMessage = { id: number; role: 'user' | 'assistant'; text: string };
type PersistedTutorMessage = { role: 'user' | 'assistant'; text: string; createdAt: number };
type NextTarget = { lesson: Lesson; courseId: string; subjectId: string };
type CelebrationState = {
  level: 'lesson' | 'subject' | 'course' | 'major';
  title: string;
  message: string;
  milestones: string[];
  nextTarget: NextTarget | null;
  majorCompleted: boolean;
  ctaLabel: string;
};

const GrowthStudio: React.FC<{ currentRole: ArtRole; userId: string }> = ({ userId, currentRole }) => {
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
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorBusy, setTutorBusy] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);
  const [confettiBurst, setConfettiBurst] = useState<{ id: number; pieces: number; durationMs: number } | null>(null);
  const tutorFeedRef = useRef<HTMLDivElement | null>(null);
  const { showConfirm, showMessage } = useAppDialog();

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
      showMessage({
        title: 'Slots Full',
        message: `You can only enroll in ${MAX_ENROLLED_MAJORS} majors at a time.`,
        tone: 'warning'
      });
      return;
    }

    await enrollInMajor(userId, majorId);
    await fetchProgress();
    await loadMajorData(majorId);
    setViewingMajor(null);
    setActiveTab('CURRICULUM');
  };

  const handleWithdraw = async (majorId: string) => {
    if (!progress?.enrolledMajorIds?.includes(majorId)) {
      showMessage({
        title: 'Not Enrolled',
        message: 'This major is not in your active slots.',
        tone: 'warning'
      });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Withdraw Major',
      message: 'This removes the major from your active slots. Your completed lessons remain on record.',
      tone: 'danger'
    });
    if (!confirmed) return;
    await unenrollFromMajor(userId, majorId);
    await fetchProgress();
    if (viewingMajor?.major.id === majorId) {
      setViewingMajor(null);
    }
    if (activeMajor?.id === majorId) {
      setActiveMajor(null);
      setActiveTab('ENROLLMENT');
    }
  };

  const startLesson = (lesson: Lesson) => {
    setTutorMessages([]);
    setTutorInput('');
    setActiveLesson(lesson);
    setSessionMode(lesson.defaultStudyMode || lesson.default_study_mode || StudyMode.FOCUS);
    setTimeLeft((lesson.estimatedEffort || lesson.estimated_effort_minutes || 45) * 60);
    setActiveTab('WORKBENCH');
  };

  const markLessonComplete = async () => {
    if (!activeLesson) return;

    const majorSnapshot = activeMajor;
    const wasAlreadyCompleted = completedLessonIds.has(activeLesson.id);

    await updateLessonProgress(userId, activeLesson.id, LessonStatus.COMPLETED, sessionMode);
    const refreshed = await getUserProgress(userId);
    setProgress(refreshed);
    setTimerRunning(false);
    setActiveTab('CURRICULUM');

    if (wasAlreadyCompleted || !majorSnapshot) {
      return;
    }

    const completionSet = new Set(refreshed.completedLessonIds || []);
    const lessonPath = findLessonPath(majorSnapshot, activeLesson.id);

    if (!lessonPath) {
      showMessage({
        title: 'Lesson Completed',
        message: `"${activeLesson.title}" was marked complete.`,
        tone: 'success'
      });
      return;
    }

    const subjectDone = isSubjectCompleteBySet(lessonPath.subject, completionSet);
    const courseDone = isCourseCompleteBySet(lessonPath.course, completionSet);
    const majorDone = isMajorCompleteBySet(majorSnapshot, completionSet);
    const nextTarget = majorDone
      ? null
      : findNextTarget(majorSnapshot, lessonPath.courseIndex, lessonPath.subjectIndex, lessonPath.lessonIndex, completionSet);

    const milestones = ['Lesson completed'];
    if (subjectDone) milestones.push(`Subject complete: ${lessonPath.subject.title}`);
    if (courseDone) milestones.push(`Course complete: ${lessonPath.course.title}`);
    if (majorDone) milestones.push(`Major complete: ${majorSnapshot.title}`);

    const level: CelebrationState['level'] = majorDone
      ? 'major'
      : courseDone
        ? 'course'
        : subjectDone
          ? 'subject'
          : 'lesson';

    const title = majorDone
      ? 'Major Completed'
      : courseDone
        ? 'Course Completed'
        : subjectDone
          ? 'Subject Completed'
          : 'Lesson Completed';

    const message = majorDone
      ? `You completed ${majorSnapshot.title}. This major will move to archive and free a slot.`
      : nextTarget
        ? `Next up: ${nextTarget.lesson.title}`
        : 'Great work. Continue your roadmap from curriculum.';

    const ctaLabel = majorDone
      ? 'Go to Status'
      : nextTarget
        ? courseDone
          ? 'Start Next Course'
          : subjectDone
            ? 'Start Next Subject'
            : 'Go to Next Lesson'
        : 'Open Curriculum';

    triggerConfetti(level);
    setCelebration({
      level,
      title,
      message,
      milestones,
      nextTarget,
      majorCompleted: majorDone,
      ctaLabel
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const triggerConfetti = (level: CelebrationState['level']) => {
    const settings = {
      lesson: { pieces: 34, durationMs: 1300 },
      subject: { pieces: 52, durationMs: 1700 },
      course: { pieces: 70, durationMs: 2100 },
      major: { pieces: 96, durationMs: 2600 }
    }[level];

    const id = Date.now();
    setConfettiBurst({ id, pieces: settings.pieces, durationMs: settings.durationMs });
    setTimeout(() => {
      setConfettiBurst((current) => (current?.id === id ? null : current));
    }, settings.durationMs);
  };

  const findLessonPath = (major: AcademyMajor, lessonId: string) => {
    for (let courseIndex = 0; courseIndex < major.courses.length; courseIndex += 1) {
      const course = major.courses[courseIndex];
      for (let subjectIndex = 0; subjectIndex < course.subjects.length; subjectIndex += 1) {
        const subject = course.subjects[subjectIndex];
        for (let lessonIndex = 0; lessonIndex < subject.lessons.length; lessonIndex += 1) {
          if (subject.lessons[lessonIndex].id === lessonId) {
            return { courseIndex, subjectIndex, lessonIndex, course, subject };
          }
        }
      }
    }
    return null;
  };

  const isSubjectCompleteBySet = (subject: Subject, done: Set<string>) => {
    return subject.lessons.length === 0 || subject.lessons.every((lesson) => done.has(lesson.id));
  };

  const isCourseCompleteBySet = (course: AcademyMajor['courses'][number], done: Set<string>) => {
    const lessons = getCourseLessons(course);
    return lessons.length === 0 || lessons.every((lesson) => done.has(lesson.id));
  };

  const isMajorCompleteBySet = (major: AcademyMajor, done: Set<string>) => {
    return major.courses.length > 0 && major.courses.every((course) => isCourseCompleteBySet(course, done));
  };

  const findNextTarget = (
    major: AcademyMajor,
    courseIndex: number,
    subjectIndex: number,
    lessonIndex: number,
    done: Set<string>
  ): NextTarget | null => {
    const currentCourse = major.courses[courseIndex];
    const currentSubject = currentCourse.subjects[subjectIndex];

    for (let i = lessonIndex + 1; i < currentSubject.lessons.length; i += 1) {
      const lesson = currentSubject.lessons[i];
      if (!done.has(lesson.id)) {
        return { lesson, courseId: currentCourse.id, subjectId: currentSubject.id };
      }
    }

    for (let s = subjectIndex + 1; s < currentCourse.subjects.length; s += 1) {
      const subject = currentCourse.subjects[s];
      for (const lesson of subject.lessons) {
        if (!done.has(lesson.id)) {
          return { lesson, courseId: currentCourse.id, subjectId: subject.id };
        }
      }
    }

    for (let c = courseIndex + 1; c < major.courses.length; c += 1) {
      const course = major.courses[c];
      for (const subject of course.subjects) {
        for (const lesson of subject.lessons) {
          if (!done.has(lesson.id)) {
            return { lesson, courseId: course.id, subjectId: subject.id };
          }
        }
      }
    }

    return null;
  };

  const totalXP = (progress?.completedLessonIds.length || 0) * 250;
  const enrolledMajorIds = progress?.enrolledMajorIds || [];
  const emptySlotCount = Math.max(0, MAX_ENROLLED_MAJORS - enrolledMajorIds.length);
  const activeLessonContext = useMemo(() => {
    if (!activeMajor || !activeLesson) return null;
    for (const course of activeMajor.courses) {
      for (const subject of course.subjects || []) {
        if ((subject.lessons || []).some((lesson) => lesson.id === activeLesson.id)) {
          return { courseTitle: course.title, subjectTitle: subject.title };
        }
      }
      if ((course.lessons || []).some((lesson) => lesson.id === activeLesson.id)) {
        return { courseTitle: course.title, subjectTitle: 'General' };
      }
    }
    return null;
  }, [activeMajor, activeLesson?.id]);
  const tutorSessionKey = useMemo(() => {
    if (!activeLesson) return null;
    return `${activeMajor?.id || 'major'}::${activeLesson.subjectId || 'subject'}::${activeLesson.id}`;
  }, [activeMajor?.id, activeLesson?.subjectId, activeLesson?.id]);
  const persistTutorMessages = async (messages: TutorMessage[]) => {
    if (!tutorSessionKey) return;

    const payload: PersistedTutorMessage[] = messages.slice(-40).map((msg) => ({
      role: msg.role,
      text: msg.text,
      createdAt: msg.id
    }));

    try {
      await saveTutorSession(userId, tutorSessionKey, payload);
    } catch (error) {
      console.error('Tutor session save error:', error);
    }
  };

  useEffect(() => {
    if (!activeLesson || !tutorSessionKey) return;

    const persisted = (progress?.tutorSessions?.[tutorSessionKey] || []) as PersistedTutorMessage[];
    if (persisted.length > 0) {
      setTutorMessages(
        persisted.map((msg, index) => ({
          id: msg.createdAt || Date.now() + index,
          role: msg.role,
          text: msg.text
        }))
      );
    } else {
      const subjectLabel = activeLessonContext?.subjectTitle || 'this subject';
      setTutorMessages([
        {
          id: Date.now(),
          role: 'assistant',
          text: `I am your tutor for "${activeLesson.title}" (${subjectLabel}). Ask what is confusing and I will explain clearly, without replacing your actual lesson work.`
        }
      ]);
    }

    setTutorInput('');
  }, [tutorSessionKey, activeLesson?.id, activeLessonContext?.subjectTitle, progress?.tutorSessions]);

  useEffect(() => {
    const feed = tutorFeedRef.current;
    if (!feed) return;
    feed.scrollTop = feed.scrollHeight;
  }, [tutorMessages, tutorBusy]);
  const askTutor = async () => {
    const question = tutorInput.trim();
    if (!question || !activeLesson) return;

    const userMessage: TutorMessage = { id: Date.now(), role: 'user', text: question };
    const nextAfterUser = [...tutorMessages, userMessage];
    setTutorMessages(nextAfterUser);
    void persistTutorMessages(nextAfterUser);
    setTutorInput('');
    setTutorBusy(true);

    try {
      const answer = await explainLessonConcept({
        question,
        role: activeMajor?.role || currentRole,
        majorTitle: activeMajor?.title,
        courseTitle: activeLessonContext?.courseTitle,
        subjectTitle: activeLessonContext?.subjectTitle,
        lessonTitle: activeLesson.title,
        lessonObjective: activeLesson.objective,
        studyMode: sessionMode
      });
      const assistantMessage: TutorMessage = { id: Date.now() + 1, role: 'assistant', text: answer };
      const nextAfterAssistant = [...nextAfterUser, assistantMessage];
      setTutorMessages(nextAfterAssistant);
      void persistTutorMessages(nextAfterAssistant);
    } catch (error) {
      console.error('Tutor error:', error);
      const failureMessage: TutorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'I could not answer right now. Try again in a moment with a more specific question.'
      };
      const nextAfterFailure = [...nextAfterUser, failureMessage];
      setTutorMessages(nextAfterFailure);
      void persistTutorMessages(nextAfterFailure);
      showMessage({
        title: 'Tutor Unavailable',
        message: 'I could not reach the tutor service right now.',
        tone: 'warning'
      });
    } finally {
      setTutorBusy(false);
    }
  };

  const openNextFromCelebration = () => {
    if (!celebration) return;

    if (celebration.majorCompleted || !celebration.nextTarget) {
      setCelebration(null);
      setActiveTab('STATUS');
      return;
    }

    setExpandedCourseId(celebration.nextTarget.courseId);
    setExpandedSubjectId(celebration.nextTarget.subjectId);
    startLesson(celebration.nextTarget.lesson);
    setCelebration(null);
  };
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
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${activeTab === t ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'text-zinc-300 border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/70 hover:border-zinc-600'
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
                <div key={majorId} className="glass p-6 rounded-[2rem] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all space-y-4 shadow-lg group">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">Enrolled Major</h4>
                  <div className="text-white font-black uppercase italic text-xl group-hover:text-accent-cyan transition-colors">{major.title}</div>
                  <div className="text-xs text-zinc-500">{major.code}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(major.softwares || major.software || []).slice(0, 4).map((sw) => (
                      <span key={sw} className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                        {sw}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="inline-flex items-center gap-2 px-5 py-3 text-[10px] rounded-xl uppercase font-black tracking-widest bg-white text-zinc-950 hover:bg-accent-cyan hover:text-white transition-all shadow-xl hover:shadow-accent-cyan/20 active:scale-95" onClick={() => { loadMajorData(majorId); setActiveTab('CURRICULUM'); }}>Open Studio <span aria-hidden="true">{'->'}</span></button>
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
                  <button key={major.id} onClick={() => setViewingMajor({ faculty, major })} className="text-left p-5 rounded-2xl border border-white/10 bg-zinc-900/30 hover:border-accent-cyan/50 hover:bg-accent-cyan/5 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:-translate-y-1 transition-all duration-300">
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
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
            onClick={() => setViewingMajor(null)}
          >
            <span aria-hidden="true">{'<-'}</span>
            Back to Catalog
          </button>
          <div className="glass p-10 rounded-[3rem] border-white/10 space-y-6">
            <h2 className="text-4xl font-black italic uppercase">{viewingMajor.major.title}</h2>
            <p className="text-zinc-400">{viewingMajor.major.description}</p>
            <div className="flex flex-wrap gap-2">
              {(viewingMajor.major.softwares || viewingMajor.major.software || []).map((sw) => (
                <span key={sw} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
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
                className={`px-8 py-4 rounded-xl uppercase text-xs font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${(progress?.enrolledMajorIds?.length || 0) >= MAX_ENROLLED_MAJORS ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-zinc-950 hover:bg-accent-cyan hover:text-white border-transparent hover:shadow-accent-cyan/20'}`}
              >
                {(progress?.enrolledMajorIds?.length || 0) >= MAX_ENROLLED_MAJORS ? 'Slots Full (3/3)' : 'Enroll in Major'}
              </button>
            )}
          </div>
          {progress?.enrolledMajorIds?.includes(viewingMajor.major.id) && (
            <div className="rounded-3xl border border-red-500/60 bg-gradient-to-br from-red-950/60 to-red-900/20 p-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-red-300">Danger Zone</h3>
              <p className="text-xs text-red-100/80 max-w-2xl">
                Withdrawing removes this major from your active slots. Completed lesson records remain saved.
              </p>
              <button
                onClick={() => handleWithdraw(viewingMajor.major.id)}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest border border-red-300/40 shadow-[0_10px_30px_rgba(220,38,38,0.4)]"
              >
                Withdraw From This Major
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'CURRICULUM' && activeMajor && (
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-4xl font-black uppercase italic">{activeMajor.title}</h2>
          <div className="flex flex-wrap gap-2">
            {(activeMajor.softwares || activeMajor.software || []).map((sw) => (
              <span key={sw} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
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
                            <span key={sw} className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-10 rounded-[3rem] border-white/10 space-y-8">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] block">Active Session</span>
              <h2 className="text-3xl font-black italic uppercase text-white leading-tight">{activeLesson.title}</h2>
              <p className="text-zinc-400 text-sm">Manual completion is required to advance roadmap unlocks.</p>
            </div>

            <div className="flex justify-center">
              <div className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sessionMode === StudyMode.FOCUS ? 'bg-blue-600/20 text-blue-200 border-blue-500/40' : 'bg-purple-600/20 text-purple-200 border-purple-500/40'}`}>
                {sessionMode} Mode (Lesson Locked)
              </div>
            </div>

            <div className="text-center">
              <div className="text-[6rem] font-black mono text-zinc-100 tabular-nums leading-none">{formatTime(timeLeft)}</div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setTimerRunning(!timerRunning)} className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-colors ${timerRunning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 text-white hover:bg-white border border-white/20 hover:text-zinc-950 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]'}`}>
                {timerRunning ? 'Pause' : 'Start Timer'}
              </button>
              <button onClick={markLessonComplete} className="flex-1 py-4 bg-gradient-to-r from-accent-cyan to-accent-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all shadow-2xl hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                Mark Complete
              </button>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border border-white/5 bg-zinc-900/40 shadow-lg space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-accent-cyan">AI Tutor</h3>
              <p className="text-xs text-zinc-400">Concept explainer only. No course generation.</p>
            </div>

            <div ref={tutorFeedRef} className="h-[22rem] overflow-y-auto space-y-3 pr-1">
              {tutorMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 text-xs leading-relaxed border ${msg.role === 'assistant'
                      ? 'bg-accent-cyan/10 border-accent-cyan/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                      : 'bg-zinc-900/70 border-white/10 text-zinc-300'
                    }`}
                >
                  {msg.text}
                </div>
              ))}
              {tutorBusy && (
                <div className="rounded-xl p-3 border border-accent-cyan/50 bg-accent-cyan/10 text-white shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-accent-cyan/90 mb-2">Tutor is thinking</div>
                  <div className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce [animation-delay:120ms]"></span>
                    <span className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce [animation-delay:240ms]"></span>
                  </div>
                </div>
              )}
              {!tutorMessages.length && (
                <div className="rounded-xl p-3 text-xs border border-zinc-700 bg-zinc-900/60 text-zinc-400">
                  Ask about terms, techniques, or what a lesson objective means.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                value={tutorInput}
                disabled={tutorBusy}
                onChange={(e) => setTutorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!tutorBusy) askTutor();
                  }
                }}
                placeholder="Ask what confuses you in this lesson..."
                className={`w-full h-24 resize-none rounded-xl px-3 py-2 text-xs placeholder:text-zinc-600 focus:outline-none transition-colors ${tutorBusy
                    ? 'bg-zinc-900/40 border-white/5 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-900/70 border border-white/10 text-zinc-100 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30'
                  }`}
              />
              <button
                onClick={askTutor}
                disabled={tutorBusy || !tutorInput.trim()}
                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tutorBusy || !tutorInput.trim()
                    ? 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
                    : 'bg-white text-zinc-950 hover:bg-accent-cyan hover:text-white shadow-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] active:scale-95 border-none'
                  }`}
              >
                {tutorBusy ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-cyan-300 animate-spin"></span>
                    Thinking...
                  </span>
                ) : (
                  'Ask Tutor'
                )}
              </button>
            </div>
          </div>
          <div className="lg:col-span-3 glass p-5 rounded-[2rem] border-white/10 bg-zinc-900/25 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Suggested Keywords</h3>
            {(activeLesson.searchQueries || []).length > 0 ? (
              <div className="space-y-2">
                {(activeLesson.searchQueries || []).map((keyword) => (
                  <div
                    key={keyword}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/40"
                  >
                    <span className="text-xs text-zinc-300">{keyword}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white"
                      >
                        YouTube
                      </a>
                      <span className="text-zinc-700 text-[10px]">|</span>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(keyword)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white"
                      >
                        Google
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No suggested keywords for this lesson yet.</p>
            )}
          </div>
        </div>
      )}

      {!!confettiBurst && (
        <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(540deg); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: confettiBurst.pieces }).map((_, idx) => {
            const left = (idx * 17 + 7) % 100;
            const delay = (idx % 9) * 0.05;
            const duration = 0.95 + (idx % 6) * 0.18;
            const colors = ['#22d3ee', '#60a5fa', '#34d399', '#f59e0b', '#f43f5e'];
            const color = colors[idx % colors.length];
            return (
              <span
                key={`${confettiBurst.id}-${idx}`}
                className="absolute top-0 w-2 h-3 rounded-sm"
                style={{
                  left: `${left}%`,
                  backgroundColor: color,
                  animation: `confetti-fall ${duration}s linear ${delay}s forwards`
                }}
              />
            );
          })}
        </div>
      )}

      {!!celebration && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-400/45 bg-gradient-to-br from-emerald-500/20 via-zinc-950 to-cyan-500/10 p-6 shadow-[0_24px_70px_rgba(16,185,129,0.35)]">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">Celebration</div>
            <h3 className="mt-2 text-2xl font-black uppercase italic text-white">{celebration.title}</h3>
            <p className="mt-2 text-sm text-zinc-200">{celebration.message}</p>
            <div className="mt-4 space-y-2">
              {celebration.milestones.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-100">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setCelebration(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-500/40 bg-zinc-900/70 text-zinc-200 text-[10px] font-black uppercase tracking-widest hover:border-zinc-300/50 hover:text-white transition-colors"
              >
                Stay Here
              </button>
              <button
                onClick={openNextFromCelebration}
                className="px-4 py-2.5 rounded-xl border border-emerald-300/60 bg-emerald-500/30 text-emerald-100 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/45 transition-colors"
              >
                {celebration.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthStudio;











