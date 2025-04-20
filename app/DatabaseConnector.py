from pymongo import MongoClient
from keys import MONGO_URI, DB_NAME


class DatabaseConnector:
    def __init__(self, uri, db_name):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def get_collection(self, collection_name):
        return self.db[collection_name]


db = DatabaseConnector(MONGO_URI, DB_NAME)

def get_db():
    return db.db
