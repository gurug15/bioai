# 🧬 BioAI - Intelligent Bioinformatics Assistant

BioAI is a modern, full-stack AI chatbot application tailored for biological data analysis and bioinformatics research. It features a high-performance Python backend and a beautiful, highly responsive React frontend designed to provide an immersive, ChatGPT-like user experience.

---

## ✨ Features

- **Immersive Chat UI**: A full-screen, responsive, and sleek dark-mode interface built with modern React standards, TailwindCSS, and Shadcn UI components.
- **Conversational Memory**: Robust conversation handling and state management for persistent context (powered by Axios interceptors and custom React hooks).
- **Asynchronous Backend**: A lightning-fast RESTful API built on FastAPI and Uvicorn, capable of handling concurrent inference requests seamlessly.
- **Agentic Extensibility**: Foundation laid for advanced AI capabilities, including Retrieval-Augmented Generation (RAG), vector embeddings, and LangGraph integration for complex biological queries.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4, Glassmorphism design elements
- **Components**: Shadcn UI, Radix UI, Lucide React (Icons)
- **API Client**: Axios (with centralized request/response interceptors)
- **Routing**: React Router DOM v7

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Package Management**: `uv` 
- **Architecture**: Domain-driven design with custom exception handlers and Pydantic schemas.

---

## 🚀 Getting Started

Follow these instructions to get the project running locally.

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher)
- `uv` (Python package manager)

### 1. Starting the Backend
The backend runs on `http://localhost:5555`.

```bash
cd backend
# Install dependencies using uv
uv sync

# Run the FastAPI server in development mode
uv run main.py
```

### 2. Starting the Frontend
The frontend runs on Vite's default dev server (usually `http://localhost:5173`).

```bash
cd frontend
# Install NPM dependencies
npm install

# Start the development server
npm run dev
```

---

## 📂 Project Structure

```text
bioai/
├── backend/
│   ├── api/            # FastAPI Routers and endpoints
│   ├── exceptions/     # Custom HTTP exceptions and handlers
│   ├── schemas/        # Pydantic models for data validation
│   └── main.py         # Application entry point & CORS configuration
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components (Shadcn)
    │   ├── hooks/      # Custom React hooks (e.g., useChat)
    │   ├── lib/        # API configurations and utility functions
    │   └── pages/      # View components (e.g., Chat.tsx)
    └── package.json    # Frontend dependencies
```

---
