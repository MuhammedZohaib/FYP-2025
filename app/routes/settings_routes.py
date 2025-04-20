import os
import logging
import pyotp
import qrcode
import io
import base64
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Header, status, BackgroundTasks
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from pydantic import BaseModel

from models.UserAccessibility import UserAccessibility
from models.UserNotifications import UserNotifications
from models.UserSecurity import UserSecurity
from pydantic_schemas.UserSettings import (
    AccessibilitySettings, 
    AccessibilitySettingsUpdate,
    NotificationSettings,
    NotificationSettingsUpdate,
    SecuritySettings,
    SecuritySettingsUpdate,
    PasswordChangeRequest,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    SuccessResponse,
    ErrorResponse,
    SessionInfo
)
from auth import verify_token
from keys import SECRET_KEY

# Create routers
accessibility_router = APIRouter(prefix="/settings/accessibility", tags=["settings"])
notifications_router = APIRouter(prefix="/settings/notifications", tags=["settings"])
security_router = APIRouter(prefix="/settings/security", tags=["settings"])

# Rate limiting setup (simplified)
request_counts = {}

# Middleware to check if user has recently authenticated
async def require_recent_auth(request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token required"
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        # Check if token was recently issued (within 5 minutes)
        issued_at = payload.get("iat")
        if not issued_at or (datetime.now().timestamp() - issued_at > 300):  # 5 minutes
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Recent authentication required for this operation"
            )
        
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Helper to get current user from token
async def get_current_user(request: Request):
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token required"
        )
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return payload.get("id")

# CSRF token validation middleware
async def validate_csrf_token(request: Request, call_next):
    # Skip CSRF validation for GET requests
    if request.method == "GET":
        return await call_next(request)
    
    # For POST, PUT, PATCH, DELETE, require CSRF token
    if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": {"code": "missing_csrf_token", "detail": "CSRF token is required"}}
            )
        
        # Verify CSRF token (simplified - in production, would compare with stored token)
        user_id = request.headers.get("access_token")
        if not user_id:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": {"code": "missing_token", "detail": "Access token is required"}}
            )
        
        # Additional CSRF validation logic would go here
        
    return await call_next(request)

# Rate limiting middleware for auth-related endpoints
async def rate_limit_auth_endpoints(request: Request, call_next):
    path = request.url.path
    
    # Apply rate limiting only to auth-related endpoints
    if path.startswith("/settings/security/password") or path.startswith("/settings/security/2fa"):
        ip = request.client.host
        current_minute = datetime.now().strftime("%Y-%m-%d %H:%M")
        key = f"{ip}:{current_minute}"
        
        request_counts[key] = request_counts.get(key, 0) + 1
        
        if request_counts[key] > 10:  # 10 requests per minute limit
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": {"code": "rate_limit_exceeded", "detail": "Too many requests, please try again later"}}
            )
    
    return await call_next(request)

# Add middleware to the application
# Note: In main.py or similar, you'd add: app.middleware("http")(validate_csrf_token)
# app.middleware("http")(rate_limit_auth_endpoints)

#
# Accessibility Settings Routes
#

@accessibility_router.get("", response_model=AccessibilitySettings)
async def get_accessibility_settings(user_id: str = Depends(get_current_user)):
    """
    Get the user's accessibility settings
    """
    settings = UserAccessibility.find_by_user_id(user_id)
    
    if not settings:
        # Return default settings if none exist
        return AccessibilitySettings()
    
    return AccessibilitySettings(
        font_size=settings.get("font_size", 16),
        high_contrast=settings.get("high_contrast", False),
        dyslexia_font=settings.get("dyslexia_font", False)
    )

@accessibility_router.patch("", response_model=SuccessResponse)
async def update_accessibility_settings(
    settings: AccessibilitySettingsUpdate,
    user_id: str = Depends(get_current_user)
):
    """
    Update the user's accessibility settings
    """
    # Convert pydantic model to dict, excluding None values
    settings_dict = {k: v for k, v in settings.model_dump().items() if v is not None}
    
    if not settings_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings provided for update"
        )
    
    # Update or create settings
    result = UserAccessibility.update(user_id, settings_dict)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update accessibility settings"
        )
    
    return {"detail": "Accessibility settings updated successfully"}

#
# Notification Settings Routes
#

@notifications_router.get("", response_model=NotificationSettings)
async def get_notification_settings(user_id: str = Depends(get_current_user)):
    """
    Get the user's notification settings
    """
    settings = UserNotifications.find_by_user_id(user_id)
    
    if not settings:
        # Return default settings if none exist
        return NotificationSettings()
    
    return NotificationSettings(
        notify_email=settings.get("notify_email", True),
        notify_sms=settings.get("notify_sms", False),
        notify_push=settings.get("notify_push", True),
        notify_app=settings.get("notify_app", True),
        quiet_start=settings.get("quiet_start"),
        quiet_end=settings.get("quiet_end"),
        categories=settings.get("categories", {
            "security": True,
            "analytics": True,
            "updates": True,
            "reminders": True
        })
    )

@notifications_router.patch("", response_model=SuccessResponse)
async def update_notification_settings(
    settings: NotificationSettingsUpdate,
    user_id: str = Depends(get_current_user)
):
    """
    Update the user's notification settings
    """
    # Convert pydantic model to dict, excluding None values
    settings_dict = {k: v for k, v in settings.model_dump().items() if v is not None}
    
    if not settings_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings provided for update"
        )
    
    # Validate quiet hours if both are provided
    if 'quiet_start' in settings_dict and 'quiet_end' in settings_dict:
        try:
            start_hour, start_min = map(int, settings_dict['quiet_start'].split(':'))
            end_hour, end_min = map(int, settings_dict['quiet_end'].split(':'))
            
            start_time = datetime.time(start_hour, start_min)
            end_time = datetime.time(end_hour, end_min)
            
            # Special handling for overnight ranges
            if start_time == end_time:
                raise ValueError("Start and end times cannot be the same")
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error": {"code": "invalid_quiet_hours", "detail": str(e)}}
            )
    
    # Update or create settings
    try:
        result = UserNotifications.update(user_id, settings_dict)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update notification settings"
            )
        
        return {"detail": "Notification settings updated successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"code": "invalid_settings", "detail": str(e)}}
        )

#
# Security Settings Routes
#

@security_router.get("", response_model=SecuritySettings)
async def get_security_settings(user_id: str = Depends(get_current_user)):
    """
    Get the user's security settings
    """
    settings = UserSecurity.find_by_user_id(user_id)
    
    if not settings:
        # Return default settings if none exist
        return SecuritySettings(
            password_last_changed=datetime.now()
        )
    
    # Convert MongoDB session objects to Pydantic models
    sessions = []
    for session in settings.get("sessions", []):
        sessions.append(SessionInfo(
            id=session.get("id", ""),
            device=session.get("device", "Unknown"),
            browser=session.get("browser", "Unknown"),
            os=session.get("os", "Unknown"),
            ip=session.get("ip", "0.0.0.0"),
            location=session.get("location"),
            created_at=session.get("created_at", datetime.now()),
            last_active=session.get("last_active", datetime.now()),
            current=session.get("current", False)
        ))
    
    return SecuritySettings(
        two_factor_enabled=settings.get("two_factor_enabled", False),
        two_factor_method=settings.get("two_factor_method", "app"),
        require_2fa_for_sensitive=settings.get("require_2fa_for_sensitive", True),
        password_last_changed=settings.get("password_last_changed", datetime.now()),
        password_expiry_days=settings.get("password_expiry_days", 90),
        sessions=sessions
    )

@security_router.patch("", response_model=SuccessResponse)
async def update_security_settings(
    request: Request,
    settings: SecuritySettingsUpdate,
    user_id: str = Depends(get_current_user)
):
    """
    Update the user's security settings
    """
    # Convert pydantic model to dict, excluding None values
    settings_dict = {k: v for k, v in settings.model_dump().items() if v is not None}
    
    if not settings_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings provided for update"
        )
    
    # Special case: disabling 2FA requires recent authentication
    if 'two_factor_enabled' in settings_dict and not settings_dict['two_factor_enabled']:
        user_id = await require_recent_auth(request)
    
    # Update or create settings
    result = UserSecurity.update(user_id, settings_dict)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update security settings"
        )
    
    return {"detail": "Security settings updated successfully"}

@security_router.post("/password/change", response_model=SuccessResponse)
async def change_password(
    password_data: PasswordChangeRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Change the user's password
    """
    # Verify current password (simplified - would check against stored hash in production)
    # In a real application, you'd verify against the stored password hash
    
    # Update password in database (simplified)
    # In a real application, you'd hash the new password and update it in the database
    
    # Update password_last_changed timestamp
    UserSecurity.update(user_id, {"password_last_changed": datetime.now()})
    
    return {"detail": "Password changed successfully"}

@security_router.get("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_two_factor(user_id: str = Depends(require_recent_auth)):
    """
    Generate a new TOTP secret and QR code for 2FA setup
    """
    # Generate a new secret
    secret = pyotp.random_base32()
    
    # Create a TOTP with the secret
    totp = pyotp.TOTP(secret)
    
    # Generate the provisioning URI for the QR code
    uri = totp.provisioning_uri(name="ASD-FYP", issuer_name="ASD Diagnosis App")
    
    # Generate the QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64 for embedding in responses
    buffer = io.BytesIO()
    img.save(buffer)
    qr_code = "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
    
    # Store the secret temporarily
    # In a real application, you'd store this in a secure way (e.g., Redis with TTL)
    # And associate it with the user's ID
    
    return TwoFactorSetupResponse(
        secret=secret,
        qr_code=qr_code
    )

@security_router.post("/2fa/verify", response_model=SuccessResponse)
async def verify_two_factor(
    verification: TwoFactorVerifyRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Verify a 2FA code to complete setup
    """
    # Get the secret for this user (simplified)
    # In a real application, you'd retrieve the temporary secret associated with this user
    settings = UserSecurity.find_by_user_id(user_id)
    
    if not settings or not settings.get("two_factor_secret"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No 2FA setup in progress"
        )
    
    # Verify the code
    totp = pyotp.TOTP(settings.get("two_factor_secret"))
    if not totp.verify(verification.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Enable 2FA for the user
    UserSecurity.update(user_id, {
        "two_factor_enabled": True,
        "two_factor_method": settings.get("two_factor_method", "app")
    })
    
    return {"detail": "Two-factor authentication enabled successfully"}

@security_router.post("/sessions/terminate/{session_id}", response_model=SuccessResponse)
async def terminate_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Terminate a specific session
    """
    # Check if the session exists
    settings = UserSecurity.find_by_user_id(user_id)
    
    if not settings or "sessions" not in settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Find the session
    session = next((s for s in settings["sessions"] if s.get("id") == session_id), None)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Prevent terminating the current session
    if session.get("current", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot terminate the current session"
        )
    
    # Terminate the session
    result = UserSecurity.terminate_session(user_id, session_id)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to terminate session"
        )
    
    return {"detail": "Session terminated successfully"}

@security_router.post("/sessions/terminate-all", response_model=SuccessResponse)
async def terminate_all_sessions(
    request: Request,
    user_id: str = Depends(get_current_user)
):
    """
    Terminate all sessions except the current one
    """
    # Get the current session ID
    token = request.headers.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token required"
        )
    
    try:
        # Decode the JWT to get session ID
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        session_id = payload.get("session")
        
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session token"
            )
        
        # Terminate all sessions except the current one
        result = UserSecurity.terminate_all_sessions_except(user_id, session_id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to terminate sessions"
            )
        
        return {"detail": "All other sessions terminated successfully"}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        ) 