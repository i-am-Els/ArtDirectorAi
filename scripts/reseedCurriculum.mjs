import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });
dotenv.config();

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT in environment.');
  }

  const trimmed = raw.trim();

  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      const repaired = trimmed.replace(
        /"private_key"\s*:\s*"([\s\S]*?)",\s*"client_email"/,
        (_match, keyBody) => `"private_key":"${keyBody.replace(/\r?\n/g, '\\n')}","client_email"`
      );
      return JSON.parse(repaired);
    }
  }

  if (fs.existsSync(trimmed)) {
    return JSON.parse(fs.readFileSync(trimmed, 'utf8'));
  }

  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON, path, or base64 JSON.');
  }
};

const serviceAccount = parseServiceAccount();
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const curriculumPath = path.join(process.cwd(), 'data', 'static_academy', 'generated', 'curriculum_state.json');
const raw = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

const toLesson = (lesson, subjectId) => ({
  id: lesson.id,
  subjectId,
  title: lesson.title,
  type: lesson.lesson_type,
  objective: lesson.objective,
  defaultStudyMode: lesson.default_study_mode === 'FOCUS' ? 'FOCUS' : 'MILEAGE',
  estimatedEffort: lesson.estimated_effort_minutes,
  orderIndex: lesson.order_index,
  searchQueries: lesson.search_queries || [],
  suggestedMileage: `${lesson.estimated_effort_minutes} min`
});

const toSubject = (subject, courseId) => ({
  id: subject.id,
  courseId,
  title: subject.title,
  description: subject.description,
  learningOutcome: subject.learning_outcome,
  orderIndex: subject.order_index,
  lessons: (subject.lessons || []).map((lesson) => toLesson(lesson, subject.id))
});

const toCourse = (course, majorId) => ({
  id: course.id,
  majorId,
  code: course.code,
  title: course.title,
  description: course.description,
  tier: course.tier,
  yearLevel: course.year_level,
  isCore: course.is_core,
  softwares: course.softwares || [],
  subjects: (course.subjects || []).map((subject) => toSubject(subject, course.id))
});

const majors = [];
const faculties = (raw.faculties || []).map((faculty) => {
  const facultyMajors = (faculty.majors || []).map((major) => {
    majors.push({
      id: major.id,
      facultyId: faculty.id,
      code: major.code,
      title: major.title,
      role: major.role,
      description: major.description,
      software: major.softwares || [],
      softwares: major.softwares || [],
      outcomes: [],
      courses: (major.courses || []).map((course) => toCourse(course, major.id))
    });

    return {
      id: major.id,
      facultyId: faculty.id,
      code: major.code,
      title: major.title,
      role: major.role,
      description: major.description,
      software: major.softwares || [],
      softwares: major.softwares || [],
      outcomes: [],
      courses: []
    };
  });

  return {
    id: faculty.id,
    code: faculty.code,
    name: faculty.name,
    icon: 'Academy',
    color: '#60a5fa',
    description: '',
    majors: facultyMajors
  };
});

const wipeCollection = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  const total = snapshot.size;

  let batch = db.batch();
  let ops = 0;

  for (const docSnap of snapshot.docs) {
    batch.delete(docSnap.ref);
    ops += 1;
    if (ops === 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }

  return total;
};

const writeCollection = async (collectionName, docs) => {
  let batch = db.batch();
  let ops = 0;

  for (const row of docs) {
    batch.set(db.collection(collectionName).doc(row.id), row);
    ops += 1;
    if (ops === 450) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
  }
};

const run = async () => {
  console.log('Starting curriculum reseed...');

  const deletedMajors = await wipeCollection('majors');
  const deletedFaculties = await wipeCollection('faculties');

  await writeCollection('majors', majors);
  await writeCollection('faculties', faculties);

  console.log(`Deleted majors: ${deletedMajors}`);
  console.log(`Deleted faculties: ${deletedFaculties}`);
  console.log(`Inserted majors: ${majors.length}`);
  console.log(`Inserted faculties: ${faculties.length}`);
  console.log('Curriculum reseed complete.');
};

run().catch((error) => {
  console.error('Curriculum reseed failed:', error);
  process.exit(1);
});
