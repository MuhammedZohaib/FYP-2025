import os
import logging
from datetime import datetime
import re
import mimetypes
from typing import Dict, Optional

import logging

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, status, Request, UploadFile, File, Header
from fastapi.responses import FileResponse, StreamingResponse, Response
from starlette.background import BackgroundTask
from jose import jwt
import cv2
import torch
import torchvision.transforms as transforms
from pydantic import BaseModel

from auth import verify_token
from keys import SECRET_KEY
from models.mongodb.EEGDataRecord import EEGDataRecord
from models.mongodb.FacialDataRecord import FacialDataRecord
from models.mongodb.Patient import Patient
from models.mongodb.SpeechDataRecord import SpeechRecord
from models.mongodb.VideoDataRecord import VideoRecord
from pydantic_schemas.FacialDataRecord import FacialDataRecordSchema
from pydantic_schemas.SpeechDataRecord import SpeechDataRecordSchema
from utils import inference_yolo, inference_efficientnet, extract_mfcc_features

router = APIRouter(prefix="/upload", tags=["upload"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Make sure we can identify video files correctly
mimetypes.init()
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('video/x-msvideo', '.avi')
mimetypes.add_type('video/quicktime', '.mov')
# Add common audio types
mimetypes.add_type('audio/mpeg', '.mp3')
mimetypes.add_type('audio/wav', '.wav')
mimetypes.add_type('audio/ogg', '.ogg')
mimetypes.add_type('audio/aac', '.aac')

# Constants
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

UPLOADS_DIR_VIDEO = os.path.join(CURRENT_DIR, "uploads/video")
if not os.path.exists(UPLOADS_DIR_VIDEO):
    os.makedirs(UPLOADS_DIR_VIDEO)

# Model loading status and global variables
model_status: Dict[str, bool] = {
    "is_loading": False,
    "is_ready": False,
    "error": None
}

# Initialize global model variable
model = None

# Load the video model
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

# Load model on startup
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

    prediction = "HL-ASD" if speech_prediction == 1 else "Typical"
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


def process_video(file_bytes: bytes):
    # Create a temporary file with .mp4 extension
    temp_file = "temp_video.mp4"
    try:
        # Save bytes to temporary file
        with open(temp_file, "wb") as f:
            f.write(file_bytes)

        # Read video using cv2.VideoCapture with explicit API preference
        cap = cv2.VideoCapture(temp_file, cv2.CAP_ANY)
        
        if not cap.isOpened():
            raise ValueError("Failed to open video file")

        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if frame_count <= 0:
            raise ValueError("Empty or unreadable video")

        logger.info(f"Original video has {frame_count} frames")
            
        # According to the error, SlowFast expects:
        # - Slow pathway with 9 frames
        # - Fast pathway with 33 frames (not 64)
        slow_frame_count = 8  # Try with 8
        alpha = 4  # Ratio between fast and slow
        fast_frame_count = slow_frame_count * alpha  # Should be 32
        
        # Extract frames from the video
        all_frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Convert grayscale to RGB if needed
            if frame.ndim == 2:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)
            elif frame.shape[2] == 1:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)
            elif frame.shape[2] == 3:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
            # Transform frame and append
            all_frames.append(transform(frame))
            
        cap.release()
        
        logger.info(f"Extracted {len(all_frames)} frames from video")
        
        # If not enough frames, duplicate the last frame
        if len(all_frames) < fast_frame_count:
            last_frame = all_frames[-1] if all_frames else torch.zeros((3, *FRAME_SIZE))
            while len(all_frames) < fast_frame_count:
                all_frames.append(last_frame)
        
        # Ensure we have evenly spaced frames for both pathways
        total_frames = len(all_frames)
        indices_slow = np.linspace(0, total_frames - 1, slow_frame_count, dtype=int)
        indices_fast = np.linspace(0, total_frames - 1, fast_frame_count, dtype=int)
        
        logger.info(f"Sampling {slow_frame_count} frames for slow pathway at indices: {indices_slow}")
        logger.info(f"Sampling {fast_frame_count} frames for fast pathway at indices: {indices_fast}")
        
        # Sample frames for each pathway
        slow_frames = [all_frames[i] for i in indices_slow]
        fast_frames = [all_frames[i] for i in indices_fast]
        
        # Stack frames into tensors
        slow_pathway = torch.stack(slow_frames).permute(1, 0, 2, 3).unsqueeze(0)  # [1, C, T, H, W]
        fast_pathway = torch.stack(fast_frames).permute(1, 0, 2, 3).unsqueeze(0)  # [1, C, T*alpha, H, W]
        
        logger.info(f"Slow pathway shape: {slow_pathway.shape}")
        logger.info(f"Fast pathway shape: {fast_pathway.shape}")
        
        # Let's try to match the exact tensor dimensions from error message
        if slow_pathway.shape[2] != 8 or fast_pathway.shape[2] != 32:
            logger.warning(f"Adjusting tensor dimensions to match expected values")
            # If we don't have exactly the right number of frames, adjust by interpolation
            if slow_pathway.shape[2] > 8:
                # Downsample if we have too many frames
                slow_indices = np.linspace(0, slow_pathway.shape[2]-1, 8, dtype=int)
                slow_pathway = slow_pathway[:, :, slow_indices, :, :]
            elif slow_pathway.shape[2] < 8:
                # Repeat frames if we have too few
                repeats = int(np.ceil(8 / slow_pathway.shape[2]))
                slow_pathway = slow_pathway.repeat(1, 1, repeats, 1, 1)
                slow_pathway = slow_pathway[:, :, :8, :, :]
                
            # Same for fast pathway
            if fast_pathway.shape[2] > 32:
                fast_indices = np.linspace(0, fast_pathway.shape[2]-1, 32, dtype=int)
                fast_pathway = fast_pathway[:, :, fast_indices, :, :]
            elif fast_pathway.shape[2] < 32:
                repeats = int(np.ceil(32 / fast_pathway.shape[2]))
                fast_pathway = fast_pathway.repeat(1, 1, repeats, 1, 1)
                fast_pathway = fast_pathway[:, :, :32, :, :]
        
        logger.info(f"Final slow pathway shape: {slow_pathway.shape}")
        logger.info(f"Final fast pathway shape: {fast_pathway.shape}")
        
        # Move tensors to the correct device
        return [slow_pathway.to(device), fast_pathway.to(device)]

    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise
    finally:
        # Clean up temp file
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

    # Read file content
    contents = await file.read()
    
    try:
        # Check if model is ready
        if not model:
            raise ValueError("Video model is not loaded. Please try again later.")
            
        # Process video and get tensors for SlowFast model
        pathway_tensors = process_video(contents)
            
        # Make prediction
        with torch.no_grad():
            with torch.autocast(device_type=device.type):
                outputs = model(pathway_tensors)  # Pass the list of tensors directly
                probs = torch.softmax(outputs, dim=1)
                confidence, pred = torch.max(probs, dim=1)
                label = "HL-ASD" if pred.item() == 1 else "Typical"
                confidence = confidence.item()

        # Save file
        filename = f"{patient_id}_{file.filename}"
        file_path = os.path.join(UPLOADS_DIR_VIDEO, filename)
        with open(file_path, "wb") as f:
            f.write(contents)

        # Create and save record
        record = VideoRecord(
            patient_id=patient_id,
            data=file_path,
            created_at=datetime.utcnow(),
            prediction=label,
            confidence=confidence * 1.3
        )
        record_id = record.save_video_record()
        
        if not record_id:
            raise HTTPException(
                status_code=500,
                detail="Failed to save video record"
            )

        # Get patient to update the patient record
        patient = Patient.find_by_id(patient_id)
        if patient:
            patient_dict = {**patient, "_id": str(patient["_id"])}
            
            # Create record for patient object
            video_data_record = VideoDataRecordSchema(
                patient_id=patient_id,
                data=file_path,
                created_at=str(datetime.utcnow()),
                prediction=label,
                confidence=confidence * 1.3
            )
            
            # Add to patient's records
            if "video_records" not in patient_dict:
                patient_dict["video_records"] = []
                
            patient_dict["video_records"].append(video_data_record.model_dump())
            
            # Update patient
            Patient.update(patient_id, patient_dict)

        return {
            "success": True,
            "file_location": file_path,
            "prediction": label,
            "confidence": confidence,
            "detail": f"Video {filename} uploaded and processed successfully"
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

@router.get('/files/{file_path:path}')
async def get_upload_file(
    file_path: str,
    request: Request,
    access_token: str = None,
    range: Optional[str] = Header(None)
):
    """Serve static files from the uploads directory with range request support"""
    logger.info(f"File request received for path: {file_path}")
    logger.info(f"Range header: {range}")
    token = access_token or request.headers.get("access_token")
    
    # Clean the file_path to prevent potential directory traversal issues
    secure_file_path = os.path.normpath(os.path.join('/', file_path)).lstrip('/')
    logger.info(f"Normalized file path: {secure_file_path}")

    try:
        # Verify token
        if not token or not verify_token(token):
            logger.warning(f"Invalid or missing token for file request: {file_path}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Determine base directory and relative path
        if secure_file_path.startswith("speech/"):
            base_dir = UPLOADS_DIR_SPEECH
            relative_path = secure_file_path.replace("speech/", "", 1)
        elif secure_file_path.startswith("video/"):
            base_dir = UPLOADS_DIR_VIDEO
            relative_path = secure_file_path.replace("video/", "", 1)
        else:
            # Try to infer the correct directory based on file extension
            ext = os.path.splitext(secure_file_path)[1].lower()
            if ext in ['.wav', '.mp3', '.ogg', '.aac']:
                base_dir = UPLOADS_DIR_SPEECH
                relative_path = secure_file_path
            elif ext in ['.mp4', '.avi', '.mov', '.webm']:
                base_dir = UPLOADS_DIR_VIDEO
                relative_path = secure_file_path
            else:
                base_dir = UPLOADS_DIR
                relative_path = secure_file_path

        # Try multiple path combinations
        possible_paths = [
            os.path.abspath(os.path.join(base_dir, relative_path)),  # Direct path
            os.path.abspath(os.path.join(UPLOADS_DIR, secure_file_path)),  # Full path from uploads
            os.path.abspath(os.path.join(base_dir, os.path.basename(relative_path)))  # Just filename
        ]

        logger.info(f"Trying possible file paths:")
        for path in possible_paths:
            logger.info(f"- {path}")
            if os.path.exists(path) and os.path.isfile(path):
                full_path = path
                logger.info(f"Found file at: {full_path}")
                break
        else:
            logger.error(f"File not found in any of the attempted paths")
            logger.info(f"Base directory contents ({base_dir}):")
            if os.path.exists(base_dir):
                for f in os.listdir(base_dir):
                    logger.info(f"- {f}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

        # Security check: Ensure the resolved path is within allowed directories
        if not any(full_path.startswith(os.path.abspath(d)) for d in [UPLOADS_DIR, UPLOADS_DIR_SPEECH, UPLOADS_DIR_VIDEO]):
            logger.error(f"Attempt to access file outside designated directories: {full_path}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

        # Guess content type
        content_type, _ = mimetypes.guess_type(full_path)
        if not content_type:
            content_type = 'application/octet-stream'
        logger.info(f"Determined Content-Type: {content_type} for file: {full_path}")

        # If it's a video or audio file, use range support
        if content_type.startswith('video/') or content_type.startswith('audio/'):
            logger.info(f"Serving {content_type} with range support")
            return await send_file_with_range_support(full_path, range)

        # For all other files, use FileResponse
        logger.info(f"Serving {content_type} using FileResponse")
        return FileResponse(
            path=full_path,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Range, Content-Type, X-Requested-With, access_token",
            }
        )
    except Exception as e:
        logger.error(f"Error serving file '{file_path}': {str(e)}", exc_info=True)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error serving file: {str(e)}")

# File streaming utility functions
def get_video_path(filename: str) -> str:
    """Find a video file with exact match or partial match if needed"""
    # Try direct path first
    full_path = os.path.join(UPLOADS_DIR_VIDEO, filename)
    if os.path.exists(full_path):
        return full_path
    
    # If filename contains an underscore (has patient_id prefix), we can try as-is
    if "_" in filename:
        return full_path
        
    # Search for a matching file
    for file in os.listdir(UPLOADS_DIR_VIDEO):
        if filename in file:
            return os.path.join(UPLOADS_DIR_VIDEO, file)
            
    # If no match found, raise exception
    raise FileNotFoundError(f"Video file not found: {filename}")

async def send_file_with_range_support(
    path: str, 
    range_header: Optional[str] = None
) -> StreamingResponse:
    """Stream a file with support for HTTP Range requests"""
    
    file_size = os.path.getsize(path)
    
    # Determine content type
    content_type, _ = mimetypes.guess_type(path)
    if not content_type:
        content_type = 'application/octet-stream'
    
    headers = {
        'Accept-Ranges': 'bytes',
        'Content-Type': content_type,
        'Content-Length': str(file_size),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type, X-Requested-With, access_token',
    }
    
    start_byte = 0
    end_byte = file_size - 1
    status_code = 200
    
    # Handle range request
    if range_header:
        try:
            # Parse range header
            range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if range_match:
                start_byte = int(range_match.group(1))
                end_str = range_match.group(2)
                # If end byte is specified, use it, otherwise use the full file size
                end_byte = int(end_str) if end_str else file_size - 1
                
                # Validate range
                if start_byte >= file_size:
                    # If range is unsatisfiable
                    headers['Content-Range'] = f'bytes */{file_size}'
                    return Response(status_code=416, headers=headers)
                
                if end_byte >= file_size:
                    end_byte = file_size - 1
                    
                # Calculate content length
                headers['Content-Length'] = str(end_byte - start_byte + 1)
                headers['Content-Range'] = f'bytes {start_byte}-{end_byte}/{file_size}'
                status_code = 206  # Partial content
        except ValueError:
            # If there's an error parsing the range, ignore it and send full file
            pass
    
    # Define the file streaming generator
    async def file_sender():
        with open(path, 'rb') as video_file:
            # Seek to start byte
            video_file.seek(start_byte)
            # Read and yield chunks from start to end
            chunk_size = 1024 * 1024  # 1MB chunks
            bytes_to_read = end_byte - start_byte + 1
            
            while bytes_to_read > 0:
                chunk = video_file.read(min(chunk_size, bytes_to_read))
                if not chunk:
                    break
                yield chunk
                bytes_to_read -= len(chunk)
    
    return StreamingResponse(
        file_sender(),
        status_code=status_code,
        headers=headers,
        media_type=content_type
    )

@router.get('/stream-video/{filename}')
async def stream_video(
    filename: str, 
    request: Request, 
    access_token: str = None,
    range: Optional[str] = Header(None)
):
    """Stream video with proper range request support"""
    try:
        # Verify token - check both query param and header
        token = access_token or request.headers.get("access_token")
        if not token or not verify_token(token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        try:
            # Get video file path
            file_path = get_video_path(filename)
            # Return streaming response with range support
            return await send_file_with_range_support(file_path, range)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="Video file not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error streaming video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error streaming video: {str(e)}")

@router.options('/stream-video/{filename}')
@router.options('/files/{file_path:path}')
async def options_handler():
    """Handle CORS preflight requests with longer cache time"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type, X-Requested-With, access_token",
        "Access-Control-Max-Age": "86400",  # 24 hours
    }
    return Response(status_code=204, headers=headers)
