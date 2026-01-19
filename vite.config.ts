
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // --- Vercel Build Logs ---
    console.log("--- VITE CONFIG LOGS --");
    console.log("Build mode:", mode);
    if (env.VITE_GEMINI_API_KEY) {
        console.log("VITE_GEMINI_API_KEY loaded successfully from Vercel secrets.");
        const apiKey = env.VITE_GEMINI_API_KEY;
        const maskedKey = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
        console.log("API Key (masked):", maskedKey);
    } else {
        console.error("CRITICAL WARNING: VITE_GEMINI_API_KEY was NOT found in environment variables!");
    }
    console.log("Defining keys for application use...");
    console.log("------------------------\n");
    // --- End Logs ---

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
