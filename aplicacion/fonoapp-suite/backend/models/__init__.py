# backend/models/__init__.py
from .user import User
from .patient import Patient
from .plan import TreatmentPlan, SessionLog
from .appointment import Appointment
from .assessment import AssessmentTemplate, AssessmentResult
from .assignment import Assignment
from .file import MediaFile
