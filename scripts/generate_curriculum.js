import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Load .env.local first (prioritize local overrides)
dotenv.config({ path: '.env.local' });
// Load .env (defaults)
dotenv.config();

// --- CONFIG ---
const API_KEY = process.env.VITE_GEMINI_API_KEY;
// Use a stable model that is available to the user.
// Based on debugging: 'gemini-2.5-flash' is available.
const MODEL_NAME = "gemini-2.5-flash";

if (!API_KEY) {
    console.error("❌ Error: VITE_GEMINI_API_KEY not found in environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- SCHEMAS ---
const LessonSchema = {
    type: SchemaType.OBJECT,
    properties: {
        id: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        lesson_type: { type: SchemaType.STRING, enum: ["READ", "WATCH", "ASSIGNMENT", "TEST", "PROJECT"] },
        objective: { type: SchemaType.STRING },
        default_study_mode: { type: SchemaType.STRING, enum: ["FOCUS", "MILEAGE"] },
        estimated_effort_minutes: { type: SchemaType.NUMBER },
        orderIndex: { type: SchemaType.NUMBER }
    },
    required: ["id", "title", "lesson_type", "objective", "default_study_mode", "estimated_effort_minutes", "orderIndex"]
};

const SubjectSchema = {
    type: SchemaType.OBJECT,
    properties: {
        id: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        learningOutcome: { type: SchemaType.STRING },
        orderIndex: { type: SchemaType.NUMBER },
    },
    required: ["id", "title", "description", "learningOutcome", "orderIndex"]
};

const CourseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        id: { type: SchemaType.STRING },
        code: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        yearLevel: { type: SchemaType.NUMBER },
        isCore: { type: SchemaType.BOOLEAN },
        tier: { type: SchemaType.STRING, enum: ["Foundations", "Production", "Mastery"] },
    },
    required: ["id", "code", "title", "description", "yearLevel", "isCore", "tier"]
};

// --- AGENTS ---
class BaseAgent {
    constructor(role, context) {
        this.role = role;
        this.context = context;
    }

    async generate(prompt, schema) {
        console.log(`🤖 [${this.role}] Working...`);
        const maxRetries = 5;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: `${this.context}\n\nTask: ${prompt}` }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                    }
                });

                const responseText = result.response.text();
                return JSON.parse(responseText);
            } catch (error) {
                attempt++;
                console.error(`⚠️ [${this.role}] Attempt ${attempt} failed: ${error.message}`);

                if (attempt >= maxRetries) {
                    console.error(`❌ [${this.role}] Max retries reached. Giving up.`);
                    throw error;
                }

                // Exponential-ish backoff to be safe with rate limits
                const waitTime = attempt * 20000;
                console.log(`⏳ [${this.role}] Waiting ${waitTime / 1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
}

class MajorAgent extends BaseAgent {
    async generateCourses(majorName, majorRole, description) {
        const prompt = `
          You are the Dean of the Faculty.
          Design a comprehensive curriculum for the Major: "${majorName}" (${majorRole}).
          Description: ${description}.
          
          Generate a list of 10-15 distinct Courses that take a student from Beginner to Pro.
          Group them logically into "Foundations", "Production", and "Mastery" tiers.
          
          Return a list of Course objects.
        `;
        const schema = { type: SchemaType.ARRAY, items: CourseSchema };
        return this.generate(prompt, schema);
    }
}

class CourseAgent extends BaseAgent {
    async generateSubjects(course) {
        const prompt = `
          You are the Professor for the Course: "${course.title}" (${course.code}).
          Course Description: ${course.description}.
          Level: Year ${course.yearLevel}, Tier: ${course.tier}.
          
          Break this course down into 4-8 distinct Subjects (Modules).
          Each subject should cover a specific topic or skill within this course.
          
          Return a list of Subject objects.
        `;
        const schema = { type: SchemaType.ARRAY, items: SubjectSchema };
        return this.generate(prompt, schema);
    }
}

class SubjectAgent extends BaseAgent {
    async generateLessons(course, subject) {
        const prompt = `
          You are the Instructor for the Subject: "${subject.title}" within the Course "${course.title}".
          Subject Description: ${subject.description}.
          Learning Outcome: ${subject.learningOutcome}.
          
          Create 3-6 granular Lessons for this subject.
          Mix of READ (Theory), WATCH (Demo), and ASSIGNMENT (Practice).
          Ensure specific "estimated_effort_minutes".
          
          Return a list of Lesson objects.
        `;
        const schema = { type: SchemaType.ARRAY, items: LessonSchema };
        return this.generate(prompt, schema);
    }
}

// --- STATE MANAGER ---
const STATE_FILE = path.join(process.cwd(), 'data', 'static_academy', 'generated', 'curriculum_state.json');

async function loadState(seedMajor) {
    try {
        await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
        if (existsSync(STATE_FILE)) {
            const data = await fs.readFile(STATE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn("⚠️ Could not load state, starting fresh.", e.message);
    }

    // Default Empty State
    return {
        faculty: {
            id: seedMajor.facultyId,
            code: "VISDEV",
            name: "Faculty of Visual Development",
            majors: [
                {
                    ...seedMajor,
                    courses: []
                }
            ]
        }
    };
}

async function saveState(state) {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`💾 State saved to ${STATE_FILE}`);
}

async function runLevelByLevel() {
    console.log("🚀 Starting Persistent Curriculum Generator...");

    // SEED DATA
    const SEED_MAJOR = {
        id: "MAJOR_ENV_ART",
        facultyId: "FAC_VISDEV",
        code: "ENV_ART",
        title: "Environment Concept Artist",
        role: "Environment Concept Artist",
        description: "Master the art of designing immersive worlds, landscapes, and architectural spaces for film and games."
    };

    let state = await loadState(SEED_MAJOR);
    const major = state.faculty.majors[0]; // Focusing on single major for now

    // --- LEVEL 1: COURSES ---
    if (!major.courses || major.courses.length === 0) {
        console.log(`\nLEVEL 1: Generating Courses for ${major.title}...`);
        const majorAgent = new MajorAgent("MajorAgent", "You are an expert curriculum designer.");
        const courses = await majorAgent.generateCourses(major.title, major.role, major.description);

        // Initialize empty arrays for next level
        major.courses = courses.map(c => ({
            ...c,
            subjects: []
        }));

        await saveState(state);
        console.log(`✅ Level 1 Complete: ${major.courses.length} courses generated.`);
    } else {
        console.log(`⏩ Level 1 Skipped: ${major.courses.length} courses already exist.`);
    }

    // --- LEVEL 2: SUBJECTS ---
    console.log(`\nLEVEL 2: Checking Subjects for ${major.courses.length} courses...`);
    for (const course of major.courses) {
        if (!course.subjects || course.subjects.length === 0) {
            console.log(`  ▶ Generating Subjects for [${course.code}] ${course.title}...`);
            const agent = new CourseAgent(`CourseAgent-${course.code}`, `Context: ${major.title}`);
            const subjects = await agent.generateSubjects(course);

            // Initialize empty arrays for next level
            course.subjects = subjects.map(s => ({
                ...s,
                lessons: []
            }));

            await saveState(state); // Save after EACH course to prevent data loss on crash
            console.log(`    ✔ Saved ${subjects.length} subjects.`);

            // Artificial delay to play nice with Rate Limit (optional but recommended)
            await new Promise(r => setTimeout(r, 2000));
        } else {
            // console.log(`  ⏩ [${course.code}] Has ${course.subjects.length} subjects.`);
        }
    }

    // --- LEVEL 3: LESSONS ---
    console.log(`\nLEVEL 3: Checking Lessons...`);
    for (const course of major.courses) {
        for (const subject of course.subjects) {
            if (!subject.lessons || subject.lessons.length === 0) {
                console.log(`  ▶ Generating Lessons for [${course.code}] -> ${subject.title}...`);
                const agent = new SubjectAgent(`SubjectAgent-${subject.id}`, `Context: ${course.title} -> ${subject.title}`);
                const lessons = await agent.generateLessons(course, subject);

                subject.lessons = lessons;

                await saveState(state); // Save after EACH subject
                console.log(`    ✔ Saved ${lessons.length} lessons.`);

                // Artificial delay
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    console.log("\n✨ ALL LEVELS COMPLETE! Curriculum is fully generated.");
}

runLevelByLevel().catch(console.error);
