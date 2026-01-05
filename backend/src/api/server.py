import uuid
import uvicorn
import sys
import subprocess
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from langchain_core.messages import HumanMessage
from pydantic import BaseModel

# Project Imports
from src.api.models import CodeRequest, CodeResponse
from src.agent.graph import app as agent_app
from src.config.settings import settings

# --- CONFIGURATION ---
frontend_path = os.path.join(os.path.dirname(__file__), "../../../frontend/dist")
IS_RENDER = os.getenv('RENDER')

class ExecuteRequest(BaseModel):
    code: str
    language: str = "python"

app = FastAPI(title="Vibe Coder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

def execute_unsafe_local(code: str, language: str):
    file_id = str(uuid.uuid4())
    output = ""
    command = []
    
    try:
        if language == "python":
            filename = f"{file_id}.py"
            with open(filename, "w") as f: f.write(code)
            command = [sys.executable, filename]

        elif language == "javascript":
            filename = f"{file_id}.js"
            with open(filename, "w") as f: f.write(code)
            command = ["node", filename]

        elif language == "cpp":
            filename = f"{file_id}.cpp"
            with open(filename, "w") as f: f.write(code)
            subprocess.run(["g++", filename, "-o", file_id], check=True, capture_output=True, text=True)
            command = [f"./{file_id}"]

        elif language == "c":
            filename = f"{file_id}.c"
            with open(filename, "w") as f: f.write(code)
            subprocess.run(["gcc", filename, "-o", file_id], check=True, capture_output=True, text=True)
            command = [f"./{file_id}"]
            
        else:
            return f"Language '{language}' not supported locally."

        result = subprocess.run(command, capture_output=True, text=True, timeout=5)
        output = result.stdout + result.stderr

    except subprocess.CalledProcessError as e:
        output = f"Compilation Error:\n{e.stderr}"
    except Exception as e:
        output = f"Runtime Error: {str(e)}"
    finally:
        for ext in [".py", ".js", ".cpp", ".c", ""]:
            path = f"{file_id}{ext}"
            if os.path.exists(path): os.remove(path)
                
    return output

@app.post("/generate", response_model=CodeResponse)
async def generate_code(payload: CodeRequest):
    initial_state = {
        "messages": [HumanMessage(content=payload.prompt)],
        "language": payload.language,
        "user_id": payload.user_id
    }
    try:
        result = agent_app.invoke(initial_state)
        return {
            "final_code": result["final_code"],
            "output": "Code Generated Successfully.",
            "status": "success"
        }
    except Exception as e:
        return {"final_code": "", "output": str(e), "status": "error"}

@app.post("/execute")
async def execute_code_endpoint(payload: ExecuteRequest):
    try:
        # Use local compilers on Render, Docker on Localhost
        if IS_RENDER:
            output = execute_unsafe_local(payload.code, payload.language)
        else:
            from src.sandbox.docker_manager import execute_in_sandbox
            output = execute_in_sandbox(payload.code, payload.language)
        return {"output": output, "status": "success"}
    except Exception as e:
        return {"output": str(e), "status": "error"}

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)