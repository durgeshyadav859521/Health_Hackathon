"""
MediSim AI - Smart Medicine Calendar Router
Author: Team BioNex - VIT Bhopal University
Purpose: Exposes endpoints for managing personal medication schedules, calendar views,
         marking dose statuses, and checking medication reminders.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from ..services.calendar_service import (
    get_all_schedules,
    add_schedule,
    update_schedule,
    delete_schedule,
    record_dose_status,
    generate_calendar_overview
)

router = APIRouter(prefix="/api/calendar", tags=["Smart Medicine Calendar & Reminders"])


class ScheduleCreateRequest(BaseModel):
    medicine_name: str
    brand_name: Optional[str] = ""
    strength: str
    dosage_form: Optional[str] = "Tablet"
    prescribed_dose: str
    frequency: str
    scheduled_times: List[str] = Field(default_factory=lambda: ["09:00"])
    food_timing: Optional[str] = "With food"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    instructions: Optional[str] = ""
    prescribing_doctor: Optional[str] = ""


class DoseStatusRequest(BaseModel):
    status: str  # 'Taken', 'Skipped', 'Missed'
    notes: Optional[str] = ""


@router.get("")
def get_calendar(date: Optional[str] = Query(None, description="Target date YYYY-MM-DD")):
    """Get comprehensive calendar overview with daily, weekly slots and adherence stats."""
    return generate_calendar_overview(date)


@router.get("/schedules")
def list_schedules():
    """List all registered medicine schedules."""
    return {
        "schedules": get_all_schedules(),
        "disclaimer": "These schedules are recorded by the user based on valid healthcare provider prescriptions."
    }


@router.post("/schedules")
def create_schedule(payload: ScheduleCreateRequest):
    """Add a new medication schedule based on user's confirmed prescription."""
    schedule_data = payload.dict()
    created = add_schedule(schedule_data)
    return {
        "message": "Medication schedule created successfully",
        "schedule": created
    }


@router.put("/schedules/{schedule_id}")
def edit_schedule(schedule_id: str, payload: ScheduleCreateRequest):
    """Update an existing medication schedule."""
    updated = update_schedule(schedule_id, payload.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {
        "message": "Schedule updated successfully",
        "schedule": updated
    }


@router.delete("/schedules/{schedule_id}")
def remove_schedule(schedule_id: str):
    """Delete a medication schedule."""
    success = delete_schedule(schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted successfully"}


@router.post("/doses/{dose_id}/status")
def update_dose_status(dose_id: str, payload: DoseStatusRequest):
    """Mark a scheduled dose as Taken, Skipped, or Missed."""
    result = record_dose_status(dose_id, payload.status, payload.notes)
    return result


@router.get("/reminders")
def get_reminders():
    """List active dose, refill, and clinical appointment reminders."""
    overview = generate_calendar_overview()
    return {
        "reminders": overview["reminders"],
        "adherence_summary": overview["adherence_statistics"]
    }
