from pydantic import BaseModel

class CodeRequest(BaseModel):
    prompt: str
    user_id: str = "default_user"
    language: str = "python"  # <--- THIS WAS MISSING!

class CodeResponse(BaseModel):
    final_code: str
    output: str
    status: str