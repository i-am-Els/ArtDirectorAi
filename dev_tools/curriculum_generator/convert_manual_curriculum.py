import json
import os
import re

INPUT_FILE = 'data/manual/academy_curriculum.json'
OUTPUT_FILE = 'data/static_academy/generated/curriculum_state.json' # Overwriting or merging?
# Actually I'll write to a new file first to be safe
FINAL_OUTPUT = 'data/static_academy/manual_import.json'

def slugify(text):
    return re.sub(r'[\W_]+', '-', text.lower()).strip('-')

def convert():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found.")
        return

    print(f"🚀 Converting {INPUT_FILE}...")
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        input_data = json.load(f)

    faculties_out = []
    
    for fac in input_data.get('faculties', []):
        fac_id = fac.get('id')
        # Map code from ID if possible
        fac_code = fac_id.replace('fac-', '').upper() if fac_id.startswith('fac-') else fac_id.upper()
        
        fac_node = {
            "id": fac_id,
            "code": fac_code,
            "name": fac.get('name'),
            "majors": []
        }
        
        for maj in fac.get('majors', []):
            maj_id = maj.get('id')
            # Extract code from ID
            maj_code = maj_id.replace('major-', '').replace('-', '_').upper()
            
            maj_node = {
                "id": maj_id,
                "faculty_id": fac_id,
                "code": maj_code,
                "title": maj.get('title'),
                "role": maj.get('role'),
                "description": maj.get('description', f"Professional path for {maj.get('title')} experts."),
                "courses": []
            }
            
            for c_idx, course in enumerate(maj.get('courses', [])):
                # Course ID needs to be unique. Friend used c1, c2 etc.
                c_id_raw = course.get('id')
                c_id = f"{maj_id}-{c_id_raw}"
                
                # Generate a code like CD101
                # CD (from Major) + 101, 102 etc.
                major_prefix = "".join([w[0] for w in maj.get('title').split()]).upper()
                year_str = course.get('level', 'Year 1').replace('Year ', '')
                try:
                    year_val = int(year_str)
                except:
                    year_val = 1
                
                c_code = f"{major_prefix}{year_val}0{c_idx + 1}"
                
                # Map Level to Tier
                tier = 'Foundations'
                if year_val == 2: tier = 'Production'
                elif year_val >= 3: tier = 'Mastery'

                course_node = {
                    "id": c_id,
                    "code": c_code,
                    "title": course.get('title'),
                    "description": course.get('description', ""),
                    "year_level": year_val,
                    "is_core": True,
                    "tier": tier,
                    "subjects": [],
                    "is_complete": True
                }
                
                for s_idx, subject in enumerate(course.get('subjects', [])):
                    s_id_raw = subject.get('id')
                    s_id = f"{c_id}-{s_id_raw}"
                    
                    subject_node = {
                        "id": s_id,
                        "title": subject.get('title'),
                        "description": subject.get('description', ""),
                        "learning_outcome": subject.get('learningOutcome', "Mastery of " + subject.get('title')),
                        "order_index": s_idx + 1,
                        "lessons": [],
                        "is_complete": True
                    }
                    
                    for l_idx, lesson in enumerate(subject.get('lessons', [])):
                        l_id_raw = lesson.get('id')
                        # If ID is missing or weak, slugify title
                        if not l_id_raw:
                            l_id_raw = slugify(lesson.get('title'))
                        
                        l_id = f"{s_id}-{l_id_raw}"
                        
                        lesson_node = {
                            "id": l_id,
                            "title": lesson.get('title'),
                            "objective": lesson.get('objective'),
                            "lesson_type": "ASSIGNMENT", # Default
                            "default_study_mode": lesson.get('mode', 'MILEAGE').upper(),
                            "estimated_effort_minutes": lesson.get('durationMinutes', 45),
                            "order_index": l_idx + 1,
                            "search_queries": lesson.get('searchKeywords', [])
                        }
                        subject_node["lessons"].append(lesson_node)
                    
                    course_node["subjects"].append(subject_node)
                
                maj_node["courses"].append(course_node)
            
            fac_node["majors"].append(maj_node)
        
        faculties_out.append(fac_node)

    output_data = {
        "faculties": faculties_out
    }

    os.makedirs(os.path.dirname(FINAL_OUTPUT), exist_ok=True)
    with open(FINAL_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)

    print(f"✅ Conversion complete! Written to {FINAL_OUTPUT}")
    print(f"   Processed {len(faculties_out)} faculties.")

if __name__ == "__main__":
    convert()
