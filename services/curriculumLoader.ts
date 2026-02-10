import { AcademyMajor, Course, Subject, Lesson, Faculty, StudyMode, LessonType, ArtRole } from '../types';
import curriculumStateData from '../data/static_academy/manual_import.json';

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
 * Transform snake_case JSON to camelCase for UI compatibility
 */
function transformLesson(raw: RawLesson, subjectId: string): Lesson {
    return {
        id: raw.id,
        subjectId: subjectId,
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
        courseId: courseId,
        title: raw.title,
        description: raw.description,
        learningOutcome: raw.learning_outcome,
        orderIndex: raw.order_index,
        lessons: raw.lessons.map(l => transformLesson(l, raw.id))
    };
}

function transformCourse(raw: RawCourse, majorId: string): Course {
    return {
        id: raw.id,
        majorId: majorId,
        code: raw.code,
        title: raw.title,
        description: raw.description,
        tier: raw.tier as 'Foundations' | 'Production' | 'Mastery',
        yearLevel: raw.year_level,
        isCore: raw.is_core,
        subjects: raw.subjects.map(s => transformSubject(s, raw.id))
    };
}

// Map string roles from JSON to ArtRole enum values
const ROLE_MAP: Record<string, ArtRole> = {
    'CONCEPT_CHAR': ArtRole.CONCEPT_CHAR,
    'CONCEPT_ENV': ArtRole.CONCEPT_ENV,
    'CONCEPT_PROP': ArtRole.CONCEPT_PROP,
    'STORYBOARD': ArtRole.STORYBOARD,
    'MATTE_PAINTING': ArtRole.MATTE_PAINTING,
    'ILLUSTRATION': ArtRole.ILLUSTRATION,
    'UI_UX': ArtRole.UI_UX,
    'ANIMATION_2D': ArtRole.ANIMATION_2D,
    'BG_PAINTER': ArtRole.BG_PAINTER,
    'COLOR_SCRIPT': ArtRole.COLOR_SCRIPT,
    'CHARACTER_3D': ArtRole.CHARACTER_3D,
    'ENVIRONMENT_3D': ArtRole.ENVIRONMENT_3D,
    'HARD_SURFACE': ArtRole.HARD_SURFACE,
    'SURFACING_ARTIST': ArtRole.SURFACING_ARTIST,
    'SHADER_ARTIST': ArtRole.SHADER_ARTIST,
    'RIGGING': ArtRole.RIGGING,
    'ANIMATION_CINEMATIC': ArtRole.ANIMATION_CINEMATIC,
    'ANIMATION_GAMEPLAY': ArtRole.ANIMATION_GAMEPLAY,
    'LIGHTING_LOOKDEV': ArtRole.LIGHTING_LOOKDEV,
    'VFX_PARTICLE': ArtRole.VFX_PARTICLE,
    'VFX_SIM': ArtRole.VFX_SIM,
    'TECH_ART': ArtRole.TECH_ART,
    'GROOMING': ArtRole.GROOMING,
    'CLOTH_SIM': ArtRole.CLOTH_SIM
};

function transformMajor(raw: RawMajor, facultyId: string): AcademyMajor {
    return {
        id: raw.id,
        facultyId: facultyId,
        code: raw.code,
        title: raw.title,
        role: ROLE_MAP[raw.role] || raw.role as any,
        description: raw.description,
        software: [], // Not in generated data yet
        outcomes: [], // Not in generated data yet
        courses: raw.courses.map(c => transformCourse(c, raw.id))
    };
}

/**
 * Load curriculum data from the generated JSON file
 */
export function loadCurriculumFromJSON(): RawCurriculumState {
    return curriculumStateData as RawCurriculumState;
}

/**
 * Get a specific major's curriculum from the JSON file
 */
export function getMajorFromJSON(majorId: string): AcademyMajor | null {
    const data = loadCurriculumFromJSON();

    for (const faculty of data.faculties) {
        const major = faculty.majors.find(m => m.id === majorId);
        if (major) {
            return transformMajor(major, faculty.id);
        }
    }

    return null;
}

/**
 * Get all faculties from the JSON file (for catalog display)
 */
export function getFacultiesFromJSON(): Faculty[] {
    const data = loadCurriculumFromJSON();

    return data.faculties.map(fac => ({
        id: fac.id,
        code: fac.code,
        name: fac.name,
        icon: '🎓', // Default icon
        color: '#60a5fa', // Default color
        description: '', // Not in generated data
        majors: fac.majors.map(maj => ({
            id: maj.id,
            facultyId: fac.id,
            code: maj.code,
            title: maj.title,
            role: maj.role as any,
            description: maj.description,
            software: [],
            outcomes: [],
            courses: [] // Don't load full courses for catalog
        }))
    }));
}
