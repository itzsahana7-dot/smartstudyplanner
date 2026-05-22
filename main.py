import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types  
from dotenv import load_dotenv
from pydantic import BaseModel

# 1. Load config
load_dotenv()

# 2. Initialize FastAPI
app = FastAPI()

# 3. Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class StudyRequest(BaseModel):
    subjects: list[str]

@app.get("/")
def health_check():
    return {"status": "Tabular Layout Backend running successfully!"}

@app.post("/generate-plan")
async def generate_study_plan(request: StudyRequest):
    try:
        prompt = (
            f"Create a highly efficient weekly study timetable matrix for these subjects: {', '.join(request.subjects)}. "
            "Distribute the sessions across different days of the week. For every single session entry, "
            "provide the Day, the exact Time Slot, the duration in Hours, the Subject name, "
            "the specific core Topic being covered, and a list of specific target Lessons/Tasks."
        )

        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "schedule_title": {"type": "STRING"},
                        "total_hours": {"type": "INTEGER"},
                        "timetable_data": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "day": {"type": "STRING"},
                                    "time_slot": {"type": "STRING"},
                                    "hours": {"type": "NUMBER"},
                                    "subject": {"type": "STRING"},
                                    "topic": {"type": "STRING"},
                                    "lessons": {
                                        "type": "ARRAY",
                                        "items": {"type": "STRING"}
                                    }
                                },
                                "required": ["day", "time_slot", "hours", "subject", "topic", "lessons"]
                            }
                        }
                    },
                    "required": ["schedule_title", "total_hours", "timetable_data"]
                }
            )
        )

        structured_timetable = json.loads(response.text)
        return structured_timetable

    except Exception as e:
        print(f"Error captured: {e}")
        raise HTTPException(status_code=500, detail=str(e))