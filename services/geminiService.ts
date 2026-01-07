import { GoogleGenAI, Type } from '@google/genai';
import {
  ArtBrief,
  GenerationParams,
  PortfolioFeedback,
  ArtRole,
  ExperienceLevel,
} from '../types';

const extractJSON = (text: string) => {
  try {
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('JSON Parse Error:', text);
    throw new Error(
      'Synthesis output error. Please re-run the initiate project protocol.'
    );
  }
};

export const generateBrief = async (
  params: GenerationParams & { useSearch?: boolean; proMode?: boolean }
): Promise<ArtBrief> => {
  // When running in the browser, proxy the request to our server so the server can
  // use the per-user stored key. This avoids shipping user keys to the client in prod.
  if (typeof window !== 'undefined') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      const firebaseAuth = await import('firebase/auth');
      const auth = firebaseAuth.getAuth();
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {
      // ignore - if firebase isn't available here, server will respond accordingly
    }

    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ type: 'brief', params }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: resp.statusText }));
      throw new Error(err.error || 'Generation failed');
    }
    const body = await resp.json();
    try {
      return JSON.parse(body.text || '{}') as ArtBrief;
    } catch (e) {
      throw new Error('Failed to parse brief from server response');
    }
  }

  // Server-side fallback: use process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = params.proMode
    ? 'gemini-3-pro-preview'
    : 'gemini-3-flash-preview';
  const systemPrompt = `You are a World-Class Studio Art Director. 
  Create a professional art production brief.
  
  Artist Profile:
  - Role: ${params.role}
  - Seniority: ${params.experience}
  - Project Theme: ${params.theme}
  - Complexity Threshold: ${params.complexity}/10
  
  Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Synthesize a professional production brief for: ${params.role}, Theme: ${params.theme}.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    },
  });

  return extractJSON(response.text || '{}') as ArtBrief;
};

export const generateReferenceImage = async (
  brief: ArtBrief,
  theme: string,
  proMode?: boolean
): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      const firebaseAuth = await import('firebase/auth');
      const auth = firebaseAuth.getAuth();
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {}

    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'image',
        params: {
          prompt: `Department: ${brief.role}. Topic: ${brief.title}. Mood: ${brief.lightingMood}. Theme: ${theme}. High-end production quality.`,
          proMode,
        },
      }),
    });
    if (!resp.ok) return null;
    const body = await resp.json();
    return body.dataUrl || null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Use pro model for higher quality if requested, else flash image
  const modelName = proMode
    ? 'gemini-3-pro-image-preview'
    : 'gemini-2.5-flash-image';

  const prompt = `Cinematic professional art reference. 
  Department: ${brief.role}. 
  Topic: ${brief.title}. 
  Mood: ${brief.lightingMood}. 
  Theme: ${theme}. 
  High-end production quality, 8k render style, focused composition.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: proMode
        ? {
            imageConfig: { aspectRatio: '16:9', imageSize: '1K' },
          }
        : undefined,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (err) {
    console.error('Reference Image Failed:', err);
    return null;
  }
};

export const analyzePortfolio = async (
  base64Image: string,
  role: ArtRole,
  experience: ExperienceLevel,
  proMode?: boolean
): Promise<PortfolioFeedback> => {
  // Browser proxy to server
  if (typeof window !== 'undefined') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      const firebaseAuth = await import('firebase/auth');
      const auth = firebaseAuth.getAuth();
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {}

    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'analyze',
        params: { base64Image, role, experience, proMode },
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: resp.statusText }));
      throw new Error(err.error || 'Analysis failed');
    }
    const body = await resp.json();
    try {
      return JSON.parse(body.text || '{}') as PortfolioFeedback;
    } catch (e) {
      throw new Error('Failed to parse analysis from server response');
    }
  }

  // Server-side fallback
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = proMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `As an Art Director, provide a technical critique for this ${role} asset. Seniority target: ${experience}. Highlight topology, lighting, and storytelling.`,
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalAdvice: { type: Type.STRING },
          overallScore: { type: Type.NUMBER },
          nextSteps: { type: Type.STRING },
        },
        required: [
          'strengths',
          'areasToImprove',
          'technicalAdvice',
          'overallScore',
          'nextSteps',
        ],
      },
    },
  });
  return extractJSON(response.text || '{}') as PortfolioFeedback;
};
