from fastapi import APIRouter
from app import schemas
import numpy as np
router = APIRouter()
@router.post("/run", response_model=schemas.MatchingResponse)
def run_matching(data: schemas.MatchingRequest):
    vec1 = np.random.rand(768)
    vec2 = np.random.rand(768)
    cosine_similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    return {"similarity_score": float(cosine_similarity)}
