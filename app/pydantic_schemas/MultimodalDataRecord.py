from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel

class MultimodalDataRecordSchema(BaseModel):
    patient_id: str
    eeg_record_id: Optional[str] = None
    facial_record_id: Optional[str] = None
    speech_record_id: Optional[str] = None
    video_record_id: Optional[str] = None
    eeg_confidence: float = 0.0
    facial_confidence: float = 0.0
    speech_confidence: float = 0.0
    video_confidence: float = 0.0
    final_prediction: str
    final_confidence: float
    date: datetime
    modality_weights: Dict[str, float] = {
        "eeg": 0.35,
        "facial": 0.25,
        "speech": 0.20,
        "video": 0.20
    }

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 