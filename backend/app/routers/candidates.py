from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, auth
from app.database import SessionLocal
router = APIRouter()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.post("/login")
def candidate_login(data: schemas.OTPRequest, db: Session = Depends(get_db)):
    user = db.query(models.Candidate).filter(models.Candidate.email == data.email).first()
    if not user:
        user = models.Candidate(email=data.email, otp=auth.generate_otp())
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.otp = auth.generate_otp()
        db.commit()
    return {"message": "OTP sent"}
@router.post("/verify")
def candidate_verify(data: schemas.OTPVerify, db: Session = Depends(get_db)):
    user = db.query(models.Candidate).filter(models.Candidate.email == data.email).first()
    if user and user.otp == data.otp:
        return {"message": "Login successful"}
    raise HTTPException(status_code=400, detail="Invalid OTP")
