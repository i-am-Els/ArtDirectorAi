
import { GoogleGenAI, Type } from "@google/genai";
import { ArtBrief, GenerationParams, PortfolioFeedback, ArtRole, ExperienceLevel } from "../types";

const extractJSON = (text: string) => {
  try {
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error("Synthesis output error. Please re-run the initiate project protocol.");
  }
};

export const generateBrief = async (params: GenerationParams & { useSearch?: boolean, proMode?: boolean }): Promise<ArtBrief> => {
  // CRITICAL: Re-initialize AI client to pick up session-linked keys from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = params.proMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const systemPrompt = `You are a World-Class Studio Art Director. 
  Create a professional art production brief.
  
  Artist Profile:
  - Role: ${params.role}
  - Seniority: ${params.experience}
  - Project Theme: ${params.theme}
  - Complexity Threshold: ${params.complexity}/10
  
  Focus on:
  - Industry-standard terminology (PBR, Subdiv, Silhouette, Flow, Texel Density).
  - Specific technical pitfalls for a ${params.experience} level artist.
  
  ${params.useSearch ? "Ground the brief in contemporary industry trends or technical documentation from major studios." : ""}
  
  Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Synthesize a professional production brief for: ${params.role}, Theme: ${params.theme}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      tools: params.useSearch ? [{ googleSearch: {} }] : undefined,
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

  const brief = extractJSON(response.text || "{}") as ArtBrief;

  // Extract search grounding URLs if available
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    brief.groundingUrls = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title
      }));
  }

  return brief;
};

export const generateReferenceImage = async (brief: ArtBrief, theme: string, proMode?: boolean): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use pro model for higher quality if requested, else flash image
  const modelName = proMode ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  const prompt = `Cinematic professional art reference. 
  Department: ${brief.role}. 
  Topic: ${brief.title}. 
  Mood: ${brief.lightingMood}. 
  Theme: ${theme}. 
  High-end production quality, 8k render style, focused composition. Strictly no text or UI elements.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: proMode ? { 
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" } 
      } : undefined
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) { 
    console.error("Reference Image Failed:", err);
    return null; 
  }
};

export const analyzePortfolio = async (base64Image: string, role: ArtRole, experience: ExperienceLevel, proMode?: boolean): Promise<PortfolioFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = proMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
        { text: `As an Art Director, provide a technical critique for this ${role} asset. Seniority target: ${experience}. Highlight topology, lighting, and storytelling.` }
      ]
    },
    config: {
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
  return extractJSON(response.text || "{}") as PortfolioFeedback;
};
