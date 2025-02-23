from pydantic import BaseModel


class SpeechDataRecordSchema(BaseModel):
    patient_id: str
    data: str
    created_at: str
    prediction: str