import onnxruntime
import cv2
import os
import librosa
import numpy as np
from fastapi import HTTPException

YOLO_WEIGHTAGE = 0.6
EFFICIENTNET_WEIGHTAGE = 0.4

photo_size = 240
yolo_image_size = 320
efficientnet_model_file = os.path.abspath("efficientnet_model.onnx")
efficientnet_model_file = efficientnet_model_file.replace("\\", "\\\\")
yolo_model_file = os.path.abspath("yolov8_m.onnx")
yolo_model_file = yolo_model_file.replace("\\", "\\\\")


def extract_mfcc_features(file_path):
    try:
        y, sr = librosa.load(file_path, sr=None)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfcc.T, axis=0)
        return mfcc_mean.reshape(1, -1)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {e}")


def load_image_from_path(filename, target_size=(320, 320), transpose=False):
    img = cv2.imread(filename)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, target_size)
    img = img.astype('float32') / 255.0
    if transpose:
        img = np.transpose(img, (2, 0, 1))
    img = np.expand_dims(img, axis=0)
    return img


def inference_onnx(model_path, img_path, target_size, transpose=False):
    img = load_image_from_path(img_path, target_size=target_size, transpose=transpose)
    session = onnxruntime.InferenceSession(model_path)
    input_name = session.get_inputs()[0].name
    output_name = session.get_outputs()[0].name
    result = session.run([output_name], {input_name: img})
    return result[0][0]


def inference_yolo(img_path, model_path=yolo_model_file):
    result = inference_onnx(model_path, img_path, target_size=(yolo_image_size, yolo_image_size), transpose=True)
    yolo_class = np.argmax(result)
    yolo_conf = result[yolo_class]
    return yolo_class, yolo_conf


def inference_efficientnet(img_path, model_path=efficientnet_model_file):
    result = inference_onnx(model_path, img_path, target_size=(photo_size, photo_size), transpose=False)
    efficientnet_conf = result[0]
    efficientnet_class = 0 if efficientnet_conf > 0.5 else 1
    return efficientnet_class, efficientnet_conf


def predict(image_path):
    yolo_class, yolo_conf = inference_yolo(image_path)
    efficientnet_class, efficientnet_conf = inference_efficientnet(image_path)

    if yolo_class == 0:
        yolo_autistic_conf = yolo_conf
    else:
        yolo_autistic_conf = 1 - yolo_conf

    combined_conf = (YOLO_WEIGHTAGE * yolo_autistic_conf) + (EFFICIENTNET_WEIGHTAGE * efficientnet_conf)
    final_class = 0 if combined_conf > 0.5 else 1
    if final_class == 1:
        combined_conf = 1 - combined_conf
    class_names = ['Autistic', 'Non_Autistic']
    predicted_class_name = class_names[final_class]

    return {"class": predicted_class_name, "confidence": combined_conf}
