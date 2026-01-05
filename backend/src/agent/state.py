from typing import TypedDict, List
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: List[BaseMessage] # Chat history
    final_code: str                   # The latest generated code
    language: str                 # The execution result
    user_id: str             # Loop counter