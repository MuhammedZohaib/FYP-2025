from datetime import datetime
from typing import List

from DatabaseConnector import db


class FacialDataRecord:
    def __init__(self, patient_id: str, data: str, date: datetime,
                 prediction_result_in_probability_of_efficentnet_model: float,
                 prediction: str, confidence: float,
                 prediction_result_in_probability_of_yolo_model: float,
                 predicted_probabilities_efficentnet_model: List[float],
                 predicted_probabilities_of_yolo_model: List[float],
                 prediction_result_in_encoded_category_of_efficentnet_model: int,
                 prediction_result_in_encoded_category_of_yolo_model: int,
                 prediction_result_in_category_of_efficentnet_model: str,
                 prediction_result_in_category_of_yolo_model: str):
        self._id = None
        self.patient_id = patient_id
        self.data = data
        self.date = date
        self.prediction_result_in_probability_of_efficentnet_model = prediction_result_in_probability_of_efficentnet_model
        self.prediction_result_in_probability_of_yolo_model = prediction_result_in_probability_of_yolo_model
        self.predicted_probabilities_efficentnet_model = predicted_probabilities_efficentnet_model
        self.predicted_probabilities_of_yolo_model = predicted_probabilities_of_yolo_model
        self.prediction_result_in_encoded_category_of_efficentnet_model = prediction_result_in_encoded_category_of_efficentnet_model
        self.prediction_result_in_encoded_category_of_yolo_model = prediction_result_in_encoded_category_of_yolo_model
        self.prediction_result_in_category_of_efficentnet_model = prediction_result_in_category_of_efficentnet_model
        self.prediction_result_in_category_of_yolo_model = prediction_result_in_category_of_yolo_model
        self.prediction = prediction
        self.confidence = confidence

    def save(self):
        collection = db.get_collection('facial_records')
        result = collection.insert_one(self.__dict__)
        self._id = str(result.inserted_id)
        return self._id

    @staticmethod
    def find_by_patient_id(patient_id: str):
        collection = db.get_collection('facial_records')
        return collection.find({"patient_id": patient_id})

    @staticmethod
    def count_facial_records():
        collection = db.get_collection('facial_records')
        return collection.count_documents({})