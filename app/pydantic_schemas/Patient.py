from typing import List

from pydantic import BaseModel

from pydantic_schemas.EEGDataRecord import EegDataRecordSchema
from pydantic_schemas.FacialDataRecord import FacialDataRecordSchema
from pydantic_schemas.SpeechDataRecord import SpeechDataRecordSchema


class PatientSchema(BaseModel):
    name: str
    mother_name: str
    mother_cnic: str
    father_name: str
    father_cnic: str
    dob: str
    gender: str
    born_country: str
    born_city: str
    other_info: str
    email: str
    phone: str
    address: str
    asd: bool
    doctor: str = None
    facial_data_records: List[FacialDataRecordSchema] = []
    eeg_data_records: List[EegDataRecordSchema] = []
    speech_data_records: List[SpeechDataRecordSchema] = []
