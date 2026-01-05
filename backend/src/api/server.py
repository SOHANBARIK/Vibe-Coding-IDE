import uuid
import uvicorn
import sys
import subprocess
import os
import re
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
    language: str 

app = FastAPI(title="Vibe Coder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

def execute_unsafe_local(code: str, language: str):
    """
    Executes Java or Bash code locally.
    WARNING: No sandbox security. 
    """
    file_id = str(uuid.uuid4())
    output = ""
    command = []
    files_to_cleanup = []

    try:
        # --- JAVA ---
        if language == "java":
            # 1. Extract public class name to name the file correctly
            match = re.search(r'public\s+class\s+(\w+)', code)
            if match:
                class_name = match.group(1)
            else:
                # Fallback if no public class found (often "Main" is safe default)
                class_name = "Main"
                # If the code doesn't have a class definition, wrap it or warn user.
                # Assuming valid Java code input here.
            
            filename_java = f"{class_name}.java"
            filename_class = f"{class_name}.class"
            
            # Write source code
            with open(filename_java, "w") as f: f.write(code)
            files_to_cleanup.append(filename_java)
            files_to_cleanup.append(filename_class)
            
            # 2. Compile
            compile_res = subprocess.run(
                ["javac", filename_java], 
                capture_output=True, text=True
            )
            
            if compile_res.returncode != 0:
                return f"Compilation Error:\n{compile_res.stderr}"
            
            # 3. Run
            command = ["java", class_name]

        # --- BASH ---
        elif language == "bash":
            filename_sh = f"{file_id}.sh"
            with open(filename_sh, "w") as f: f.write(code)
            files_to_cleanup.append(filename_sh)
            command = ["bash", filename_sh]

        else:
            return f"Language '{language}' not supported. Only Java and Bash are allowed."

        # Execute the command
        result = subprocess.run(command, capture_output=True, text=True, timeout=10)
        output = result.stdout + result.stderr

    except subprocess.TimeoutExpired:
        output = "Error: Execution timed out (Limit: 10s)."
    except Exception as e:
        output = f"Runtime Error: {str(e)}"
    finally:
        # Clean up files
        for path in files_to_cleanup:
            if os.path.exists(path): 
                try:
                    os.remove(path)
                except:
                    pass
                
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
        # Always use local execution for this simplified setup
        output = execute_unsafe_local(payload.code, payload.language)
        return {"output": output, "status": "success"}
    except Exception as e:
        return {"output": str(e), "status": "error"}

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)