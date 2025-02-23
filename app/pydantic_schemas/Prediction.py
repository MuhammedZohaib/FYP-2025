from pydantic import BaseModel


class PredictionSchema(BaseModel):
    patient_id: str
    doctor_id: str
    result: str
    created_at: str
    updated_at: str
    delta_F_sx: str
    delta_F_dx: str
    theta_F_sx: str
    theta_F_dx: str
    low_alpha_F_sx: str
    low_alpha_F_dx: str
    high_alpha_F_sx: str
    high_alpha_F_dx: str
    beta_F_sx: str
    beta_F_dx: str
    gamma_F_sx: str
    gamma_F_dx: str
    group: str
    time_point: str
