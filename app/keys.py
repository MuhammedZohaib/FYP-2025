from dotenv import load_dotenv

env_path = "../../env"
load_dotenv(env_path)

SECRET_KEY = "f4e7e7b1"
TOKEN_EXPIRE_MINUTES = 300
MONGO_URI = ("")
DB_NAME = "asd-fyp-fa21"
ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8080",
    "http://localhost:4200",
    "http://localhost:5173",
    "http://localhost:3001"
]

MAIL_USERNAME = ''
MAIL_PASSWORD = ''
MAIL_SERVER = ''
MAIL_PORT = 587
MAIL_TLS = True
MAIL_SSL = False
