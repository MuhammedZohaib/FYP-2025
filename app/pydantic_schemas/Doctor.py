from typing import List

from pydantic import BaseModel


class DoctorSchema(BaseModel):
    name: str
    email: str
    password: str
    location: str
    phone: str
    patients: List[str] = []
    consultations: List[str] = []
    specialization: str
