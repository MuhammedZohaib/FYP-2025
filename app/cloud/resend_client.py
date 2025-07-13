import os
import resend
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

def send_reset_email(to_email: str, code: str):
    return resend.Emails.send({
        "from": "ASD AI <no-reply@ash-dev.me>",
        "to": [to_email],
        "subject": "Reset Your Password",
        "html": f"""
            <p>You requested a password reset.</p>
            <p>{code} is your reset password code.</p>
            <p>This code will expire in 5 minutes.</p>
        """
    })
