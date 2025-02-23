from pydantic import BaseModel


class UpdatePasswordSchema(BaseModel):
    newPassword: str
    oldPassword: str
