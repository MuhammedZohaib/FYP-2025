from fastapi import APIRouter, HTTPException, status
from starlette.responses import JSONResponse
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

import logging

from models.mogodb.Doctor import Doctor
from models.mogodb.EEGDataRecord import EEGDataRecord
from models.mogodb.Patient import Patient
from pydantic_schemas.Email import EmailSchema

router = APIRouter(prefix="/email", tags=["email"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

conf = ConnectionConfig(
    MAIL_USERNAME="ar5414929@gmail.com",
    MAIL_PASSWORD="ublz hxxh aaau mkhg",
    MAIL_FROM="ar5414929@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="Dr. Imran Raza",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


@router.post("/share-patient")
async def email_send(email: EmailSchema) -> JSONResponse:
    patient = Patient.find_by_email(email.dict().get("patient_email"))
    if patient is None:
        return JSONResponse(status_code=404, content={"message": "Patient not found"})
    patient_dict = {**patient, "_id": str(patient["_id"])}
    # remove _id
    patient_dict.pop("_id")
    patient_dict.pop('isReportGenerated')
    patient_dict.pop('care_giver_prompt')
    patient_dict.pop('health_provider_prompt')

    new_patient = Patient(**patient_dict)
    html = f"""
    <html>
    <head>
    <style>
    table {{
    border-collapse: collapse;
    width: 100%;
    }}
    th, td {{
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
    }}
    th {{
    background-color: #f2f2f2;
    }}
    </style>
    </head>
    <body>
    <h1>Hello, Dr. {email.name}!</h1>
    <div style="color: #000000; font-size: 13px; line-height: 24px; margin: 0 0 24px; padding: 0; text-align: left;">{email.message}</div>

    <div>
    <div>
        <h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:1rem">Patient Details</h2>
        <div style="overflow-x:auto">
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Mother Name</th>
                <th>Mother CNIC</th>
                <th>Father Name</th>
                <th>Father CNIC</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Born Country</th>
                <th>Born City</th>
                <th>Other Info</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>{new_patient.name}</td>
                <td>{new_patient.email}</td>
                <td>{new_patient.phone}</td>
                <td>{new_patient.address}</td>
                <td>{new_patient.mother_name}</td>
                <td>{new_patient.mother_cnic}</td>
                <td>{new_patient.father_name}</td>
                <td>{new_patient.father_cnic}</td>
                <td>{new_patient.dob}</td>
                <td>{new_patient.gender}</td>
                <td>{new_patient.born_country}</td>
                <td>{new_patient.born_city}</td>
                <td>{new_patient.other_info}</td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>

    <div style="margin-top: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: bold;">EEG Data Records</h2>
        <div style="overflow-x:auto;">
        <table>
            <thead>
            <tr>
                <th>Updated At</th>
                <th>Delta F sx</th>
                <th>Delta F dx</th>
                <th>Theta F sx</th>
                <th>Theta F dx</th>
                <th>Low Alpha F sx</th>
                <th>Low Alpha F dx</th>
                <th>High Alpha F sx</th>
                <th>High Alpha F dx</th>
                <th>Beta F sx</th>
                <th>Beta F dx</th>
                <th>Gamma F sx</th>
                <th>Gamma F dx</th>
                <th>Group</th>
                <th>Time Point</th>
                <th>Prediction</th>
            </tr>
            </thead>
            <tbody>
    """

    for record in new_patient.eeg_data_records:
        record["prediction_result_in_probability"] = record.get("prediction_result_in_probability",
                                                                0.0)  # Default to 0.0
        record["predicted_probabilities"] = record.get("predicted_probabilities", [])  # Default to an empty list
        record["prediction_result_in_encoded_category"] = record.get("prediction_result_in_encoded_category",
                                                                     0)  # Default to 0
        record["prediction_result_in_category"] = record.get("prediction_result_in_category",
                                                             "Unknown")  # Default to "Unknown"
        patient = EEGDataRecord(**record)
        html += f"""    
            <tr>
                <td>{patient.updated_at}</td>
                <td>{patient.delta_F_sx}</td>
                <td>{patient.delta_F_dx}</td>
                <td>{patient.theta_F_sx}</td>
                <td>{patient.theta_F_dx}</td>
                <td>{patient.low_alpha_F_sx}</td>
                <td>{patient.low_alpha_F_dx}</td>
                <td>{patient.high_alpha_F_sx}</td>
                <td>{patient.high_alpha_F_dx}</td>
                <td>{patient.beta_F_sx}</td>
                <td>{patient.beta_F_dx}</td>
                <td>{patient.gamma_F_sx}</td>
                <td>{patient.gamma_F_dx}</td>
                <td>{patient.group}</td>
                <td>{patient.time_point}</td>
                <td>{patient.prediction}</td>
            </tr>
    """

    html += """
            </tbody>
        </table>
        </div>
    </div>
    </div>

    <div>
        <h2 style="font-size: 1.25rem; font-weight: bold; margin-top: 2rem; color: #333333;">Thank you!</h2>
        <p style="font-size: 1rem; font-weight: 400; margin-top: 1rem; color: #333333; line-height: 24px;">
            This email was sent by Brainostics. If you have any questions, please contact us at
            <a href="mailto:ar5414924@gmail.com" style="color: #007bff; display: block;">Team Brainostics</a>.
        </p>
    </div>


    </body>
    </html>
    """

    message = MessageSchema(
        subject="Accesss to Brainostics Patient Data",
        recipients=email.dict().get("email"),
        body=html,
        subtype="html")

    fm = FastMail(conf)
    await fm.send_message(message)
    return JSONResponse(status_code=200, content={"message": "Email has been sent", 'success': True})


def make_password():
    import random
    import string
    password = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return password


@router.post('/change-password', status_code=status.HTTP_200_OK)
async def change_password(data: dict) -> JSONResponse:
    email = data.get("email")
    password = make_password()

    doctor = Doctor.find_by_email(email)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found with the provided email."
        )

    Doctor.change_password(email, password)

    html = f"""
    <html>
    <head>
    <style>
    table {{
    border-collapse: collapse;
    width: 100%;
    }}
    th, td {{
    border: 1px solid
    text-align: left;
    padding: 8px;
    }}
    th {{
    background-color: #f2f2f2;
    }}
    </style>
    </head>
    <body>
    <h1>Hello, Dr. {doctor['name']}!</h1>
    <div style="color: #000000; font-size: 13px; line-height: 24px; margin: 0 0 24px; padding: 0; text-align: left;">
    Your password has been updated successfully. Your new password is: <strong>{password}</strong>
    </div>
    <div>
        <h2 style="font-size: 1.25rem; font-weight: bold; margin-top: 2rem; color: #333333;">Thank you!</h2>
        <p style="font-size: 1rem; font-weight: 400; margin-top: 1rem; color: #333333; line-height: 24px;">
            This email was sent by Brainostics. If you have any questions, please contact us at
            <a href="mailto:ar5414924@gmail.com" style="color: #007bff; display: block;">Team Brainostics</a>.
        </p>
    </div>


    </body>
    </html>
    """
    message = MessageSchema(
        subject="Password Updated Successfully!",
        recipients=[email],
        body=html,
        subtype="html")

    fm = FastMail(conf)
    await fm.send_message(message)
    return JSONResponse(status_code=200, content={
        "detail": "Password updated successfully. Please check your email for the new password.", 'success': True})
