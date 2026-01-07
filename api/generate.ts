import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize firebase-admin
if (!admin.apps.length) {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svc) {
    console.error('FIREBASE_SERVICE_ACCOUNT not set');
  } else {
    const serviceAccount = JSON.parse(svc);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
}
const db = admin.firestore();

const APP_KEY = process.env.APP_AES_KEY; // base64
if (!APP_KEY) {
  console.warn('APP_AES_KEY is not set. Encryption will fail.');
}
function decrypt(ciphertext: string) {
  if (!APP_KEY) throw new Error('Encryption key missing');
  const key = Buffer.from(APP_KEY, 'base64');
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return out.toString('utf8');
}

async function verifyFirebaseToken(req: VercelRequest) {
  const auth = req.headers.authorization || '';
  const m = /^Bearer (.+)$/.exec(auth as string);
  if (!m) throw new Error('Missing auth');
  const idToken = m[1];
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded.uid;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });
  try {
    const uid = await verifyFirebaseToken(req);
    const doc = await db.collection('user_keys').doc(uid).get();
    if (!doc.exists)
      return res.status(403).json({ error: 'No API key stored for user' });
    const ciphertext = doc.data()?.encrypted_key;
    if (!ciphertext) return res.status(403).json({ error: 'No API key found' });
    const apiKey = decrypt(ciphertext);

    const payload = req.body || {};
    const type = payload.type || 'brief';
    const params = payload.params || {};

    // instantiate GoogleGenAI client with user's key
    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (type === 'brief') {
      const modelName = params.proMode
        ? 'gemini-3-pro-preview'
        : 'gemini-3-flash-preview';
      const systemPrompt = `You are a World-Class Studio Art Director. Create a professional art production brief. Role: ${params.role}. Seniority: ${params.experience}. Theme: ${params.theme}. Complexity: ${params.complexity}/10. Return ONLY valid JSON.`;
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Synthesize a professional production brief for: ${params.role}, Theme: ${params.theme}.`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      // try to parse response text
      const text = response.text || '{}';
      return res.json({ text, raw: response });
    }

    if (type === 'image') {
      const modelName = params.proMode
        ? 'gemini-3-pro-image-preview'
        : 'gemini-2.5-flash-image';
      const prompt = params.prompt || '';
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [{ text: prompt }] },
          config: params.proMode
            ? { imageConfig: { aspectRatio: '16:9', imageSize: '1K' } }
            : undefined,
        });
        // extract inlineData base64
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return res.json({
              dataUrl: `data:image/png;base64,${part.inlineData.data}`,
            });
          }
        }
        return res.status(200).json({ dataUrl: null });
      } catch (err: any) {
        console.error('image generation failed', err);
        return res.status(500).json({ error: err.message || String(err) });
      }
    }

    return res.status(400).json({ error: 'Unknown type' });
  } catch (err: any) {
    console.error('generate error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
