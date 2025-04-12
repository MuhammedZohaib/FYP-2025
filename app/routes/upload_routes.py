import os
import logging
from datetime import datetime

import logging

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File
from jose import jwt

from auth import verify_token
from keys import SECRET_KEY
from models.mongodb.EEGDataRecord import EEGDataRecord
from models.mongodb.FacialDataRecord import FacialDataRecord
from models.mongodb.Patient import Patient
from models.mongodb.SpeechDataRecord import SpeechRecord
from pydantic_schemas.FacialDataRecord import FacialDataRecordSchema
from pydantic_schemas.SpeechDataRecord import SpeechDataRecordSchema
from utils import inference_yolo, inference_efficientnet, extract_mfcc_features

router = APIRouter(prefix="/upload", tags=["upload"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

YOLO_WEIGHTAGE = 0.6
EFFICIENTNET_WEIGHTAGE = 0.4

model_file = 'models/ml/weights/svm_calibrated_classifier.pkl'
loaded_model = joblib.load(model_file)

speech_cue_model = 'models/ml/weights/svc_speech_model.pkl'
audio_model = joblib.load(speech_cue_model)

CURRENT_DIR = os.getcwd()

UPLOADS_DIR = os.path.join(CURRENT_DIR, "uploads")
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

UPLOADS_DIR_SPEECH = os.path.join(CURRENT_DIR, "uploads/speech")
if not os.path.exists(UPLOADS_DIR_SPEECH):
    os.makedirs(UPLOADS_DIR_SPEECH)


@router.post("/facial/{patient_id}")
def upload_image(patient_id: str, request: Request, image: UploadFile = File(...)):
    token = request.headers.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    patient = Patient.find_by_id(patient_id)

    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    filename = f"{patient_id}_{image.filename}"
    file_location = os.path.join(UPLOADS_DIR, filename)
    with open(os.path.join(UPLOADS_DIR, filename), "wb") as f:
        f.write(image.read())

    yolo_class, yolo_conf = inference_yolo(file_location)

    efficientnet_class, efficientnet_conf = inference_efficientnet(file_location)

    prediction_result_in_probability_of_efficentnet_model = float(efficientnet_conf)
    prediction_result_in_probability_of_yolo_model = float(yolo_conf)
    predicted_probabilities_efficentnet_model = []
    predicted_probabilities_of_yolo_model = []
    prediction_result_in_encoded_category_of_efficentnet_model = 0 if efficientnet_class == 1 else 1
    prediction_result_in_encoded_category_of_yolo_model = 0 if yolo_class == 1 else 1
    prediction_result_in_category_of_efficentnet_model = ""
    prediction_result_in_category_of_yolo_model = ""
    if efficientnet_class == 1:
        prediction_result_in_probability_of_efficentnet_model = 1 - prediction_result_in_probability_of_efficentnet_model
        predicted_probabilities_efficentnet_model = [1 - prediction_result_in_probability_of_efficentnet_model,
                                                     prediction_result_in_probability_of_efficentnet_model]
        prediction_result_in_category_of_efficentnet_model = "Typical"
    elif efficientnet_class == 0:
        predicted_probabilities_efficentnet_model = [1 - prediction_result_in_probability_of_efficentnet_model,
                                                     prediction_result_in_probability_of_efficentnet_model]
        prediction_result_in_category_of_efficentnet_model = "HL-ASD"
    if yolo_class == 1:
        predicted_probabilities_of_yolo_model = [prediction_result_in_probability_of_yolo_model,
                                                 1 - prediction_result_in_probability_of_yolo_model]
        prediction_result_in_category_of_yolo_model = "Typical"
    elif yolo_class == 0:
        predicted_probabilities_of_yolo_model = [1 - prediction_result_in_probability_of_yolo_model,
                                                 prediction_result_in_probability_of_yolo_model]
        prediction_result_in_category_of_yolo_model = "HL-ASD"

    if yolo_class == 0:
        yolo_autistic_conf = yolo_conf  # Confidence for "Autistic" from YOLO
    else:
        yolo_autistic_conf = 1 - yolo_conf  # If YOLO predicts "Non-Autistic", use the opposite confidence

    combined_conf = (YOLO_WEIGHTAGE * yolo_autistic_conf) + (EFFICIENTNET_WEIGHTAGE * efficientnet_conf)

    # Final decision: if combined confidence > 0.5, predict "Autistic"; otherwise, "Non-Autistic"
    final_class = 1 if combined_conf > 0.5 else 0  # 0: Autistic, 1: Non-Autistic
    if final_class == 0:
        combined_conf = 1 - combined_conf
    # Map class indices to class names
    class_names = ['Typical', 'HL-ASD']
    predicted_class_name = class_names[final_class]

    patient_dict = {**patient, "_id": str(patient["_id"])}
    patient_dict.pop("_id")

    # if score is greater than 0.5, then set Prediction to positive, else negative
    prediction = predicted_class_name

    facial_data_record = FacialDataRecordSchema(data=file_location, date=datetime.now(), prediction=str(prediction),
                                                confidence=float(combined_conf),
                                                prediction_result_in_probability_of_efficentnet_model=prediction_result_in_probability_of_efficentnet_model,
                                                prediction_result_in_probability_of_yolo_model=prediction_result_in_probability_of_yolo_model,
                                                predicted_probabilities_efficentnet_model=predicted_probabilities_efficentnet_model,
                                                predicted_probabilities_of_yolo_model=predicted_probabilities_of_yolo_model,
                                                prediction_result_in_encoded_category_of_efficentnet_model=prediction_result_in_encoded_category_of_efficentnet_model,
                                                prediction_result_in_encoded_category_of_yolo_model=prediction_result_in_encoded_category_of_yolo_model,
                                                prediction_result_in_category_of_efficentnet_model=prediction_result_in_category_of_efficentnet_model,
                                                prediction_result_in_category_of_yolo_model=prediction_result_in_category_of_yolo_model)
    facial_record = FacialDataRecord(patient_id=patient_id, data=file_location, prediction=str(prediction),
                                     confidence=float(combined_conf), date=datetime.now(),
                                     prediction_result_in_probability_of_efficentnet_model=prediction_result_in_probability_of_efficentnet_model,
                                     prediction_result_in_probability_of_yolo_model=prediction_result_in_probability_of_yolo_model,
                                     predicted_probabilities_efficentnet_model=predicted_probabilities_efficentnet_model,
                                     predicted_probabilities_of_yolo_model=predicted_probabilities_of_yolo_model,
                                     prediction_result_in_encoded_category_of_efficentnet_model=prediction_result_in_encoded_category_of_efficentnet_model,
                                     prediction_result_in_encoded_category_of_yolo_model=prediction_result_in_encoded_category_of_yolo_model,
                                     prediction_result_in_category_of_efficentnet_model=prediction_result_in_category_of_efficentnet_model,
                                     prediction_result_in_category_of_yolo_model=prediction_result_in_category_of_yolo_model)
    facial_record_id = facial_record.save()
    if not facial_record_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add facial record")
    patient_dict["facial_data_records"].append(facial_data_record.model_dump())

    updated_patient = Patient.update(patient_id, patient_dict)
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    new_patient = Patient(**patient_dict)

    return {"detail": f"Image {filename} uploaded successfully.", "prediction": prediction, "patient": new_patient,
            "success": True}


@router.post('/speech/{patient_id}', status_code=status.HTTP_200_OK)
async def upload_speech(patient_id: str, request: Request, audio: UploadFile = File(...)):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    if not audio.content_type.startswith("audio"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is not an audio file")

    patient = Patient.find_by_id(patient_id)
    patient_dict = {**patient, "_id": str(patient["_id"])}

    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    filename = f"{patient_id}_{audio.filename}"
    file_location = os.path.join(UPLOADS_DIR_SPEECH, filename)
    
    # Read file content asynchronously
    contents = await audio.read()
    with open(os.path.join(UPLOADS_DIR_SPEECH, filename), "wb") as f:
        f.write(contents)

    mfcc_features = extract_mfcc_features(file_location)
    speech_prediction = audio_model.predict(mfcc_features)

    prediction = "positive" if speech_prediction == 1 else "negative"
    speech_data_record = SpeechDataRecordSchema(patient_id=patient_id, data=file_location,
                                                created_at=str(datetime.now()), prediction=prediction)
    speech_record = SpeechRecord(patient_id=patient_id, data=file_location, created_at=datetime.now(),
                                 prediction=prediction)
    speech_inserted_id = speech_record.save_speech_record()
    if not speech_inserted_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add speech record")
    patient_dict["speech_data_records"].append(speech_data_record.model_dump())
    Patient.update(patient_id, patient_dict)
    return {"detail": f"Audio {filename} uploaded successfully.", "prediction": prediction, "patient": str(patient),
            "success": True}


@router.post('/eeg/{patient_id}', status_code=status.HTTP_200_OK)
async def predict(patient_id: str, data: dict, request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id: str = result.get("id")
    patient_data = Patient.find_by_id(patient_id)
    if not patient_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    patient_data.pop("_id")
    data.pop("name")
    data.pop("patient_id")

    columns = ['group', 'time_point', 'delta_F_sx', 'delta_F_dx', 'theta_F_sx', 'theta_F_dx', 'low_alpha_F_sx',
               'low_alpha_F_dx', 'high_alpha_F_sx', 'high_alpha_F_dx', 'beta_F_sx', 'beta_F_dx', 'gamma_F_sx',
               'gamma_F_dx']
    input_df = pd.DataFrame(data, columns=columns, index=[0])

    predicted_class = int(loaded_model.predict(input_df)[0])
    predicted_probs = loaded_model.predict_proba(input_df)
    predicted_probs = np.array(predicted_probs).flatten().tolist()
    predicted_probs = predicted_probs[:3]
    pred = "positive" if predicted_class == 2 else "negative"

    if predicted_class == 2:
        prediction_result_in_category = "HL-ASD"
    elif predicted_class == 1:
        prediction_result_in_category = "dyslexia"
    else:
        prediction_result_in_category = "atypical"

    eeg_data = EEGDataRecord(
        **data,
        doctor_id=doctor_id,
        patient_id=patient_id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        prediction_result_in_probability=predicted_probs[predicted_class],
        predicted_probabilities=predicted_probs,
        prediction_result_in_encoded_category=predicted_class,
        prediction_result_in_category=prediction_result_in_category
    )
    eeg_data.save()
    patient_data["eeg_data_records"].append(eeg_data.__dict__)
    updated_patient = Patient.update(patient_id, patient_data)
    new_patient = Patient(**patient_data)
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    return {"detail": "EEG data uploaded successfully", "prediction": pred, "patient": new_patient, "success": True}

