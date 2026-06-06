import os
import pandas as pd
from typing import Annotated, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# 1. Define the exact JSON shape the frontend chart component needs
class ChartDataPoint(BaseModel):
    name: str = Field(description="The X-axis label (e.g., the date or ticker Name)")
    value: float = Field(description="The Y-axis numerical value")

class ChartStructure(BaseModel):
    chart_type: Literal["line", "bar"] = Field(description="The type of chart to display")
    title: str = Field(description="A clean title for the chart based on the request")
    data: List[ChartDataPoint] = Field(description="The structured rows of coordinates for Recharts")
    explanation: str = Field(description="A brief text summary explaining what the data shows")

# 2. Define the LangGraph State
class DashboardState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    chart_config: Dict[str, Any]

# Load dataset once globally into memory to inspect columns/data quickly
CSV_PATH = os.path.join(os.path.dirname(__file__), "sp500_5yr.csv")

def llm_chart_node(state: DashboardState) -> Dict[str, Any]:
    """
    Reads the user's request, inspects the CSV data, and forces the LLM 
    to output structured JSON for the frontend.
    """
    # Load data rows safely
    try:
        df = pd.read_csv(CSV_PATH)
        # Give the LLM a tiny slice sample of the data so it understands what's inside
        data_context = f"""
        You have access to an S&P 500 dataset with columns: {list(df.columns)}.
        Unique Ticker Names in dataset: {df['Name'].unique().tolist()}
        Total rows: {len(df)}
        Sample Data:
        {df.head(5).to_string()}
        """
    except Exception as e:
        data_context = f"Error reading CSV file path: {str(e)}"

    # System rules to guide the LLM's structural framing
    system_prompt = (
        "You are an expert Data Analyst AI agent. Your sole purpose is to look at the dataset context "
        "provided below and fulfill the user's visualization request.\n\n"
        f"{data_context}\n\n"
        "CRITICAL INSTRUCTIONS:\n"
        "1. Filter the dataset accurately based on the requested ticker Symbol (found in the 'Name' column).\n"
        "2. Extract the matching coordinate pairs. Map dates or categories to the 'name' property and metrics "
        "to the 'value' property.\n"
        "3. Keep data sizes compact. Do not return more than 15-20 data points so the graph is readable.\n"
        "4. If the user asks to modify a previous chart (e.g., 'Change it to a bar chart'), respect the existing data "
        "and simply change the chart_type."
    )

    # Initialize the LLM structured output engine
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    structured_llm = llm.with_structured_output(ChartStructure)

    # Compile message stream including history
    full_messages = [{"role": "system", "content": system_prompt}]
    for msg in state["messages"]:
        if isinstance(msg, HumanMessage):
            full_messages.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            full_messages.append({"role": "assistant", "content": msg.content})

    # Invoke LLM
    try:
        response: ChartStructure = structured_llm.invoke(full_messages)
        chart_json = response.model_dump()
    except Exception as e:
        # Fallback dictionary structure if structural synthesis errors out
        chart_json = {
            "chart_type": "line",
            "title": "Error Processing Request",
            "data": [],
            "explanation": f"I hit an error parsing that request: {str(e)}"
        }

    # Package output text to keep track of the conversation sequence natively
    ai_message = AIMessage(content=chart_json["explanation"])

    return {
        "messages": [ai_message],
        "chart_config": chart_json
    }

# 3. Build and Compile the State Graph
workflow = StateGraph(DashboardState)
workflow.add_node("analyst_node", llm_chart_node)

workflow.add_edge(START, "analyst_node")
workflow.add_edge("analyst_node", END)

# Export compiled engine
agent_graph = workflow.compile()
