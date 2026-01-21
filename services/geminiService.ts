
import { GoogleGenAI, Type } from "@google/genai";
import { ArtBrief, GenerationParams, PortfolioFeedback, ArtRole, ExperienceLevel, GrowthPlan, DrillBlueprint } from "../types.ts";

export const generateBrief = async (params: GenerationParams): Promise<ArtBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
