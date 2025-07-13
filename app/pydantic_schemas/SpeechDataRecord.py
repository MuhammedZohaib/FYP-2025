from pydantic import BaseModel
from typing import Optional

class SpeechDataRecordSchema(BaseModel):
    patient_id: str
    data: str
    created_at: str
    prediction: str
    multimodal: Optional[bool] = False
