
import { GoogleGenAI, Type } from "@google/genai";
import { ArtBrief, GenerationParams, PortfolioFeedback, ArtRole, ExperienceLevel } from "../types";

const extractJSON = (text: string) => {
  try {
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error("The AI returned non-standard data. Please re-run the synthesis.");
  }
};

export const generateBrief = async (params: GenerationParams & { useSearch?: boolean, proMode?: boolean }): Promise<ArtBrief> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Model selection based on the proMode toggle
  const modelName = params.proMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const systemPrompt = `You are a World-Class Studio Art Director. 
  Your goal is to create a realistic, challenging, and professional production brief for an artist.
  
  Role: ${params.role}
  Exp Level: ${params.experience}
  Theme: ${params.theme}
  Complexity: ${params.complexity}/10
  
  Instructions:
  - Technical Constraints must be industry-standard (e.g., PBR, LODs, Silhouette, Color Theory).
  - The Challenge Factor should address common pitfalls for this specific experience level.
  - Lighting Mood should be evocative and professional.
  
  ${params.useSearch ? "Include grounding in real-world industry trends or specific technical references." : ""}
  
  You must return ONLY a JSON object.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Synthesize a professional production brief for a ${params.role} project themed "${params.theme}".`,
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

  const prompt = `Art direction reference image for a professional ${brief.role}. 
  Project Title: ${brief.title}. 
  Setting: ${theme}. 
  Atmosphere: ${brief.lightingMood}. 
  Focus on: ${brief.summary}. 
  High-end digital cinematic art, concept art style, professional composition. No text, no interface elements.`;

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
    console.error("Visual Reference Error:", err);
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
        { text: `As a Lead Artist, review this ${role} portfolio piece. The artist is at an "${experience}" level. Be critical but constructive. Focus on technical execution, lighting, and composition.` }
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
