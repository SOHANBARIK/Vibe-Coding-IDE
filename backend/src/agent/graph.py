from langgraph.graph import StateGraph, END
from src.agent.state import AgentState
from src.agent.nodes import coder_node, executor_node, should_continue

# Define Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("coder", coder_node)
workflow.add_node("executor", executor_node)

# Set Flow
workflow.set_entry_point("coder")
workflow.add_edge("coder", "executor")

# Conditional Logic
workflow.add_conditional_edges(
    "executor",
    should_continue,
    {
        "retry": "coder",
        "end": END
    }
)

# Compile
app = workflow.compile()