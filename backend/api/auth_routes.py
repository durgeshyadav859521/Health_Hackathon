"""
MediSim AI - Authentication, Consent & Privacy Routes
Author: Team BioNex - VIT Bhopal University
Purpose: User registration, session simulation, consent management, and data deletion per privacy-by-design.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Auth & Privacy"])

# In-memory session and user store for instantaneous zero-setup demonstration
USERS_DB: Dict[str, Any] = {
    "researcher@bionex.org": {
        "email": "researcher@bionex.org",
        "full_name": "BioNex Investigator",
        "password": "Password123!",
        "consent_given": True,
        "consent_timestamp": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
}


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    consent_given: bool = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ConsentUpdateRequest(BaseModel):
    email: EmailStr
    consent_given: bool


@router.post("/register")
def register_user(req: RegisterRequest):
    if req.email in USERS_DB:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    USERS_DB[req.email] = {
        "email": req.email,
        "full_name": req.full_name,
        "password": req.password,
        "consent_given": req.consent_given,
        "consent_timestamp": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    
    return {
        "message": "User registered successfully.",
        "user": {
            "email": req.email,
            "full_name": req.full_name,
            "consent_given": req.consent_given
        },
        "token": f"medisim_jwt_token_{req.email.split('@')[0]}"
    }


@router.post("/login")
def login_user(req: LoginRequest):
    user = USERS_DB.get(req.email)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    return {
        "message": "Login successful.",
        "user": {
            "email": user["email"],
            "full_name": user["full_name"],
            "consent_given": user["consent_given"]
        },
        "token": f"medisim_jwt_token_{req.email.split('@')[0]}"
    }


@router.post("/consent")
def update_consent(req: ConsentUpdateRequest):
    if req.email not in USERS_DB:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    USERS_DB[req.email]["consent_given"] = req.consent_given
    USERS_DB[req.email]["consent_timestamp"] = datetime.utcnow().isoformat()
    
    return {
        "message": "Consent status updated.",
        "consent_given": req.consent_given,
        "timestamp": USERS_DB[req.email]["consent_timestamp"]
    }


@router.delete("/data")
def delete_user_data(email: EmailStr):
    """GDPR / HIPAA Privacy Compliance: completely removes user data and stored profile."""
    if email in USERS_DB:
        del USERS_DB[email]
        return {"message": f"All personal data and records associated with '{email}' have been permanently deleted."}
    return {"message": "No records found matching criteria."}
