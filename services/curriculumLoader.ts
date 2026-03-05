import { AcademyMajor, Course, Subject, Lesson, Faculty, StudyMode, LessonType } from '../types';
import curriculumStateData from '../data/static_academy/generated/curriculum_state.json';

// Type for the raw JSON structure (snake_case from generator)
interface RawCurriculumState {
    faculties: RawFaculty[];
}

interface RawFaculty {
    id: string;
    code: string;
    name: string;
    majors: RawMajor[];
}

interface RawMajor {
    id: string;
    faculty_id: string;
    code: string;
    title: string;
    role: string;
    description: string;
    courses: RawCourse[];
    softwares?: string[];
}

interface RawCourse {
    code: string;
    description: string;
    id: string;
    is_core: boolean;
    tier: string;
    title: string;
    year_level: number;
    subjects: RawSubject[];
    softwares?: string[];
    is_complete?: boolean;
}

interface RawSubject {
    description: string;
    id: string;
    learning_outcome: string;
    order_index: number;
    title: string;
    lessons: RawLesson[];
    is_complete?: boolean;
}

interface RawLesson {
    default_study_mode: string;
    estimated_effort_minutes: number;
    id: string;
    lesson_type: string;
    objective: string;
    order_index: number;
    title: string;
    search_queries?: string[];
}

/**
 * Transform snake_case JSON to camelCase for UI compatibility.
 */
function transformLesson(raw: RawLesson, subjectId: string): Lesson {
    return {
        id: raw.id,
        subjectId,
        title: raw.title,
        type: raw.lesson_type as LessonType,
        objective: raw.objective,
        defaultStudyMode: raw.default_study_mode === 'FOCUS' ? StudyMode.FOCUS : StudyMode.MILEAGE,
        estimatedEffort: raw.estimated_effort_minutes,
        orderIndex: raw.order_index,
        searchQueries: raw.search_queries || [],
        suggestedMileage: `${raw.estimated_effort_minutes} min`
    };
}

function transformSubject(raw: RawSubject, courseId: string): Subject {
    return {
        id: raw.id,
        courseId,
        title: raw.title,
        description: raw.description,
        learningOutcome: raw.learning_outcome,
        orderIndex: raw.order_index,
        lessons: raw.lessons.map((lesson) => transformLesson(lesson, raw.id))
    };
}

function transformCourse(raw: RawCourse, majorId: string): Course {
    return {
        id: raw.id,
        majorId,
        code: raw.code,
        title: raw.title,
        description: raw.description,
        tier: raw.tier as 'Foundations' | 'Production' | 'Mastery',
        yearLevel: raw.year_level,
        isCore: raw.is_core,
        softwares: raw.softwares || [],
        subjects: raw.subjects.map((subject) => transformSubject(subject, raw.id))
    };
}

function transformMajor(raw: RawMajor, facultyId: string): AcademyMajor {
    return {
        id: raw.id,
        facultyId,
        code: raw.code,
        title: raw.title,
        role: raw.role as any,
        description: raw.description,
        software: raw.softwares || [],
        softwares: raw.softwares || [],
        outcomes: [],
        courses: raw.courses.map((course) => transformCourse(course, raw.id))
    };
}

function transformFaculty(raw: RawFaculty): Faculty {
    return {
        id: raw.id,
        code: raw.code,
        name: raw.name,
        icon: 'Academy',
        color: '#60a5fa',
        description: '',
        majors: raw.majors.map((major) => ({
            id: major.id,
            facultyId: raw.id,
            code: major.code,
            title: major.title,
            role: major.role as any,
            description: major.description,
            software: major.softwares || [],
            softwares: major.softwares || [],
            outcomes: [],
            courses: []
        }))
    };
}

/**
 * Load curriculum data from the generated JSON file.
 */
export function loadCurriculumFromJSON(): RawCurriculumState {
    return curriculumStateData as RawCurriculumState;
}

/**
 * Get all majors from the JSON file with full curriculum content.
 */
export function getAllMajorsFromJSON(): AcademyMajor[] {
    const data = loadCurriculumFromJSON();
    const majors: AcademyMajor[] = [];

    for (const faculty of data.faculties) {
        for (const major of faculty.majors) {
            majors.push(transformMajor(major, faculty.id));
        }
    }

    return majors;
}

/**
 * Get a specific major's curriculum from the JSON file.
 */
export function getMajorFromJSON(majorId: string): AcademyMajor | null {
    const majors = getAllMajorsFromJSON();
    return majors.find((major) => major.id === majorId) || null;
}

/**
 * Get all faculties from the JSON file (for catalog display).
 */
export function getFacultiesFromJSON(): Faculty[] {
    const data = loadCurriculumFromJSON();
    return data.faculties.map(transformFaculty);
}
