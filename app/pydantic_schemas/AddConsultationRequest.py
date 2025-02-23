from pydantic import BaseModel


class AddConsultationRequestSchema(BaseModel):
    email: str
    patient_id: str
