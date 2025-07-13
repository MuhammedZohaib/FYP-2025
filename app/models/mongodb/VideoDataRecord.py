from datetime import datetime

from DatabaseConnector import db


class VideoRecord:
    def __init__(self, patient_id: str, data: str, created_at: datetime, prediction: str, confidence: float = 0.0, multimodal: bool = False):
        self.patient_id = patient_id
        self.data = data
        self.date = created_at
        self.prediction = prediction
        self.confidence = confidence
        self.multimodal = multimodal

    def save_video_record(self):
        collection = db.get_collection('video_records')
        result = collection.insert_one(self.__dict__)
        self.inserted_collection_id = result.inserted_id
        return self.inserted_collection_id

    @staticmethod
    def count_video_records():
        video_collection = db.get_collection('video_records')
        return video_collection.count_documents({})

    @classmethod
    def find_by_patient_id(cls, patient_id: str):
        collection = db.get_collection("video_records")
        records = list(collection.find({"patient_id": patient_id}))

        for record in records:
            record["_id"] = str(record["_id"])  
        return records 
