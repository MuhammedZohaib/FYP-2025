from pydantic import BaseModel


class LoginDoctorSchema(BaseModel):
    email: str
    password: str
