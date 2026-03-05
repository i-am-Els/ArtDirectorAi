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
    UserProgress
} from '../types';

const COLLECTION_NAME = 'student_progress';
const MAJORS_COLLECTION = 'majors';
const FACULTIES_COLLECTION = 'faculties';

const DEFAULT_PROGRESS: UserProgress = {
    userId: '',
    enrolledMajorIds: [],
    completedLessonIds: [],
    lessonProgress: {},
    activeDrills: {}
};

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

    // Allow update if last log was more than 18 hours ago.
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






