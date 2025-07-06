from typing import List

from bson import ObjectId

from DatabaseConnector import db


class Patient:
    def __init__(self, name: str, email: str, phone: str, address: str, mother_name: str, mother_cnic: str,
                 father_name: str, father_cnic: str, dob: str, gender: str, born_country: str, born_city: str,
                 other_info: str, asd: bool, doctor: str, facial_data_records=None,
                 eeg_data_records=None, speech_data_records=None, video_records=None):
        if speech_data_records is None:
            speech_data_records = []
        if facial_data_records is None:
            facial_data_records = []
        if eeg_data_records is None:
            eeg_data_records = []
        if video_records is None:
            video_records = []
        self.name = name
        self.email = email
        self.phone = phone
        self.address = address
        self.asd = asd
        self.mother_name = mother_name
        self.mother_cnic = mother_cnic
        self.father_name = father_name
        self.father_cnic = father_cnic
        self.dob = dob
        self.gender = gender
        self.born_country = born_country
        self.born_city = born_city
        self.other_info = other_info
        self.facial_data_records = facial_data_records
        self.doctor = doctor
        self.eeg_data_records = eeg_data_records
        self.speech_data_records = speech_data_records
        self.video_records = video_records

    def save(self):
        collection = db.get_collection('patients')
        result = collection.insert_one(self.__dict__)
        self._id = str(result.inserted_id)
        return self._id

    @staticmethod
    def update(patient_id: str, update_data: dict):
        if '_id' in update_data:
            del update_data['_id']
        collection = db.get_collection('patients')
        result = collection.update_one({"_id": ObjectId(patient_id)}, {"$set": update_data})
        return result

    @staticmethod
    def find_by_email(email: str):
        collection = db.get_collection('patients')
        return collection.find_one({"email": email})

    @staticmethod
    def find_by_id(patient_id: str):
        collection = db.get_collection('patients')
        return collection.find_one({"_id": ObjectId(patient_id)})

    @staticmethod
    def get_all():
        collection = db.get_collection('patients')
        return collection.find()

    @staticmethod
    def get_all_by_ids(ids: List[str]):
        collection = db.get_collection('patients')
        object_ids = [ObjectId(id_str) for id_str in ids]
        return collection.find({"_id": {"$in": object_ids}})

    @staticmethod
    def count_asd_patients():
        collection = db.get_collection('patients')
        return collection.count_documents({"asd": True})

    @staticmethod
    def count_non_asd_patients():
        collection = db.get_collection('patients')
        return collection.count_documents({"asd": False})
