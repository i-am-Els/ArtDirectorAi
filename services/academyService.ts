
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { UserProgress, ACADEMY_FACULTIES, AcademyMajor, Course, Lesson } from "../types";

const COLLECTION_NAME = "student_progress";

const DEFAULT_PROGRESS: UserProgress = {
    enrolledMajors: [],
    completedLessons: [],
    activeDrills: {}
};

export const getUserProgress = async (userId: string): Promise<UserProgress> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProgress;
        } else {
            await setDoc(docRef, DEFAULT_PROGRESS);
            return DEFAULT_PROGRESS;
        }
    } catch (error) {
        console.error("Error fetching user progress:", error);
        return DEFAULT_PROGRESS;
    }
};

export const enrollInMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, {
        enrolledMajors: arrayUnion(majorId)
    }, { merge: true });
};

export const unenrollFromMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    // Find all lesson IDs associated with this major
    const major = ACADEMY_FACULTIES.flatMap(f => f.majors).find(m => m.id === majorId);
    const lessonIdsToRemove = major
        ? major.courses.flatMap(c => c.lessons.map(l => l.id))
        : [];

    await setDoc(docRef, {
        enrolledMajors: arrayRemove(majorId),
        completedLessons: arrayRemove(...lessonIdsToRemove)
    }, { merge: true });
};

export const completeLesson = async (userId: string, lessonId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, {
        completedLessons: arrayUnion(lessonId)
    }, { merge: true });
};

export const updateDrill = async (userId: string, lessonId: string, daysToAdd: number = 1) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getUserProgress(userId);

    const currentDrill = progress.activeDrills[lessonId] || {
        startDate: Date.now(),
        daysCompleted: 0,
        lastLog: 0
    };

    // Check if logged today (simple timestamp check for demo, prod would need better date logic)
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Allow update if last log was more than 18 hours ago
    if (now - currentDrill.lastLog > (18 * 60 * 60 * 1000)) {
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

// Helper: Get next unlocked lesson for a major
export const getNextLesson = (majorId: string, completedLessons: string[]): Lesson | null => {
    const faculty = ACADEMY_FACULTIES.find(f => f.majors.some(m => m.id === majorId));
    if (!faculty) return null;
    const major = faculty.majors.find(m => m.id === majorId);
    if (!major) return null;

    for (const course of major.courses) {
        for (const lesson of course.lessons) {
            if (!completedLessons.includes(lesson.id)) {
                return lesson; // Return the first incomplete lesson
            }
        }
    }
    return null; // All done
};
