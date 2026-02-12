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
                
                data = json.loads(response.text)
                
                # --- VALIDATION ---
                def validate_data(item):
                    if isinstance(item, str):
                        # Detect halluncination/looping
                        if len(item) > 1000:
                            raise ValueError(f"Field too long ({len(item)} chars). Possible hallucination.")
                        if "What is art and" in item:
                             raise ValueError("Detected corrupted loop pattern in response.")
                    elif isinstance(item, list):
                        for x in item: validate_data(x)
                    elif isinstance(item, dict):
                        for k, v in item.items(): validate_data(v)
                
                try:
                    validate_data(data)
                except ValueError as ve:
                    logger.error(f"❌ Validation failed: {ve}")
                    attempt += 1
                    wait_time = attempt * 10
                    logger.info(f"⏳ Retrying with backoff {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                return data

            except Exception as e:
                error_str = str(e)
                
                # Check for ANY Quota/Rate Limit (429 or ResourceExhausted)
                if "429" in error_str or "ResourceExhausted" in error_str or "quota" in error_str.lower():
                    logger.warning(f"⚠️ Quota or Rate Limit hit: {error_str[:100]}...")
                    
                    # Attempt to rotate before waiting
                    if rotation_count < max_rotations:
                        if key_manager.rotate_key():
                            rotation_count += 1
                            # Refresh model to ensure it uses the new key/client
                            self.model = genai.GenerativeModel(MODEL_NAME)
                            logger.info(f"🔄 Key rotated. Retrying immediately... (Rotation {rotation_count}/{max_rotations})")
                            continue
                    
                    # If we've tried all keys and still hit a limit:
                    # 1. If it's a DAILY limit, we must stop.
                    if "GenerateRequestsPerDayPerProjectPerModel-FreeTier" in error_str:
                        logger.error(f"❌ ALL API KEYS EXHAUSTED (Daily Quota). Giving up.")
                        raise e
                    
                    # 2. If it's just a RATE limit (per-minute), wait and reset rotation count
                    attempt += 1
                    if attempt >= max_retries:
                        logger.error(f"❌ [{self.role}] Max retries reached after trying all keys. Giving up.")
                        raise e
                    
                    wait_time = 60 + (attempt * 10)
                    logger.info(f"⏳ All keys hitting rate limits. Waiting {wait_time}s before reset and retry...")
                    time.sleep(wait_time)
                    rotation_count = 0 # Reset to allow another cycle through keys
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
          Use short, relative IDs (e.g. "L1", "L2", "L3").
          Provide 3-5 highly relevant "search_queries" (e.g. "character silhouette design tutorial") for each lesson.
          
          Return a list of Lesson objects.
        """
        return self.generate(prompt, list[Lesson])

    def batch_generate_lesson_queries(self, lessons_info: list[dict]):
        prompt = f"""
          For each of the following lessons, generate 3-5 high-quality YouTube/Google search queries.
          
          Lessons:
          {json.dumps(lessons_info, indent=2)}
          
          Return a list of lists of strings. The outer list must have the same length as the input lessons list. 
          Each inner list should contain 3-5 search queries for the corresponding lesson.
        """
        return self.generate(prompt, list[list[str]])
