import { GoogleGenAI, Type } from "@google/genai";
import { ArtBrief, GenerationParams, PortfolioFeedback, ArtRole, ExperienceLevel } from "../types";

/**
 * Service to generate Art Briefs.
 * Strictly initializes the API client with process.env.API_KEY inside each call
 * to ensure environment variables are resolved correctly in production.
 */
export const generateBrief = async (params: GenerationParams): Promise<ArtBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemPrompt = `You are an elite Art Director from a major studio (e.g., Rockstar, Framestore, Sony Santa Monica).
  Compose a professional production brief for a ${params.role} at ${params.experience} level.
  Theme/Setting: ${params.theme}. Complexity: ${params.complexity}/10.

  Use exact professional terminology:
  - Prop Designer: Focus on functional design, material breakdown, and LOD planning.
  - Matte Painter: Focus on photographic integration, set extension, and projection mapping logic.
  - Surfacing/Texture Artist: Focus on PBR metal/rough workflows, UDIM planning, texel density, and micro-surface detail.
  - Shader Artist: Focus on node-based logic, performance optimization, procedural masks, and dynamic parameters.
  - Rigging: Focus on bone hierarchy, weighted deformation, and animator-friendly UX.
  - Grooming: Focus on clumping, stray hairs, and physics-ready strand counts.
  - Gameplay Animator: Focus on frame data, responsiveness, and clear action-readability.
  - Cinematic Animator: Focus on emotional performance, weight, and silhouette.
  - Cloth Sim: Focus on collision margins, fabric weight, and simulation layering.
  - Technical Art: Focus on shader complexity, scripting for automation, and performance profiling.
  
  Format as a high-stakes studio assignment. The "challengeFactor" should be a direct quote from the Lead Artist explaining the technical and artistic growth this task provides for someone at the ${params.experience} level.`;

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
  Analyze the image multimodal data for design fundamentals (color, value, composition) and role-specific technicals (topology if 3D, anatomy if characters, modularity if environments).
  Provide honest, industry-standard critique.`;

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
 */
export const generateReferenceImage = async (brief: ArtBrief, theme: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Art reference for studio brief: ${brief.title}. Theme: ${theme}. Mood: ${brief.lightingMood}. Extremely detailed concept art, cinematic lighting, 8k professional production quality.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch { return null; }
};