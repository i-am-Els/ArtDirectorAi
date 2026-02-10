# Static definitions of Faculties and Majors to seed the generator
# Extracted from data/curriculum.ts

SEED_FACULTIES = [
    {
        "id": 'fac-visdev',
        "code": "VISDEV",
        "name": "Faculty of Visual Development",
        "description": "Ideation, design language, and narrative visualization.",
        "majors": [
            {
                "id": 'dept-char-concept',
                "faculty_id": 'fac-visdev',
                "code": "CHAR_DES",
                "title": "Character Design",
                "role": "Character Concept Artist",
                "description": "Designing character archetypes with anatomical and narrative depth."
            },
            {
                "id": 'dept-env-concept',
                "faculty_id": 'fac-visdev',
                "code": "ENV_ART",
                "title": "Environment Design",
                "role": "Environment Concept Artist",
                "description": "World-building, layout, and lighting design."
            },
            {
                "id": 'dept-prop',
                "faculty_id": 'fac-visdev',
                "code": "PROP_DES",
                "title": "Prop & Vehicle Design",
                "role": "Prop & Vehicle Designer",
                "description": "Functional industrial and mechanical design."
            },
            {
                "id": 'dept-sb',
                "faculty_id": 'fac-visdev',
                "code": "STORYBOARD",
                "title": "Storyboard Artist",
                "role": "Storyboard Artist",
                "description": "Visualizing narrative pacing and cinematic grammar."
            },
            {
                "id": 'dept-mp',
                "faculty_id": 'fac-visdev',
                "code": "MATTE_PAINT",
                "title": "Digital Matte Painter",
                "role": "Digital Matte Painter",
                "description": "Creating realistic set extensions for film."
            },
            {
                "id": 'dept-illu',
                "faculty_id": 'fac-visdev',
                "code": "ILLUSTRATION",
                "title": "Keyframe Illustration",
                "role": "Keyframe Illustrator",
                "description": "Marketing and narrative marketing illustration."
            },
            {
                "id": 'dept-ui',
                "faculty_id": 'fac-visdev',
                "code": "UI_UX",
                "title": "UI/UX Game Artist",
                "role": "UI/UX Game Artist",
                "description": "Interactive feedback and icon systems."
            },
            {
                "id": 'dept-bg',
                "faculty_id": 'fac-visdev',
                "code": "BG_PAINT",
                "title": "Background Painter",
                "role": "Background Painter",
                "description": "Set painting for animation series."
            },
            {
                "id": 'dept-cs',
                "faculty_id": 'fac-visdev',
                "code": "COLOR_SCRIPT",
                "title": "Color & Lighting Keys",
                "role": "Color Script/Lighting Keys",
                "description": "Emotional color arc development."
            }
        ]
    },
    {
        "id": 'fac-3d',
        "code": "3D_PROD",
        "name": "Faculty of 3D Production",
        "description": "Asset creation and digital sculpting.",
        "majors": [
            {
                "id": 'dept-char-3d',
                "faculty_id": 'fac-3d',
                "code": "CHAR_3D",
                "title": "3D Character Art",
                "role": "Character Artist",
                "description": "High-fidelity sculpting and production modeling."
            },
            {
                "id": 'dept-env-3d',
                "faculty_id": 'fac-3d',
                "code": "ENV_3D",
                "title": "3D Environment Art",
                "role": "Environment Artist",
                "description": "World building and scene assembly."
            },
            {
                "id": 'dept-hs',
                "faculty_id": 'fac-3d',
                "code": "HARD_SURFACE",
                "title": "Hard Surface Modeling",
                "role": "Hard Surface Modeler",
                "description": "Mechanical modeling and clean topology."
            },
            {
                "id": 'dept-surf',
                "faculty_id": 'fac-3d',
                "code": "SURFACING",
                "title": "Texture & Surfacing",
                "role": "Texture & Material Artist",
                "description": "PBR materials and look-dev."
            },
            {
                "id": 'dept-groom',
                "faculty_id": 'fac-3d',
                "code": "GROOM",
                "title": "Grooming & Hair",
                "role": "Grooming/Hair Artist",
                "description": "Realistic hair and fur digital production."
            }
        ]
    },
    {
        "id": 'fac-anim',
        "code": "ANIMATION",
        "name": "Faculty of Animation",
        "description": "Bringing life to characters and worlds.",
        "majors": [
            {
                "id": 'dept-a2d',
                "faculty_id": 'fac-anim',
                "code": "ANIM_2D",
                "title": "2D Animation",
                "role": "2D Animator (Classical/Spine)",
                "description": "Traditional and technical 2D performance."
            },
            {
                "id": 'dept-acine',
                "faculty_id": 'fac-anim',
                "code": "ANIM_CINE",
                "title": "Cinematic Animation",
                "role": "3D Animator (Cinematic)",
                "description": "Performance and acting-driven character animation."
            },
            {
                "id": 'dept-agame',
                "faculty_id": 'fac-anim',
                "code": "ANIM_GAME",
                "title": "Gameplay Animation",
                "role": "3D Animator (Gameplay)",
                "description": "Responsive combat and locomotion cycles."
            },
            {
                "id": 'dept-rig',
                "faculty_id": 'fac-anim',
                "code": "RIGGING",
                "title": "Rigging",
                "role": "Rigging Technical Director",
                "description": "Skeletal technical deformation and control systems."
            }
        ]
    },
    {
        "id": 'fac-tech',
        "code": "TECH_ART",
        "name": "Faculty of Tech Art & VFX",
        "description": "The intersection of engineering and visual art.",
        "majors": [
            {
                "id": 'dept-sha',
                "faculty_id": 'fac-tech',
                "code": "SHADER",
                "title": "Shader & Lookdev",
                "role": "Shader/Technical Artist",
                "description": "Mathematical material rendering and real-time effects."
            },
            {
                "id": 'dept-light',
                "faculty_id": 'fac-tech',
                "code": "LIGHTING",
                "title": "Lighting & Lookdev",
                "role": "Lighting & Lookdev Artist",
                "description": "Cinematic rendering and light set extensions."
            },
            {
                "id": 'dept-vfx-p',
                "faculty_id": 'fac-tech',
                "code": "VFX_PARTICLE",
                "title": "VFX Particles",
                "role": "VFX Artist (Particles/FX)",
                "description": "Magic, fire, and kinetic particle systems."
            },
            {
                "id": 'dept-vfx-s',
                "faculty_id": 'fac-tech',
                "code": "VFX_SIM",
                "title": "VFX Simulation",
                "role": "VFX Artist (Fluid/Crowd Sim)",
                "description": "Fluid and rigid body dynamics."
            },
            {
                "id": 'dept-ta',
                "faculty_id": 'fac-tech',
                "code": "TECH_DEV",
                "title": "Technical Art",
                "role": "Technical Artist",
                "description": "Pipeline engineering and tool development."
            },
            {
                "id": 'dept-clo',
                "faculty_id": 'fac-tech',
                "code": "CLOTH_SIM",
                "title": "Cloth & Physics",
                "role": "Cloth/Physics Artist",
                "description": "Dynamic character fabric and hair behavior."
            }
        ]
    }
]
