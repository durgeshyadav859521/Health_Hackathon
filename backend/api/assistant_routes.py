"""
MediSim AI - AI Medicine Guide & Research Assistant Router
Author: Team BioNex - VIT Bhopal University
Purpose: Exposes RAG conversational endpoints for General User and Researcher modes.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..services.ai_assistant_service import process_assistant_query

router = APIRouter(prefix="/api/assistant", tags=["AI Medicine Guide & Research Assistant"])


class AssistantQueryRequest(BaseModel):
    query: str
    mode: Optional[str] = "general"  # 'general' or 'researcher'
    drug_context: Optional[str] = None


@router.post("/query")
def ask_assistant(payload: AssistantQueryRequest):
    """
    Submits a user query to the RAG knowledge engine.
    Returns citation-grounded response with medical safety enforcement.
    """
    if not payload.query or len(payload.query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Query string cannot be empty")
        
    result = process_assistant_query(
        query=payload.query,
        mode=payload.mode or "general",
        drug_context=payload.drug_context
    )
    return result
