from datetime import datetime
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException
from io import BytesIO
from dotenv import load_dotenv
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

async def upload_audio_to_cloudinary(audio_content, patient_id) -> str:
    try:
        # Create a BytesIO object to upload the file
        audio_stream = BytesIO(audio_content)

        # Upload the audio file to Cloudinary
        response = cloudinary.uploader.upload(
            audio_stream,
            resource_type='video',  # Audio files are treated as 'video' in Cloudinary
            public_id=f"audio/{patient_id}_{datetime.now().timestamp()}",  # Optional: Customize public ID
            folder="fyp-audio",  # Optional: You can specify a folder for organization
            use_filename=True,  # Preserve the original filename
            unique_filename=True  # Ensures unique filename in Cloudinary
        )

        # Return the URL of the uploaded file
        return response['secure_url']

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")


async def upload_video_to_cloudinary(video_content, patient_id) -> str:
    try:
        # Create a BytesIO object to upload the file
        video_stream = BytesIO(video_content)

        # Upload the audio file to Cloudinary
        response = cloudinary.uploader.upload(
            video_stream,
            resource_type='video',  # Audio files are treated as 'video' in Cloudinary
            public_id=f"audio/{patient_id}_{datetime.now().timestamp()}",  # Optional: Customize public ID
            folder="fyp-video",  # Optional: You can specify a folder for organization
            use_filename=True,  # Preserve the original filename
            unique_filename=True  # Ensures unique filename in Cloudinary
        )

        # Return the URL of the uploaded file
        return response['secure_url']

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")

async def upload_image_to_cloudinary(image_content, patient_id) -> str:
    try:
        video_stream = BytesIO(image_content)

        # Upload the audio file to Cloudinary
        response = cloudinary.uploader.upload(
            video_stream,
            resource_type='image',  # Audio files are treated as 'video' in Cloudinary
            public_id=f"audio/{patient_id}_{datetime.now().timestamp()}",  # Optional: Customize public ID
            folder="fyp-image",  # Optional: You can specify a folder for organization
            use_filename=True,  # Preserve the original filename
            unique_filename=True  # Ensures unique filename in Cloudinary
        )

        # Return the URL of the uploaded file
        return response['secure_url']

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
