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
st.set_page_config(layout="wide", page_title="CV & Job Matching Platform", page_icon="🔍")

# Custom CSS for an enhanced professional UI
st.markdown(
    """
    <style>
    /* Base styles */
    body {
        background-color: #f8f9fa;
        font-family: 'Segoe UI', Arial, sans-serif;
    }
    .main {
        padding: 2rem;
    }
    
    /* Header and title styles */
    .title-container {
        text-align: center;
        margin-bottom: 2rem;
    }
    .main-title {
        color: #1e3a8a;
        font-weight: 700;
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }
    .subtitle {
        color: #475569;
        font-size: 1.1rem;
        font-weight: 400;
    }
    
    /* Notice banner */
    .notice-banner {
        background-color: #eff6ff;
        border-left: 5px solid #3b82f6;
        padding: 1rem 1.5rem;
        margin-bottom: 2rem;
        border-radius: 0 6px 6px 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    .notice-banner h3 {
        color: #1e40af;
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
    }
    .notice-banner p {
        color: #334155;
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.5;
    }
    
    /* Section headers */
    .section-header {
        padding: 1rem 0;
        text-align: center;
        color: #334155;
        font-weight: 600;
        font-size: 1.75rem;
        margin: 1rem 0 1.5rem 0;
        position: relative;
    }
    .section-header:after {
        content: '';
        display: block;
        width: 60px;
        height: 3px;
        background-color: #3b82f6;
        margin: 0.75rem auto 0;
    }
    
    /* Cards and content blocks */
    .card {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    }
    .card h4 {
        color: #1e40af;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        font-weight: 600;
    }
    .card p {
        color: #334155;
        margin: 0.75rem 0;
        line-height: 1.6;
    }
    .card strong {
        color: #1e3a8a;
        font-weight: 600;
    }
    
    /* Form styling */
    .stButton button {
        background-color: #2563eb;
        color: white;
        font-weight: 500;
        padding: 0.5rem 1.5rem;
        border-radius: 6px;
        border: none;
        box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        transition: all 0.2s;
    }
    .stButton button:hover {
        background-color: #1d4ed8;
        box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
    }
    
    /* File uploader styling */
    .stFileUploader label {
        font-weight: 500;
        color: #334155;
    }
    .stFileUploader div[data-testid="stFileUploadDropzone"] {
        border: 2px dashed #cbd5e1;
        border-radius: 8px;
        background-color: #f8fafc;
    }
    
    /* Success and info messages */
    .st-success {
        background-color: #ecfdf5;
        border-color: #10b981;
        color: #065f46;
        border-width: 1px;
        border-left-width: 10px;
        padding: 1rem;
        border-radius: 6px;
        font-weight: 500;
    }
    
    /* Score indicators */
    .score-indicator {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.875rem;
        background-color: #dbeafe;
        color: #1e40af;
    }
    .high-score {
        background-color: #dcfce7;
        color: #166534;
    }
    .medium-score {
        background-color: #fff7ed;
        color: #9a3412;
    }
    .low-score {
        background-color: #fee2e2;
        color: #991b1b;
    }
    
    /* Progress and spinner elements */
    .stSpinner {
        text-align: center;
        color: #3b82f6;
    }
    
    /* Footer */
    footer {
        text-align: center;
        padding: 2rem 0 1rem;
        color: #64748b;
        font-size: 0.85rem;
    }
    footer a {
        color: #2563eb;
        text-decoration: none;
    }
    footer a:hover {
        text-decoration: underline;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# Display main title and notice banner
st.markdown('<div class="title-container"><h1 class="main-title">Professional CV & Job Matching Platform</h1><p class="subtitle">AI-powered candidate-job matching for recruiters</p></div>', unsafe_allow_html=True)

st.markdown(
    """
    <div class="notice-banner">
        <h3>⚠️ Demo Mode Active</h3>
        <p>Due to the model size being too big, we couldn't fully deploy our website. This version uses a lighter model for demonstration purposes. You can see the entire working code in our GitHub repository. Due to resource constraints, we couldn't deploy the complete solution directly.</p>
    </div>
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

def get_score_class(score):
    """Return CSS class based on score value"""
    if score >= 0.8:
        return "high-score"
    elif score >= 0.6:
        return "medium-score"
    else:
        return "low-score"

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
# Create a sidebar with better styling
st.sidebar.markdown('<h2 style="color:#1e3a8a;margin-bottom:20px;">Navigation</h2>', unsafe_allow_html=True)
app_mode = st.sidebar.selectbox("Choose Mode", ["Submit CV", "Upload Job Description"])

# Add stats in sidebar
# Add stats in sidebar
st.sidebar.markdown("### Platform Statistics")
st.sidebar.markdown(f"CVs in database: **{len(cv_dict)}**")
st.sidebar.markdown(f"Jobs in database: **{len(job_dict)}**")

# Add info about GitHub
st.sidebar.markdown("---")
st.sidebar.markdown("### About")
st.sidebar.markdown("This platform uses AI to match CVs with job descriptions using semantic understanding and vector embeddings.")
st.sidebar.markdown("[View on GitHub](https://github.com/your-username/cv-job-matching)")

if app_mode == "Submit CV":
    st.markdown("<h2 class='section-header'>Submit Your CV</h2>", unsafe_allow_html=True)
    
    with st.container():
        st.markdown("""
        <div class="card">
            <h4>📄 Upload Your Resume</h4>
            <p>Our AI will analyze your CV to extract key skills, education, and experience that will help match you with suitable job opportunities.</p>
        </div>
        """, unsafe_allow_html=True)
    
    with st.form(f"cv_form_{st.session_state.cv_form_key}"):
        col1, col2 = st.columns([1, 2])
        with col1:
            phone = st.text_input("Phone Number", key="cv_phone_input", placeholder="+1 (555) 123-4567")
        with col2:
            cv_file = st.file_uploader("Upload your CV (PDF, DOCX, or TXT)", type=["pdf", "docx", "txt"], key="cv_file_input")
        
        col3, col4 = st.columns([3, 1])
        with col4:
            submitted = st.form_submit_button("Submit CV")
        
        if submitted:
            if phone and cv_file:
                with st.spinner("Processing your CV... Please wait"):
                    extracted_text = extract_text_from_file(cv_file)
                    if not extracted_text:
                        st.error("Failed to extract text from the uploaded file.")
                    else:
                        cv_id = str(uuid.uuid4())
                        cleaned_text = clean_text(extracted_text)
                        extracted_info = {}
                        extraction_failed = False
                        
                        progress_bar = st.progress(0)
                        status_text = st.empty()
                        
                        for i, (key, question) in enumerate(cv_extraction_questions.items()):
                            status_text.text(f"Extracting {key} from CV...")
                            progress_bar.progress((i / len(cv_extraction_questions)) * 0.9)
                            response_text = query_extraction(question, cleaned_text)
                            if response_text is None:
                                st.error(f"Extraction failed for {key}.")
                                extraction_failed = True
                                break
                            cleaned_response = clean_text(response_text)
                            embedding = get_embedding(cleaned_response)
                            extracted_info[key] = {"text": cleaned_response, "embedding": embedding}
                        
                        if not extraction_failed:
                            progress_bar.progress(1.0)
                            status_text.text("CV analysis complete!")
                            
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
                                    <h4>CV Summary (ID: {cv_id})</h4>
                                    <p><strong>Skills:</strong> {cv_entry['skills']['text']}</p>
                                    <p><strong>Education:</strong> {cv_entry['education']['text']}</p>
                                    <p><strong>Requirements:</strong> {cv_entry['requirement']['text']}</p>
                                    <p><strong>Experience:</strong> {cv_entry['experience']['text']}</p>
                                </div>
                                """, unsafe_allow_html=True)
                            
                            # Check if there are any jobs to match with
                            if job_dict:
                                st.markdown("<h4 style='margin-top:2rem;'>Potential Job Matches</h4>", unsafe_allow_html=True)
                                job_matches = []
                                
                                for job_id, job_entry in job_dict.items():
                                    score = (
                                        WEIGHT_SKILLS * cosine_similarity(job_entry["skills"]["embedding"], cv_entry["skills"]["embedding"]) +
                                        WEIGHT_EDUCATION * cosine_similarity(job_entry["education"]["embedding"], cv_entry["education"]["embedding"]) +
                                        WEIGHT_REQUIREMENT * cosine_similarity(job_entry["requirement"]["embedding"], cv_entry["requirement"]["embedding"]) +
                                        WEIGHT_EXPERIENCE * cosine_similarity(job_entry["experience"]["embedding"], cv_entry["experience"]["embedding"])
                                    )
                                    job_matches.append({"job_id": job_id, "score": score})
                                
                                top_matches = sorted(job_matches, key=lambda x: x["score"], reverse=True)[:3]
                                
                                for match in top_matches:
                                    job = job_dict[match["job_id"]]
                                    score_class = get_score_class(match["score"])
                                    st.markdown(
                                        f"""
                                        <div class="card">
                                            <h4>Job ID: {match["job_id"]}</h4>
                                            <p><span class="score-indicator {score_class}">Match Score: {match["score"]:.2f}</span></p>
                                            <p><strong>Skills Required:</strong> {job['skills']['text']}</p>
                                            <p><strong>Education Required:</strong> {job['education']['text']}</p>
                                        </div>
                                        """, unsafe_allow_html=True)
                            
                            st.session_state.cv_form_key += 1  # Reset form by incrementing key
            else:
                st.warning("Please fill in all fields and upload a file before submitting.")
                
elif app_mode == "Upload Job Description":
    st.markdown("<h2 class='section-header'>Upload Job Description</h2>", unsafe_allow_html=True)
    
    with st.container():
        st.markdown("""
        <div class="card">
            <h4>🔍 Find the Perfect Candidate</h4>
            <p>Upload a job description to find the most suitable candidates from our database. Our AI will analyze the requirements and match them with candidate profiles.</p>
        </div>
        """, unsafe_allow_html=True)
    
    with st.form(f"job_form_{st.session_state.job_form_key}"):
        col1, col2 = st.columns([1, 2])
        with col1:
            job_phone = st.text_input("Phone Number", key="job_phone_input", placeholder="+1 (555) 123-4567")
        with col2:
            jd_file = st.file_uploader("Upload Job Description (PDF, DOCX, or TXT)", type=["pdf", "docx", "txt"], key="jd_file_input")
        
        col3, col4 = st.columns([3, 1])
        with col4:
            submitted_job = st.form_submit_button("Submit Job")
        
        if submitted_job:
            if job_phone and jd_file:
                with st.spinner("Processing job description... Please wait"):
                    extracted_text = extract_text_from_file(jd_file)
                    if not extracted_text:
                        st.error("Failed to extract text from the uploaded file.")
                    else:
                        job_id = str(uuid.uuid4())
                        cleaned_text = clean_text(extracted_text)
                        extracted_info = {}
                        extraction_failed = False
                        
                        progress_bar = st.progress(0)
                        status_text = st.empty()
                        
                        for i, (key, question) in enumerate(job_extraction_questions.items()):
                            status_text.text(f"Extracting {key} from Job Description...")
                            progress_bar.progress((i / len(job_extraction_questions)) * 0.9)
                            response_text = query_extraction_jd(question, cleaned_text)
                            if response_text is None:
                                st.error(f"Extraction failed for {key}.")
                                extraction_failed = True
                                break
                            cleaned_response = clean_text(response_text)
                            embedding = get_embedding(cleaned_response)
                            extracted_info[key] = {"text": cleaned_response, "embedding": embedding}
                        
                        if not extraction_failed:
                            progress_bar.progress(1.0)
                            status_text.text("Job analysis complete!")
                            
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
                                    <h4>Job Summary (ID: {job_id})</h4>
                                    <p><strong>Skills Required:</strong> {job_entry['skills']['text']}</p>
                                    <p><strong>Education Required:</strong> {job_entry['education']['text']}</p>
                                    <p><strong>Requirements:</strong> {job_entry['requirement']['text']}</p>
                                    <p><strong>Experience Required:</strong> {job_entry['experience']['text']}</p>
                                </div>
                                """, unsafe_allow_html=True)
                            
                            st.markdown("<h3 class='section-header'>Candidate Ranking</h3>", unsafe_allow_html=True)
                            if ranking:
                                for index, candidate in enumerate(ranking):
                                    cv_data = cv_dict[candidate['cv_id']]
                                    score_class = get_score_class(candidate['score'])
                                    
                                    st.markdown(
                                        f"""
                                        <div class="card">
                                            <h4>Candidate #{index + 1} (CV ID: {candidate['cv_id']})</h4>
                                            <p><span class="score-indicator {score_class}">Match Score: {candidate['score']:.2f}</span></p>
                                            <p><strong>Skills:</strong> {cv_data['skills']['text']}</p>
                                            <p><strong>Education:</strong> {cv_data['education']['text']}</p>
                                            <p><strong>Experience:</strong> {cv_data['experience']['text']}</p>
                                        </div>
                                        """, unsafe_allow_html=True)
                            else:
                                st.info("No matching CVs found in the database. Please encourage candidates to submit their CVs.")
                            st.session_state.job_form_key += 1  # Reset form by incrementing key
            else:
                st.warning("Please fill in all fields and upload a file before submitting.")

# Add footer
st.markdown("""
<footer>
    <p>© 2025 CV & Job Matching Platform | <a href="https://github.com/your-username/cv-job-matching" target="_blank">View on GitHub</a></p>
</footer>
""", unsafe_allow_html=True)