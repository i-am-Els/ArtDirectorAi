
import { Faculty, ArtRole, AcademyMajor } from '../types';

export const ACADEMY_FACULTIES: Faculty[] = [
    {
        id: 'fac-visdev',
        name: "Faculty of Visual Development",
        icon: "🎨",
        color: "#60a5fa",
        description: "Ideation, design language, and narrative visualization.",
        majors: [
            {
                id: 'dept-char-concept',
                title: "Character Design",
                role: ArtRole.CONCEPT_CHAR,
                description: "Designing character archetypes with anatomical and narrative depth.",
                software: ["Photoshop", "Clip Studio", "Procreate", "PureRef", "ZBrush (Basic)"],
                outcomes: ["Lead Character Designer", "Visual Development Artist"],
                courses: [
                    {
                        id: 'cc-1', title: "Foundation: Dynamic Sketching", tier: 'Foundations',
                        description: "Mastering line confidence, shape manipulation, and observation.",
                        lessons: [
                            { id: 'l1', title: "Line Economy & Confidence", focusDescription: "Ghosting lines and committing to marks", suggestedMileage: "50 pages", searchQueries: ["dynamic sketching peter han", "drawabox lesson 1", "scott robertson drawing basics"] },
                            { id: 'l2', title: "Primitive Form Manipulation", focusDescription: "Rotation of cubes, cylinders, spheres in space", suggestedMileage: "100 forms", searchQueries: ["drawabox 250 box challenge", "perspective primitive rotation", "moderndayjames perspective"] },
                            { id: 'l3', title: "Organic Intersections", focusDescription: "Combining hard and soft forms", suggestedMileage: "20 insects", searchQueries: ["drawabox organic intersections", "insect drawing construction", "texture sketching"] }
                        ]
                    },
                    {
                        id: 'cc-2', title: "Analytical Anatomy", tier: 'Foundations',
                        description: "The mechanical engineering of the human form.",
                        lessons: [
                            { id: 'l4', title: "The Skeletal Armature", focusDescription: "Bony landmarks and proportions", suggestedMileage: "1 skeletons", searchQueries: ["proko skeleton anatomy", "gottfried bammes skeleton", "landmark anatomy"] },
                            { id: 'l5', title: "Torso Mechanics", focusDescription: "The bean, the box, and muscle layering", suggestedMileage: "20 torsos", searchQueries: ["proko torso anatomy", "michael hampton torso drawings", "anatomy muscle origins insertions"] },
                            { id: 'l6', title: "Head & Hands Construction", focusDescription: "Planes of the face and finger articulation", suggestedMileage: "50 hands", searchQueries: ["reilly method head", "bridgman hand construction", "kevin chen head drawing"] }
                        ]
                    },
                    {
                        id: 'cc-3', title: "Design & Story", tier: 'Production',
                        description: "Translating narrative prompts into visual language.",
                        lessons: [
                            { id: 'l7', title: "Shape Language & Archetypes", focusDescription: "Circle(Good), Square(Stable), Triangle(Danger)", suggestedMileage: "3 lineups", searchQueries: ["shape language character design", "character archetypes guide", "bouba kiki effect design"] },
                            { id: 'l8', title: "Costume History & Function", focusDescription: "Analyzing folds, fabrics, and historical eras", suggestedMileage: "10 studies", searchQueries: ["costume design history timeline", "drawing drapery folds", "fashion history for concept art"] },
                            { id: 'l9', title: "Acting & Expression", focusDescription: "Gesture drawing for emotion", suggestedMileage: "20 expressions", searchQueries: ["force drawing expressions", "character design acting sheet", "stephen silver character design"] }
                        ]
                    },
                    {
                        id: 'cc-4', title: "Production Pipeline", tier: 'Production',
                        description: "Preparing designs for 3D modelers and animators.",
                        lessons: [
                            { id: 'l10', title: "The Orthographic Turnaround", focusDescription: "Front, Side, Back (Neutral Pose)", suggestedMileage: "3 turns", searchQueries: ["character turnaround sheet tutorial", "model sheet production", "t-pose vs a-pose"] },
                            { id: 'l11', title: "Material & Detail Callouts", focusDescription: "Explaining buckles, stitching, surfaces", suggestedMileage: "5 callouts", searchQueries: ["concept art callout sheet", "material rendering tutorial", "prop breakdown sheet"] },
                            { id: 'l12', title: "Color Variations", focusDescription: "Palette testing and readability", suggestedMileage: "10 variants", searchQueries: ["color theory character design", "value composition", "color scripting basics"] }
                        ]
                    },
                    {
                        id: 'cc-5', title: "Professional Portfolio", tier: 'Mastery',
                        description: "Creating a cohesive IP pitch.",
                        lessons: [
                            { id: 'l13', title: "The Hero Lineup", focusDescription: "5 Character team with size relationships", suggestedMileage: "1 full lineup", searchQueries: ["artstation portfolio review character", "character lineup composition", "visual development project pitch"] },
                            { id: 'l14', title: "Creature Companion", focusDescription: "Applying anatomy to imaginary beasts", suggestedMileage: "3 creatures", searchQueries: ["whitlatch creature anatomy", "animal anatomy for artists", "terryl whitlatch creature design"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-env-concept',
                title: "Environment Design",
                role: ArtRole.CONCEPT_ENV,
                description: "World-building, layout, and lighting design.",
                software: ["Photoshop", "Blender", "Unreal Engine 5", "SketchUp"],
                outcomes: ["Environment Concept Artist", "Matte Painter"],
                courses: [
                    {
                        id: 'env-1', title: "Perspective & Structure", tier: 'Foundations',
                        description: "Mastering 1, 2, and 3 point perspective grids.",
                        lessons: [
                            { id: 'l15', title: "1 & 2 Point Construction", focusDescription: "Drawing rooms and boxes accurately", suggestedMileage: "20 layouts", searchQueries: ["how to draw in 1 point perspective", "scott robertson perspective", "feng zhu design cinema perspective"] },
                            { id: 'l16', title: "3 Point & Verticality", focusDescription: "Looking up/down at skyscrapers", suggestedMileage: "10 cityscapes", searchQueries: ["3 point perspective tutorial", "dynamic camera angles drawing", "curvilinear perspective"] }
                        ]
                    },
                    {
                        id: 'env-2', title: "Composition & Value", tier: 'Foundations',
                        description: "Guiding the eye through the frame.",
                        lessons: [
                            { id: 'l17', title: "Value Grouping (Notan)", focusDescription: "Reading images clearly in Black & White", suggestedMileage: "50 thumbnails", searchQueries: ["notan explained art", "value grouping composition", "film study composition"] },
                            { id: 'l18', title: "Cinematic Lenses", focusDescription: "Wide angle (Epic) vs Telephoto (Intimate)", suggestedMileage: "20 shots", searchQueries: ["focal length for concept art", "cinematography composition guide", "framing shot types"] }
                        ]
                    },
                    {
                        id: 'env-3', title: "Nature & Architecture", tier: 'Production',
                        description: "Understanding construction materials and geology.",
                        lessons: [
                            { id: 'l19', title: "Rocks, Trees, & Water", focusDescription: "Organic texturing and forms", suggestedMileage: "30 studies", searchQueries: ["drawing rocks and stone", "painting foliage tutorial", "water reflection painting"] },
                            { id: 'l20', title: "Architectural Styles", focusDescription: "Gothic vs Brutalist vs Sci-Fi", suggestedMileage: "10 buildings", searchQueries: ["architectural styles for artists", "designing fantasy architecture", "kitbashing architecture"] }
                        ]
                    },
                    {
                        id: 'env-4', title: "The 3D Workflow", tier: 'Production',
                        description: "Using Blender for complex blockouts.",
                        lessons: [
                            { id: 'l21', title: "Modular Blocking", focusDescription: "Greyboxing a level layout", suggestedMileage: "3 levels", searchQueries: ["blender blockout tutorial", "environment design 3d base", "megascans workflow"] },
                            { id: 'l22', title: "Paintover Techniques", focusDescription: "Photobashing over a 3D render", suggestedMileage: "5 paintovers", searchQueries: ["photobashing tutorial blender", "matte painting basics", "environment concept art process"] }
                        ]
                    },
                    {
                        id: 'env-5', title: "Mastery: World Bible", tier: 'Mastery',
                        description: "Designing a complete location packet.",
                        lessons: [
                            { id: 'l23', title: "The Establishing Shot", focusDescription: "The 'Wow' moment of a film/game", suggestedMileage: "1 masterpiece", searchQueries: ["establishing shot concept art", "epic environment painting", "visual storytelling environment"] },
                            { id: 'l24', title: "Prop & Set Dressing", focusDescription: "Lived-in details and history", suggestedMileage: "10 props", searchQueries: ["set dressing concept art", "environmental storytelling", "prop placement guide"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-prop',
                title: "Prop & Vehicle Design",
                role: ArtRole.CONCEPT_PROP,
                description: "Functional industrial and mechanical design.",
                software: ["Fusion 360", "Blender", "Photoshop", "Sketchbook Pro"],
                outcomes: ["Hard Surface Designer", "Prop Artist"],
                courses: [
                    {
                        id: 'prop-1', title: "Mechanical Logic", tier: 'Foundations',
                        description: "How things work: Pivots, hinges, and engines.",
                        lessons: [
                            { id: 'l_p1', title: "Basic Perspective & Primitive Wrapping", focusDescription: "Ellipses in perspective", suggestedMileage: "50 pages", searchQueries: ["drawing ellipses in perspective", "scott robertson vehicle sketching", "drawabox wheels"] },
                            { id: 'l_p2', title: "Joints and Articulation", focusDescription: "How parts move and connect", suggestedMileage: "20 joints", searchQueries: ["mechanical joint design", "robot joint tutorial", "industrial design sketching basics"] }
                        ]
                    },
                    {
                        id: 'prop-2', title: "Industrial Design Language", tier: 'Production',
                        description: "Form follows function.",
                        lessons: [
                            { id: 'l_p3', title: "Greebles & Detailing", focusDescription: "Adding believable complexity", suggestedMileage: "10 panels", searchQueries: ["greeble design tutorial", "hard surface detailing", "sci fi panel design"] }
                        ]
                    },
                    {
                        id: 'prop-3', title: "Vehicle Architecture", tier: 'Mastery',
                        description: "Designing believable vehicles.",
                        lessons: [
                            { id: 'l_p4', title: "The Chassis", focusDescription: "Frame and suspension logic", suggestedMileage: "5 chassis", searchQueries: ["vehicle design chassis", "car frame sketching", "suspension logic for artists"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-sb',
                title: "Storyboard Artist",
                role: ArtRole.STORYBOARD,
                description: "Visualizing narrative pacing and cinematic grammar.",
                software: ["Storyboard Pro", "TVPaint", "Photoshop"],
                outcomes: ["Storyboard Artist", "Director"],
                courses: [
                    {
                        id: 'sb-1', title: "Cinematic Vocabulary", tier: 'Foundations',
                        description: "Language of the camera.",
                        lessons: [
                            { id: 'l_sb1', title: "Shot Types & Angles", focusDescription: "Wide, Medium, Close-up, Dutch", suggestedMileage: "50 frames", searchQueries: ["film shot types guide", "camera angles composition", "storyboard basics"] }
                        ]
                    },
                    {
                        id: 'sb-2', title: "Continuity & Cutting", tier: 'Production',
                        description: "Editing in the mind's eye.",
                        lessons: [
                            { id: 'l_sb2', title: "The 180 Line", focusDescription: "Spatial geography", suggestedMileage: "10 sequences", searchQueries: ["180 degree rule cinematography", "crossing the line film", "screen direction tutorial"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-mp',
                title: "Digital Matte Painter",
                role: ArtRole.MATTE_PAINTING,
                description: "Creating realistic set extensions for film.",
                software: ["Nuke", "Photoshop", "Maya", "Clarisse"],
                outcomes: ["Matte Painter", "Environment TD"],
                courses: [
                    {
                        id: 'mp-1', title: "Photorealism Basics", tier: 'Foundations',
                        description: "Matching light, shadow, and grain.",
                        lessons: [
                            { id: 'l_mp1', title: "Plate Integration", focusDescription: "Matching black levels and perspective", suggestedMileage: "5 plates", searchQueries: ["matte painting plate integration", "nuke black point matching", "photoshop perspective match"] }
                        ]
                    },
                    {
                        id: 'mp-2', title: "2.5D Projection", tier: 'Production',
                        description: "Camera mapping for parallax.",
                        lessons: [
                            { id: 'l_mp2', title: "Camera Projection Setup", focusDescription: "Nuke/Maya projection workflow", suggestedMileage: "3 shots", searchQueries: ["nuke camera projection tutorial", "maya camera mapping", "2.5d matte painting"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-illu',
                title: "Keyframe Illustration",
                role: ArtRole.ILLUSTRATION,
                description: "Marketing and narrative marketing illustration.",
                software: ["Photoshop", "Corel Painter", "Blender"],
                outcomes: ["Keyframe Illustrator", "Splash Artist"],
                courses: [
                    {
                        id: 'ill-1', title: "Compositional Storytelling", tier: 'Foundations',
                        description: "Directing the viewer's eye.",
                        lessons: [
                            { id: 'l_ill1', title: "Value Hierarchy", focusDescription: "Reading order control", suggestedMileage: "20 thumbnails", searchQueries: ["composition value hierarchy", "illustration focal point", "directing the eye art"] }
                        ]
                    },
                    {
                        id: 'ill-2', title: "Rendering Materials", tier: 'Production',
                        description: "Painting light on surfaces.",
                        lessons: [
                            { id: 'l_ill2', title: "Subsurface Scattering", focusDescription: "Skin and wax", suggestedMileage: "10 spheres", searchQueries: ["painting subsurface scattering", "skin rendering tutorial", "material rendering art"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-ui',
                title: "UI/UX Game Artist",
                role: ArtRole.UI_UX,
                description: "Interactive feedback and icon systems.",
                software: ["Figma", "Adobe XD", "Photoshop", "Illustrator"],
                outcomes: ["UI Artist", "UX Designer"],
                courses: [
                    {
                        id: 'ui-1', title: "Visual Communication", tier: 'Foundations',
                        description: "Clarity and hierarchy.",
                        lessons: [
                            { id: 'l_ui1', title: "Iconography & Shape", focusDescription: "Readability at small scales", suggestedMileage: "50 icons", searchQueries: ["game icon design tutorial", "vector art for games", "ui shape language"] }
                        ]
                    },
                    {
                        id: 'ui-2', title: "Diegetic Interfaces", tier: 'Production',
                        description: "UI that exists in the game world.",
                        lessons: [
                            { id: 'l_ui2', title: "Holograms & screens", focusDescription: "Floating UI integration", suggestedMileage: "5 screens", searchQueries: ["diegetic ui design", "dead space ui analysis", "scifi ui tutorial"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-bg',
                title: "Background Painter",
                role: ArtRole.BG_PAINTER,
                description: "Set painting for animation series.",
                software: ["Photoshop", "Clip Studio", "TVPaint"],
                outcomes: ["BG Painter", "Color Stylist"],
                courses: [
                    {
                        id: 'bg-1', title: "Style Matching", tier: 'Foundations',
                        description: "Adapting to show bibles.",
                        lessons: [
                            { id: 'l_bg1', title: "Line vs Lineless", focusDescription: "Analyzing production styles", suggestedMileage: "5 styles", searchQueries: ["background painting styles", "ghibli background tutorial", "cartoon network background art"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-cs',
                title: "Color & Lighting Keys",
                role: ArtRole.COLOR_SCRIPT,
                description: "Emotional color arc development.",
                software: ["Photoshop", "Procreate"],
                outcomes: ["Color Script Artist", "Art Director"],
                courses: [
                    {
                        id: 'cs-1', title: "Color Psychology", tier: 'Foundations',
                        description: "Emotion through palette.",
                        lessons: [
                            { id: 'l_cs1', title: "Warm vs Cool", focusDescription: "Temperature contrast", suggestedMileage: "20 keys", searchQueries: ["color script tutorial", "emotional color theory film", "pixar color scripts"] }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'fac-3d',
        name: "Faculty of 3D Production",
        icon: "🧱",
        color: "#a855f7",
        description: "Asset creation and digital sculpting.",
        majors: [
            {
                id: 'dept-char-3d',
                title: "3D Character Art",
                role: ArtRole.CHARACTER_3D,
                description: "High-fidelity sculpting and production modeling.",
                software: ["ZBrush", "Maya", "3DCoat", "Marvelous Designer"],
                outcomes: ["Character Artist", "Digital Sculptor"],
                courses: [
                    {
                        id: 'c3d-1', title: "ZBrush Form Logic", tier: 'Foundations',
                        description: "Mastering primary and secondary shapes.",
                        lessons: [
                            { id: 'l19', title: "Anatomy Blockouts", focusDescription: "Proportions and massing", suggestedMileage: "10 heads", searchQueries: ["zbrush anatomy blockout", "sculpting head planes", "primary shapes zbrush"] },
                            { id: 'l_c3d2', title: "Planar Slicing", focusDescription: "Defining sharp planes in organic forms", suggestedMileage: "5 busts", searchQueries: ["planar sculpting zbrush", "planes of the face", "dam standard brush techniques"] }
                        ]
                    },
                    {
                        id: 'c3d-2', title: "Production Topology", tier: 'Production',
                        description: "Deformation-ready mesh creation.",
                        lessons: [
                            { id: 'l20', title: "Facial Loop Mastery", focusDescription: "Topology for blinks and smiles", suggestedMileage: "3 faces", searchQueries: ["face topology guide", "edge flow for animation", "retopology maya tutorial"] },
                            { id: 'l_c3d4', title: "Body Edge Flow", focusDescription: "Joint deformation zones", suggestedMileage: "2 bodies", searchQueries: ["limb topology deformation", "shoulder topology guide", "hip joint edge flow"] }
                        ]
                    },
                    {
                        id: 'c3d-3', title: "High-Freq Detailing", tier: 'Mastery',
                        description: "Pores, wrinkles, and micro-surface.",
                        lessons: [
                            { id: 'l_c3d5', title: "Skin Alphas & Noise", focusDescription: "Realistic skin texture", suggestedMileage: "3 portraits", searchQueries: ["zbrush skin alphas", "mari skin texturing", "xyz texturing workflow"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-env-3d',
                title: "3D Environment Art",
                role: ArtRole.ENVIRONMENT_3D,
                description: "World building and scene assembly.",
                software: ["UE5", "Unity", "Maya", "SpeedTree"],
                outcomes: ["Environment Artist", "Level Artist"],
                courses: [
                    {
                        id: 'e3d-1', title: "Modular Kit Design", tier: 'Foundations',
                        description: "Efficiency through reusable grid-snapping kits.",
                        lessons: [
                            { id: 'l21', title: "Trim Sheet Workflow", focusDescription: "Maximizing texel density", suggestedMileage: "1 sheet", searchQueries: ["trim sheet tutorial ue5", "modular environment design", "uv mapping trim sheets"] },
                            { id: 'l_e3d2', title: "Tileable Textures", focusDescription: "Seamless world materials", suggestedMileage: "5 materials", searchQueries: ["seamless texture creation", "substance designer tileable", "material layering"] }
                        ]
                    },
                    {
                        id: 'e3d-2', title: "Engine Integration", tier: 'Production',
                        description: "Optimized scene assembly.",
                        lessons: [
                            { id: 'l_e3d3', title: "LODs & Collision", focusDescription: "Performance optimization", suggestedMileage: "1 kit", searchQueries: ["ue5 lod generation", "collision mesh creation", "game optimization 3d"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-hs',
                title: "Hard Surface Modeling",
                role: ArtRole.HARD_SURFACE,
                description: "Mechanical modeling and clean topology.",
                software: ["Blender", "Maya", "ZBrush", "Plasticity"],
                outcomes: ["Vehicle Artist", "Prop Modeler"],
                courses: [
                    {
                        id: 'hs-1', title: "Sub-D Perfection", tier: 'Foundations',
                        description: "Edge tension and flow control.",
                        lessons: [
                            { id: 'l22', title: "Boolean Management", focusDescription: "Cleaning topology after booleans", suggestedMileage: "5 props", searchQueries: ["hard surface topology cleaning", "boolean workflow blender", "subdivision surface modeling guide"] }
                        ]
                    },
                    {
                        id: 'hs-2', title: "CAD Workflows", tier: 'Production',
                        description: "NURBS based modeling.",
                        lessons: [
                            { id: 'l_hs2', title: "Plasticity/Fusion Basics", focusDescription: "Fillets and chamfers", suggestedMileage: "3 objects", searchQueries: ["plasticity 3d tutorial", "moi3d basics", "cad to poly workflow"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-surf',
                title: "Texture & Surfacing",
                role: ArtRole.SURFACING_ARTIST,
                description: "PBR materials and look-dev.",
                software: ["Substance Painter", "Substance Designer", "Marmoset Toolbag"],
                outcomes: ["Surfacing Artist", "Texture Artist"],
                courses: [
                    {
                        id: 'tx-1', title: "PBR Material Theory", tier: 'Foundations',
                        description: "Roughness, Albedo, and Metalness logic.",
                        lessons: [
                            { id: 'l23', title: "Weathering Logic", focusDescription: "Procedural dirt and rust", suggestedMileage: "5 spheres", searchQueries: ["pbr material guide", "substance painter weathering tutorial", "roughness map explanation"] }
                        ]
                    },
                    {
                        id: 'tx-2', title: "Procedural Material Creation", tier: 'Production',
                        description: "Node-based texture generation.",
                        lessons: [
                            { id: 'l_tx2', title: "Pattern Generation", focusDescription: "Creating complex weaves and tiles", suggestedMileage: "5 materials", searchQueries: ["substance designer tutorial", "procedural texture nodes", "material graph basics"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-groom',
                title: "Grooming & Hair",
                role: ArtRole.GROOMING,
                description: "Realistic hair and fur digital production.",
                software: ["XGen", "Houdini", "Ornatrix"],
                outcomes: ["Grooming Artist", "Character TD"],
                courses: [
                    {
                        id: 'gr-1', title: "Strand & Clump Logic", tier: 'Foundations',
                        description: "Creating believable hair volume.",
                        lessons: [
                            { id: 'l24', title: "Hair Card Creation", focusDescription: "Optimized game-ready hair", suggestedMileage: "1 groom", searchQueries: ["hair cards tutorial blender", "realtime hair grooming", "xgen basics"] }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'fac-anim',
        name: "Faculty of Animation",
        icon: "🎬",
        color: "#f43f5e",
        description: "Bringing life to characters and worlds.",
        majors: [
            {
                id: 'dept-a2d',
                title: "2D Animation",
                role: ArtRole.ANIMATION_2D,
                description: "Traditional and technical 2D performance.",
                software: ["ToonBoom Harmony", "Spine", "Live2D", "TVPaint"],
                outcomes: ["2D Animator", "Spine Rigger"],
                courses: [
                    {
                        id: 'a2d-1', title: "Deformation & Squash", tier: 'Foundations',
                        description: "Foundational principles of movement.",
                        lessons: [
                            { id: 'l25', title: "Weight Shift", focusDescription: "Center of gravity transition", suggestedMileage: "10 loops", searchQueries: ["animation squash and stretch tutorial", "weight shift animation", "12 principles of animation"] },
                            { id: 'l_a2d2', title: "The Bouncing Ball", focusDescription: "Timing and spacing mastery", suggestedMileage: "20 bounces", searchQueries: ["bouncing ball animation tutorial", "timing and spacing animation", "animation charts"] }
                        ]
                    },
                    {
                        id: 'a2d-2', title: "Character Performance", tier: 'Production',
                        description: "Acting and dialogue.",
                        lessons: [
                            { id: 'l_a2d3', title: "Lip Sync Basics", focusDescription: "Mouth shapes and phonemes", suggestedMileage: "5 lines", searchQueries: ["lip sync animation tutorial", "mouth chart animation", "dialogue animation"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-acine',
                title: "Cinematic Animation",
                role: ArtRole.ANIMATION_CINEMATIC,
                description: "Performance and acting-driven character animation.",
                software: ["Maya", "MotionBuilder"],
                outcomes: ["Animator", "Previs Artist"],
                courses: [
                    {
                        id: 'acin-1', title: "Body Mechanics", tier: 'Foundations',
                        description: "Mastering weight, balance, and force.",
                        lessons: [
                            { id: 'l26', title: "Bipedal Walk Cycles", focusDescription: "Contact and passing positions", suggestedMileage: "5 cycles", searchQueries: ["walk cycle animation tutorial", "body mechanics animation", "maya animation basics"] }
                        ]
                    },
                    {
                        id: 'acin-2', title: "Advanced Acting", tier: 'Mastery',
                        description: "Subtext and micro-expressions.",
                        lessons: [
                            { id: 'l_acin2', title: "Monologue Performance", focusDescription: "Emotional shift", suggestedMileage: "1 shot", searchQueries: ["acting for animators", "facial animation tutorial", "reference for animation acting"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-agame',
                title: "Gameplay Animation",
                role: ArtRole.ANIMATION_GAMEPLAY,
                description: "Responsive combat and locomotion cycles.",
                software: ["Maya", "Unreal Engine"],
                outcomes: ["Gameplay Animator"],
                courses: [
                    {
                        id: 'agam-1', title: "Responsive Locomotion", tier: 'Foundations',
                        description: "Designing for input responsiveness.",
                        lessons: [
                            { id: 'l27', title: "Hit Reactions", focusDescription: "Impact and recovery frames", suggestedMileage: "3 sets", searchQueries: ["gameplay animation tutorial", "animation hit reaction", "unreal engine animation blueprint"] }
                        ]
                    },
                    {
                        id: 'agam-2', title: "Combat Systems", tier: 'Production',
                        description: "Attacks, blocks, and cancels.",
                        lessons: [
                            { id: 'l_agam2', title: "3-Hit Combo", focusDescription: "Flow and readability", suggestedMileage: "5 combos", searchQueries: ["combat animation tutorial", "game animation attacks", "anticipation impact recovery"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-rig',
                title: "Rigging",
                role: ArtRole.RIGGING,
                description: "Skeletal technical deformation and control systems.",
                software: ["Maya", "Python", "Blender"],
                outcomes: ["Rigging TD", "Technical Artist"],
                courses: [
                    {
                        id: 'rig-1', title: "Skeletal Hierarchies", tier: 'Foundations',
                        description: "Joint orientation and rigging math.",
                        lessons: [
                            { id: 'l28', title: "IK/FK Switch Systems", focusDescription: "Building robust controls", suggestedMileage: "1 biped rig", searchQueries: ["maya rigging tutorial", "ik fk switch python", "joint orientation guide"] }
                        ]
                    },
                    {
                        id: 'rig-2', title: "Deformation Systems", tier: 'Production',
                        description: "Skinning and corrective shapes.",
                        lessons: [
                            { id: 'l_rig2', title: "Corrective Blendshapes", focusDescription: "Fixing joint collapsing", suggestedMileage: "1 shoulder", searchQueries: ["blendshape rigging tutorial", "corrective shapes maya", "rbf solver rigging"] }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'fac-tech',
        name: "Faculty of Tech Art & VFX",
        icon: "⚙️",
        color: "#10b981",
        description: "The intersection of engineering and visual art.",
        majors: [
            {
                id: 'dept-sha',
                title: "Shader & Lookdev",
                role: ArtRole.SHADER_ARTIST,
                description: "Mathematical material rendering and real-time effects.",
                software: ["HLSL", "GLSL", "Unreal Engine Shader Graph", "Amplify"],
                outcomes: ["Shader Artist", "Technical Artist"],
                courses: [
                    {
                        id: 'sh-1', title: "Real-time Shader Math", tier: 'Foundations',
                        description: "UV distortion and panner logic.",
                        lessons: [
                            { id: 'l29', title: "Vector Operations", focusDescription: "Dot and Cross product in shading", suggestedMileage: "5 shaders", searchQueries: ["shader graph tutorial", "dot product explanation gamedev", "uv manipulation shader"] }
                        ]
                    },
                    {
                        id: 'sh-2', title: "Advanced Effects", tier: 'Mastery',
                        description: "Raymarching and volumetric rendering.",
                        lessons: [
                            { id: 'l_sh2', title: "Raymarching Basics", focusDescription: "Rendering SDFs", suggestedMileage: "3 shapes", searchQueries: ["raymarching tutorial", "shader toy basics", "volumetric shader ue5"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-light',
                title: "Lighting & Lookdev",
                role: ArtRole.LIGHTING_LOOKDEV,
                description: "Cinematic rendering and light set extensions.",
                software: ["Maya", "Arnold", "UE5", "Katana"],
                outcomes: ["Lighting Artist", "Lookdev TD"],
                courses: [
                    {
                        id: 'li-1', title: "Cinematic 3-Point Setup", tier: 'Foundations',
                        description: "Subject separation and rim lighting.",
                        lessons: [
                            { id: 'l30', title: "Shadow Quality", focusDescription: "Soft vs Hard light logic", suggestedMileage: "5 scenes", searchQueries: ["cinematic lighting tutorial", "3 point lighting setup", "arnold lighting maya"] }
                        ]
                    },
                    {
                        id: 'li-2', title: "Baked vs Realtime", tier: 'Production',
                        description: "Lightmaps and global illumination.",
                        lessons: [
                            { id: 'l_li2', title: "Lightmap Baking", focusDescription: "UVs for lighting", suggestedMileage: "1 level", searchQueries: ["ue5 lumen vs baked", "lightmap uv unwrap", "static vs stationary lights"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-vfx-p',
                title: "VFX Particles",
                role: ArtRole.VFX_PARTICLE,
                description: "Magic, fire, and kinetic particle systems.",
                software: ["Niagara", "Unity VFX Graph", "Houdini"],
                outcomes: ["VFX Artist"],
                courses: [
                    {
                        id: 'vfxp-1', title: "Emitter Logic", tier: 'Foundations',
                        description: "Velocity, life, and color over time.",
                        lessons: [
                            { id: 'l31', title: "Energy Beam Simulation", focusDescription: "Ribbon and sprite logic", suggestedMileage: "3 effects", searchQueries: ["niagara vfx tutorial", "unity vfx graph basics", "game effect particle tutorial"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-vfx-s',
                title: "VFX Simulation",
                role: ArtRole.VFX_SIM,
                description: "Fluid and rigid body dynamics.",
                software: ["Houdini", "RealFlow"],
                outcomes: ["FX TD", "Simulation Artist"],
                courses: [
                    {
                        id: 'vfxs-1', title: "Fracture Solvers", tier: 'Foundations',
                        description: "Architectural destruction logic.",
                        lessons: [
                            { id: 'l32', title: "Rigid Body Dynamics", focusDescription: "Collision and constraints", suggestedMileage: "1 destruction shot", searchQueries: ["houdini rbd tutorial", "destruction fx breakdown", "rigid body dynamics simulation"] }
                        ]
                    },
                    {
                        id: 'vfxs-2', title: "Fluid Dynamics", tier: 'Production',
                        description: "Fire, smoke, and water.",
                        lessons: [
                            { id: 'l_vfxs2', title: "Pyro Solvers", focusDescription: "Temperature, fuel, and density", suggestedMileage: "1 explosion", searchQueries: ["houdini pyro tutorial", "fluid simulation basics", "sparse solver houdini"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-ta',
                title: "Technical Art",
                role: ArtRole.TECH_ART,
                description: "Pipeline engineering and tool development.",
                software: ["Python", "C++", "C#", "Maya API"],
                outcomes: ["Technical Artist", "Pipeline TD"],
                courses: [
                    {
                        id: 'ta-1', title: "Automation Scripting", tier: 'Foundations',
                        description: "Building Python tools for DCCs.",
                        lessons: [
                            { id: 'l33', title: "Batch Exporters", focusDescription: "Automating the FBX pipeline", suggestedMileage: "1 custom tool", searchQueries: ["python for maya tutorial", "pipeline td basics", "automating 3d workflow"] }
                        ]
                    }
                ]
            },
            {
                id: 'dept-clo',
                title: "Cloth & Physics",
                role: ArtRole.CLOTH_SIM,
                description: "Dynamic character fabric and hair behavior.",
                software: ["Marvelous Designer", "Houdini", "Maya"],
                outcomes: ["Simulation Artist"],
                courses: [
                    {
                        id: 'clo-1', title: "Pattern Making & Sim", tier: 'Foundations',
                        description: "Functional clothing construction.",
                        lessons: [
                            { id: 'l34', title: "Drapery Physics", focusDescription: "Pressure and wind interaction", suggestedMileage: "1 full character outfit", searchQueries: ["marvelous designer tutorial", "cloth simulation basics", "digital fashion workflow"] }
                        ]
                    }
                ]
            }
        ]
    }
];
