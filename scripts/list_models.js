import dotenv from 'dotenv';

// Load .env.local first (prioritize local overrides)
dotenv.config({ path: '.env.local' });
// Load .env (defaults)
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ Error: VITE_GEMINI_API_KEY not found in environment variables.");
    process.exit(1);
}

async function listModels() {
    console.log("🔍 Querying API for available models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();

        console.log("\n📋 Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
            });
        } else {
            console.log("No models found in response.");
        }

    } catch (error) {
        console.error("❌ Failed to list models:", error.message);
    }
}

listModels();
