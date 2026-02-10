import json

# Load the state file
with open('data/static_academy/generated/curriculum_state.json', 'r') as f:
    data = json.load(f)

print("=" * 60)
print("CURRICULUM GENERATION PROGRESS REPORT")
print("=" * 60)

total_faculties = len(data['faculties'])
total_majors = 0
total_courses = 0
total_subjects = 0
total_lessons = 0

for fac in data['faculties']:
    fac_majors = len(fac['majors'])
    total_majors += fac_majors
    
    print(f"\n📚 {fac['name']}")
    print(f"   Majors: {fac_majors}")
    
    for maj in fac['majors']:
        courses = len(maj['courses'])
        total_courses += courses
        
        subjects = sum(len(c.get('subjects', [])) for c in maj['courses'])
        total_subjects += subjects
        
        lessons = sum(len(s.get('lessons', [])) for c in maj['courses'] for s in c.get('subjects', []))
        total_lessons += lessons
        
        if courses > 0:
            print(f"   ✅ {maj['title']}: {courses} courses, {subjects} subjects, {lessons} lessons")
        else:
            print(f"   ⏸️  {maj['title']}: Not started")

print("\n" + "=" * 60)
print("TOTALS")
print("=" * 60)
print(f"Faculties: {total_faculties}")
print(f"Majors: {total_majors}")
print(f"Courses: {total_courses}")
print(f"Subjects: {total_subjects}")
print(f"Lessons: {total_lessons}")
print("=" * 60)
