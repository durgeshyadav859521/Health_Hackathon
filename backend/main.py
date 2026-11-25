"""
MediSim AI - Main FastAPI Application
Project Title: AI-Powered Drug Response Simulation and Interactive Human Body Visualization
Tagline: Understand the Medicine. Visualize Its Effects. Explore the Science.
Team: BioNex – VIT Bhopal University
Category: Predictive and Preventive Health Intelligence
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .api.drug_routes import router as drug_router
from .api.simulation_routes import router as simulation_router
from .api.model_routes import router as model_router
from .api.report_routes import router as report_router
from .api.auth_routes import router as auth_router
from .api.anatomy_routes import router as anatomy_router
from .api.calendar_routes import router as calendar_router
from .api.assistant_routes import router as assistant_router

app = FastAPI(
    title="MediSim AI - Dual-Platform Health & Research Intelligence",
    description="Real-world biomedical AI platform developed by Team BioNex (VIT Bhopal University) featuring 3D Human Body simulation, DILIrank 2.0 ML, LINCS L1000, CPIC guidelines, Smart Medicine Calendar, and RAG AI Guide.",
    version="2.5.0"
)

# Configure CORS for React/Vite development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(drug_router)
app.include_router(simulation_router)
app.include_router(model_router)
app.include_router(report_router)
app.include_router(auth_router)
app.include_router(anatomy_router)
app.include_router(calendar_router)
app.include_router(assistant_router)


@app.get("/")
def root():
    return {
        "platform": "MediSim AI",
        "tagline": "Understand the Medicine. Visualize Its Effects. Explore the Science.",
        "project_title": "AI-Powered Drug Response Simulation and Interactive Human Body Visualization",
        "category": "Predictive and Preventive Health Intelligence",
        "team": "BioNex – VIT Bhopal University",
        "status": "Operational",
        "docs_url": "/docs",
        "endpoints": [
            "/api/drugs/search",
            "/api/drugs/{drug_id}",
            "/api/drugs/{drug_id}/safety",
            "/api/drugs/interactions",
            "/api/anatomy/organs",
            "/api/anatomy/systems",
            "/api/anatomy/drug/{drug_id}/evidence",
            "/api/anatomy/drug-journey",
            "/api/calendar",
            "/api/calendar/schedules",
            "/api/calendar/doses/{dose_id}/status",
            "/api/calendar/reminders",
            "/api/assistant/query",
            "/api/simulation/liver-toxicity",
            "/api/simulation/biological-response",
            "/api/simulation/{simulation_id}",
            "/api/explainability/{simulation_id}",
            "/api/models/status",
            "/api/models/metrics",
            "/api/datasets/status",
            "/api/reports/generate",
            "/api/reports/{report_id}",
            "/api/auth/register",
            "/api/auth/login"
        ]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "MediSim AI Core API",
        "team": "BioNex - VIT Bhopal University"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
