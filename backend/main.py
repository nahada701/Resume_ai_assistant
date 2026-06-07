from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
import os
import io
import json
import asyncio
from typing import Optional
import PyPDF2
import docx2txt

app = FastAPI(title="Resume AI Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
BASE_URL = "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else None
MODEL = "llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o-mini"

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)


class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None


class ImproveRequest(BaseModel):
    section_name: str
    section_content: str
    target_role: Optional[str] = None


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    company_name: str
    applicant_name: str


class ChatRequest(BaseModel):
    resume_text: str
    message: str
    history: list = []


class LinkedInRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None


class BulletRequest(BaseModel):
    job_title: str
    company: str
    description: str
    years_exp: Optional[int] = None


class ParseRequest(BaseModel):
    resume_text: str


class LinkedInPostRequest(BaseModel):
    topic: str
    tone: str = "Professional"
    length: str = "medium"
    resume_text: Optional[str] = None


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.endswith(".docx"):
        return docx2txt.process(io.BytesIO(file_bytes))
    else:
        return file_bytes.decode("utf-8", errors="ignore")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, or TXT files are supported.")
    content = await file.read()
    text = extract_text_from_file(content, file.filename)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from file.")
    return {"text": text, "filename": file.filename}


@app.post("/analyze")
async def analyze_resume(req: AnalyzeRequest):
    job_context = f"\n\nTarget Job Description:\n{req.job_description}" if req.job_description else ""

    prompt = f"""You are an expert resume reviewer and career coach. Analyze the following resume and provide structured feedback.

Resume:
{req.resume_text}{job_context}

Return a JSON object with these exact keys:
- overall_score: integer 0-100
- summary: 2-3 sentence overall assessment
- strengths: array of 3-5 string bullet points
- weaknesses: array of 3-5 string bullet points
- ats_score: integer 0-100 (ATS compatibility)
- keyword_match: integer 0-100 (only if job description provided, else null)
- sections: object with keys "contact", "summary", "experience", "education", "skills" each having score (0-10) and feedback string
- top_improvements: array of 3 most impactful action items
- missing_keywords: array of important missing keywords (only if job description provided, else empty array)

Respond ONLY with the JSON object, no markdown."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/improve-section")
async def improve_section(req: ImproveRequest):
    role_context = f" for a {req.target_role} role" if req.target_role else ""

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert resume writer. Rewrite resume sections to be impactful, ATS-friendly, and achievement-focused{role_context}. Use strong action verbs and quantify achievements where possible.",
                },
                {
                    "role": "user",
                    "content": f"Rewrite this {req.section_name} section to be stronger:\n\n{req.section_content}\n\nProvide the improved version directly, followed by a brief explanation of changes made.",
                },
            ],
            stream=True,
            temperature=0.7,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/cover-letter")
async def generate_cover_letter(req: CoverLetterRequest):
    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert cover letter writer. Create compelling, personalized cover letters that highlight relevant experience and show genuine enthusiasm.",
                },
                {
                    "role": "user",
                    "content": f"""Write a professional cover letter for {req.applicant_name} applying to {req.company_name}.

Resume:
{req.resume_text}

Job Description:
{req.job_description}

Write a 3-paragraph cover letter that:
1. Opens with a strong hook connecting their background to the role
2. Highlights 2-3 most relevant achievements with specifics
3. Closes with enthusiasm and a clear call to action

Use a professional but personable tone.""",
                },
            ],
            stream=True,
            temperature=0.75,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/chat")
async def chat_with_resume(req: ChatRequest):
    messages = [
        {
            "role": "system",
            "content": f"""You are a career coach AI with deep expertise in resume writing, job searching, and career development.
You have access to the user's resume below. Answer questions, provide advice, and help them improve their career prospects.

User's Resume:
{req.resume_text}

Be specific, actionable, and encouraging.""",
        }
    ]

    for h in req.history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})

    messages.append({"role": "user", "content": req.message})

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            temperature=0.7,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/job-match")
async def job_match_score(req: AnalyzeRequest):
    if not req.job_description:
        raise HTTPException(status_code=400, detail="Job description is required.")

    prompt = f"""Compare this resume against the job description and provide a detailed match analysis.

Resume:
{req.resume_text}

Job Description:
{req.job_description}

Return JSON with:
- match_score: integer 0-100
- verdict: one of "Strong Match", "Good Match", "Partial Match", "Weak Match"
- matching_skills: array of skills present in both resume and JD
- missing_skills: array of required skills not found in resume
- matching_experience: array of relevant experience points that align
- recommendations: array of 3-5 specific actions to improve match
- interview_prep: array of 3 likely interview questions based on the JD

Respond ONLY with JSON."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/parse-resume")
async def parse_resume(req: ParseRequest):
    prompt = f"""Extract structured information from this resume. Return ONLY a JSON object with these exact keys:
- name: string (full name or empty string if not found)
- email: string (or empty string)
- phone: string (or empty string)
- linkedin: string (LinkedIn URL or username, or empty string)
- location: string (city/state/country or empty string)
- skills: array of strings (technical and soft skills, max 20)
- experience: array of objects with keys: title (string), company (string), dates (string)
- education: array of objects with keys: degree (string), school (string), year (string)
- summary: string (1-2 sentence professional summary extracted or inferred)

Resume:
{req.resume_text}

Respond ONLY with the JSON object."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/linkedin-optimize")
async def linkedin_optimize(req: LinkedInRequest):
    role_context = f" targeting a {req.target_role} role" if req.target_role else ""

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"You are a LinkedIn profile expert{role_context}. Create compelling, keyword-rich LinkedIn content that attracts recruiters and hiring managers.",
                },
                {
                    "role": "user",
                    "content": f"""Based on this resume, generate optimized LinkedIn profile content:

Resume:
{req.resume_text}

Provide exactly these four sections, each clearly labeled:

## HEADLINE
Write a punchy LinkedIn headline (max 120 characters). Use | to separate key info. Do NOT use "Seeking" or "Looking for".

## ABOUT
Write a compelling About section (250-300 words). Use first person. Start with a hook. Cover: who you are, what you do, key achievements, and what you're looking for. End with a call to action.

## FEATURED SKILLS
List exactly 5 skills to feature (most relevant and impactful for your profile). One per line.

## CONNECTION MESSAGE
Write a personalized connection request template (max 300 chars) that feels genuine, not spammy.""",
                },
            ],
            stream=True,
            temperature=0.75,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/generate-bullets")
async def generate_bullets(req: BulletRequest):
    exp_context = f" with {req.years_exp} years of experience" if req.years_exp else ""

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume writer specializing in achievement-focused bullet points. Use the STAR method (Situation, Task, Action, Result). Always quantify impact with numbers, percentages, or dollar amounts where possible.",
                },
                {
                    "role": "user",
                    "content": f"""Generate 6 strong resume bullet points for this role{exp_context}:

Job Title: {req.job_title}
Company: {req.company}
Context/Description: {req.description}

Rules:
- Start each bullet with a strong action verb (Led, Built, Increased, Reduced, Designed, etc.)
- Include quantified results (%, $, time saved, users, etc.) — estimate if needed
- Keep each bullet to 1-2 lines
- Make them ATS-friendly with relevant keywords
- Number each bullet 1-6

Output only the 6 numbered bullet points, nothing else.""",
                },
            ],
            stream=True,
            temperature=0.7,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(generate(), media_type="text/plain")


@app.post("/linkedin-post")
async def linkedin_post(req: LinkedInPostRequest):
    length_map = {"short": "150-200 words", "medium": "250-350 words", "long": "400-500 words"}
    word_count = length_map.get(req.length, "250-350 words")

    tone_instructions = {
        "Professional": "authoritative, insightful, data-driven. Like a thought leader sharing expertise.",
        "Casual": "conversational, warm, relatable. Like talking to a colleague over coffee.",
        "Inspirational": "motivating, story-driven, emotional. Use a personal experience or lesson learned.",
        "Educational": "clear, structured, actionable. Like a mini tutorial or 'how I learned X' story.",
        "Storytelling": "narrative arc with a hook, conflict, resolution. Pull the reader in emotionally.",
    }
    tone_desc = tone_instructions.get(req.tone, tone_instructions["Professional"])
    resume_context = f"\n\nAuthor's background (use to personalize where relevant):\n{req.resume_text[:1000]}" if req.resume_text else ""

    def generate():
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"You are a LinkedIn content strategist who writes viral, high-engagement posts. Your tone is {tone_desc} Posts you write get thousands of likes because they are genuine, specific, and valuable.",
                },
                {
                    "role": "user",
                    "content": f"""Write a LinkedIn post about: {req.topic}

Requirements:
- Length: {word_count}
- Tone: {req.tone}
- Start with a STRONG hook (first line must stop the scroll — use a bold claim, surprising stat, or thought-provoking question)
- Use short paragraphs (1-3 lines max) with line breaks for readability
- Include a specific insight, lesson, or takeaway that provides real value
- End with a call to action or question to drive comments
- Add 3-5 relevant hashtags at the end{resume_context}

Write only the post content, ready to copy-paste into LinkedIn.""",
                },
            ],
            stream=True,
            temperature=0.8,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(generate(), media_type="text/plain")
