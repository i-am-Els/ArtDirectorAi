import os
import json
import time
from config import STATUS_FILE, SEED_FACULTIES
from agents import MajorAgent, CourseAgent, SubjectAgent
from schema import Faculty, Major, Course, Subject, Lesson
import sys

def load_state():
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, 'r') as f:
            return json.load(f)
    return None

def save_state(state):
    os.makedirs(os.path.dirname(STATUS_FILE), exist_ok=True)
    with open(STATUS_FILE, 'w') as f:
        json.dump(state, f, indent=2)
    print(f"💾 State saved to {STATUS_FILE}")

def run():
    print("🚀 Starting Python Curriculum Generator...")
    
    # 1. Load or Init State
    state = load_state()
    if not state:
        print("🌱 Initializing new state from SEED_FACULTIES...")
        # Deep copy structure to avoid mutating seed if imported directly
        state = {
            "faculties": [
                {
                    "id": fac["id"],
                    "code": fac["code"],
                    "name": fac["name"],
                    "majors": [
                        {
                            "id": maj["id"],
                            "faculty_id": fac["id"],
                            "code": maj["code"],
                            "title": maj["title"],
                            "role": maj["role"],
                            "description": maj["description"],
                             "courses": []
                        } for maj in fac["majors"]
                    ]
                } for fac in SEED_FACULTIES
            ]
        }
        save_state(state) 
    
    # Flatten majors for easier processing
    all_majors = []
    if "faculties" in state:
        for fac in state["faculties"]:
            for maj in fac["majors"]:
                all_majors.append(maj)
    elif "faculty" in state: 
        # Migration for old single-faculty state
        print("⚠️ Detected legacy state format. Migrating...")
        all_majors = state["faculty"]["majors"]

    for major in all_majors:
        print(f"\n🎓 Processing Major: {major['title']} ({major['code']})")
        
        # --- PASS 1: Generate Courses ---
        if not major['courses']:
            print(f"  📚 PASS 1: Generating Courses...")
            agent = MajorAgent("MajorAgent", "You are an expert curriculum designer.")
            
            try:
                courses_data = agent.generate_courses(major['title'], major['role'], major['description'])
                major['courses'] = [
                    {**c, "subjects": [], "is_complete": False} if isinstance(c, dict) else {**c.to_dict(), "subjects": [], "is_complete": False} 
                    for c in courses_data
                ]
                save_state(state)
                print(f"  ✅ Generated {len(major['courses'])} courses.")
            except Exception as e:
                print(f"  ❌ Failed to generate courses: {e}")
                if "429" in str(e) or "ResourceExhausted" in str(e):
                     print("🚨 QUOTA EXCEEDED. Saving and exiting.")
                     sys.exit(0)
                continue # Skip to next major
        else:
            print(f"  ⏩ PASS 1: Skipped ({len(major['courses'])} courses exist).")

        # --- PASS 2: Generate Subjects ---
        print(f"  📚 PASS 2: Checking Subjects...")
        for course in major['courses']:
             if not course.get('is_complete', False):
                print(f"    ▶ Generating Subjects for [{course['code']}]...")
                agent = CourseAgent(f"CourseAgent-{course['code']}", f"Context: {major['title']}")
                
                try:
                    subjects_data = agent.generate_subjects(course)
                    course['subjects'] = [
                        {**s, "lessons": [], "is_complete": False} if isinstance(s, dict) else {**s.to_dict(), "lessons": [], "is_complete": False}
                        for s in subjects_data
                    ]
                    course['is_complete'] = True
                    save_state(state)
                    time.sleep(1) 
                except Exception as e:
                    print(f"    ❌ Failed: {e}")
                    if "429" in str(e) or "ResourceExhausted" in str(e):
                        print("🚨 QUOTA EXCEEDED. Saving and exiting.")
                        sys.exit(0)
                    continue

        # --- PASS 3: Generate Lessons ---
        print(f"  📚 PASS 3: Checking Lessons...")
        for course in major['courses']:
            for subject in course['subjects']:
                # Check if subject is marked as complete
                if not subject.get('is_complete', False):
                    current_lessons = subject.get('lessons', [])
                    if current_lessons:
                        print(f"    ⚠️  [{course['code']}] -> {subject['title']}: Incomplete, regenerating...")
                    else:
                        print(f"    ▶ Generating Lessons for [{course['code']}] -> {subject['title']}...")
                    
                    agent = SubjectAgent(f"SubjectAgent", f"Context: {course['title']} -> {subject['title']}")
                    
                    try:
                        lessons_data = agent.generate_lessons(course, subject)
                        subject['lessons'] = [
                            l if isinstance(l, dict) else l.to_dict()
                            for l in lessons_data
                        ]
                        # Mark as complete only after successful generation
                        subject['is_complete'] = True
                        save_state(state)
                        time.sleep(1)
                    except Exception as e:
                        print(f"    ❌ Failed: {e}")
                        # Don't mark as complete on failure
                        if "429" in str(e) or "ResourceExhausted" in str(e):
                            print("🚨 QUOTA EXCEEDED. Saving and exiting.")
                            sys.exit(0)
                        continue

    print("\n✨ All passes complete.")

if __name__ == "__main__":
    run()
