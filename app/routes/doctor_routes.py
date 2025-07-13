import logging
import os
from datetime import datetime
from ssl import HAS_SSLv2
from typing_extensions import Doc
import bcrypt
import random

from bson.objectid import ObjectId
from cloudinary.uploader import upload
from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File, BackgroundTasks
from jose import jwt
from cloud.resend_client import send_reset_email

from auth import authenticate_doctor, create_access_token, verify_token
from keys import SECRET_KEY
from models.mongodb.Doctor import Doctor
from models.mongodb.Patient import Patient
from pydantic_schemas.AddConsultationRequest import AddConsultationRequestSchema
from pydantic_schemas.Doctor import DoctorSchema
from pydantic_schemas.LoginDoctor import LoginDoctorSchema
from pydantic_schemas.ResetPasswordSchema import RequestResetSchema, ConfirmCodeSchema, NewPasswordSchema
from pydantic_schemas.UpdateDoctorProfile import UpdateDoctorProfileSchema
from pydantic_schemas.UpdatePassword import UpdatePasswordSchema

router = APIRouter(prefix="/doctor", tags=["doctor"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")


@router.post('/register', status_code=status.HTTP_201_CREATED)
def register_doctor(doctor_info: DoctorSchema):
    try:
        existing_doctor = Doctor.find_by_email(doctor_info.email)
        if existing_doctor:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor already registered")
        hashed_password = bcrypt.hashpw(doctor_info.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        doctor_data = doctor_info.model_dump()
        print(doctor_data)
        doctor_data['password'] = hashed_password
        
        new_doctor = Doctor(**doctor_data)
        doctor_id = new_doctor.save()

        return {"detail": "Doctor registered successfully", "doctor_id": doctor_id}

    except Exception as e:
        logger.error(f"Error in doctor registration: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")



@router.post('/login', status_code=status.HTTP_200_OK)
def login_doctor(doctor: LoginDoctorSchema):
    existing_doctor = Doctor.find_by_email(doctor.email)
    if not existing_doctor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    existing_doctor = {**existing_doctor, "_id": str(existing_doctor["_id"])}
    
    authenticated_doctor = authenticate_doctor(doctor.password, existing_doctor)
    if not authenticated_doctor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')
    
    token = create_access_token({"email": doctor.email, "id": authenticated_doctor["_id"]})
    return {
        'detail': 'Doctor logged in successfully',
        'token': token,
        'doctor': existing_doctor,
        'success': True
    }

reset_codes = {}

def generate_reset_code():
    return f"{random.randint(0, 999999):06}"

@router.post("/reset-password/request", status_code=status.HTTP_200_OK)
def request_password_reset(data: RequestResetSchema, background_tasks: BackgroundTasks):
    doctor = Doctor.find_by_email(data.email)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor with this email does not exist")

    code = generate_reset_code()
    reset_codes[data.email] = code

    background_tasks.add_task(send_reset_email, data.email, code)

    return {"detail": "Reset code sent to your email", "success": True}

@router.post("/reset-password/confirm", status_code=status.HTTP_200_OK)
def confirm_reset_password(data: ConfirmCodeSchema):
    stored_code = reset_codes.get(data.email)
    if not stored_code or stored_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid reset code")

    doctor = Doctor.find_by_email(data.email)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Optionally delete the code after use
    del reset_codes[data.email]

    return {"detail": "Code Confirmed", "success": True}

@router.post("/reset-password/new", status_code=status.HTTP_200_OK)
def set_new_password(data: NewPasswordSchema):
    
    hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    Doctor.change_password(data.email, hashed_password)
    
    return {"detail": "New Password Set.", "success": True}


@router.get('/profile', status_code=status.HTTP_200_OK)
def get_doctor_profile(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing")
    
    # Expecting the header format to be "Bearer <token>"
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")
    
    # Verify the token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # Decode token to get doctor ID and fetch profile
    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id: str = result.get("id")
    doctor = Doctor.find_by_id(doctor_id)  # Replace with your actual lookup logic
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    doctor_dict = {**doctor, "_id": str(doctor["_id"])}
    return doctor_dict

@router.put('/profile', status_code=status.HTTP_200_OK)
def update_doctor_profile(doctor_info: UpdateDoctorProfileSchema, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing or invalid")
    token = auth_header.split(" ")[1]

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


@router.put('/password', status_code=status.HTTP_200_OK)
def update_doctor_password(password: UpdatePasswordSchema, request: Request):
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
def check_token(request: Request):
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


@router.post("/upload-profile-pic")
def upload_profile_pic(request: Request, image: UploadFile = File(...)):
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


@router.get('/consultations', status_code=status.HTTP_200_OK)
def get_doctor_consultations(request: Request):
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


@router.post("/add-consultation", status_code=status.HTTP_200_OK)
def add_patient_to_consultation(bodyData: AddConsultationRequestSchema):
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
