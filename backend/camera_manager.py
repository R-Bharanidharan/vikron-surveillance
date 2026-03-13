import cv2
import threading
import time
import numpy as np
from datetime import datetime

class CameraStreamManager:
    def __init__(self, camera_id: str, stream_url: str):
        self.camera_id = camera_id
        self.stream_url = stream_url
        self.cap = None
        self.latest_frame = None
        self.is_running = False
        self.status = "Offline"
        self.thread = None
        self.last_frame_time = None

    def start(self):
        self.is_running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if self.thread:
            self.thread.join()
        if self.cap:
            self.cap.release()
        self.status = "Offline"

    def _generate_mock_frame(self):
        # Create a black frame
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        # Add text
        cv2.putText(frame, f"MOCK MODE: {self.camera_id}", (50, 200), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        cv2.putText(frame, "No physical camera detected/requested", (50, 240),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        cv2.putText(frame, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), (50, 280), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (150, 150, 150), 1)
        
        # Add a moving indicator to show it's "live"
        t = time.time()
        cx = int(320 + 200 * np.cos(t))
        cy = int(240 + 100 * np.sin(t))
        cv2.circle(frame, (cx, cy), 20, (0, 255, 0), -1)
        return frame

    def _capture_loop(self):
        while self.is_running:
            try:
                url = self.stream_url
                is_mock_requested = (url == "mock")
                
                # Only attempt connection if cap is none or not opened
                if not self.cap or not self.cap.isOpened():
                    # Attempt to open camera
                    if is_mock_requested:
                        # Windows: Try DSHOW first, fallback to default
                        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                        if not self.cap or not self.cap.isOpened():
                            self.cap = cv2.VideoCapture(0)
                    else:
                        # Try primary URL
                        print(f"[{self.camera_id}] Attempting connection to {url}")
                        self.cap = cv2.VideoCapture(url)
                        
                        # Fallback to Port 80 if Port 81 was tried and failed
                        if (not self.cap or not self.cap.isOpened()) and ":81" in url:
                            fallback_url = url.replace(":81", ":80")
                            print(f"[{self.camera_id}] Port 81 failed. Trying {fallback_url}...")
                            self.cap = cv2.VideoCapture(fallback_url)

                if self.cap and self.cap.isOpened():
                    if "Fallback" not in self.status:
                        self.status = "Online"
                    print(f"[{self.camera_id}] Connection Successful! (Status: {self.status})")
                else:
                    if is_mock_requested:
                        self.status = "Mocking"
                        print(f"[{self.camera_id}] Using synthetic mock stream.")
                    else:
                        print(f"[{self.camera_id}] Device at {url} is unreachable. Check network/IP.")
                        # Auto-fallback to local webcam for Camera 1 if requested
                        if self.camera_id == "Camera 1":
                             print(f"[{self.camera_id}] FALLBACK: Attempting local webcam...")
                             self.cap = cv2.VideoCapture(0)
                             if self.cap and self.cap.isOpened():
                                 self.status = "Online (Webcam Fallback)"
                                 continue
                        
                        self.status = "Offline"
                        time.sleep(5)
                        continue

                # Main read loop
                while self.is_running:
                    if self.cap and self.cap.isOpened():
                        ret, frame = self.cap.read()
                        if not ret:
                            print(f"[{self.camera_id}] Stream disconnected.")
                            break
                        self.latest_frame = frame
                    elif self.status == "Mocking":
                        self.latest_frame = self._generate_mock_frame()
                        # Sleep to match ~30fps mock stream
                        time.sleep(0.033)
                    else:
                        break
                    
                    self.last_frame_time = time.time()
                    time.sleep(0.01) # Yield

            except Exception as e:
                print(f"[{self.camera_id}] Loop error: {e}")
            finally:
                if self.cap:
                    self.cap.release()
                    self.cap = None
                if self.status != "Mocking":
                    self.status = "Offline"
                time.sleep(2)

    def get_latest_frame(self):
        return self.latest_frame

    def get_status(self):
         return {
             "camera_id": self.camera_id,
             "status": self.status,
             "last_frame_time": datetime.fromtimestamp(self.last_frame_time).strftime("%Y-%m-%d %H:%M:%S") if self.last_frame_time else "Never"
         }
