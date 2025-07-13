from datetime import datetime
from typing import List

from bson import ObjectId

from DatabaseConnector import db


class EEGDataRecord:
    def __init__(self, patient_id: str, doctor_id: str, created_at: datetime, updated_at: datetime,
                 delta_F_sx: str, delta_F_dx: str, theta_F_sx: str, theta_F_dx: str,
                 low_alpha_F_sx: str, low_alpha_F_dx: str,
                 prediction_result_in_probability: float, predicted_probabilities: List[float],
                 prediction_result_in_encoded_category: int, prediction_result_in_category: str,
                 group: int = None, time_point: int = None, high_alpha_F_sx: str = None,
                 high_alpha_F_dx: str = None, beta_F_sx: str = None, beta_F_dx: str = None,
                 gamma_F_sx: str = None, gamma_F_dx: str = None, multimodal = False):
        self.patient_id = patient_id
        self.doctor_id = doctor_id
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
        self.group = group
        self.time_point = time_point
        self.high_alpha_F_sx = high_alpha_F_sx
        self.high_alpha_F_dx = high_alpha_F_dx
        self.beta_F_sx = beta_F_sx
        self.beta_F_dx = beta_F_dx
        self.gamma_F_sx = gamma_F_sx
        self.gamma_F_dx = gamma_F_dx
        self.multimodal = multimodal

    def save(self):
        collection = db.get_collection('eeg_data')
        result = collection.insert_one(self.__dict__)
        self._id = str(result.inserted_id)
        return self._id

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

    @classmethod
    def find_by_patient_id(cls, patient_id: str):
        collection = db.get_collection("eeg_data")
        records = list(collection.find({"patient_id": patient_id}))

        for record in records:
            record["_id"] = str(record["_id"])  # Convert _id field to string
        return records
