import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize firebase-admin using service account JSON stored in env FIREBASE_SERVICE_ACCOUNT
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

function encrypt(text: string) {
  if (!APP_KEY) throw new Error('Encryption key missing');
  const key = Buffer.from(APP_KEY, 'base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
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
    const { key, projectId } = req.body;
    if (!key || typeof key !== 'string' || key.length < 20) {
      return res.status(400).json({ error: 'Invalid key' });
    }
    // Validate key by making a quick test request to Generative API models endpoint
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      const testUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(
        key.trim()
      )}`;
      const resp = await fetch(testUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!resp.ok) {
        console.warn('Key validation failed', resp.status);
        if (resp.status === 401 || resp.status === 403) {
          return res.status(400).json({ error: 'Invalid API key' });
        }
        return res.status(400).json({ error: 'Unable to validate API key' });
      }
    } catch (e: any) {
      console.error('Key validation error', e);
      return res.status(400).json({ error: 'Key validation request failed' });
    }

    const ciphertext = encrypt(key.trim());
    await db
      .collection('user_keys')
      .doc(uid)
      .set(
        {
          encrypted_key: ciphertext,
          project_id: projectId || null,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    return res.json({ ok: true, projectId: projectId || null });
  } catch (err: any) {
    console.error('store-key error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
