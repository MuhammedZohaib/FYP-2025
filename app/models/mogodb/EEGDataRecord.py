from datetime import datetime
from typing import List

from bson import ObjectId

from DatabaseConnector import db


class EEGDataRecord:
    def __init__(self, patient_id: str, doctor_id: str, result: str, created_at: datetime, updated_at: datetime, delta_F_sx: str,
                 delta_F_dx: str, theta_F_sx: str, theta_F_dx: str, low_alpha_F_sx: str, low_alpha_F_dx: str,
                 prediction_result_in_probability: float, predicted_probabilities: List[float],
                 prediction_result_in_encoded_category: int, prediction_result_in_category: str):
        self.patient_id = patient_id
        self.doctor_id = doctor_id
        self.result = result
        self.created_at = created_at
        self.updated_at = updated_at
        self.delta_F_sx = delta_F_sx
        self.delta_F_dx = delta_F_dx
        self.theta_F_sx = theta_F_sx
        self.theta_F_dx = theta_F_dx
        self.low_alpha_F_sx = low_alpha_F_sx
        self.low_alpha_F_dx = low_alpha_F_dx
        self.prediction_result_in_probability = prediction_result_in_probability
        self.predicted_probabilities = predicted_probabilities
        self.prediction_result_in_encoded_category = prediction_result_in_encoded_category
        self.prediction_result_in_category = prediction_result_in_category

    def save(self):
        collection = db.get_collection('eeg_data')
        result = collection.insert_one(self.__dict__)
        _id = str(result.inserted_id)
        return _id

    @staticmethod
    def find_by_id(patient_id: str):
        collection = db.get_collection('eeg_data')
        return collection.find_one({"_id": ObjectId(patient_id)})

    @staticmethod
    def get_all():
        collection = db.get_collection('eeg_data')
        return collection.find()

    @staticmethod
    def count_eeg_records():
        collection = db.get_collection('eeg_data')
        return collection.count_documents({})
    