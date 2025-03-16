from fastapi import FastAPI
from app.routers import recruiter, candidate, matching, extraction
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
app.include_router(candidate.router, prefix="/candidate", tags=["Candidate"])
app.include_router(matching.router, prefix="/matching", tags=["Matching"])
app.include_router(extraction.router, prefix="/extraction", tags=["Extraction"])
