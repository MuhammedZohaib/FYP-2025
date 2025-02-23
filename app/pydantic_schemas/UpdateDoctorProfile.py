from pydantic import BaseModel


class UpdateDoctorProfileSchema(BaseModel):
    name: str
    location: str
    phone: str
    specialization: str
    experience: str
