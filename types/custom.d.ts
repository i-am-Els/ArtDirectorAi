declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'http';
  interface VercelRequest extends IncomingMessage {
    body?: any;
    headers: Record<string, string | undefined>;
    query: Record<string, string | undefined>;
  }
  interface VercelResponse extends ServerResponse {
    status(code: number): VercelResponse;
    json(body: any): VercelResponse;
  }
  export type { VercelRequest, VercelResponse };
}

declare module 'firebase-admin' {
  const admin: any;
  export default admin;
}
