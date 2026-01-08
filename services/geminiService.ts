import { GoogleGenAI, Type } from "@google/genai";
import { ArtBrief, GenerationParams, PortfolioFeedback, ArtRole, ExperienceLevel } from "../types.ts";

/**
 * Service to generate Art Briefs.
 */
export const generateBrief = async (params: GenerationParams): Promise<ArtBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are an elite Art Director from a major studio.
  Compose a professional production brief for a ${params.role} at ${params.experience} level.
  Theme/Setting: ${params.theme}. Complexity: ${params.complexity}/10.

  Use exact professional terminology. Format as a high-stakes studio assignment. 
  The "challengeFactor" should be a direct quote from the Lead Artist explaining the growth this task provides.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write the art director's brief for a ${params.role}.`,
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

/**
 * Multimodal analysis of user-uploaded artwork.
 */
export const analyzePortfolio = async (
  base64Image: string, 
  role: ArtRole, 
  experience: ExperienceLevel
): Promise<PortfolioFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are an elite Art Director reviewing a portfolio submission for a ${role} at a ${experience} level.
  Analyze the image for design fundamentals and role-specific technicals.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
        { text: "Analyze this artwork based on professional studio standards." }
      ]
    },
    config: {
      systemInstruction: systemPrompt,
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

/**
 * Visual reference generator for the generated brief.
 * Uses gemini-2.5-flash-image for maximum compatibility across project tiers.
 */
export const generateReferenceImage = async (brief: ArtBrief, theme: string): Promise<string | null> => {
  // Always create a new instance to pick up the most current API_KEY from the environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Professional high-end production concept art reference: ${brief.title}. Theme: ${theme}. Lighting: ${brief.lightingMood}. Composition: ${brief.compositionNotes || 'Cinematic'}. Atmospheric studio quality visualization.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "16:9"
        } 
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    console.error("Reference image generation failed:", error);
    // Explicitly throw so the UI can detect 403 Permission Denied or other issues
    throw error;
  }
};