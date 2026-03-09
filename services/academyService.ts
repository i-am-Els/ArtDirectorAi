import { db } from './firebase';
import {
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import {
    AcademyMajor,
    Faculty,
    LessonStatus,
    StudyMode,
    UserLessonProgress,
    UserProgress,
    TutorChatMessage,
    UserRitual,
    ArtBrief,
    ArtRole,
    ExperienceLevel,
    PortfolioFeedback,
    SavedBriefChallenge,
    ReviewThread
} from '../types';

const COLLECTION_NAME = 'student_progress';
const MAJORS_COLLECTION = 'majors';
const FACULTIES_COLLECTION = 'faculties';

const DEFAULT_PROGRESS: UserProgress = {
    userId: '',
    enrolledMajorIds: [],
    archivedMajorIds: [],
    completedLessonIds: [],
    lessonProgress: {},
    activeDrills: {},
    tutorSessions: {},
    rituals: [],
    ritualCompletions: {},
    savedBriefs: [],
    reviewThreads: []
};

const makeRitualId = () => `ritual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const makeBriefId = () => `brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const makeThreadId = () => `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const makeThreadEntryId = () => `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const getUserProgress = async (userId: string): Promise<UserProgress> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...DEFAULT_PROGRESS, ...docSnap.data() } as UserProgress;
        }

        const newProgress = { ...DEFAULT_PROGRESS, userId };
        await setDoc(docRef, newProgress);
        return newProgress;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return { ...DEFAULT_PROGRESS, userId };
    }
};

export const enrollInMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(
        docRef,
        {
            enrolledMajorIds: arrayUnion(majorId)
        },
        { merge: true }
    );
};

export const unenrollFromMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    await setDoc(
        docRef,
        {
            enrolledMajorIds: arrayRemove(majorId)
        },
        { merge: true }
    );
};

export const archiveCompletedMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    await setDoc(
        docRef,
        {
            enrolledMajorIds: arrayRemove(majorId),
            archivedMajorIds: arrayUnion(majorId)
        },
        { merge: true }
    );
};

export const updateLessonProgress = async (
    userId: string,
    lessonId: string,
    status: LessonStatus,
    mode: StudyMode
) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);

    const currentEntry = progress.lessonProgress[lessonId] || {
        userId,
        lessonId,
        status: LessonStatus.NOT_STARTED,
        chosenStudyMode: mode,
        attemptCount: 0
    };

    const updatedEntry: UserLessonProgress = {
        ...currentEntry,
        status,
        chosenStudyMode: mode,
        completedAt: status === LessonStatus.COMPLETED ? Date.now() : currentEntry.completedAt,
        attemptCount: status === LessonStatus.COMPLETED ? currentEntry.attemptCount + 1 : currentEntry.attemptCount
    };

    const updates: Record<string, unknown> = {
        [`lessonProgress.${lessonId}`]: updatedEntry
    };

    if (status === LessonStatus.COMPLETED) {
        updates.completedLessonIds = arrayUnion(lessonId);
    }

    await updateDoc(docRef, updates);
};

export const getMajorCurriculum = async (majorId: string): Promise<AcademyMajor | null> => {
    try {
        const docRef = doc(db, MAJORS_COLLECTION, majorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as AcademyMajor;
        }

        return null;
    } catch (error) {
        console.error('Error fetching curriculum:', error);
        return null;
    }
};

export const getFacultiesCatalog = async (): Promise<Faculty[]> => {
    try {
        const snapshot = await getDocs(collection(db, FACULTIES_COLLECTION));
        return snapshot.docs.map((facultyDoc) => facultyDoc.data() as Faculty);
    } catch (error) {
        console.error('Error fetching faculties catalog:', error);
        return [];
    }
};

export const updateDrill = async (userId: string, lessonId: string, daysToAdd: number = 1) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);

    const currentDrill = progress.activeDrills[lessonId] || {
        startDate: Date.now(),
        daysCompleted: 0,
        lastLog: 0
    };

    const now = Date.now();

    if (now - currentDrill.lastLog > 18 * 60 * 60 * 1000) {
        const newDrills = {
            ...progress.activeDrills,
            [lessonId]: {
                ...currentDrill,
                daysCompleted: currentDrill.daysCompleted + daysToAdd,
                lastLog: now
            }
        };
        await updateDoc(docRef, { activeDrills: newDrills });
    }
};

export const saveTutorSession = async (userId: string, lessonId: string, messages: TutorChatMessage[]) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);
    const trimmed = messages.slice(-40);

    const nextSessions = {
        ...(progress.tutorSessions || {}),
        [lessonId]: trimmed
    };

    await setDoc(docRef, { tutorSessions: nextSessions }, { merge: true });
};

export const addRitual = async (userId: string, title: string): Promise<UserRitual | null> => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return null;

    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);

    const ritual: UserRitual = {
        id: makeRitualId(),
        title: trimmedTitle,
        createdAt: Date.now()
    };

    const nextRituals = [...(progress.rituals || []), ritual];
    await setDoc(docRef, { rituals: nextRituals }, { merge: true });

    return ritual;
};

export const setRitualCompletionForDay = async (
    userId: string,
    ritualId: string,
    dayKey: string,
    completed: boolean
) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);

    const ritualCompletions = { ...(progress.ritualCompletions || {}) };
    const daySet = new Set(ritualCompletions[dayKey] || []);

    if (completed) {
        daySet.add(ritualId);
    } else {
        daySet.delete(ritualId);
    }

    if (daySet.size === 0) {
        delete ritualCompletions[dayKey];
    } else {
        ritualCompletions[dayKey] = Array.from(daySet);
    }

    await setDoc(docRef, { ritualCompletions }, { merge: true });
};

export const deleteRitual = async (userId: string, ritualId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);

    const rituals = (progress.rituals || []).filter((ritual) => ritual.id !== ritualId);
    const ritualCompletions = { ...(progress.ritualCompletions || {}) };

    Object.keys(ritualCompletions).forEach((dayKey) => {
        const remaining = (ritualCompletions[dayKey] || []).filter((id) => id !== ritualId);
        if (remaining.length === 0) {
            delete ritualCompletions[dayKey];
        } else {
            ritualCompletions[dayKey] = remaining;
        }
    });

    await setDoc(docRef, { rituals, ritualCompletions }, { merge: true });
};


export const saveBriefChallenge = async (
    userId: string,
    params: {
        role: ArtRole,
        experience: ExperienceLevel,
        theme: string,
        complexity: number,
        brief: ArtBrief
    }
): Promise<SavedBriefChallenge> => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);
    const now = Date.now();

    const nextItem: SavedBriefChallenge = {
        id: makeBriefId(),
        role: params.role,
        experience: params.experience,
        theme: params.theme,
        complexity: params.complexity,
        brief: params.brief,
        createdAt: now,
        updatedAt: now
    };

    const nextSaved = [nextItem, ...(progress.savedBriefs || [])];
    await setDoc(docRef, { savedBriefs: nextSaved }, { merge: true });

    return nextItem;
};

export const appendReviewThreadEntry = async (
    userId: string,
    params: {
        source: 'ADHOC' | 'BRIEF';
        role: ArtRole;
        experience: ExperienceLevel;
        feedback: PortfolioFeedback;
        linkedBriefId?: string;
        linkedBriefTitle?: string;
        threadId?: string;
    }
): Promise<ReviewThread> => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);
    const now = Date.now();
    const threads = [...(progress.reviewThreads || [])];

    let thread: ReviewThread | undefined;

    if (params.threadId) {
        thread = threads.find((t) => t.id === params.threadId);
    }

    if (!thread && params.source === 'BRIEF' && params.linkedBriefId) {
        thread = threads.find((t) => t.source === 'BRIEF' && t.linkedBriefId === params.linkedBriefId);
    }

    if (!thread) {
        thread = {
            id: makeThreadId(),
            source: params.source,
            role: params.role,
            experience: params.experience,
            linkedBriefId: params.linkedBriefId,
            linkedBriefTitle: params.linkedBriefTitle,
            createdAt: now,
            updatedAt: now,
            entries: []
        };
        threads.unshift(thread);
    }

    thread.entries = [
        ...(thread.entries || []),
        {
            id: makeThreadEntryId(),
            createdAt: now,
            feedback: params.feedback
        }
    ];
    thread.updatedAt = now;

    const sorted = threads.sort((a, b) => b.updatedAt - a.updatedAt);
    await setDoc(docRef, { reviewThreads: sorted }, { merge: true });

    return thread;
};











