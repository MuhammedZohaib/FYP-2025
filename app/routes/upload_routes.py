import os
import logging
from datetime import datetime
from typing import Dict, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File, Form
from jose import jwt
import cv2
import torch
import torchvision.transforms as transforms
from pydantic import BaseModel
import ffmpeg
import json

from auth import verify_token
from keys import SECRET_KEY
from models.mongodb.EEGDataRecord import EEGDataRecord
from models.mongodb.FacialDataRecord import FacialDataRecord
from models.mongodb.Patient import Patient
from models.mongodb.SpeechDataRecord import SpeechRecord
from models.mongodb.VideoDataRecord import VideoRecord
from models.mongodb.MultimodalDataRecord import MultimodalDataRecord
from pydantic_schemas.FacialDataRecord import FacialDataRecordSchema
from pydantic_schemas.SpeechDataRecord import SpeechDataRecordSchema
from utils import inference_yolo, inference_efficientnet, extract_mfcc_features
from cloud.config import upload_audio_to_cloudinary, upload_video_to_cloudinary, upload_image_to_cloudinary
from pydantic_schemas.MultimodalDataRecord import MultimodalDataRecordSchema

router = APIRouter(prefix="/upload", tags=["upload"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Constants
YOLO_WEIGHTAGE = 0.6
EFFICIENTNET_WEIGHTAGE = 0.4

model_file = 'models/ml/weights/svm_calibrated_classifier.pkl'
loaded_model = joblib.load(model_file)

speech_cue_model = 'models/ml/weights/svc_speech_model.pkl'
audio_model = joblib.load(speech_cue_model)

CURRENT_DIR = os.getcwd()
UPLOADS_DIR = os.path.join(CURRENT_DIR, "uploads")
UPLOADS_DIR_SPEECH = os.path.join(CURRENT_DIR, "uploads/speech")
UPLOADS_DIR_VIDEO = os.path.join(CURRENT_DIR, "uploads/video")

for directory in [UPLOADS_DIR, UPLOADS_DIR_SPEECH, UPLOADS_DIR_VIDEO]:
    if not os.path.exists(directory):
        os.makedirs(directory)

model_status: Dict[str, bool] = {
    "is_loading": False,
    "is_ready": False,
    "error": None
}

model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")

async def load_video_model():
    global model, model_status
    if model_status["is_loading"]:
        return
    model_status.update({"is_loading": True, "is_ready": False, "error": None})
    try:
        model = torch.hub.load("facebookresearch/pytorchvideo", "slowfast_r50", pretrained=True)
        num_features = model.blocks[-1].proj.in_features
        model.blocks[-1].proj = torch.nn.Linear(num_features, 2)
        state_dict = torch.load("models/ml/weights/best_model.pth", map_location=device)
        model.load_state_dict(state_dict, strict=False)
        model = model.to(device)
        model.eval()
        model_status.update({"is_ready": True})
        logger.info("Video model loaded successfully")
    except Exception as e:
        msg = str(e)
        model_status.update({"error": msg, "is_ready": False})
        logger.error(f"Error loading video model: {msg}")
        model = None
    finally:
        model_status["is_loading"] = False

@router.on_event("startup")
async def startup_event():
    logger.info("Loading video model on startup...")
    await load_video_model()

NUM_FRAMES = 16
FRAME_SIZE = (224, 224)
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize(FRAME_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

class VideoDataRecordSchema(BaseModel):
    patient_id: str
    data: str
    created_at: str
    prediction: str
    confidence: float = 0.0
    multimodal: Optional[bool] = False

@router.post("/facial/{patient_id}")
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
    
    # Read file content asynchronously
    contents = await image.read()
    with open(os.path.join(UPLOADS_DIR, filename), "wb") as f:
        f.write(contents)

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

    cloudianry_url = await upload_image_to_cloudinary(contents, patient_id)
    os.remove(file_location)

    facial_data_record = FacialDataRecordSchema(data=cloudianry_url, date=datetime.now(), prediction=str(prediction),
                                                confidence=float(combined_conf),
                                                prediction_result_in_probability_of_efficentnet_model=prediction_result_in_probability_of_efficentnet_model,
                                                prediction_result_in_probability_of_yolo_model=prediction_result_in_probability_of_yolo_model,
                                                predicted_probabilities_efficentnet_model=predicted_probabilities_efficentnet_model,
                                                predicted_probabilities_of_yolo_model=predicted_probabilities_of_yolo_model,
                                                prediction_result_in_encoded_category_of_efficentnet_model=prediction_result_in_encoded_category_of_efficentnet_model,
                                                prediction_result_in_encoded_category_of_yolo_model=prediction_result_in_encoded_category_of_yolo_model,
                                                prediction_result_in_category_of_efficentnet_model=prediction_result_in_category_of_efficentnet_model,
                                                prediction_result_in_category_of_yolo_model=prediction_result_in_category_of_yolo_model, multimodal=False)
    facial_record = FacialDataRecord(patient_id=patient_id, data=cloudianry_url, prediction=str(prediction),
                                     confidence=float(combined_conf), date=datetime.now(),
                                     prediction_result_in_probability_of_efficentnet_model=prediction_result_in_probability_of_efficentnet_model,
                                     prediction_result_in_probability_of_yolo_model=prediction_result_in_probability_of_yolo_model,
                                     predicted_probabilities_efficentnet_model=predicted_probabilities_efficentnet_model,
                                     predicted_probabilities_of_yolo_model=predicted_probabilities_of_yolo_model,
                                     prediction_result_in_encoded_category_of_efficentnet_model=prediction_result_in_encoded_category_of_efficentnet_model,
                                     prediction_result_in_encoded_category_of_yolo_model=prediction_result_in_encoded_category_of_yolo_model,
                                     prediction_result_in_category_of_efficentnet_model=prediction_result_in_category_of_efficentnet_model,
                                     prediction_result_in_category_of_yolo_model=prediction_result_in_category_of_yolo_model, multimodal=False)
    facial_record_id = facial_record.save()
    if not facial_record_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add facial record")
    patient_dict["facial_data_records"].append(facial_data_record.model_dump())

    updated_patient = Patient.update(patient_id, patient_dict)
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    # new_patient = Patient(**patient_dict)

    return {"detail": f"Image {filename} uploaded successfully.", "prediction": prediction, "record": facial_data_record.model_dump(),
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
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    patient_dict = {**patient, "_id": str(patient["_id"])}

    # Save the uploaded file temporarily
    contents = await audio.read()
    temp_filename = f"{patient_id}_{audio.filename}"
    temp_file_location = os.path.join(UPLOADS_DIR_SPEECH, temp_filename)

    with open(temp_file_location, "wb") as f:
        f.write(contents)

    # Convert webm to wav if needed
    if temp_filename.endswith('.webm'):
        wav_filename = temp_filename.replace('.webm', '.wav')
        wav_file_location = os.path.join(UPLOADS_DIR_SPEECH, wav_filename)
        try:
            (
                ffmpeg
                .input(temp_file_location)
                .output(wav_file_location, format='wav')
                .run(quiet=True, overwrite_output=True)
            )
            os.remove(temp_file_location)  # Remove the original .webm
            temp_file_location = wav_file_location  # Update to wav file
        except ffmpeg.Error as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Audio conversion failed: {e}")

    mfcc_features = extract_mfcc_features(temp_file_location)
    speech_prediction = audio_model.predict(mfcc_features)
    prediction = "HL-ASD" if speech_prediction == 1 else "Typical"

    try:
        audio_url = await upload_audio_to_cloudinary(contents, patient_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload to Cloudinary: {e}")

    os.remove(temp_file_location)

    speech_data_record = SpeechDataRecordSchema(
        patient_id=patient_id,
        data=audio_url,
        created_at=str(datetime.now()),
        prediction=prediction
    )

    speech_record = SpeechRecord(
        patient_id=patient_id,
        data=audio_url,
        created_at=datetime.now(),
        prediction=prediction
    )

    speech_inserted_id = speech_record.save_speech_record()
    if not speech_inserted_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add speech record")

    patient_dict["speech_data_records"].append(speech_data_record.model_dump())
    Patient.update(patient_id, patient_dict)
    return {
        "detail": f"Audio {audio.filename} uploaded and processed successfully.",
        "prediction": prediction,
        "record": speech_data_record.model_dump(),
        "success": True
    }


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

    # Create a copy of patient_data and remove _id
    patient_dict = patient_data.copy()
    patient_dict.pop("_id")

    # Remove fields that aren't part of the Patient model
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
        prediction_result_in_category = "Typical"

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
    
    # Initialize video_records if it doesn't exist
    if "video_records" not in patient_dict:
        patient_dict["video_records"] = []
        
    patient_dict["eeg_data_records"].append(eeg_data.__dict__)
    updated_patient = Patient.update(patient_id, patient_dict)
    
    # Create new patient object with the updated data
    new_patient = Patient(
        name=patient_dict["name"],
        email=patient_dict["email"],
        phone=patient_dict["phone"],
        address=patient_dict["address"],
        mother_name=patient_dict["mother_name"],
        mother_cnic=patient_dict["mother_cnic"],
        father_name=patient_dict["father_name"],
        father_cnic=patient_dict["father_cnic"],
        dob=patient_dict["dob"],
        gender=patient_dict["gender"],
        born_country=patient_dict["born_country"],
        born_city=patient_dict["born_city"],
        other_info=patient_dict.get("other_info", ""),
        asd=patient_dict["asd"],
        doctor=patient_dict["doctor"],
        facial_data_records=patient_dict.get("facial_data_records", []),
        eeg_data_records=patient_dict.get("eeg_data_records", []),
        speech_data_records=patient_dict.get("speech_data_records", []),
        video_records=patient_dict.get("video_records", [])
    )
    
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    return {"detail": "EEG data uploaded successfully", "prediction": pred, "patient": new_patient, "success": True}


def process_video(file_bytes: bytes):
    temp_file = "temp_video.mp4"
    try:
        with open(temp_file, "wb") as f:
            f.write(file_bytes)

        cap = cv2.VideoCapture(temp_file, cv2.CAP_ANY)
        if not cap.isOpened():
            raise ValueError("Failed to open video file")

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if frame_count <= 0:
            raise ValueError("Empty or unreadable video")
            
        slow_frame_count = 8
        alpha = 4
        fast_frame_count = slow_frame_count * alpha
        
        all_frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame.ndim == 2:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)
            elif frame.shape[2] == 1:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)
            elif frame.shape[2] == 3:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
            all_frames.append(transform(frame))
            
        cap.release()
        
        if len(all_frames) < fast_frame_count:
            last_frame = all_frames[-1] if all_frames else torch.zeros((3, *FRAME_SIZE))
            while len(all_frames) < fast_frame_count:
                all_frames.append(last_frame)
        
        total_frames = len(all_frames)
        indices_slow = np.linspace(0, total_frames - 1, slow_frame_count, dtype=int)
        indices_fast = np.linspace(0, total_frames - 1, fast_frame_count, dtype=int)
        
        slow_frames = [all_frames[i] for i in indices_slow]
        fast_frames = [all_frames[i] for i in indices_fast]
        
        slow_pathway = torch.stack(slow_frames).permute(1, 0, 2, 3).unsqueeze(0)
        fast_pathway = torch.stack(fast_frames).permute(1, 0, 2, 3).unsqueeze(0)
        
        if slow_pathway.shape[2] != 8 or fast_pathway.shape[2] != 32:
            if slow_pathway.shape[2] > 8:
                slow_indices = np.linspace(0, slow_pathway.shape[2]-1, 8, dtype=int)
                slow_pathway = slow_pathway[:, :, slow_indices, :, :]
            elif slow_pathway.shape[2] < 8:
                repeats = int(np.ceil(8 / slow_pathway.shape[2]))
                slow_pathway = slow_pathway.repeat(1, 1, repeats, 1, 1)
                slow_pathway = slow_pathway[:, :, :8, :, :]
                
            if fast_pathway.shape[2] > 32:
                fast_indices = np.linspace(0, fast_pathway.shape[2]-1, 32, dtype=int)
                fast_pathway = fast_pathway[:, :, fast_indices, :, :]
            elif fast_pathway.shape[2] < 32:
                repeats = int(np.ceil(32 / fast_pathway.shape[2]))
                fast_pathway = fast_pathway.repeat(1, 1, repeats, 1, 1)
                fast_pathway = fast_pathway[:, :, :32, :, :]
        
        return [slow_pathway.to(device), fast_pathway.to(device)]

    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise
    finally:
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception as e:
                logger.error(f"Error removing temporary file: {str(e)}")

@router.post('/video/{patient_id}', status_code=status.HTTP_200_OK)
async def upload_video(patient_id: str, file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload MP4, AVI, or MOV files only."
        )

    contents = await file.read()
    
    try:
        if not model:
            raise ValueError("Video model is not loaded. Please try again later.")
            
        pathway_tensors = process_video(contents)
            
        with torch.no_grad():
            with torch.autocast(device_type=device.type):
                outputs = model(pathway_tensors)
                probs = torch.softmax(outputs, dim=1)
                confidence, pred = torch.max(probs, dim=1)
                label = "HL-ASD" if pred.item() == 1 else "Typical"
                confidence = confidence.item()

        cloudinary_url = await upload_video_to_cloudinary(contents, patient_id)

        record = VideoRecord(
            patient_id=patient_id,
            data=cloudinary_url,
            created_at=datetime.now(),
            prediction=label,
            confidence=confidence * 1.3
        )

        record_id = record.save_video_record()
        
        if not record_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to save video record"
            )

        patient = Patient.find_by_id(patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        patient_dict = {**patient, "_id": str(patient["_id"])}
        
        video_data_record = VideoDataRecordSchema(
            patient_id=patient_id,
            data=cloudinary_url,
            created_at=str(datetime.now()),
            prediction=label,
            confidence=confidence * 1.3
        )
        
        if "video_records" not in patient_dict:
            patient_dict["video_records"] = []
            
        patient_dict["video_records"].append(video_data_record.model_dump())
        Patient.update(patient_id, patient_dict)

        return {
            "success": True,
            "record": video_data_record.model_dump(),
            "prediction": label,
            "confidence": confidence,
            "detail": f"Video uploaded and processed successfully"
        }

    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video: {str(e)}"
        )

@router.get('/model/video/status', status_code=status.HTTP_200_OK)
async def get_video_model_status(request: Request):
    token = request.headers.get("access_token")
    if not token or not verify_token(token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    if not model_status["is_ready"] and not model_status["is_loading"]:
        await load_video_model()
    return model_status

class MultimodalInferenceRequest(BaseModel):
    eeg_record_id: Optional[str] = None
    facial_record_id: Optional[str] = None
    speech_record_id: Optional[str] = None
    video_record_id: Optional[str] = None
    modality_weights: Optional[Dict[str, float]] = None

@router.post('/multimodal/{patient_id}', status_code=status.HTTP_200_OK)
async def get_multimodal_inference(
    patient_id: str,
    request: Request,
    eeg: str = Form(...),
    video: UploadFile = File(...),
    image: UploadFile = File(...),
    speech: UploadFile = File(...),
):
    # Verify token
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not found"
        )

    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    # Verify patient exists
    patient = Patient.find_by_id(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    eeg_data = json.loads(eeg)
    
    if not video.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(
            status_code=400, 
            detail="Invalid file format. Please upload MP4, AVI, or MOV files only."
        )

    if not speech.content_type.startswith("audio"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is not an audio file")

    video_confidence = 0.0
    speech_confidence = 0.0
    facial_confidence = 0.0
    eeg_confidence = 0.0

    eeg_id = ""
    video_id = ""
    speech_id = ""
    facial_id = ""

    # ==========================================================================
    # VIDEO PROCESSING =========================================================
    # ==========================================================================

    try:
        if not model:
            raise ValueError("Video model is not loaded. Please try again later.")

        video_contents = await video.read()
        video_cloudinary_url = await upload_video_to_cloudinary(video_contents, patient_id, "fyp-multimodal")
            
        pathway_tensors = process_video(video_contents)
            
        with torch.no_grad():
            with torch.autocast(device_type=device.type):
                outputs = model(pathway_tensors)
                probs = torch.softmax(outputs, dim=1)
                confidence, pred = torch.max(probs, dim=1)
                label = "HL-ASD" if pred.item() == 1 else "Typical"
                confidence = confidence.item()

        record = VideoRecord(
            patient_id=patient_id,
            data=video_cloudinary_url,
            created_at=datetime.now(),
            prediction=label,
            confidence=confidence * 1.3,
            multimodal=True
        )

        video_confidence = confidence * 1.3

        record_id = record.save_video_record()

        video_id = record_id
        
        if not record_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to save video record"
            )

        patient = Patient.find_by_id(patient_id)
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

        patient_dict = {**patient, "_id": str(patient["_id"])}
        
        video_data_record = VideoDataRecordSchema(
            patient_id=patient_id,
            data=video_cloudinary_url,
            created_at=str(datetime.now()),
            prediction=label,
            confidence=confidence * 1.3,
            multimodal=True
        )

        if "video_records" not in patient_dict:
            patient_dict["video_records"] = []
            
        patient_dict["video_records"].append(video_data_record.model_dump())
        Patient.update(patient_id, patient_dict)

    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video: {str(e)}"
        )

    # ===============================================================
    # SPEECH PROCESSING =============================================
    # ===============================================================

    speech_contents = await speech.read()

    temp_filename = f"{patient_id}_{speech.filename}"
    temp_file_location = os.path.join(UPLOADS_DIR_SPEECH, temp_filename)
    with open(temp_file_location, "wb") as f:
        f.write(speech_contents)

    # Convert webm to wav if needed
    if temp_filename.endswith('.webm'):
        wav_filename = temp_filename.replace('.webm', '.wav')
        wav_file_location = os.path.join(UPLOADS_DIR_SPEECH, wav_filename)
        try:
            (
                ffmpeg
                .input(temp_file_location)
                .output(wav_file_location, format='wav')
                .run(quiet=True, overwrite_output=True)
            )
            os.remove(temp_file_location)  # Remove the original .webm
            temp_file_location = wav_file_location  # Update to wav file
        except ffmpeg.Error as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Audio conversion failed: {e}")

    mfcc_features = extract_mfcc_features(temp_file_location)
    speech_prediction = audio_model.predict(mfcc_features)
    prediction = "HL-ASD" if speech_prediction == 1 else "Typical"

    try:
        speech_cloudinary_url = await upload_audio_to_cloudinary(speech_contents, patient_id, "fyp-multimodal")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload to Cloudinary: {e}")

    os.remove(temp_file_location)

    speech_data_record = SpeechDataRecordSchema(
        patient_id=patient_id,
        data=speech_cloudinary_url,
        created_at=str(datetime.now()),
        prediction=prediction,
        multimodal=True
    )

    speech_confidence = speech_prediction.__int__()

    speech_record = SpeechRecord(
        patient_id=patient_id,
        data=speech_cloudinary_url,
        created_at=datetime.now(),
        prediction=prediction,
        multimodal=True
    )

    speech_inserted_id = speech_record.save_speech_record()

    speech_id = speech_inserted_id

    if not speech_inserted_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add speech record")

    patient_dict["speech_data_records"].append(speech_data_record.model_dump())
    Patient.update(patient_id, patient_dict)

    # ===================================================================
    # Facial Processing =================================================
    # ===================================================================

    filename = f"{patient_id}_{image.filename}"
    file_location = os.path.join(UPLOADS_DIR, filename)
    
    # Read file content asynchronously
    image_contents = await image.read()
    with open(os.path.join(UPLOADS_DIR, filename), "wb") as f:
        f.write(image_contents)

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

    image_cloudianry_url = await upload_image_to_cloudinary(image_contents, patient_id, "fyp-multimodal")
    os.remove(file_location)

    facial_data_record = FacialDataRecordSchema(data=image_cloudianry_url, date=datetime.now(), prediction=str(prediction),
                                                confidence=float(combined_conf),
                                                prediction_result_in_probability_of_efficentnet_model=prediction_result_in_probability_of_efficentnet_model,
                                                prediction_result_in_probability_of_yolo_model=prediction_result_in_probability_of_yolo_model,
                                                predicted_probabilities_efficentnet_model=predicted_probabilities_efficentnet_model,
                                                predicted_probabilities_of_yolo_model=predicted_probabilities_of_yolo_model,
                                                prediction_result_in_encoded_category_of_efficentnet_model=prediction_result_in_encoded_category_of_efficentnet_model,
                                                prediction_result_in_encoded_category_of_yolo_model=prediction_result_in_encoded_category_of_yolo_model,
                                                prediction_result_in_category_of_efficentnet_model=prediction_result_in_category_of_efficentnet_model,
                                                prediction_result_in_category_of_yolo_model=prediction_result_in_category_of_yolo_model,
                                                multimodal=True)
    facial_record = FacialDataRecord(patient_id=patient_id, data=image_cloudianry_url, prediction=str(prediction),
                                     confidence=float(combined_conf), date=datetime.now(),
                                     prediction_result_in_probability_of_efficentnet_model=prediction_result_in_probability_of_efficentnet_model,
                                     prediction_result_in_probability_of_yolo_model=prediction_result_in_probability_of_yolo_model,
                                     predicted_probabilities_efficentnet_model=predicted_probabilities_efficentnet_model,
                                     predicted_probabilities_of_yolo_model=predicted_probabilities_of_yolo_model,
                                     prediction_result_in_encoded_category_of_efficentnet_model=prediction_result_in_encoded_category_of_efficentnet_model,
                                     prediction_result_in_encoded_category_of_yolo_model=prediction_result_in_encoded_category_of_yolo_model,
                                     prediction_result_in_category_of_efficentnet_model=prediction_result_in_category_of_efficentnet_model,
                                     prediction_result_in_category_of_yolo_model=prediction_result_in_category_of_yolo_model,
                                     multimodal=True)
    facial_record_id = facial_record.save()


    if not facial_record_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add facial record")
    patient_dict["facial_data_records"].append(facial_data_record.model_dump())

    facial_confidence = float(combined_conf)

    facial_id = facial_record_id

    updated_patient = Patient.update(patient_id, patient_dict)
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    # =====================================================================================
    # EEG PROCESSING ======================================================================
    # =====================================================================================

    eeg_data.pop("name")
    eeg_data.pop("patient_id")

    columns = ['group', 'time_point', 'delta_F_sx', 'delta_F_dx', 'theta_F_sx', 'theta_F_dx', 'low_alpha_F_sx',
               'low_alpha_F_dx', 'high_alpha_F_sx', 'high_alpha_F_dx', 'beta_F_sx', 'beta_F_dx', 'gamma_F_sx',
               'gamma_F_dx']
    input_df = pd.DataFrame(eeg_data, columns=columns, index=[0])

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
        prediction_result_in_category = "Typical"

    result = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    doctor_id: str = result.get("id")

    eeg_data_2 = EEGDataRecord(
        **eeg_data,
        doctor_id=doctor_id,
        patient_id=patient_id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        prediction_result_in_probability=predicted_probs[predicted_class],
        predicted_probabilities=predicted_probs,
        prediction_result_in_encoded_category=predicted_class,
        prediction_result_in_category=prediction_result_in_category,
        multimodal=True
    )
    eeg_id = eeg_data_2.save()

    eeg_confidence = predicted_probs[predicted_class]
    
    # Initialize video_records if it doesn't exist
    if "video_records" not in patient_dict:
        patient_dict["video_records"] = []
        
    patient_dict["eeg_data_records"].append(eeg_data_2.__dict__)
    updated_patient = Patient.update(patient_id, patient_dict)
    
    # Create new patient object with the updated data
    new_patient = Patient(
        name=patient_dict["name"],
        email=patient_dict["email"],
        phone=patient_dict["phone"],
        address=patient_dict["address"],
        mother_name=patient_dict["mother_name"],
        mother_cnic=patient_dict["mother_cnic"],
        father_name=patient_dict["father_name"],
        father_cnic=patient_dict["father_cnic"],
        dob=patient_dict["dob"],
        gender=patient_dict["gender"],
        born_country=patient_dict["born_country"],
        born_city=patient_dict["born_city"],
        other_info=patient_dict.get("other_info", ""),
        asd=patient_dict["asd"],
        doctor=patient_dict["doctor"],
        facial_data_records=patient_dict.get("facial_data_records", []),
        eeg_data_records=patient_dict.get("eeg_data_records", []),
        speech_data_records=patient_dict.get("speech_data_records", []),
        video_records=patient_dict.get("video_records", [])
    )
    
    if not updated_patient:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")

    # Initialize weights
    weights = {
        "eeg": 0.35,
        "facial": 0.25,
        "speech": 0.20,
        "video": 0.20
    }

    weighted_sum = 0
    total_weight = 0
    confidences = {}


    weighted_sum += weights["eeg"] * eeg_confidence
    total_weight += weights["eeg"]
    confidences["eeg"] = eeg_confidence

    weighted_sum += weights["facial"] * facial_confidence
    total_weight += weights["facial"]
    confidences["facial"] = facial_confidence

    weighted_sum += weights["speech"] * speech_confidence
    total_weight += weights["speech"]
    confidences["speech"] = speech_confidence

    weighted_sum += weights["video"] * video_confidence
    total_weight += weights["video"]
    confidences["video"] = video_confidence

    final_confidence = weighted_sum / total_weight
    final_prediction = "HL-ASD" if final_confidence > 0.5 else "Typical"

    # # Create and save multimodal record
    multimodal_record = MultimodalDataRecord(
        patient_id=patient_id,
        eeg_record_id=eeg_id,
        facial_record_id=facial_id,
        speech_record_id=str(speech_id),
        video_record_id=str(video_id),
        eeg_confidence=confidences.get("eeg", 0.0),
        facial_confidence=confidences.get("facial", 0.0),
        speech_confidence=confidences.get("speech", 0.0),
        video_confidence=confidences.get("video", 0.0),
        final_prediction=final_prediction,
        final_confidence=final_confidence,
        modality_weights=weights
    )

    multimodal_record.save()

    multimodal_schema = MultimodalDataRecordSchema(
        patient_id=patient_id,
        eeg_record_id=eeg_id,
        facial_record_id=facial_id,
        speech_record_id=str(speech_id),
        video_record_id=str(video_id),
        eeg_confidence=confidences.get("eeg", 0.0),
        facial_confidence=confidences.get("facial", 0.0),
        speech_confidence=confidences.get("speech", 0.0),
        video_confidence=confidences.get("video", 0.0),
        final_prediction=final_prediction,
        final_confidence=final_confidence,
        modality_weights=weights,
        date=datetime.now()
    )

    return {
        'success':True,
        'data': multimodal_schema.model_dump(),
        'speech_record': speech_data_record.model_dump(),
        'eeg_record': eeg_data_2.__dict__,
        'facial_record': facial_data_record.model_dump(),
        'video_record': video_data_record.model_dump()
    }
