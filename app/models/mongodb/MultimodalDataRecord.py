from datetime import datetime
from typing import Dict, List, Optional
from pymongo import MongoClient
from bson import ObjectId

from DatabaseConnector import db


class MultimodalDataRecord:
    def __init__(
        self,
        patient_id: str,
        eeg_record_id: Optional[str] = None,
        facial_record_id: Optional[str] = None,
        speech_record_id: Optional[str] = None,
        video_record_id: Optional[str] = None,
        eeg_confidence: float = 0.0,
        facial_confidence: float = 0.0,
        speech_confidence: float = 0.0,
        video_confidence: float = 0.0,
        final_prediction: str = "",
        final_confidence: float = 0.0,
        modality_weights: Optional[Dict[str, float]] = None,
        date: Optional[datetime] = None
    ):
        self.patient_id = patient_id
        self.eeg_record_id = eeg_record_id
        self.facial_record_id = facial_record_id
        self.speech_record_id = speech_record_id
        self.video_record_id = video_record_id
        self.eeg_confidence = eeg_confidence
        self.facial_confidence = facial_confidence
        self.speech_confidence = speech_confidence
        self.video_confidence = video_confidence
        self.final_prediction = final_prediction
        self.final_confidence = final_confidence
        self.modality_weights = modality_weights or {
            "eeg": 0.35,
            "facial": 0.25,
            "speech": 0.20,
            "video": 0.20
        }
        self.date = date or datetime.now()

    def to_dict(self) -> Dict:
        return {
            "patient_id": self.patient_id,
            "eeg_record_id": self.eeg_record_id,
            "facial_record_id": self.facial_record_id,
            "speech_record_id": self.speech_record_id,
            "video_record_id": self.video_record_id,
            "eeg_confidence": self.eeg_confidence,
            "facial_confidence": self.facial_confidence,
            "speech_confidence": self.speech_confidence,
            "video_confidence": self.video_confidence,
            "final_prediction": self.final_prediction,
            "final_confidence": self.final_confidence,
            "modality_weights": self.modality_weights,
            "date": self.date
        }

    def save(self):
        collection = db.get_collection("multimodal_data_records")
        result = collection.insert_one(self.to_dict())
        return str(result.inserted_id)

    @staticmethod
    def find_by_patient_id(patient_id: str) -> List[Dict]:
        collection = db.get_collection("multimodal_data_records")
        records = list(collection.find({"patient_id": patient_id}))
        for record in records:
            record["_id"] = str(record["_id"])
        return records

    @staticmethod
    def find_by_id(record_id: str) -> Optional[Dict]:
        collection = db.get_collection("multimodal_data_records")
        record = collection.find_one({"_id": ObjectId(record_id)})
        if record:
            record["_id"] = str(record["_id"])
        return record 

