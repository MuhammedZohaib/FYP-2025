from datetime import datetime

from DatabaseConnector import db


class SpeechRecord:
    def __init__(self, patient_id: str, data: str, created_at: datetime, prediction: str):
        self.patient_id = patient_id
        self.data = data
        self.date = created_at
        self.prediction = prediction

    def save_speech_record(self):
        collection = db.get_collection('speech_records')
        result = collection.insert_one(self.__dict__)
        self.inserted_collection_id = result.inserted_id
        return self.inserted_collection_id

    @staticmethod
    def count_speech_records():
        speech_collection = db.get_collection('speech_records')
        return speech_collection.count_documents({})

    @classmethod
    def find_by_patient_id(cls, patient_id: str):
        collection = db.get_collection("speech_records")
        records = list(collection.find({"patient_id": patient_id}))

        for record in records:
            record["_id"] = str(record["_id"])  
        return records
