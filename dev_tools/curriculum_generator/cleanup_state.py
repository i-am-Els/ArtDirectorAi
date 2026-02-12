import json
import os

STATUS_FILE = "data/static_academy/generated/curriculum_state.json"

def cleanup():
    if not os.path.exists(STATUS_FILE):
        print("File not found.")
        return

    with open(STATUS_FILE, "r") as f:
        state = json.load(f)

    corrupted_count = 0
    
    faculties = state.get("faculties", [])
    for fac in faculties:
        for maj in fac.get("majors", []):
            for course in maj.get("courses", []):
                for subject in course.get("subjects", []):
                    lessons = subject.get("lessons", [])
                    is_corrupted = False
                    
                    # Check for corruption
                    for lesson in lessons:
                        title = str(lesson.get("title", ""))
                        if "What is art and" in title or len(title) > 500:
                            is_corrupted = True
                            break
                    
                    if is_corrupted:
                        print(f"🧹 resetting corrupted subject: {subject.get('title')} ({subject.get('id')})")
                        subject["lessons"] = []
                        subject["is_complete"] = False
                        subject["resources_complete"] = False
                        corrupted_count += 1

    if corrupted_count > 0:
        with open(STATUS_FILE, "w") as f:
            json.dump(state, f, indent=2)
        print(f"✅ Cleaned up {corrupted_count} subjects.")
    else:
        print("✨ No corruption found.")

if __name__ == "__main__":
    cleanup()
