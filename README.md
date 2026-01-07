<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zHaKWuW-yIgCwQN8vdyhDl0P1iLSdfvP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Bring Your Own Key (BYOK)

Short summary:

- This app requires a Google AI Studio API key for generation. For security, users should create and own their own key (BYOK) in their Google account. The app stores only an encrypted copy on the server — the plaintext key never lives in the browser in production.

Two simple options for users:

- Recommended (non-technical): Use the Google Cloud Console UI to create an API key and paste the final key string into the app when prompted.
- Power users: Paste the one-shot Cloud Shell script (provided in the app's "Get help with BYOK API KEY" modal) into Cloud Shell; the script creates a new project in your account, enables the Generative AI API, and prints the Project ID and API key.

Important notes:

- Billing: Google may require you to enable billing on the project you create — this happens in your Google account and must be approved by you.
- Deletion: Deleting the project or API key in your Google Console will revoke access; keep the Project ID if you need to manage or remove the key later.
- Security: Do not share your API key. The app only stores an encrypted version in Firestore and never exposes plaintext in production.

If you need a walkthrough, open the app, go to Step 3, and click "Get help with BYOK API KEY".
