"""
MediSim AI - Smart Medicine Calendar & Reminders Service
Author: Team BioNex - VIT Bhopal University
Purpose: Manages personal medication schedules, daily/weekly/monthly calendar slots,
         self-reported adherence tracking (Taken/Skipped/Missed), and refill reminders.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
import uuid

# In-memory storage with initial realistic demo medication schedules
_SCHEDULES_DB: List[Dict[str, Any]] = [
    {
        "id": "sched-001",
        "medicine_name": "Metformin",
        "brand_name": "Glycomet",
        "strength": "500 mg",
        "dosage_form": "Sustained Release Tablet",
        "prescribed_dose": "1 tablet",
        "frequency": "Twice daily",
        "scheduled_times": ["08:30", "20:30"],
        "food_timing": "With meals",
        "start_date": (date.today() - timedelta(days=14)).isoformat(),
        "end_date": (date.today() + timedelta(days=76)).isoformat(),
        "instructions": "Swallow whole with a glass of water. Do not crush.",
        "prescribing_doctor": "Dr. V. Sharma (Endocrinology)",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "sched-002",
        "medicine_name": "Atorvastatin",
        "brand_name": "Storvas",
        "strength": "20 mg",
        "dosage_form": "Tablet",
        "prescribed_dose": "1 tablet",
        "frequency": "Once daily at bedtime",
        "scheduled_times": ["22:00"],
        "food_timing": "Before sleep (regardless of food)",
        "start_date": (date.today() - timedelta(days=30)).isoformat(),
        "end_date": (date.today() + timedelta(days=60)).isoformat(),
        "instructions": "Take consistently at bedtime.",
        "prescribing_doctor": "Dr. A. Verma (Cardiology)",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "sched-003",
        "medicine_name": "Paracetamol",
        "brand_name": "Dolo 650",
        "strength": "650 mg",
        "dosage_form": "Tablet",
        "prescribed_dose": "1 tablet as needed",
        "frequency": "Every 6-8 hours as needed (Max 4g/day)",
        "scheduled_times": ["14:00"],
        "food_timing": "After food",
        "start_date": date.today().isoformat(),
        "end_date": (date.today() + timedelta(days=3)).isoformat(),
        "instructions": "Take only if experiencing fever or bodily pain. Do not exceed 4 tablets in 24 hours.",
        "prescribing_doctor": "Self / OTC Guided",
        "created_at": datetime.utcnow().isoformat()
    }
]

# Track recorded dose actions (dose_id -> status dict)
_DOSES_STATUS_DB: Dict[str, Dict[str, Any]] = {
    f"sched-001-{date.today().isoformat()}-08:30": {
        "status": "Taken",
        "recorded_at": (datetime.now() - timedelta(hours=3)).isoformat(),
        "notes": "Taken with breakfast"
    }
}


def get_all_schedules() -> List[Dict[str, Any]]:
    return _SCHEDULES_DB


def add_schedule(schedule_data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"sched-{uuid.uuid4().hex[:6]}"
    schedule_data["id"] = new_id
    schedule_data["created_at"] = datetime.utcnow().isoformat()
    _SCHEDULES_DB.append(schedule_data)
    return schedule_data


def update_schedule(schedule_id: str, updated_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    for idx, s in enumerate(_SCHEDULES_DB):
        if s["id"] == schedule_id:
            _SCHEDULES_DB[idx].update(updated_data)
            return _SCHEDULES_DB[idx]
    return None


def delete_schedule(schedule_id: str) -> bool:
    global _SCHEDULES_DB
    initial_len = len(_SCHEDULES_DB)
    _SCHEDULES_DB = [s for s in _SCHEDULES_DB if s["id"] != schedule_id]
    return len(_SCHEDULES_DB) < initial_len


def record_dose_status(dose_id: str, status: str, notes: Optional[str] = None) -> Dict[str, Any]:
    """
    Record user-reported status for a specific scheduled dose slot.
    Statuses: 'Taken', 'Skipped', 'Missed'
    """
    valid_statuses = ["Taken", "Skipped", "Missed", "Upcoming"]
    clean_status = status.capitalize() if status.capitalize() in valid_statuses else "Taken"
    
    _DOSES_STATUS_DB[dose_id] = {
        "status": clean_status,
        "recorded_at": datetime.utcnow().isoformat(),
        "notes": notes or ""
    }
    
    guidance = ""
    if clean_status == "Missed":
        guidance = "Important: If you missed a dose, take it as soon as you remember unless it is almost time for your next scheduled dose. Never take a double dose to make up for a missed dose."
    elif clean_status == "Skipped":
        guidance = "Dose recorded as skipped. Keep your prescribing doctor or pharmacist informed if you frequently skip medications."
    else:
        guidance = "Dose confirmed taken on time. Excellent adherence!"

    return {
        "dose_id": dose_id,
        "status": clean_status,
        "recorded_at": _DOSES_STATUS_DB[dose_id]["recorded_at"],
        "missed_dose_guidance": guidance,
        "adherence_note": "Adherence metrics are self-reported."
    }


def generate_calendar_overview(target_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates a full calendar view including today's slots, upcoming 7-day schedule,
    and self-reported adherence statistics.
    """
    today_dt = date.today()
    if target_date:
        try:
            today_dt = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            pass
            
    today_str = today_dt.isoformat()
    
    today_doses = []
    weekly_slots = []
    
    total_slots = 0
    taken_count = 0
    skipped_count = 0
    missed_count = 0
    
    # Generate schedule for the current week (7 days)
    for day_offset in range(-3, 4):
        current_day = today_dt + timedelta(days=day_offset)
        day_str = current_day.isoformat()
        
        for s in _SCHEDULES_DB:
            # Check if active on this day
            start = datetime.strptime(s["start_date"], "%Y-%m-%d").date() if s.get("start_date") else today_dt
            end = datetime.strptime(s["end_date"], "%Y-%m-%d").date() if s.get("end_date") else today_dt + timedelta(days=365)
            
            if start <= current_day <= end:
                for time_slot in s.get("scheduled_times", ["09:00"]):
                    slot_id = f"{s['id']}-{day_str}-{time_slot}"
                    
                    # Status determination
                    status_info = _DOSES_STATUS_DB.get(slot_id)
                    if status_info:
                        status = status_info["status"]
                    elif current_day < today_dt:
                        status = "Missed"  # Auto-categorized as missed if past day with no record
                    elif current_day == today_dt:
                        # If time has passed by >2h and not taken, suggest pending/missed
                        status = "Upcoming"
                    else:
                        status = "Upcoming"
                        
                    total_slots += 1
                    if status == "Taken":
                        taken_count += 1
                    elif status == "Skipped":
                        skipped_count += 1
                    elif status == "Missed":
                        missed_count += 1
                        
                    dose_item = {
                        "dose_id": slot_id,
                        "schedule_id": s["id"],
                        "medicine_name": s["medicine_name"],
                        "brand_name": s.get("brand_name", ""),
                        "strength": s["strength"],
                        "dosage_form": s.get("dosage_form", "Tablet"),
                        "date": day_str,
                        "time": time_slot,
                        "food_timing": s.get("food_timing", ""),
                        "status": status,
                        "recorded_at": status_info.get("recorded_at") if status_info else None,
                        "instructions": s.get("instructions", "")
                    }
                    
                    if current_day == today_dt:
                        today_doses.append(dose_item)
                        
                    weekly_slots.append(dose_item)
                    
    # Sort today's doses chronologically
    today_doses.sort(key=lambda x: x["time"])
    
    # Calculate self-reported adherence rate
    evaluated_slots = taken_count + missed_count + skipped_count
    adherence_pct = round((taken_count / evaluated_slots * 100), 1) if evaluated_slots > 0 else 100.0
    
    # Active reminders
    reminders = [
        {
            "id": "rem-01",
            "medicine": "Metformin (Glycomet)",
            "type": "Dose Reminder",
            "time": "20:30",
            "message": "Time for your evening dose with dinner.",
            "urgent": False
        },
        {
            "id": "rem-02",
            "medicine": "Atorvastatin (Storvas)",
            "type": "Refill Reminder",
            "time": "In 5 days",
            "message": "Only 6 tablets remaining in current pack. Time to refill.",
            "urgent": True
        }
    ]
    
    return {
        "current_date": today_str,
        "today_schedule": today_doses,
        "weekly_schedule": weekly_slots,
        "adherence_statistics": {
            "rate_percentage": adherence_pct,
            "taken_doses": taken_count,
            "missed_doses": missed_count,
            "skipped_doses": skipped_count,
            "label": "Self-Reported Adherence Rate"
        },
        "reminders": reminders,
        "missed_dose_rule": "Never double your dose to compensate for a missed dose. Contact your prescriber or pharmacist if unsure."
    }
