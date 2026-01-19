import { GoogleGenAI, Type } from '@google/genai';
import { ArtBrief, GenerationParams } from "../types";


export const generateBrief = async (params: GenerationParams): Promise<ArtBrief> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
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
          submissionRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          productionTimeline: { type: Type.STRING },
          referenceImages: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyContacts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING } } } }
        },
        required: ["title", "summary", "keyDeliverables", "technicalConstraints", "lightingMood", "submissionRequirements", "productionTimeline", "referenceImages", "keyContacts"]
      }
    }
  });
  return JSON.parse(response.response.text) as ArtBrief;
};