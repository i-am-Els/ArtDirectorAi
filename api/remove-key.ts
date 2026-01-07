import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(svc)) });
  }
}
const db = admin.firestore();

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
    await db.collection('user_keys').doc(uid).delete();
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('remove-key error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
