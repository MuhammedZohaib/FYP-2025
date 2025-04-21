from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Request
from jose import jwt

import logging

from DatabaseConnector import db
from auth import verify_token
from keys import SECRET_KEY
from models.mongodb.Doctor import Doctor
from models.mongodb.EEGDataRecord import EEGDataRecord
from models.mongodb.FacialDataRecord import FacialDataRecord
from models.mongodb.VideoDataRecord import VideoRecord
from models.mongodb.Patient import Patient
from models.mongodb.SpeechDataRecord import SpeechRecord
from pydantic_schemas.Patient import PatientSchema

router = APIRouter(prefix="/patient", tags=["patient"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

@router.post('/new', status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientSchema, request: Request):
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


@router.get('/all', status_code=status.HTTP_200_OK)
def get_patients(request: Request):
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
        print("Doctor Not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    patient_array = doctor["patients"]
    print(patient_array)

    doctors_patients = Patient.get_all_by_ids(patient_array)
    patients = []
    for patient in doctors_patients:
        patient = {**patient, "_id": str(patient["_id"])}
        patients.append(patient)

    return {'patients': patients, 'success': True}


@router.get('/{patient_id}', status_code=status.HTTP_200_OK)
def get_patient(patient_id: str):
    patient = Patient.find_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Patient not found')
    patient = {**patient, "_id": str(patient["_id"])}
    return {"patient": patient, "success": True}


@router.put('/{patient_id}', status_code=status.HTTP_200_OK)
async def update_patient(patient_id: str, request: Request):
    try:
        # Verify token
        token = request.headers.get("access_token")
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
        payload = verify_token(token)
        if not payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Get existing patient
        patient = Patient.find_by_id(patient_id)
        if patient is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        # Get update data from request body
        update_data = await request.json()
        
        # Create a copy of the patient dict and update with new data
        patient_dict = {**patient, "_id": str(patient["_id"])}
        
        # Update fields from the request
        allowed_fields = [
            "name", "email", "phone", "address", "dob", "gender",
            "born_country", "born_city", "father_name", "father_cnic",
            "mother_name", "mother_cnic", "other_info"
        ]
        
        for field in allowed_fields:
            if field in update_data:
                patient_dict[field] = update_data[field]

        # Update the patient
        updated = Patient.update(patient_id, patient_dict)
        if not updated:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

        return {"detail": "Patient updated successfully", "patient": patient_dict}

    except Exception as e:
        logger.error(f"Error updating patient: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get('/{patient_id}/predictions', status_code=status.HTTP_200_OK)
def get_predictions(patient_id: str, request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id = result.get("id")

    # Check if the doctor exists
    doctor = Doctor.find_by_id(doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # Get the patient information
    patient = Patient.find_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Get EEG model predictions for the patient
    eeg_records = EEGDataRecord.find_by_patient_id(patient_id)
    
    # Get facial records
    facial_records = FacialDataRecord.find_by_patient_id(patient_id)
    facial_predictions = [
        {
            "id": str(record["_id"]),
            "prediction": record["prediction"],
            "data": record.get("data", ""),
            "created_at": record.get("date", ""),
            "confidence": record.get("confidence", 0)
        } for record in facial_records
    ]
    
    # Get speech records
    speech_records = SpeechRecord.find_by_patient_id(patient_id)
    speech_predictions = [
        {
            "id": str(record["_id"]),
            "data": record.get("data", ""),
            "prediction": record.get("prediction", "unknown"),
            "created_at": record.get("created_at", "")
        } for record in speech_records
    ]
    
    # Get video records - fixed to properly format the data
    video_records = VideoRecord.find_by_patient_id(patient_id)
    logger.info(f"Retrieved {len(video_records) if video_records else 0} video records for patient {patient_id}")
    
    video_predictions = [
        {
            "id": str(record["_id"]),
            "data": record.get("data", ""),
            "prediction": record.get("prediction", "unknown"),
            "created_at": record.get("created_at", ""),
            "confidence": record.get("confidence", 0)
        } for record in video_records
    ]
    
    logger.info(f"Formatted {len(video_predictions)} video predictions")

    return {
        "detail": "Predictions retrieved successfully",
        "eeg_predictions": eeg_records,
        "facial_predictions": facial_predictions,
        "speech_predictions": speech_predictions,
        "video_predictions": video_predictions,
        "success": True
    }


@router.post('/export-data/{patient_id}', status_code=status.HTTP_200_OK)
def export_data(patient_id: str, request: Request):
    try:
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
        patient = Patient(**patient_data)

        residuals = db.get_collection('residual_distribution')
        residuals = residuals.find_one()
        residuals.pop("_id")

        doctors_collection = db.get_collection('doctors')
        doctor = doctors_collection.find_one({"_id": ObjectId(doctor_id)})

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

