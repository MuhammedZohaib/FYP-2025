from app.models.mongodb import EEGDataRecord, FacialDataRecord
from fastapi import APIRouter, status


router = APIRouter()

@router.get('/data', status_code=status.HTTP_200_OK)
async def get_dashboard_data():
    total_eeg_records = EEGDataRecordrd.count_eeg_records()
    total_facial_records = FacialDataRecord.count_facial_records()
    total_asd_patients = Patient.count_asd_patients()
    total_non_asd_patients = Patient.count_non_asd_patients()
    
    return {
        "eeg_records": total_eeg_records, 
        "facial_records": total_facial_records,
        "asd_patients": total_asd_patients, 
        "non_asd_patients": total_non_asd_patients, 
        "success": True
    }
