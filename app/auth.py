from jose import jwt
from jose import JWTError
from datetime import datetime, timedelta
from keys import SECRET_KEY, TOKEN_EXPIRE_MINUTES
from pydantic_schemas.Doctor import DoctorSchema
import bcrypt


def create_access_token(data: dict):
    to_encode = data.copy()
    if "id" in to_encode:
        to_encode["id"] = str(to_encode["id"])
    expire = datetime.now() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def authenticate_doctor(plain_password: str, doctor: dict):
    stored_password = doctor.get('password')
    if not stored_password:
        return None
    if bcrypt.checkpw(plain_password.encode('utf-8'), stored_password.encode('utf-8')):
        print('authenticated')
        return doctor
    return None



def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("email")
        user_id: str = payload.get("id")
        if email is None:
            return False
        return {"email": email, 'id': user_id}
    except JWTError:
        return False
