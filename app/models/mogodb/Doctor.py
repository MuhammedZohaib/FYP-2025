from datetime import datetime
from typing import List

from bson import ObjectId

from DatabaseConnector import db


class Doctor:
    def __init__(self, name: str, email: str, password: str, location: str, phone: str, specialization: str,
                 picture: str = "nothing there", experience: str = "5 years", patients=None,
                 consultations=None):
        if patients is None:
            patients = []
        if consultations is None:
            consultations = []
        self.name = name
        self.email = email
        self.password = password
        self.location = location
        self.phone = phone
        self.specialization = specialization
        self.picture = picture
        self.patients = patients
        self.consultations = consultations
        self.joining = datetime.now()
        self.experience = experience

    def save(self):
        collection = db.get_collection('doctors')
        result = collection.insert_one(self.__dict__)
        self._id = str(result.inserted_id)
        return self._id

    @staticmethod
    def find_by_email(email: str):
        collection = db.get_collection('doctors')
        doctor_data = collection.find_one({"email": email})
        if doctor_data:
            doctor_data['_id'] = str(doctor_data['_id'])
        return doctor_data

    @staticmethod
    def find_by_id(patient_id: str):
        collection = db.get_collection('doctors')
        return collection.find_one({"_id": ObjectId(patient_id)})

    @staticmethod
    def update(doctor_id: str, update_data: dict):
        collection = db.get_collection('doctors')
        update_data.pop('_id')
        result = collection.update_one({"_id": ObjectId(doctor_id)}, {"$set": update_data})
        return result

    @staticmethod
    def change_password(email: str, new_password: str):
        collection = db.get_collection('doctors')
        result = collection.update_one({"email": email}, {"$set": {"password": new_password}})
        return result
