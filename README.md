# Agentic S&P 500 Analytics Dashboard 📈

A highly streamlined, full-stack web application that allows users to analyze and visualize data from a full S&P 500 dataset using natural language. Built as an educational MVP to master stateful orchestration with **LangGraph**, API delivery via **FastAPI**, and dynamic frontend rendering with **React** and **Recharts**.

---

## 🚀 Overview

Instead of building a bloated multi-agent setup, this project focuses on a lean, high-impact architecture. It demonstrates how an LLM can act as a natural language interface for financial datasets by tracking conversational state and mapping user intent directly to frontend chart properties.

### Core Architecture
1. **Frontend (React):** A clean, single-page split-screen UI featuring a chat container on the left and a dynamic chart rendering area on the right.
2. **Backend (FastAPI + Uvicorn):** Exposes a clean, stateless-to-stateful POST endpoint to process messages.
3. **Agent Core (LangGraph):** A simplified single-node state graph that tracks conversation history and uses **GPT-4o-mini** with structured outputs to convert raw data fields into UI-ready configurations (`chart_type`, `x_axis`, `y_axis`, and filtered data rows).

---

## 📊 Dataset Focus: S&P 500

The backend contains a complete S&P 500 dataset (`sp500_data.csv`). The LangGraph agent is primed to look at key institutional financial fields, including:
* `Ticker` (e.g., AAPL, MSFT, AMZN)
* `Sector` (e.g., Information Technology, Financials, Healthcare)
* `MarketCap` (Market Capitalization)
* `Price` (Current stock price)
* `PE_Ratio` (Price-to-Earnings Ratio)
* `DividendYield` (Annual dividend payout percentage)

Users can type queries like: 
* *"Show me a bar chart of the top 10 companies by market cap in the Technology sector."*
* *"Compare the P/E ratios of Apple, Microsoft, and Google."*
* *"Change that previous comparison into a line chart instead."*

---

## 🛠️ Tech Stack

To keep the project lightweight and maintainable, dependencies have been stripped down to the bare essentials:

* **Frontend:** React (JavaScript), TailwindCSS, Recharts
* **Backend:** FastAPI, Uvicorn, Pydantic
* **AI Agent Orchestration:** LangGraph, LangChain Core
* **LLM Provider:** OpenAI (gpt-5o-mini)

---

## 🧠 LangGraph State Management

The core of this application relies on LangGraph's explicit state tracking. It monitors both what was said and how the dashboard should change over time:

```python
from typing import TypedDict, List, Dict, Any
from langchain_core.messages import BaseMessage

class DashboardState(TypedDict):
    messages: List[BaseMessage]       # Keeps track of conversational chat history
    chart_config: Dict[str, Any]      # Structured JSON formatting for the React frontend
