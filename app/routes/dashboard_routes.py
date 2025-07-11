from fastapi import APIRouter, status
import logging

from models.mongodb.EEGDataRecord import EEGDataRecord
from models.mongodb.FacialDataRecord import FacialDataRecord
from models.mongodb.SpeechDataRecord import SpeechRecord
from models.mongodb.VideoDataRecord import VideoRecord
from models.mongodb.Patient import Patient

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

@router.get('/data', status_code=status.HTTP_200_OK)
def get_dashboard_data():
    total_eeg_records = EEGDataRecord.count_eeg_records()
    total_facial_records = FacialDataRecord.count_facial_records()
    total_speech_records = SpeechRecord.count_speech_records()
    total_video_records = VideoRecord.count_video_records()
    total_asd_patients = Patient.count_asd_patients()
    total_non_asd_patients = Patient.count_non_asd_patients()
    return {"eeg_records": total_eeg_records, "facial_records": total_facial_records, "speech_records": total_speech_records, "video_records": total_video_records,
            "asd_patients": total_asd_patients, "non_asd_patients": total_non_asd_patients, "success": True}
