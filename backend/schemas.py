from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Detection(BaseModel):
    roll_no: str
    name: str
    confidence: float
    camera: str
    timestamp: str  # Format: "2026-03-12 10:30:45"
    status: str     # "Authorized" or "Unknown"
    snapshot_path: Optional[str] = None
    dob: Optional[str] = None

class DetectionLog(Detection):
    id: int

class CameraStatus(BaseModel):
    camera_id: str
    status: str     # "Online" or "Offline"
    last_frame_time: Optional[str] = None

class PersonCard(BaseModel):
    roll_no: str
    name: str
    latest_detection_time: str
    camera: str
    status: str
    photo_path: Optional[str] = None
    dob: Optional[str] = None
