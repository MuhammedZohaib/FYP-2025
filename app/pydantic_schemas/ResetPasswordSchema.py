from pydantic import BaseModel, EmailStr

class RequestResetSchema(BaseModel):
    email: EmailStr

class ConfirmCodeSchema(BaseModel):
    email: EmailStr
    code: str

class NewPasswordSchema(BaseModel):
    email: EmailStr
    password: str
