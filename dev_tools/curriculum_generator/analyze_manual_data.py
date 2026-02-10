import json
import os

FILE_PATH = 'data/manual/academy_curriculum.json'

def analyze_curriculum():
    if not os.path.exists(FILE_PATH):
        print(f"Error: {FILE_PATH} not found.")
        return

    print(f"🔍 Analyzing {FILE_PATH}...")
    
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    faculty_count = 0
    major_count = 0
    course_count = 0
    subject_count = 0
    lesson_count = 0
    
    major_ids = set()
    course_ids = set()
    
    faculties = data.get('faculties', [])
    faculty_count = len(faculties)
    
    for faculty in faculties:
        majors = faculty.get('majors', [])
        major_count += len(majors)
        for major in majors:
            major_ids.add(major.get('id'))
            courses = major.get('courses', [])
            course_count += len(courses)
            for course in courses:
                course_ids.add(course.get('id'))
                subjects = course.get('subjects', [])
                subject_count += len(subjects)
                for subject in subjects:
                    lessons = subject.get('lessons', [])
                    lesson_count += len(lessons)

    out = []
    out.append("="*40)
    out.append("CURRICULUM COUNTS")
    out.append("="*40)
    out.append(f"Faculties: {faculty_count}")
    out.append(f"Majors:    {major_count}")
    out.append(f"Courses:   {course_count}")
    out.append(f"Subjects:  {subject_count}")
    out.append(f"Lessons:   {lesson_count}")
    out.append("="*40)

    # Detect Schema Differences
    out.append("\n" + "="*40)
    out.append("SCHEMA ANALYSIS (First Item Samples)")
    out.append("="*40)
    
    if faculty_count > 0:
        fac = faculties[0]
        out.append(f"Faculty keys: {list(fac.keys())}")
        if 'majors' in fac and len(fac['majors']) > 0:
            maj = fac['majors'][0]
            out.append(f"Major keys:   {list(maj.keys())}")
            if 'courses' in maj and len(maj['courses']) > 0:
                course = maj['courses'][0]
                out.append(f"Course keys:  {list(course.keys())}")
                if 'subjects' in course and len(course['subjects']) > 0:
                    sub = course['subjects'][0]
                    out.append(f"Subject keys: {list(sub.keys())}")
                    if 'lessons' in sub and len(sub['lessons']) > 0:
                        lesson = sub['lessons'][0]
                        out.append(f"Lesson keys:  {list(lesson.keys())}")
                        out.append(f"Sample Lesson: {json.dumps(lesson, indent=2)}")

    out.append("="*40)
    
    with open('dev_tools/curriculum_generator/analysis_results.txt', 'w', encoding='utf-8') as f:
        f.write("\n".join(out))
    
    print("✅ Analysis saved to dev_tools/curriculum_generator/analysis_results.txt")

if __name__ == "__main__":
    analyze_curriculum()
