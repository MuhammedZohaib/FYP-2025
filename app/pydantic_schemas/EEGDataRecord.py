from datetime import datetime
from typing import List

from pydantic import BaseModel
from typing import Optional


class EegDataRecordSchema(BaseModel):
    created_at: datetime
    updated_at: datetime
    delta_F_sx: float
    delta_F_dx: float
    theta_F_sx: float
    theta_F_dx: float
    low_alpha_F_sx: float
    low_alpha_F_dx: float
    high_alpha_F_sx: float
    high_alpha_F_dx: float
    beta_F_sx: float
    beta_F_dx: float
    gamma_F_sx: float
    gamma_F_dx: float
    group: int
    time_point: int
    prediction: str
    prediction_result_in_probability: float
    predicted_probabilities: List[float]
    prediction_result_in_encoded_category: int
    prediction_result_in_category: str
    multimodal: Optional[bool] = False
