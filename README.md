# Agentic S&P 500 Analytics Dashboard

A highly streamlined, full-stack web application that allows users to analyze and visualize 5 years of historical S&P 500 stock data using natural language. Built as an educational MVP to master stateful orchestration with **LangGraph**, API delivery via **FastAPI**, and dynamic frontend rendering with **React** and **Recharts**.

---

## Overview

This project implements a single-node state graph architecture designed to bridge the gap between natural language user intent and structured data visualizations. By managing conversational context and utilizing strict schema generation, the application enables an LLM to serve as an intelligent interface that transforms raw time-series metrics directly into customizable dashboard properties.

### Core Architecture
1. **Frontend (React + Vite):** A clean, single-page split-screen UI featuring a chat container on the left and a dynamic chart rendering area on the right.
2. **Backend (FastAPI + Uvicorn):** Exposes a clean, stateless-to-stateful POST endpoint to process messages and handle cross-origin requests.
3. **Agent Core (LangGraph):** A simplified single-node state graph that maintains conversation history, reads instructions dynamically from an external system file (`prompt.md`), and uses **GPT-4o-mini** with structured outputs to efficiently bind raw metrics directly into UI-ready chart properties.

---

## Dataset Focus: S&P 500 Historical Data

The application loads a 5-year historical asset dataset (`sp500_5yr.csv`) into memory. The LangGraph agent is primed to parse user queries and map them against the following transactional time-series columns:

* `date`: The execution timestamp of the stock metrics (YYYY-MM-DD).
* `open`: The starting market price for the stock on that day.
* `high`: The highest trading price reached during the session.
* `low`: The lowest trading price reached during the session.
* `close`: The final closing market price for the stock.
* `volume`: The total quantity of shares traded throughout the session.
* `Name`: The equity ticker symbol used to filter rows (e.g., AAP, ABBV, CNC, CNP, SJM, SLB).

### Sample Analytical Prompts
* *"Show me a line chart of the closing prices for CNC"*
* *"Show me a bar chart of the highest value for ABBV"*
* *"Change that previous view into a line chart instead"*

---

## Tech Stack

To keep the project lightweight and maintainable, dependencies have been stripped down to the bare essentials:

* **Frontend:** React (JavaScript), Vite, TailwindCSS, Recharts, Lucide React
* **Backend:** Python, FastAPI, Uvicorn, Pydantic, Pandas, Python-Dotenv
* **AI Agent Orchestration:** LangGraph, LangChain Core
* **LLM Provider:** OpenAI (via `gpt-4o-mini` structured output bindings)

---

## LangGraph State Management & Graph Flow

The core of this application relies on LangGraph's explicit state tracking. It monitors both what was said chronologically and how the visual dashboard configuration should change over time:

```python
from typing import Annotated, Dict, Any
from langchain_core.messages import BaseMessage
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

class DashboardState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]  # Keeps track of conversational chat history
    chart_config: Dict[str, Any]                          # Structured JSON formatting for the React frontend
