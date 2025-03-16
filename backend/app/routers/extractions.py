from fastapi import APIRouter
from app import schemas
router = APIRouter()
@router.post("/process", response_model=schemas.ExtractionResponse)
def process_extraction(data: schemas.ExtractionRequest):
    extracted = {"skills": "extracted", "experience": "extracted", "qualifications": "extracted"}
    return {"extracted_data": extracted}
