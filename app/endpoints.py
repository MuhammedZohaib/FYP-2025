import json
import logging
import os
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from bson.objectid import ObjectId
from cloudinary.uploader import upload
from fastapi import UploadFile, File, APIRouter, HTTPException, status, Request
from jose import jwt

from DatabaseConnector import db
from auth import authenticate_doctor, create_access_token, verify_token
from keys import SECRET_KEY
from models.mogodb.Doctor import Doctor
from models.mogodb.EEGDataRecord import EEGDataRecord
from models.mogodb.FacialDataRecord import FacialDataRecord
from models.mogodb.Patient import Patient
from models.mogodb.SpeechDataRecord import SpeechRecord
from pydantic_schemas.AddConsultationRequest import AddConsultationRequestSchema
from pydantic_schemas.Doctor import DoctorSchema
from pydantic_schemas.FacialDataRecord import FacialDataRecordSchema
from pydantic_schemas.LoginDoctor import LoginDoctorSchema
from pydantic_schemas.Patient import PatientSchema
from pydantic_schemas.SpeechDataRecord import SpeechDataRecordSchema
from pydantic_schemas.UpdateDoctorProfile import UpdateDoctorProfileSchema
from pydantic_schemas.UpdatePassword import UpdatePasswordSchema
from utils import extract_mfcc_features
from utils import inference_efficientnet, inference_yolo

router = APIRouter()

YOLO_WEIGHTAGE = 0.6
EFFICIENTNET_WEIGHTAGE = 0.4

model_file = 'models/ml/weights/svm_calibrated_classifier.pkl'
loaded_model = joblib.load(model_file)

speech_cue_model = 'models/ml/weights/svc_speech_model.pkl'
audio_model = joblib.load(speech_cue_model)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.get('/')
async def test():
    return {'detail': 'Hello World'}


CURRENT_DIR = os.getcwd()

UPLOADS_DIR = os.path.join(CURRENT_DIR, "uploads")
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

UPLOADS_DIR_SPEECH = os.path.join(CURRENT_DIR, "uploads/speech")
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)


@router.post("/upload-facial/{patient_id}")
async def upload_image(patient_id: str, request: Request, image: UploadFile = File(...)):
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
        f.write(await image.read())

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


@router.post('/upload-speech/{patient_id}', status_code=status.HTTP_200_OK)
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
    with open(os.path.join(UPLOADS_DIR_SPEECH, filename), "wb") as f:
        f.write(await audio.read())

    mfcc_features = extract_mfcc_features(file_location)
    speech_prediction = audio_model.predict(mfcc_features)

    prediction = "positive" if speech_prediction == 1 else "negative"
    speech_data_record = SpeechDataRecordSchema(patient_id=patient_id, data=file_location,
                                                created_at=str(datetime.now()), prediction=prediction)
    speech_record = SpeechRecord(patient_id=patient_id, data=file_location, created_at=datetime.now(),
                                 prediction=prediction)
    speech_inserted_id = speech_record.save_speech_record()
    print(speech_inserted_id)
    if not speech_inserted_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add speech record")
    patient_dict["speech_data_records"].append(speech_data_record.model_dump())
    print(patient_dict)
    Patient.update(patient_id, patient_dict)
    print(patient)
    return {"detail": f"Audio {filename} uploaded successfully.", "prediction": prediction, "patient": str(patient),
            "success": True}


@router.post('/new-patient', status_code=status.HTTP_201_CREATED)
async def create_patient(patient: PatientSchema, request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id: str = result.get("id")
    if Patient.find_by_email(patient.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
    try:
        # 
        patient = patient.model_dump()
        patient["doctor"] = doctor_id

        new_patient = Patient(**patient)

        new_patient_id = new_patient.save()
        doctor = Doctor.find_by_id(doctor_id)

        if doctor:

            doctor = {**doctor, "_id": str(doctor["_id"])}
            doctor["patients"].append(new_patient_id)
            Doctor.update(doctor_id, doctor)
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

        return {'detail': 'Patient created successfully', 'patient': new_patient, 'success': True}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get('/patients', status_code=status.HTTP_200_OK)
async def get_patients(request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id = result.get("id")

    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    patient_array = doctor["patients"]

    doctors_patients = Patient.get_all_by_ids(patient_array)
    patients = []
    for patient in doctors_patients:
        patient = {**patient, "_id": str(patient["_id"])}
        patients.append(patient)
    # 
    return {'patients': patients, 'success': True}


# # get patient by id with all his predictions
@router.get('/patient/{patient_id}', status_code=status.HTTP_200_OK)
async def get_patient(patient_id: str):
    patient = Patient.find_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Patient not found')
    patient = {**patient, "_id": str(patient["_id"])}
    return {"patient": patient, "success": True}


@router.put('/patient/{patient_id}', status_code=status.HTTP_200_OK)
async def update_patient(patient_id: str, update_data: PatientSchema):
    patient = Patient.find_by_id(patient_id)
    patient_dict = {**patient, "_id": str(patient["_id"])}
    patient_dict.pop("_id")
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    for field, value in update_data.model_dump().items():
        patient_dict[field] = value

    updated = Patient.update(patient_id, patient_dict)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    return {"detail": "Patient updated successfully", "patient": patient_dict}


# Route to register a new doctor
@router.post('/register/doctor', status_code=status.HTTP_201_CREATED)
async def register_doctor(doctor_info: DoctorSchema):
    existing_doctor = Doctor.find_by_email(doctor_info.email)
    if existing_doctor:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor already registered")

    new_doctor = Doctor(**doctor_info.model_dump())
    new_doctor.save()

    return {"detail": "Doctor registered successfully", "doctor": new_doctor.__dict__}


@router.post('/login/doctor', status_code=status.HTTP_200_OK)
async def login_doctor(doctor: LoginDoctorSchema):
    existing_doctor = Doctor.find_by_email(doctor.email)
    if not existing_doctor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    existing_doctor = {**existing_doctor, "_id": str(existing_doctor["_id"])}
    authenticated_doctor = authenticate_doctor(doctor.password, existing_doctor)
    if not authenticated_doctor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    token = create_access_token({"email": doctor.email, "id": authenticated_doctor["_id"]})
    return {'detail': 'Doctor logged in successfully', 'token': token, 'doctor': existing_doctor, 'success': True}


@router.put('/doctor/profile', status_code=status.HTTP_200_OK)
async def update_doctor_profile(doctor_info: UpdateDoctorProfileSchema, request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id: str = result.get("id")
    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    doctor_dict = {**doctor, "_id": str(doctor["_id"])}

    for field, value in doctor_info.model_dump().items():
        doctor_dict[field] = value

    updated = Doctor.update(doctor_id, doctor_dict)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update doctor")

    return {"detail": "Doctor profile updated successfully", "doctor": doctor_dict}


@router.put('/doctor/password', status_code=status.HTTP_200_OK)
async def update_doctor_password(password: UpdatePasswordSchema, request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id: str = result.get("id")
    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    if not doctor["password"] == password.oldPassword:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect")

    updated = Doctor.update(doctor_id, {"password": password.newPassword})
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update password")

    return {"detail": "Password updated successfully", "success": True}


@router.get("/check-token")
async def check_token(request: Request):
    token = request.headers.get("access_token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            email: str = payload.get("email")
            if email is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            else:
                doctor = Doctor.find_by_email(email)
                if doctor:
                    return {"detail": "Token is valid", "doctor": doctor, "success": True, 'valid_token': True}
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")


@router.post('/upload-eeg/{patient_id}', status_code=status.HTTP_200_OK)
async def predict(patient_id: str, data: dict, request: Request):

    token = request.headers.get("access_token")
    # 
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

    logger.info(f"Predicted class: {predicted_class}, Predicted probabilities: {predicted_probs}")

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
    patient_data["eeg_data_records"].append(eeg_data)
    updated_patient = Patient.update(patient_id, patient_data)
    new_patient = Patient(**patient_data)
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    return {"detail": "EEG data uploaded successfully", "prediction": pred, "patient": new_patient, "success": True}


@router.post("/upload-profile-pic")
async def upload_profile_pic(request: Request, image: UploadFile = File(...)):
    # Get the doctor's ID from the token
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    doctor_id = payload.get("id")
    if not doctor_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doctor ID not found")

    # Check if the doctor exists
    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Doctor not found")

    # Upload the image to Cloudinary
    upload_result = upload(image.file, folder="profile_pics")  # Upload to "profile_pics" folder
    if not upload_result or "secure_url" not in upload_result:
        return {"error": "Failed to upload image to Cloudinary"}

    # Update the doctor's profile picture URL in the database
    profile_pic_url = upload_result["secure_url"]
    update_data = {"picture": profile_pic_url}
    Doctor.update(doctor_id, update_data)

    return {"detail": "Profile picture updated successfully", "profile_pic_url": profile_pic_url}


# getting total number of eeg records present in the database
@router.get('/get-dashbaord-data', status_code=status.HTTP_200_OK)
async def get_eeg_records():
    total_eeg_records = EEGDataRecord.count_eeg_records()
    total_facial_records = FacialDataRecord.count_facial_records()
    total_asd_patients = Patient.count_asd_patients()
    total_non_asd_patients = Patient.count_non_asd_patients()
    return {"eeg_records": total_eeg_records, "facial_records": total_facial_records,
            "asd_patients": total_asd_patients, "non_asd_patients": total_non_asd_patients, "success": True}


@router.get('/patient/{patient_id}/predictions', status_code=status.HTTP_200_OK)
async def get_predictions(patient_id: str, request: Request):
    # Verify token and get the user information
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id = result.get("patient_id")

    # Check if the doctor exists
    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # Get the patient information
    patient = Patient.find_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Get EEG model predictions for the patient
    eeg_records = EEGDataRecord.find_by_id(patient_id)
    eeg_predictions = [
        {
            "id": str(record["_id"]),
            "prediction_result": record["prediction"]  # Example: 0 or 1
        } for record in eeg_records
    ]

    # Get facial model predictions for the patient
    facial_records = FacialDataRecord.find_by_patient_id(patient_id)
    facial_predictions = [
        {
            "id": str(record["_id"]),
            "prediction": record["prediction"]  # Example: positive/negative
        } for record in facial_records
    ]

    speech_records = SpeechRecord.find_by_patient_id(patient_id)
    speech_predictions = [
        {
            "id": str(record["_id"]),
            "prediction": record["prediction"]
        } for record in speech_records
    ]

    return {
        "detail": "Predictions retrieved successfully",
        "eeg_predictions": eeg_predictions,
        "facial_predictions": facial_predictions,
        "speech_predictions": speech_predictions,
        "success": True
    }


@router.post("/add-consultation", status_code=status.HTTP_200_OK)
async def add_patient_to_consultation(bodyData: AddConsultationRequestSchema):
    doctor_email = bodyData.email

    doctor = Doctor.find_by_email(doctor_email)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found with the provided email."
        )

    doctor_id = doctor["_id"]

    patient = Patient.find_by_id(bodyData.patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found with the provided ID."
        )

    consultations = doctor.get("consultations", [])
    if bodyData.patient_id in consultations:
        return {
            "detail": "Patient is already in the doctor's consultations list.",
            "success": False
        }

    doctor = {**doctor, "_id": str(doctor["_id"])}
    doctor["consultations"].append(bodyData.patient_id)
    Doctor.update(doctor_id, doctor)

    return {
        "detail": "Patient added to consultations successfully.",
        "success": True,
    }


@router.get('/doctor/consultations', status_code=status.HTTP_200_OK)
async def get_doctor_consultations(request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id = result.get("id")

    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    consultations = doctor.get("consultations", [])

    patients = Patient.get_all_by_ids(consultations)

    consultation_details = []
    for patient in patients:
        patient = {**patient, "_id": str(patient["_id"])}  # Convert ObjectId to string
        consultation_details.append(patient)

    return {
        "detail": "Consultations retrieved successfully",
        "consultations": consultation_details,
        "success": True
    }


def clean_data(data):
    cleaned_data = {}
    for key, value in data.items():
        if isinstance(value, ObjectId):
            cleaned_data[key] = str(value)  # Convert ObjectId to string
        elif isinstance(value, datetime):
            cleaned_data[key] = value.strftime('%Y-%m-%d %H:%M:%S')  # Format datetime
        elif isinstance(value, list):
            cleaned_data[key] = [str(item) if isinstance(item, ObjectId) else item for item in
                                 value]  # Handle lists of ObjectIds
        else:
            cleaned_data[key] = value
    return cleaned_data


@router.post('/export-data/{patient_id}', status_code=status.HTTP_200_OK)
async def export_data(patient_id: str, request: Request):
    try:
        token = request.headers.get("access_token")
        # 
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
        patient = Patient(**patient_data)

        residuals = db.get_collection('residual_distribution')
        residuals = residuals.find_one()
        residuals.pop("_id")

        doctors_collection = db.get_collection('doctors')
        doctor = doctors_collection.find_one({"_id": ObjectId(doctor_id)})

        doctor = clean_data(doctor)
        residual_distribution_of_efficentnet_model_values = [
            item.get("residual_distribution_of_efficentnet_model")
            for item in residuals.get("facial_expressions", [])
        ]

        residual_distribution_of_yolo_model_values = [
            item.get("residual_distribution_of_yolo_model")
            for item in residuals.get("facial_expressions", [])
        ]

        # Calculate age using dob
        dob = patient_data.get("dob")
        if dob:
            dob = datetime.strptime(dob, "%Y-%m-%d")
            today = datetime.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        else:
            age = None

        json_data = {
            "patient_info": {
                "dob": patient_data["dob"],
                "age": age,
                "gender": patient.gender,
                "born_country": patient.born_country,
                "born_city": patient.born_city
            },
            "doctor_info": {
                "name": doctor.get("name", None),
                "location": doctor.get("location", None),
                "specialization": doctor.get("specialization", None),
                "experience": doctor.get("experience", None),
            },
            "info_and_expert_prior_prediction_on_eeg_data_of_patient": {
                "created_at_of_eeg": patient.eeg_data_records[0].get("created_at",
                                                                     None) if patient.eeg_data_records else None,
                "eeg_data": {
                    "delta_F_sx": patient.eeg_data_records[0].get("delta_F_sx",
                                                                  None) if patient.eeg_data_records else None,
                    "delta_F_dx": patient.eeg_data_records[0].get("delta_F_dx",
                                                                  None) if patient.eeg_data_records else None,
                    "theta_F_sx": patient.eeg_data_records[0].get("theta_F_sx",
                                                                  None) if patient.eeg_data_records else None,
                    "theta_F_dx": patient.eeg_data_records[0].get("theta_F_dx",
                                                                  None) if patient.eeg_data_records else None,
                    "low_alpha_F_sx": patient.eeg_data_records[0].get("low_alpha_F_sx",
                                                                      None) if patient.eeg_data_records else None,
                    "low_alpha_F_dx": patient.eeg_data_records[0].get("low_alpha_F_dx",
                                                                      None) if patient.eeg_data_records else None,
                    "high_alpha_F_sx": patient.eeg_data_records[0].get("high_alpha_F_sx",
                                                                       None) if patient.eeg_data_records else None,
                    "high_alpha_F_dx": patient.eeg_data_records[0].get("high_alpha_F_dx",
                                                                       None) if patient.eeg_data_records else None,
                    "beta_F_sx": patient.eeg_data_records[0].get("beta_F_sx",
                                                                 None) if patient.eeg_data_records else None,
                    "beta_F_dx": patient.eeg_data_records[0].get("beta_F_dx",
                                                                 None) if patient.eeg_data_records else None,
                    "gamma_F_sx": patient.eeg_data_records[0].get("gamma_F_sx",
                                                                  None) if patient.eeg_data_records else None,
                    "gamma_F_dx": patient.eeg_data_records[0].get("gamma_F_dx",
                                                                  None) if patient.eeg_data_records else None
                },
                "prediction_result_in_probability": patient.eeg_data_records[0].get("prediction_result_in_probability",
                                                                                    None) if patient.eeg_data_records else None,
                "predicted_probabilities": patient.eeg_data_records[0].get("predicted_probabilities",
                                                                           []) if patient.eeg_data_records else [],
                "residual_distribution": residuals.get("eeg", []) if residuals else [],
                "prediction_result_in_encoded_category": patient.eeg_data_records[0].get(
                    "prediction_result_in_encoded_category", None) if patient.eeg_data_records else None,
                "prediction_result_in_category": patient.eeg_data_records[0].get("prediction_result_in_category",
                                                                                 None) if patient.eeg_data_records else None
            },
            "expert_prior_prediction_on_facial_image_of_patient": [
                {
                    "date": record.get("date", None),
                    "prediction_result_in_probability_of_efficentnet_model": record.get(
                        "prediction_result_in_probability_of_efficentnet_model", None),
                    "prediction_result_in_probability_of_yolo_model": record.get(
                        "prediction_result_in_probability_of_yolo_model", None),
                    "predicted_probabilities_efficentnet_model": record.get("predicted_probabilities_efficentnet_model",
                                                                            []),
                    "predicted_probabilities_of_yolo_model": record.get("predicted_probabilities_of_yolo_model", []),
                    "residual_distribution_of_efficentnet_model": residual_distribution_of_efficentnet_model_values,
                    "residual_distribution_of_yolo_model": residual_distribution_of_yolo_model_values,
                    "prediction_result_in_encoded_category_of_efficentnet_model": record.get(
                        "prediction_result_in_encoded_category_of_efficentnet_model", None),
                    "prediction_result_in_encoded_category_of_yolo_model": record.get(
                        "prediction_result_in_encoded_category_of_yolo_model"),
                    "prediction_result_in_category_of_efficentnet_model": record.get(
                        "prediction_result_in_category_of_efficentnet_model", None),
                    "prediction_result_in_category_of_yolo_model": record.get(
                        "prediction_result_in_category_of_yolo_model", None)
                } for i, record in enumerate(patient.facial_data_records)
            ]
        }

        with open("genai.json", "w") as json_file:
            json.dump(json_data, json_file, indent=4, default=str)
        return {"detail": "EEG data uploaded successfully", "patient": patient_data, "success": True}

    except Exception as e:

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
