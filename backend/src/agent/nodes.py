from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from src.config.settings import settings
from src.sandbox.docker_manager import execute_in_sandbox
from src.agent.state import AgentState

# Initialize Groq LPU (Global LLM)
# This replaces the need to import it from graph.py
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=settings.GROQ_API_KEY,
    temperature=0.1
)

def coder_node(state: AgentState):
    """
    Generates code based on the user's prompt and selected language.
    """
    messages = state["messages"]
    
    # 1. GET THE LANGUAGE FROM STATE (Default to Python if missing)
    language = state.get("language", "python").lower()

    # 2. DYNAMIC SYSTEM PROMPT
    language_instructions = {
        "python": "Write a complete, runnable Python script. Ensure all imports are included.",
        "javascript": "Write a complete Node.js script. Use console.log for output.",
        "cpp": "Write a complete C++ program with a main function. Include <iostream> and use std namespace.",
        "java": "Write a complete Java program. CRITICAL: The class MUST be named 'Main' (public class Main). Do not use packages.",
        "bash": "Write a Bash script.",
    }
    
    instruction = language_instructions.get(language, f"Write a complete {language} script.")

    system_message = SystemMessage(content=f"""
    You are an expert Polyglot Programmer.
    
    YOUR TASK:
    {instruction}
    
    USER PROMPT:
    {messages[-1].content}
    
    RULES:
    1. Output ONLY the raw code. 
    2. Do NOT use Markdown backticks (```).
    3. Do NOT add explanations or comments before/after the code.
    4. The code must print the output to stdout so the user can see it.
    """)

    # 3. CALL THE LLM
    # (WE REMOVED THE CIRCULAR IMPORT HERE. IT NOW USES THE 'llm' DEFINED AT THE TOP)
    response = llm.invoke([system_message])
    
    return {"messages": [response], "final_code": response.content}

def executor_node(state: AgentState):
    """Runs the code in Docker."""
    print(f"--- EXECUTING (Attempt {state.get('iterations', 1)}) ---")
    
    # FIXED: Use 'final_code' which matches what coder_node returns
    code_to_run = state.get("final_code") or state.get("code")
    
    if not code_to_run:
        return {"output": "Error: No code found to execute."}

    # Pass the correct language from state
    language = state.get("language", "python")
    result = execute_in_sandbox(code_to_run, language)
    
    return {"output": result}

def should_continue(state: AgentState):
    """Decides if we stop or retry."""
    # Simple logic: If we have code, we stop.
    # (Complex retry loops are disabled for Vibe Coding speed)
    return "end"