import { AcademyMajor, Course, LessonType, StudyMode, ArtRole } from '../../../types';

export const CHARACTER_DESIGN_MAJOR: AcademyMajor = {
    id: 'dept-char-concept',
    facultyId: 'fac-visdev',
    code: 'CHAR_DES',
    title: "Character Design",
    role: ArtRole.CONCEPT_CHAR,
    description: "Designing character archetypes with anatomical and narrative depth. Focuses on readable silhouettes, appeal, and production readiness.",
    software: ["Photoshop", "Clip Studio", "Procreate", "PureRef", "ZBrush (Basic)"],
    outcomes: ["Lead Character Designer", "Visual Development Artist"],
    courses: [
        {
            id: 'course-chd201',
            majorId: 'dept-char-concept',
            code: 'CHD 201',
            title: "Essential Elements of Character Design",
            tier: 'Foundations',
            description: "Introduces the fundamental visual principles behind readable, appealing, and functional character designs across illustration, animation, and games.",
            yearLevel: 2,
            isCore: true,
            subjects: [
                {
                    id: 'subj-sil-101',
                    courseId: 'course-chd201',
                    title: "Silhouettes and Negative Space in Character Design",
                    description: "Understanding how clear silhouettes and controlled negative space create instantly readable characters, independent of detail.",
                    learningOutcome: "Ability to create instantly readable characters using only black and white shapes.",
                    orderIndex: 1,
                    lessons: [
                        {
                            id: 'l-sil-01',
                            subjectId: 'subj-sil-101',
                            title: "Analyse iconic character silhouettes",
                            type: LessonType.ASSIGNMENT,
                            objective: "Identify why certain silhouettes read instantly",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 45,
                            orderIndex: 1,
                            searchQueries: ["iconic character silhouettes analysis", "character design silhouette theory"]
                        },
                        {
                            id: 'l-sil-02',
                            subjectId: 'subj-sil-101',
                            title: "Silhouette reduction exercise",
                            type: LessonType.ASSIGNMENT,
                            objective: "Reduce complex designs into pure black shapes",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 2,
                            searchQueries: ["simplifying character shapes", "silhouette reduction techniques"]
                        },
                        {
                            id: 'l-sil-03',
                            subjectId: 'subj-sil-101',
                            title: "Silhouette iteration drill",
                            type: LessonType.ASSIGNMENT,
                            objective: "Produce 30 distinct silhouettes for one character brief",
                            defaultStudyMode: StudyMode.MILEAGE,
                            estimatedEffort: 90,
                            orderIndex: 3,
                            suggestedMileage: "30 silhouettes",
                            searchQueries: ["silhouette generation techniques", "thumbnailing for character design"]
                        },
                        {
                            id: 'l-sil-04',
                            subjectId: 'subj-sil-101',
                            title: "Negative space mapping",
                            type: LessonType.ASSIGNMENT,
                            objective: "Identify and adjust negative space to improve clarity",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 45,
                            orderIndex: 4,
                            searchQueries: ["negative space in character design", "improving silhouette clarity"]
                        },
                        {
                            id: 'l-sil-05',
                            subjectId: 'subj-sil-101',
                            title: "Silhouette stress test",
                            type: LessonType.ASSIGNMENT,
                            objective: "Test silhouettes at extreme scales and angles",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 30,
                            orderIndex: 5,
                            searchQueries: ["character silhouette readability test", "small scale design check"]
                        }
                    ]
                },
                {
                    id: 'subj-shp-102',
                    courseId: 'course-chd201',
                    title: "Shape Language and Visual Psychology",
                    description: "Explores how basic shapes communicate personality, morality, and function.",
                    learningOutcome: "Mastery of circle, square, triangle psychology in character construction.",
                    orderIndex: 2,
                    lessons: [
                        {
                            id: 'l-shp-01',
                            subjectId: 'subj-shp-102',
                            title: "Shape association breakdown",
                            type: LessonType.READ,
                            objective: "Study circles, squares, triangles in character design",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 45,
                            orderIndex: 1,
                            searchQueries: ["shape language character design", "bouba kiki effect design"]
                        },
                        {
                            id: 'l-shp-02',
                            subjectId: 'subj-shp-102',
                            title: "Single-shape character study",
                            type: LessonType.ASSIGNMENT,
                            objective: "Design characters dominated by one shape language",
                            defaultStudyMode: StudyMode.MILEAGE,
                            estimatedEffort: 90,
                            orderIndex: 2,
                            suggestedMileage: "15 sketches",
                            searchQueries: ["primary shape character design", "forced shape design challenge"]
                        },
                        {
                            id: 'l-shp-03',
                            subjectId: 'subj-shp-102',
                            title: "Mixed shape hierarchy",
                            type: LessonType.ASSIGNMENT,
                            objective: "Combine shapes while maintaining a dominant read",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 3,
                            searchQueries: ["shape hierarchy character design", "combining shapes effectively"]
                        },
                        {
                            id: 'l-shp-04',
                            subjectId: 'subj-shp-102',
                            title: "Audience perception test",
                            type: LessonType.PROJECT,
                            objective: "Predict and verify emotional responses to shapes",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 120,
                            orderIndex: 4,
                            searchQueries: ["visual psychology character design", "audience shape perception"]
                        }
                    ]
                },
                {
                    id: 'subj-prop-103',
                    courseId: 'course-chd201',
                    title: "Proportion, Scale, and Exaggeration",
                    description: "Covers realistic and stylised proportions and how exaggeration supports storytelling.",
                    learningOutcome: "Control over realistic vs stylized proportions.",
                    orderIndex: 3,
                    lessons: [
                        {
                            id: 'l-prop-01',
                            subjectId: 'subj-prop-103',
                            title: "Standard human proportion study",
                            type: LessonType.READ,
                            objective: "Review classical and modern proportion systems",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 1,
                            searchQueries: ["human anatomy proportions", "andrew loomis proportions"]
                        },
                        {
                            id: 'l-prop-02',
                            subjectId: 'subj-prop-103',
                            title: "Exaggeration spectrum exercise",
                            type: LessonType.ASSIGNMENT,
                            objective: "Push proportions from realistic to extreme",
                            defaultStudyMode: StudyMode.MILEAGE,
                            estimatedEffort: 90,
                            orderIndex: 2,
                            suggestedMileage: "3 character variants",
                            searchQueries: ["character design exaggeration", "pushing poses and proportions"]
                        },
                        {
                            id: 'l-prop-03',
                            subjectId: 'subj-prop-103',
                            title: "Functional exaggeration",
                            type: LessonType.ASSIGNMENT,
                            objective: "Exaggerate proportions based on character role",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 3,
                            searchQueries: ["gameplay signalling character design", "functional character design"]
                        },
                        {
                            id: 'l-prop-04',
                            subjectId: 'subj-prop-103',
                            title: "Consistency check",
                            type: LessonType.ASSIGNMENT,
                            objective: "Maintain proportion rules across multiple poses",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 4,
                            searchQueries: ["character design model sheet", "keeping characters on model"]
                        }
                    ]
                },
                {
                    id: 'subj-ges-104',
                    courseId: 'course-chd201',
                    title: "Gesture, Line of Action, and Flow",
                    description: "Introduces gesture as the backbone of dynamic character poses.",
                    learningOutcome: "Creating dynamic poses driven by single lines of action.",
                    orderIndex: 4,
                    lessons: [
                        {
                            id: 'l-ges-01',
                            subjectId: 'subj-ges-104',
                            title: "Line of action identification",
                            type: LessonType.READ,
                            objective: "Extract gesture from existing artworks",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 45,
                            orderIndex: 1,
                            searchQueries: ["line of action tutorial", "gesture drawing basics"]
                        },
                        {
                            id: 'l-ges-02',
                            subjectId: 'subj-ges-104',
                            title: "Timed gesture drawing",
                            type: LessonType.ASSIGNMENT,
                            objective: "Rapid pose capture under time constraints",
                            defaultStudyMode: StudyMode.MILEAGE,
                            estimatedEffort: 30, // 30 mins session
                            orderIndex: 2,
                            suggestedMileage: "30 second poses",
                            searchQueries: ["croquis drawing practice", "quick gesture drawing sketches"]
                        },
                        {
                            id: 'l-ges-03',
                            subjectId: 'subj-ges-104',
                            title: "Gesture refinement",
                            type: LessonType.ASSIGNMENT,
                            objective: "Strengthen clarity without adding detail",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 3,
                            searchQueries: ["improving gesture drawing", "force drawing method"]
                        },
                        {
                            id: 'l-ges-04',
                            subjectId: 'subj-ges-104',
                            title: "Stiffness diagnosis",
                            type: LessonType.ASSIGNMENT,
                            objective: "Identify and correct rigid poses",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 45,
                            orderIndex: 4,
                            searchQueries: ["fixing stiff drawings", "dynamic vs static poses"]
                        }
                    ]
                },
                {
                    id: 'subj-cost-105',
                    courseId: 'course-chd201',
                    title: "Costumes, Props, and Readability",
                    description: "Focuses on how clothing and props support character identity without clutter.",
                    learningOutcome: "Designing functional and narrative costumes that don't break the silhouette.",
                    orderIndex: 5,
                    lessons: [
                        {
                            id: 'l-cost-01',
                            subjectId: 'subj-cost-105',
                            title: "Costume purpose analysis",
                            type: LessonType.READ,
                            objective: "Analyse costumes by function and narrative",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 45,
                            orderIndex: 1,
                            searchQueries: ["character costume design", "narrative clothing design"]
                        },
                        {
                            id: 'l-cost-02',
                            subjectId: 'subj-cost-105',
                            title: "Prop silhouette integration",
                            type: LessonType.ASSIGNMENT,
                            objective: "Ensure props enhance, not break, readability",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 2,
                            searchQueries: ["prop design integration", "silhouette with props"]
                        },
                        {
                            id: 'l-cost-03',
                            subjectId: 'subj-cost-105',
                            title: "Costume variation drill",
                            type: LessonType.ASSIGNMENT,
                            objective: "Design multiple outfits for one character",
                            defaultStudyMode: StudyMode.MILEAGE,
                            estimatedEffort: 90,
                            orderIndex: 3,
                            suggestedMileage: "5 outfits",
                            searchQueries: ["costume variations art", "character skin design"]
                        },
                        {
                            id: 'l-cost-04',
                            subjectId: 'subj-cost-105',
                            title: "Overdesign correction",
                            type: LessonType.ASSIGNMENT,
                            objective: "Strip unnecessary detail while retaining appeal",
                            defaultStudyMode: StudyMode.FOCUS,
                            estimatedEffort: 60,
                            orderIndex: 4,
                            searchQueries: ["preventing overdesign", "simplifying character details"]
                        }
                    ]
                }
            ]
        }
    ]
};
