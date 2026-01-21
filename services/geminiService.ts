
import { GoogleGenAI, Type } from "@google/genai";
import { ArtBrief, GenerationParams, PortfolioFeedback, ArtRole, ExperienceLevel, GrowthPlan, DrillBlueprint } from "../types.ts";

// Use VITE_API_KEY if available (client-side), otherwise API_KEY (server-side)
const getApiKey = () => import.meta.env.VITE_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;

export const generateBrief = async (params: GenerationParams): Promise<ArtBrief> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const systemPrompt = `You are an elite Art Director. Compose a professional studio brief for ${params.role}. Theme: ${params.theme}. Complexity: ${params.complexity}/10. Use exact terminology.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft assignment for ${params.role}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalConstraints: { type: Type.ARRAY, items: { type: Type.STRING } },
          lightingMood: { type: Type.STRING },
          compositionNotes: { type: Type.STRING },
          materialNotes: { type: Type.STRING },
          challengeFactor: { type: Type.STRING }
        },
        required: ["title", "summary", "keyDeliverables", "technicalConstraints", "lightingMood", "challengeFactor"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as ArtBrief;
};

export const generateGrowthPlan = async (
  goal: string,
  role: ArtRole,
  days: number,
  hours: number
): Promise<GrowthPlan> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const weeks = Math.ceil(days / 7);

  const systemPrompt = `You are a legendary Art Professor at a top industry academy. 
  Create a ${weeks}-week intensive curriculum for a student wanting to: "${goal}".
  Targeting the role: ${role}. They have ${hours} hours per day.
  Break it down into weeks. Each week must have daily specific tasks.
  Focus on a "Zero to Hero" trajectory.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate the full curriculum.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                focusTitle: { type: Type.STRING },
                dailyTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url_search: { type: Type.STRING }
                    }
                  }
                }
              },
              required: ["week", "focusTitle", "dailyTasks", "resources"]
            }
          }
        },
        required: ["modules"]
      }
    }
  });

  const parsed = JSON.parse(response.text || "{}");
  return {
    id: Math.random().toString(36).substr(2, 9),
    goal,
    specialization: role,
    durationDays: days,
    dailyHours: hours,
    modules: parsed.modules,
    createdAt: Date.now(),
    completedTasks: []
  };
};

export const analyzePortfolio = async (base64Image: string, role: ArtRole, experience: ExperienceLevel): Promise<PortfolioFeedback> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
        { text: "Analyze this artwork based on professional studio standards." }
      ]
    },
    config: {
      systemInstruction: `You are an Art Director reviewing ${role} work.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalAdvice: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          nextSteps: { type: Type.STRING }
        },
        required: ["strengths", "areasToImprove", "technicalAdvice", "overallScore", "nextSteps"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as PortfolioFeedback;
};

export const generateDrill = async (lessonTitle: string, mode: 'FOCUS' | 'MILEAGE', role: string): Promise<DrillBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const systemPrompt = `You are a strict Art Coach. Create a specific training drill for: "${lessonTitle}". 
  Role: ${role}. Mode: ${mode}.
  FOCUS mode = One high-quality piece.
  MILEAGE mode = High repetition/quantity.
  Output a JSON blueprint.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `Generate drill for ${lessonTitle} in ${mode} mode.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          mode: { type: Type.STRING, enum: ["FOCUS", "MILEAGE"] },
          objective: { type: Type.STRING },
          constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
          durationMinutes: { type: Type.INTEGER }
        },
        required: ["title", "mode", "objective", "constraints", "durationMinutes"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as DrillBlueprint;
};

export const generateCourseList = async (majorTitle: string, role: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const systemPrompt = `You are a Dean of Arts. Create a comprehensive 5-tier curriculum for: "${majorTitle}".
  Role: ${role}.
  Tiers: Foundations (2 courses), Production (2 courses), Mastery (1 course).
  Total 5 courses. Each course must have a unique title and description.
  Output JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `Generate course list for ${majorTitle}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          courses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tier: { type: Type.STRING, enum: ["Foundations", "Production", "Mastery"] },
                description: { type: Type.STRING }
              },
              required: ["title", "tier", "description"]
            }
          }
        },
        required: ["courses"]
      }
    }
  });
  return JSON.parse(response.text || "{}").courses || [];
};

export const generateLessonOutlines = async (courseTitle: string, tier: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const systemPrompt = `You are a Professor. Create a syllabus of 4-6 lessons for the course: "${courseTitle}" (${tier}).
  Each lesson needs a title, focusDescription (technical goal), suggestedMileage (e.g. "50 sketches"), and searchQueries (3 specific youtube search terms to learn the topic).
  Output JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `Generate lessons for ${courseTitle}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                focusDescription: { type: Type.STRING },
                suggestedMileage: { type: Type.STRING },
                searchQueries: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "focusDescription", "suggestedMileage", "searchQueries"]
            }
          }
        },
        required: ["lessons"]
      }
    }
  });
  return JSON.parse(response.text || "{}").lessons || [];
};
