import asyncio
import cv2
import uuid
import time
import os
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json

from backend.database import init_db, save_detection, get_recent_detections, get_person_cards
from backend.face_recognizer import recognizer
from backend.camera_manager import CameraStreamManager

app = FastAPI(title="Face Recognition Dashboard API")

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static mounts ─────────────────────────────────────────────────────────
# Student images from D:\dataset
if os.path.exists("D:/dataset"):
    app.mount("/api/student_images", StaticFiles(directory="D:/dataset"), name="student_images")

# Snapshots directory (unknown faces)
snapshots_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "snapshots")
os.makedirs(snapshots_dir, exist_ok=True)
app.mount("/api/snapshots", StaticFiles(directory=snapshots_dir), name="snapshots")

# ── Camera setup (Dual Cameras) ─────────────────────────────────────────
# Using the requested ESP32-CAM IPs
CAMERA_1_URL = os.getenv("CAMERA_1_URL", "http://172.16.236.52:81/stream")
CAMERA_2_URL = os.getenv("CAMERA_2_URL", "http://172.16.236.177:81/stream")

cam1 = CameraStreamManager("Camera 1", CAMERA_1_URL)
cam2 = CameraStreamManager("Camera 2", CAMERA_2_URL)
cameras = [cam1, cam2]

# ── Runtime state ────────────────────────────────────────────────────────
active_websockets: list[WebSocket] = []
latest_detection_cache = None
camera_detections = {"Camera 1": None, "Camera 2": None}


# ── Lifecycle ────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    init_db()
    for cam in cameras:
        cam.start()
    asyncio.create_task(recognition_loop())

@app.on_event("shutdown")
def shutdown_event():
    for cam in cameras:
        cam.stop()


# ── WebSocket broadcast helper ───────────────────────────────────────────
async def broadcast_ws(message: dict):
    print(f"DEBUG: Broadcasting {message['event']}")
    payload = json.dumps(message, default=str)
    dead = []
    for ws in active_websockets:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        try:
            active_websockets.remove(ws)
        except ValueError:
            pass


# ── Recognition loop ─────────────────────────────────────────────────────
async def recognition_loop():
    global latest_detection_cache

    last_process_time = 0.0
    process_interval = 0.5          # 2 fps inference (all cameras)

    last_status_broadcast = 0.0
    status_interval = 2.0           # broadcast camera status every 2 s

    print("DEBUG: [recognition_loop] Starting...")
    while True:
        current_time = time.time()

        # ── Face recognition ──────────────────────────────────────────
        if current_time - last_process_time >= process_interval:
            print(f"DEBUG: [recognition_loop] Heartbeat - {len(cameras)} cameras")
            for cam in cameras:
                frame = cam.get_latest_frame()
                if frame is None:
                    print(f"DEBUG: [{cam.camera_id}] Skipping - No frame available.")
                    continue
                
                print(f"DEBUG: [{cam.camera_id}] Scanning frame {frame.shape}...")
                
                # Save one frame for visual check
                if current_time % 5 < 1: # roughly every 5 seconds
                    cv2.imwrite("debug_live.jpg", frame)
                    # print(f"DEBUG: Saved live frame to debug_live.jpg")

                result = await asyncio.to_thread(recognizer.recognize_frame, frame)
                
                if result:
                    print(f"DEBUG: [{cam.camera_id}] Face Recognized: {result['name']} (Conf: {result['confidence']:.2f})")
                    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                    snapshot_path = None
                    if result["status"] == "Unknown":
                        snap_name = f"unknown_{uuid.uuid4().hex[:8]}.jpg"
                        snap_full = os.path.join(snapshots_dir, snap_name)
                        cv2.imwrite(snap_full, cv2.cvtColor(result["rgb_img"], cv2.COLOR_RGB2BGR))
                        snapshot_path = f"/api/snapshots/{snap_name}"
                        print(f"[{cam.camera_id}] Unknown person → saved snapshot.")

                    detection_data = {
                        "roll_no":       result["roll_no"],
                        "name":          result["name"],
                        "confidence":    round(result["confidence"], 2),
                        "camera":        cam.camera_id,
                        "timestamp":     timestamp_str,
                        "status":        result["status"],
                        "snapshot_path": snapshot_path,
                        "photo_path":    result.get("photo_path"),
                        "dob":           result.get("dob"),
                        "box":           result.get("box"),
                    }

                    db_record = save_detection(detection_data)
                    detection_data["id"] = db_record.id
                    camera_detections[cam.camera_id] = detection_data
                    await broadcast_ws({"event": "new_detection", "data": detection_data})
                else:
                    camera_detections[cam.camera_id] = None

        # ── Periodic camera-status broadcast ─────────────────────────
        if current_time - last_status_broadcast >= status_interval:
            last_status_broadcast = current_time
            await broadcast_ws({
                "event": "camera_status",
                "data": [c.get_status() for c in cameras]
            })

        await asyncio.sleep(0.1)


# ── WebSocket endpoint ───────────────────────────────────────────────────
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    # Send current camera status immediately on connect
    await websocket.send_text(json.dumps({
        "event": "camera_status",
        "data": [c.get_status() for c in cameras]
    }, default=str))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        try:
            active_websockets.remove(websocket)
        except ValueError:
            pass


# ── REST endpoints ───────────────────────────────────────────────────────
@app.get("/api/latest_detection")
async def get_latest_detection():
    return latest_detection_cache

@app.get("/api/detection_logs")
async def get_logs(limit: int = 50):
    logs = get_recent_detections(limit)
    return [
        {
            "id":            l.id,
            "roll_no":       l.roll_no,
            "name":          l.name,
            "confidence":    l.confidence,
            "camera":        l.camera,
            "timestamp":     l.timestamp,
            "status":        l.status,
            "snapshot_path": l.snapshot_path,
            "photo_path":    l.photo_path,
            "dob":           l.dob,
        }
        for l in logs
    ]

@app.get("/api/person_cards")
async def fetch_person_cards():
    cards = get_person_cards()
    return [
        {
            "roll_no":              c.roll_no,
            "name":                 c.name,
            "latest_detection_time": c.latest_detection_time,
            "camera":               c.camera,
            "status":               c.status,
            "photo_path":           c.photo_path,
            "dob":                  c.dob,
        }
        for c in cards
    ]

@app.get("/api/camera_status")
async def camera_status():
    return [c.get_status() for c in cameras]

@app.get("/api/student_photo/{roll_no}")
async def get_student_photo(roll_no: str):
    """Returns the URL of the first photo found for a student."""
    stu_dir = os.path.join("D:/dataset", roll_no.strip())
    if os.path.exists(stu_dir):
        imgs = [f for f in os.listdir(stu_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if imgs:
            return {"photo_url": f"/api/student_images/{roll_no}/{imgs[0]}"}
    return {"photo_url": None}


# ── MJPEG video feed ─────────────────────────────────────────────────────
def gen_frames(camera_manager: CameraStreamManager):
    """Synchronous generator for MJPEG stream."""
    print(f"DEBUG: [gen_frames] Starting stream for {camera_manager.camera_id}")
    while True:
        frame = camera_manager.get_latest_frame()
        if frame is None:
            time.sleep(0.05)
            continue

        try:
            # Annotate with detection box / name if available
            detection = camera_detections.get(camera_manager.camera_id)
            if detection and detection.get("box"):
                box  = detection["box"]
                name = detection.get("name", "")
                x1, y1, x2, y2 = int(box[0]), int(box[1]), int(box[2]), int(box[3])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, name, (x1, max(y1 - 10, 10)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

            ret, buffer = cv2.imencode(".jpg", frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
        except Exception as e:
            print(f"[video_feed] Frame encode error: {e}")
            time.sleep(0.05)

        time.sleep(1 / 30)  # ~30 fps cap


@app.get("/api/video_feed/{camera_id}")
async def video_feed(camera_id: str):
    """MJPEG live stream."""
    cam = cam1 if camera_id == "1" else cam2
    return StreamingResponse(
        gen_frames(cam),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
