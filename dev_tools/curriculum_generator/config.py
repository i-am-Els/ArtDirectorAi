import os
import sys
from dotenv import load_dotenv

# Load .env.local first, then .env
# We need to go up two levels to find the root .env files from dev_tools/curriculum_generator
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ENV_LOCAL_PATH = os.path.join(BASE_DIR, '.env.local')
ENV_PATH = os.path.join(BASE_DIR, '.env')

load_dotenv(ENV_LOCAL_PATH)
load_dotenv(ENV_PATH)

# Load multiple keys if available, otherwise fallback to single
API_KEYS_STR = os.getenv("GEMINI_API_KEYS")
if API_KEYS_STR:
    API_KEYS = [k.strip() for k in API_KEYS_STR.split(',') if k.strip()]
else:
    # Fallback to single key
    single_key = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    API_KEYS = [single_key] if single_key else []

MODEL_NAME = "gemini-2.5-flash" 

if not API_KEYS:
    print(f"❌ Error: No API Keys found in GEMINI_API_KEYS or VITE_GEMINI_API_KEY.")
    sys.exit(1)

OUTPUT_DIR = os.path.join(BASE_DIR, 'data', 'static_academy', 'generated')
STATUS_FILE = os.path.join(OUTPUT_DIR, 'curriculum_state.json')

# Import the seed data
try:
    from seed_data import SEED_FACULTIES
except ImportError:
    # Fallback to empty if file not found (shouldn't happen)
    SEED_FACULTIES = []

print(f"🔧 Config Loaded. Model: {MODEL_NAME}")
print(f"📂 Output Dir: {OUTPUT_DIR}")
