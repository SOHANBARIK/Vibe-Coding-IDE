import uuid  # <--- ADDED THIS IMPORT
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage # <--- ADDED THIS IMPORT

from src.api.models import CodeRequest, CodeResponse
from src.agent.graph import app as agent_app # Imported as 'agent_app'
from src.config.settings import settings
from pydantic import BaseModel
from src.sandbox.docker_manager import execute_in_sandbox

from fastapi.staticfiles import StaticFiles
import os

# Define the Request Model
class ExecuteRequest(BaseModel):
    code: str
    language: str = "python"

# Initialize FastAPI app
app = FastAPI(title="Coding Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Coding Agent API"}

@app.post("/generate", response_model=CodeResponse)
async def generate_code(payload: CodeRequest):
    req_id = str(uuid.uuid4()) # <--- Now works because uuid is imported
    
    # 1. INITIALIZE STATE WITH LANGUAGE
    initial_state = {
        "messages": [HumanMessage(content=payload.prompt)], # <--- Now works
        "language": payload.language,
        "user_id": payload.user_id
    }
    
    # 2. RUN THE GRAPH
    try:
        # FIXED: Changed 'app_graph' to 'agent_app' to match your import above
        result = agent_app.invoke(initial_state)
        
        # 3. RETURN RESULT
        return {
            "final_code": result["final_code"],
            "output": "Code Generated Successfully. Click 'Run' to execute.",
            "status": "success"
        }
    except Exception as e:
        return {
            "final_code": "",
            "output": str(e),
            "status": "error"
        }
    
@app.post("/execute")
async def execute_code_endpoint(payload: ExecuteRequest):
    try:
        output = execute_in_sandbox(payload.code, payload.language)
        return {"output": output, "status": "success"}
    except Exception as e:
        return {"output": str(e), "status": "error"}
    
    
frontend_path = os.path.join(os.path.dirname(__file__), "../../../frontend/dist")

if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
else:
    print("WARNING: Frontend build not found. Did you run 'npm run build'?")

if __name__ == "__main__":
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)

if __name__ == "__main__":
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)