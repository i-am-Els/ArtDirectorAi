import time
import json
import logging
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from config import API_KEYS, MODEL_NAME
from schema import Course, Subject, Lesson

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- KEY MANAGER ---
class KeyManager:
    def __init__(self, keys):
        self.keys = keys
        self.current_index = 0
        self.total_keys = len(keys)
    
    def get_current_key(self):
        return self.keys[self.current_index]

    def rotate_key(self):
        if self.total_keys <= 1:
            logger.warning("⚠️ Only one API key available. Rotation impossible.")
            return False
            
        self.current_index = (self.current_index + 1) % self.total_keys
        new_key = self.keys[self.current_index]
        logger.info(f"🔄 Rotating API Key. New Key Index: {self.current_index + 1}/{self.total_keys}")
        
        # Reconfigure global genai with new key
        genai.configure(api_key=new_key)
        return True

# Initialize Global Manager
key_manager = KeyManager(API_KEYS)
genai.configure(api_key=key_manager.get_current_key())

# Safety Settings (Block nothing)
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

class BaseAgent:
    def __init__(self, role: str, context: str):
        self.role = role
        self.context = context
        # Model instance might need refreshment if key changes, 
        # but usually `genai.configure` updates the global client used by GenerativeModel.
        # To be safe, we can re-instantiate if needed, but SDK often handles it.
        self.model = genai.GenerativeModel(MODEL_NAME)

    def generate(self, prompt: str, response_schema):
        max_retries = 5
        attempt = 0
        rotation_count = 0  # Track how many times we've rotated
        max_rotations = key_manager.total_keys  # Stop after trying all keys
        
        full_prompt = f"{self.context}\n\nTask: {prompt}"

        while attempt < max_retries:
            try:
                logger.info(f"🤖 [{self.role}] Working...")
                response = self.model.generate_content(
                    full_prompt,
                    generation_config=genai.GenerationConfig(
                        response_mime_type="application/json",
                        response_schema=response_schema
                    ),
                    safety_settings=SAFETY_SETTINGS
                )
                
                return json.loads(response.text)

            except Exception as e:
                error_str = str(e)
                
                # Check for DAILY Quota Limit (should rotate)
                if "GenerateRequestsPerDayPerProjectPerModel-FreeTier" in error_str:
                    logger.error(f"🚨 DAILY QUOTA EXCEEDED. Attempting rotation...")
                    
                    # Check if we've already tried all keys
                    if rotation_count >= max_rotations:
                        logger.error(f"❌ All {max_rotations} API keys exhausted! Stopping.")
                        raise e
                    
                    # Try to rotate
                    if key_manager.rotate_key():
                        rotation_count += 1
                        logger.info(f"🔄 Key rotated successfully. Retrying immediately... (Rotation {rotation_count}/{max_rotations})")
                        continue
                    else:
                        logger.error("❌ No more keys to rotate! Stopping.")
                        raise e
                
                # Check for RATE LIMIT (per-minute, should wait and retry with same key)
                elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(f"⏱️ Rate limit hit (per-minute/per-second). Waiting before retry...")
                    attempt += 1
                    
                    if attempt >= max_retries:
                        logger.error(f"❌ [{self.role}] Max retries reached. Giving up.")
                        raise e
                    
                    # Wait longer for rate limits (60s base)
                    wait_time = 60 + (attempt * 10)
                    logger.info(f"⏳ [{self.role}] Waiting {wait_time}s before retry (attempt {attempt}/{max_retries})...")
                    time.sleep(wait_time)
                    continue

                # Other errors - standard retry logic
                attempt += 1
                logger.error(f"⚠️ [{self.role}] Attempt {attempt} failed: {error_str}")
                
                if attempt >= max_retries:
                    logger.error(f"❌ [{self.role}] Max retries reached. Giving up.")
                    raise e
                
                # Exponential Backoff: 20s, 40s, 60s...
                wait_time = attempt * 20
                logger.info(f"⏳ [{self.role}] Waiting {wait_time}s before retry...")
                time.sleep(wait_time)

class MajorAgent(BaseAgent):
    def generate_courses(self, major_name: str, major_role: str, description: str):
        prompt = f"""
          You are the Dean of the Faculty.
          Design a comprehensive curriculum for the Major: "{major_name}" ({major_role}).
          Description: {description}.
          
          Generate a list of 10-15 distinct Courses that take a student from Beginner to Pro.
          Group them logically into "Foundations", "Production", and "Mastery" tiers.
          
          Return a list of Course objects.
        """
        # Gemini Python SDK schema definition is a bit different (uses typing objects or dicts)
        # But passing the Pydantic/Dataclass type often works with newer SDKs, or we pass the raw schema dict.
        # For simplicity in this script, we'll let Gemini infer from the prompt structure + JSON mode, 
        # or we can pass a simplified schema dict if the SDK version supports it cleanly. 
        # The Node SDK used `SchemaType`. Python SDK `genai.GenerationConfig` supports `response_schema`.
        
        # We will use the list of dicts approach which is robust.
        return self.generate(prompt, list[Course])

class CourseAgent(BaseAgent):
    def generate_subjects(self, course: dict):
        # course is a dict here (from state)
        prompt = f"""
          You are the Professor for the Course: "{course['title']}" ({course['code']}).
          Course Description: {course['description']}.
          Level: Year {course['year_level']}, Tier: {course['tier']}.
          
          Break this course down into 4-8 distinct Subjects (Modules).
          Each subject should cover a specific topic or skill within this course.
          
          Return a list of Subject objects.
        """
        return self.generate(prompt, list[Subject])

class SubjectAgent(BaseAgent):
    def generate_lessons(self, course: dict, subject: dict):
        prompt = f"""
          You are the Instructor for the Subject: "{subject['title']}" within the Course "{course['title']}".
          Subject Description: {subject['description']}.
          Learning Outcome: {subject['learning_outcome']}.
          
          Create 3-6 granular Lessons for this subject.
          Mix of READ (Theory), WATCH (Demo), and ASSIGNMENT (Practice).
          Ensure specific "estimated_effort_minutes".
          
          Return a list of Lesson objects.
        """
        return self.generate(prompt, list[Lesson])
