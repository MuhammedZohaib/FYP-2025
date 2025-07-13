from datetime import datetime
from typing import List

from pydantic import BaseModel
from typing import Optional


class FacialDataRecordSchema(BaseModel):
    data: str
    date: datetime
    prediction: str
    confidence: float
    group: int = 1
    time_point: int = 1
    prediction_result_in_probability_of_efficentnet_model: float
    prediction_result_in_probability_of_yolo_model: float
    predicted_probabilities_efficentnet_model: List[float] = []
    predicted_probabilities_of_yolo_model: List[float] = []
    prediction_result_in_encoded_category_of_efficentnet_model: int
    prediction_result_in_encoded_category_of_yolo_model: int
    prediction_result_in_category_of_efficentnet_model: str
    prediction_result_in_category_of_yolo_model: str
    multimodal: Optional[bool]
