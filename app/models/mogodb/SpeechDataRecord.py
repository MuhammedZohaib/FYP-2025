from datetime import datetime

from bson import ObjectId

from DatabaseConnector import db


class SpeechRecord:
    def __init__(self, patient_id: str, data: str, created_at: datetime, prediction: str):
        self.patient_id = patient_id
        self.data = data
        self.date = created_at
        self.prediction = prediction
        self.inserted_collection_id = None

    def save_speech_record(self):
        collection = db.get_collection('speech_records')
        result = collection.insert_one(self.__dict__)
        self.inserted_collection_id = result.inserted_id
        return self.inserted_collection_id

    @staticmethod
    def count_speech_records():
        speech_collection = db.get_collection('speech_records')
        return speech_collection.count_documents({})

    @staticmethod
    def find_by_patient_id(patient_id: str):
        collection = db.get_collection('speech_records')
        return collection.find({"patient_id": ObjectId(patient_id)})
