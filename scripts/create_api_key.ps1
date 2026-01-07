# PowerShell helper: Steps to create an API key for Google Generative AI (BYOK)
# Save this file locally and run in PowerShell. This script only opens the Cloud Console pages and
# shows the gcloud commands; it does NOT create credentials automatically (gcloud may require extra setup).

Start-Process 'https://console.cloud.google.com/apis/credentials'
Start-Process 'https://console.cloud.google.com/iam-admin/serviceaccounts'

Write-Host "Follow these steps in the Cloud Console:" -ForegroundColor Cyan
Write-Host " 1) Select your project (the same project used by the app)." -ForegroundColor Yellow
Write-Host " 2) Open APIs & Services → Credentials → Create Credentials → API key." -ForegroundColor Yellow
Write-Host " 3) Restrict the key to the Generative AI API and set application restrictions (optional but recommended)." -ForegroundColor Yellow
Write-Host " 4) Copy the API key string and paste it into the app when prompted." -ForegroundColor Yellow

Write-Host "If you prefer the gcloud CLI (advanced), first install and authenticate with gcloud." -ForegroundColor Cyan
Write-Host "Example gcloud CLI commands (you must be authenticated and have billing enabled):" -ForegroundColor Green
Write-Host "  gcloud auth login" -ForegroundColor Green
Write-Host "  gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Green
Write-Host "  gcloud services enable generativeai.googleapis.com" -ForegroundColor Green
Write-Host "  gcloud services enable iam.googleapis.com" -ForegroundColor Green
Write-Host "  gcloud services enable iamcredentials.googleapis.com" -ForegroundColor Green
Write-Host "  gcloud alpha services api-keys create --display-name='ArtDirectorAI BYOK'" -ForegroundColor Green

Write-Host "After creating the key, open the app, sign in with Google, and paste the API key into Step 3 (Link Project Key)." -ForegroundColor Cyan

Pause
