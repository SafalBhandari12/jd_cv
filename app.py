import os
import uuid
import numpy as np
import re
import streamlit as st
import requests
import PyPDF2
import docx
from sentence_transformers import SentenceTransformer

# For local development, load .env only if not in production.
if os.getenv("STREAMLIT_ENV") != "production":
    from dotenv import load_dotenv
    load_dotenv()  # Load environment variables from .env for local development

# Retrieve the API key from st.secrets (set via your deployment dashboard)
# or from the environment variables.
API_KEY = st.secrets.get("MISTRAL_API_KEY", os.environ.get("MISTRAL_API_KEY"))
if not API_KEY:
    st.error("MISTRAL_API_KEY not set in environment variables!")
    st.stop()

# Mistral API configuration
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Set page configuration at the very beginning
st.set_page_config(layout="wide", page_title="CV & Job Matching Platform")

# Custom CSS for a modern, professional UI
st.markdown(
    """
    <style>
    body {
        background-color: #f9f9f9;
    }
    .main {
        padding: 20px;
    }
    .card {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .card h4 {
        color: #2c3e50;
        margin-bottom: 12px;
    }
    .card p {
        color: #555555;
        margin: 4px 0;
        line-height: 1.5;
    }
    .title {
        color: #2c3e50;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
    }
    .section-header {
        margin-top: 40px;
        margin-bottom: 20px;
        text-align: center;
        color: #34495e;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# Cache and load the embedding model so it only loads once
@st.cache_resource
def load_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

with st.spinner("Loading embedding model... This might take a moment."):
    model = load_model()
st.success("Embedding model loaded successfully!")

# Initialize session_state storage for CVs and Jobs if not already present.
if "cv_dict" not in st.session_state:
    st.session_state.cv_dict = {}
if "phone_cv_map" not in st.session_state:
    st.session_state.phone_cv_map = {}
if "job_dict" not in st.session_state:
    st.session_state.job_dict = {}
if "phone_job_map" not in st.session_state:
    st.session_state.phone_job_map = {}

# For resetting forms using a unique key.
if "cv_form_key" not in st.session_state:
    st.session_state.cv_form_key = 0
if "job_form_key" not in st.session_state:
    st.session_state.job_form_key = 0

# Shortcuts for session_state storage
cv_dict = st.session_state.cv_dict
job_dict = st.session_state.job_dict

# Matching weights
WEIGHT_SKILLS = 0.4
WEIGHT_EDUCATION = 0.2
WEIGHT_REQUIREMENT = 0.2
WEIGHT_EXPERIENCE = 0.2

# -----------------------------
# Utility Functions
# -----------------------------
def clean_text(text: str) -> str:
    """Convert multiple spaces/newlines to a single space."""
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r' +', ' ', text).strip()
    return text

def get_embedding(text: str):
    """Generate an embedding for the given text."""
    return model.encode(text).tolist()

def cosine_similarity(vec1, vec2) -> float:
    """Compute cosine similarity between two vectors."""
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))

def query_extraction(question: str, text: str) -> str:
    """Call the Mistral API to extract info from a CV."""
    data = {
        "model": "mistral-large-2411",
        "messages": [
            {"role": "system", "content": "You are an AI assistant that extracts useful insights from a CV."},
            {"role": "user", "content": f"My CV:\n\n{text}\n\n{question}"}
        ]
    }
    response = requests.post(MISTRAL_URL, headers=HEADERS, json=data)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return None

def query_extraction_jd(question: str, text: str) -> str:
    """Call the Mistral API to extract info from a Job Description."""
    data = {
        "model": "mistral-large-2411",
        "messages": [
            {"role": "system", "content": "You are an AI assistant that extracts useful insights from a Job Description (JD)."},
            {"role": "user", "content": f"My Job Description:\n\n{text}\n\n{question}"}
        ]
    }
    response = requests.post(MISTRAL_URL, headers=HEADERS, json=data)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return None

def perform_job_matching(job_entry: dict) -> list:
    """
    For the given job entry, match all submitted CVs.
    Returns a sorted list of candidate rankings (all CVs included).
    """
    ranking = []
    for cv_id, cv_entry in cv_dict.items():
        score = (
            WEIGHT_SKILLS * cosine_similarity(job_entry["skills"]["embedding"], cv_entry["skills"]["embedding"]) +
            WEIGHT_EDUCATION * cosine_similarity(job_entry["education"]["embedding"], cv_entry["education"]["embedding"]) +
            WEIGHT_REQUIREMENT * cosine_similarity(job_entry["requirement"]["embedding"], cv_entry["requirement"]["embedding"]) +
            WEIGHT_EXPERIENCE * cosine_similarity(job_entry["experience"]["embedding"], cv_entry["experience"]["embedding"])
        )
        ranking.append({"cv_id": cv_id, "score": score})
    return sorted(ranking, key=lambda x: x["score"], reverse=True)

cv_extraction_questions = {
    "skills": "What are the skills from this CV?",
    "education": "What are the educations from this CV?",
    "requirement": "What are the requirements from this CV?",
    "experience": "What are the experiences mentioned in this CV?"
}

job_extraction_questions = {
    "skills": "What are the skills from this Job Description?",
    "education": "What are the required educations for this job?",
    "requirement": "What are the requirements for this job?",
    "experience": "What are the required experiences for this job?"
}

def extract_text_from_file(uploaded_file):
    """
    Extract text from an uploaded file.
    Supports PDF, DOCX, and TXT.
    """
    if uploaded_file is not None:
        file_type = uploaded_file.type
        if file_type == "application/pdf":
            try:
                pdf_reader = PyPDF2.PdfReader(uploaded_file)
                text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text
            except Exception:
                st.error("Error reading PDF file.")
                return None
        elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            try:
                doc = docx.Document(uploaded_file)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text
            except Exception:
                st.error("Error reading DOCX file.")
                return None
        elif file_type == "text/plain":
            try:
                return uploaded_file.read().decode("utf-8")
            except Exception:
                st.error("Error reading text file.")
                return None
        else:
            st.error("Unsupported file type!")
            return None
    return None

# -----------------------------
# User Interface
# -----------------------------
st.markdown("<h1 class='title'>Professional CV & Job Matching Platform</h1>", unsafe_allow_html=True)
st.sidebar.title("Navigation")
app_mode = st.sidebar.selectbox("Choose Mode", ["Submit CV", "Upload Job Description"])

if app_mode == "Submit CV":
    st.markdown("<h2 class='section-header'>Submit Your CV</h2>", unsafe_allow_html=True)
    with st.form(f"cv_form_{st.session_state.cv_form_key}"):
        col1, col2 = st.columns(2)
        with col1:
            phone = st.text_input("Phone Number", key="cv_phone_input")
        with col2:
            cv_file = st.file_uploader("Upload your CV (PDF, DOCX, or TXT)", type=["pdf", "docx", "txt"], key="cv_file_input")
        submitted = st.form_submit_button("Submit CV")
        
        if submitted:
            if phone and cv_file:
                extracted_text = extract_text_from_file(cv_file)
                if not extracted_text:
                    st.error("Failed to extract text from the uploaded file.")
                else:
                    cv_id = str(uuid.uuid4())
                    cleaned_text = clean_text(extracted_text)
                    extracted_info = {}
                    extraction_failed = False
                    
                    for key, question in cv_extraction_questions.items():
                        with st.spinner(f"Extracting {key} from CV..."):
                            response_text = query_extraction(question, cleaned_text)
                        if response_text is None:
                            st.error(f"Extraction failed for {key}.")
                            extraction_failed = True
                            break
                        cleaned_response = clean_text(response_text)
                        embedding = get_embedding(cleaned_response)
                        extracted_info[key] = {"text": cleaned_response, "embedding": embedding}
                    
                    if not extraction_failed:
                        cv_entry = {
                            "id": cv_id,
                            "cv_text": cleaned_text,
                            "skills": extracted_info["skills"],
                            "education": extracted_info["education"],
                            "requirement": extracted_info["requirement"],
                            "experience": extracted_info["experience"]
                        }
                        cv_dict[cv_id] = cv_entry
                        st.session_state.phone_cv_map.setdefault(phone, []).append(cv_id)
                        
                        st.success("CV submitted successfully!")
                        st.markdown(
                            f"""
                            <div class="card">
                                <h4>CV ID: {cv_id}</h4>
                                <p><strong>Skills:</strong> {cv_entry['skills']['text']}</p>
                                <p><strong>Education:</strong> {cv_entry['education']['text']}</p>
                                <p><strong>Requirements:</strong> {cv_entry['requirement']['text']}</p>
                                <p><strong>Experience:</strong> {cv_entry['experience']['text']}</p>
                            </div>
                            """, unsafe_allow_html=True)
                        st.session_state.cv_form_key += 1  # Reset form by incrementing key
            else:
                st.warning("Please fill in all fields and upload a file before submitting.")
                
elif app_mode == "Upload Job Description":
    st.markdown("<h2 class='section-header'>Upload Job Description</h2>", unsafe_allow_html=True)
    with st.form(f"job_form_{st.session_state.job_form_key}"):
        col1, col2 = st.columns(2)
        with col1:
            job_phone = st.text_input("Phone Number", key="job_phone_input")
        with col2:
            jd_file = st.file_uploader("Upload Job Description (PDF, DOCX, or TXT)", type=["pdf", "docx", "txt"], key="jd_file_input")
        submitted_job = st.form_submit_button("Submit Job Description")
        
        if submitted_job:
            if job_phone and jd_file:
                extracted_text = extract_text_from_file(jd_file)
                if not extracted_text:
                    st.error("Failed to extract text from the uploaded file.")
                else:
                    job_id = str(uuid.uuid4())
                    cleaned_text = clean_text(extracted_text)
                    extracted_info = {}
                    extraction_failed = False
                    
                    for key, question in job_extraction_questions.items():
                        with st.spinner(f"Extracting {key} from Job Description..."):
                            response_text = query_extraction_jd(question, cleaned_text)
                        if response_text is None:
                            st.error(f"Extraction failed for {key}.")
                            extraction_failed = True
                            break
                        cleaned_response = clean_text(response_text)
                        embedding = get_embedding(cleaned_response)
                        extracted_info[key] = {"text": cleaned_response, "embedding": embedding}
                    
                    if not extraction_failed:
                        job_entry = {
                            "id": job_id,
                            "jd_text": cleaned_text,
                            "skills": extracted_info["skills"],
                            "education": extracted_info["education"],
                            "requirement": extracted_info["requirement"],
                            "experience": extracted_info["experience"],
                            "ranking": []
                        }
                        job_dict[job_id] = job_entry
                        st.session_state.phone_job_map.setdefault(job_phone, []).append(job_id)
                        
                        ranking = perform_job_matching(job_entry)
                        job_entry["ranking"] = ranking
                        
                        st.success("Job Description submitted successfully!")
                        st.markdown(
                            f"""
                            <div class="card">
                                <h4>Job ID: {job_id}</h4>
                                <p><strong>Skills:</strong> {job_entry['skills']['text']}</p>
                                <p><strong>Education:</strong> {job_entry['education']['text']}</p>
                                <p><strong>Requirements:</strong> {job_entry['requirement']['text']}</p>
                                <p><strong>Experience:</strong> {job_entry['experience']['text']}</p>
                            </div>
                            """, unsafe_allow_html=True)
                        
                        st.subheader("Candidate Ranking")
                        if ranking:
                            for candidate in ranking:
                                st.markdown(
                                    f"""
                                    <div class="card">
                                        <p><strong>CV ID:</strong> {candidate['cv_id']}</p>
                                        <p><strong>Matching Score:</strong> {candidate['score']:.3f}</p>
                                    </div>
                                    """, unsafe_allow_html=True)
                        else:
                            st.info("No matching CVs found.")
                        st.session_state.job_form_key += 1  # Reset form by incrementing key
            else:
                st.warning("Please fill in all fields and upload a file before submitting.")
