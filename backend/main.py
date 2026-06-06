import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from langchain_core.messages import HumanMessage, AIMessage
from graph import agent_graph

from dotenv import load_dotenv
load_dotenv() 

app = FastAPI(title="Agentic Data Visualizer MVP API")

# Configure CORS so your frontend server doesn't get blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Define Request/Response API Formats
class ChatMessageInput(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageInput]

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    """
    Receives chat history from the frontend, maps it into LangChain message types,
    runs it through the LangGraph engine, and returns the updated state.
    """
    # Convert incoming standard arrays into rich LangChain Objects
    graph_messages = []
    for msg in payload.messages:
        if msg.role == "user":
            graph_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            graph_messages.append(AIMessage(content=msg.content))

    # Initialize input dict state
    inputs = {"messages": graph_messages, "chart_config": {}}

    # Run the transaction state smoothly over the graph
    output_state = agent_graph.invoke(inputs)

    # Return the clean state configuration directly back to React
    return {
        "reply": output_state["messages"][-1].content,
        "chart_config": output_state.get("chart_config", {})
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
