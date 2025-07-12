from dotenv import load_dotenv

env_path = "../../env"
load_dotenv(env_path)

SECRET_KEY = "f4e7e7b1"
TOKEN_EXPIRE_MINUTES = 300
MONGO_URI = ("mongodb+srv://fa21bcs047:MyaGVNAPy1aB94D9@asd-fyp-fa21.9pcvp.mongodb.net/?retryWrites=true&w=majority"
             "&appName=asd-fyp-fa21")
DB_NAME = "asd-fyp-fa21"
ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8080",
    "https://131.163.80.80:3000",
    "http://localhost:4200",
    "http://localhost:5173",
    "http://localhost:3001"
]

MAIL_USERNAME = 'ar5414929@gmail.com'
MAIL_PASSWORD = 'ublz hxxh aaau mkhg'
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_TLS = True
MAIL_SSL = False
