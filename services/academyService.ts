
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, writeBatch } from "firebase/firestore";
import { UserProgress, AcademyMajor, Course, Lesson, LessonStatus, StudyMode, UserLessonProgress } from "../types"; // Updated imports
import { ACADEMY_FACULTIES } from "../data/curriculum";
import { getMajorFromJSON } from "./curriculumLoader"; // Import JSON loader

// Feature flag: Use generated JSON instead of Firestore
// Set to true to test with generated curriculum during development
// Set to false to use Firestore in production
const USE_GENERATED_JSON = true;

const COLLECTION_NAME = "student_progress";

const DEFAULT_PROGRESS: UserProgress = {
    userId: "", // Set at runtime
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
            // Migration helper: If existing data has old field, could migrate here, but for dev we assume fresh or compatible
            return { ...DEFAULT_PROGRESS, ...docSnap.data() } as UserProgress;
        } else {
            const newProgress = { ...DEFAULT_PROGRESS, userId };
            await setDoc(docRef, newProgress);
            return newProgress;
        }
    } catch (error) {
        console.error("Error fetching user progress:", error);
        return { ...DEFAULT_PROGRESS, userId };
    }
};

export const enrollInMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, {
        enrolledMajorIds: arrayUnion(majorId)
    }, { merge: true });
};

// enrollInMinor removed as per Multi-Major pivot

export const unenrollFromMajor = async (userId: string, majorId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    await setDoc(docRef, {
        enrolledMajorIds: arrayRemove(majorId)
    }, { merge: true });
};

// Helper to update lesson status
export const updateLessonProgress = async (userId: string, lessonId: string, status: LessonStatus, mode: StudyMode) => {
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

    const updates: any = {
        [`lessonProgress.${lessonId}`]: updatedEntry
    };

    if (status === LessonStatus.COMPLETED) {
        updates.completedLessonIds = arrayUnion(lessonId);
    }

    await updateDoc(docRef, updates);
};


export const saveMajorCurriculum = async (major: AcademyMajor) => {
    try {
        // Save the major metadata/courses to a "majors" collection
        // ID: major.id (e.g. "dept-char-concept")
        const docRef = doc(db, "majors", major.id);
        await setDoc(docRef, major);
        console.log(`Saved Major: ${major.title}`);
    } catch (error) {
        console.error("Error saving curriculum:", error);
        throw error;
    }
};

export const getMajorCurriculum = async (majorId: string): Promise<AcademyMajor | null> => {
    try {
        // Use JSON loader if feature flag is enabled
        if (USE_GENERATED_JSON) {
            console.log(`📚 Loading curriculum from JSON for major: ${majorId}`);
            const major = getMajorFromJSON(majorId);
            if (major) {
                console.log(`✅ Loaded ${major.title} with ${major.courses.length} courses from JSON`);
            } else {
                console.warn(`⚠️ Major ${majorId} not found in generated JSON`);
            }
            return major;
        }

        // Otherwise load from Firestore (production mode)
        const docRef = doc(db, "majors", majorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as AcademyMajor;
        }
        return null;
    } catch (error) {
        console.error("Error fetching curriculum:", error);
        return null;
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
