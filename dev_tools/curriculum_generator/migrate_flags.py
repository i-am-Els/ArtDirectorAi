import json
import os

STATE_FILE = 'data/static_academy/generated/curriculum_state.json'

print("🔄 Migrating curriculum_state.json to add is_complete flags...")

# Load existing state
with open(STATE_FILE, 'r') as f:
    state = json.load(f)

# Create backup
backup_file = STATE_FILE.replace('.json', '_backup.json')
with open(backup_file, 'w') as f:
    json.dump(state, f, indent=2)
print(f"✅ Backup created: {backup_file}")

# Counters
courses_updated = 0
subjects_updated = 0

# Migrate
for faculty in state.get('faculties', []):
    for major in faculty.get('majors', []):
        for course in major.get('courses', []):
            # Add is_complete flag to courses
            if 'is_complete' not in course:
                # Course is complete if it has subjects
                course['is_complete'] = bool(course.get('subjects'))
                courses_updated += 1
            
            # Add is_complete flag to subjects
            for subject in course.get('subjects', []):
                if 'is_complete' not in subject:
                    # Subject is complete if it has lessons
                    subject['is_complete'] = bool(subject.get('lessons'))
                    subjects_updated += 1

# Save migrated state
with open(STATE_FILE, 'w') as f:
    json.dump(state, f, indent=2)

print(f"✅ Migration complete!")
print(f"   Courses updated: {courses_updated}")
print(f"   Subjects updated: {subjects_updated}")
print(f"   State saved to: {STATE_FILE}")
