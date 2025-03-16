from pydantic import BaseModel
class OTPRequest(BaseModel):
    email: str
class OTPVerify(BaseModel):
    email: str
    otp: str
class MatchingRequest(BaseModel):
    candidate_id: int
    job_description: str
class MatchingResponse(BaseModel):
    similarity_score: float
class ExtractionRequest(BaseModel):
    document: str
class ExtractionResponse(BaseModel):
    extracted_data: dict
