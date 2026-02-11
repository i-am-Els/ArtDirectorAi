from typing import List, Optional, Literal
from dataclasses import dataclass, asdict

# --- ENUMS ---
LESSON_TYPES = [
    "READ", "WATCH", "ASSIGNMENT", "TEST", "PROJECT"
]

STUDY_MODES = [
    "FOCUS", "MILEAGE"
]

TIERS = [
    "Foundations", "Production", "Mastery"
]

# --- DATA CLASSES ---

@dataclass
class Lesson:
    id: str
    title: str
    lesson_type: Literal["READ", "WATCH", "ASSIGNMENT", "TEST", "PROJECT"]
    objective: str
    default_study_mode: Literal["FOCUS", "MILEAGE"]
    estimated_effort_minutes: int
    search_queries: List[str]
    order_index: int
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Subject:
    id: str
    title: str
    description: str
    learning_outcome: str
    order_index: int
    # lessons removed to prevent deep generation & default errors
    
    def to_dict(self):
        return asdict(self)

@dataclass
class Course:
    id: str
    code: str
    title: str
    description: str
    year_level: int
    is_core: bool
    tier: Literal["Foundations", "Production", "Mastery"]
    # subjects removed to prevent deep generation & default errors

    def to_dict(self):
        return asdict(self)

@dataclass
class Major:
    id: str
    faculty_id: str
    code: str
    title: str
    role: str
    description: str
    # courses removed

    def to_dict(self):
        return asdict(self)

@dataclass
class Faculty:
    id: str
    code: str
    name: str
    # majors removed

    def to_dict(self):
        return asdict(self)
