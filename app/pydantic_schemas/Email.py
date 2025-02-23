from typing import List

from pydantic import BaseModel, EmailStr


class EmailSchema(BaseModel):
    name: str
    message: str
    patient_email: str
    email: List[EmailStr]