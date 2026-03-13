import os
import numpy as np
import pandas as pd
from PIL import Image
import cv2

# Removed sklearn to save memory, implementing lightweight numpy version
def cosine_similarity(a, b):
    # a: (1, N), b: (M, N)
    dot_product = np.dot(a, b.T)
    norm_a = np.linalg.norm(a, axis=1, keepdims=True)
    norm_b = np.linalg.norm(b, axis=1, keepdims=True)
    # Avoid division by zero
    return dot_product / (np.dot(norm_a, norm_b.T) + 1e-10)

# Lazy loading flags
_TF_LOADED = False
_TORCH_LOADED = False

class FaceRecognizer:
    def __init__(self, models_dir: str = "./backend/models", data_dir: str = "./backend/data"):
        self.models_dir = os.path.abspath(models_dir)
        self.data_dir = os.path.abspath(data_dir)
        self.device = 'cpu' 
        self.mtcnn = None
        self.resnet = None
        self.tf_model = None
        self.model_type = "facenet"
        self.class_names = []
        
        self.embeddings_path = os.path.join(self.models_dir, "face_embeddings.npy")
        self.labels_path = os.path.join(self.models_dir, "labels.npy")
        self.csv_path = os.path.join(self.data_dir, "students.csv")
        
        self.embeddings = None
        self.labels = None
        self.students_df = None
        
        # Load non-heavy data (CSV, numpy arrays)
        self.load_data()

        # Unknown Face Tracking
        self.unknown_embeddings = []  # List of numpy arrays
        self.unknown_labels = []      # List of strings "Unknown1", "Unknown2", etc.

    def _lazy_init_ai(self):
        """Loads PyTorch and FaceNet models only when needed."""
        global _TORCH_LOADED
        if _TORCH_LOADED: return # Keep this check to avoid re-initialization if already loaded

        try:
            print("Lazy loading PyTorch and FaceNet models...")
            import torch
            # Determine device before loading models
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

            if self.mtcnn is None:
                print("DEBUG: Initializing MTCNN and FaceNet...")
                from facenet_pytorch import MTCNN, InceptionResnetV1
                # Aligned margin=0 and thresholds/min_face_size with rebuild script
                self.mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20, thresholds=[0.5, 0.6, 0.6], device=self.device)
                self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
                print("DEBUG: AI Models Loaded (MTCNN, FaceNet)")
            _TORCH_LOADED = True
            print(f"FaceNet/MTCNN loaded on {self.device}.")
        except Exception as e:
            print(f"Warning: FaceNet/MTCNN loading failed: {e}")

    def _lazy_init_tf(self):
        """Loads TensorFlow only when needed."""
        global _TF_LOADED
        if _TF_LOADED: return
        
        h5_path = os.path.join(self.models_dir, "model.h5")
        if os.path.exists(h5_path):
            try:
                print("Lazy loading TensorFlow...")
                import tensorflow as tf
                from tensorflow.keras.models import load_model
                self.tf_model = load_model(h5_path)
                self.model_type = "h5"
                _TF_LOADED = True
                print(f"Loaded .h5 model from {h5_path}")
            except Exception as ex:
                print(f"Error loading .h5 model: {ex}")

    def load_data(self):
        try:
            if os.path.exists(self.embeddings_path) and os.path.exists(self.labels_path):
                self.embeddings = np.load(self.embeddings_path)
                self.labels = np.load(self.labels_path)
                # Map 174 output nodes of H5 to 174 unique sorted labels
                self.class_names = np.sort(np.unique(self.labels))
                print(f"Loaded {len(self.embeddings)} embeddings and {len(self.class_names)} unique classes.")
            else:
                print(f"Warning: embeddings not found at {self.embeddings_path}")
                self.class_names = []

            if os.path.exists(self.csv_path):
                self.students_df = pd.read_csv(self.csv_path)
                self.students_df.columns = self.students_df.columns.str.strip().str.replace(" ", "_").str.upper()
                
                if "NAME_WITH_INITIAL_AFTER_NAME" in self.students_df.columns:
                    self.students_df = self.students_df.rename(columns={"NAME_WITH_INITIAL_AFTER_NAME": "NAME"})
                
                if "ROLL_NO" in self.students_df.columns:
                    self.students_df["ROLL_NO"] = self.students_df["ROLL_NO"].astype(str).str.strip()

                print(f"Loaded student database with {len(self.students_df)} records.")
            else:
                print(f"Warning: students.csv not found at {self.csv_path}")

            # If an h5 model exists, we'll mark it for lazy loading later if needed
            h5_path = os.path.join(self.models_dir, "model.h5")
            if os.path.exists(h5_path):
                self.model_type = "h5"

        except Exception as e:
            print(f"Error loading data: {e}")

    def recognize_frame(self, frame_bgr):
        if self.embeddings is None or self.labels is None:
            # print("DEBUG: [recognize_frame] Skipping: No embeddings/labels loaded")
            return None
        
        # Ensure models are loaded
        if self.model_type == "h5":
            self._lazy_init_tf()
        self._lazy_init_ai()
        if self.mtcnn is None: return None

        # print(f"DEBUG: [recognize_frame] Input shape: {frame_bgr.shape}")
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)

        try:
            # Improved logging: check input size
            # print(f"DEBUG: [recognize_frame] Frame: {frame_bgr.shape[1]}x{frame_bgr.shape[0]}")
            boxes, probs = self.mtcnn.detect(img)
            
            if boxes is None or len(boxes) == 0:
                # Simple brightness boost (alpha=1.5, beta=30) and Denoise
                denoised = cv2.fastNlMeansDenoisingColored(frame_bgr, None, 10, 10, 7, 21)
                enhanced_cv = cv2.convertScaleAbs(denoised, alpha=1.5, beta=30)
                enhanced_rgb = cv2.cvtColor(enhanced_cv, cv2.COLOR_BGR2RGB)
                enhanced_pil = Image.fromarray(enhanced_rgb)
                boxes, probs = self.mtcnn.detect(enhanced_pil)
                
                if boxes is None or len(boxes) == 0:
                    # Final attempt: just brighten
                    bright = cv2.convertScaleAbs(frame_bgr, alpha=1.8, beta=50)
                    bright_pil = Image.fromarray(cv2.cvtColor(bright, cv2.COLOR_BGR2RGB))
                    boxes, probs = self.mtcnn.detect(bright_pil)
                    if boxes is not None:
                        img = bright_pil
                        print("DEBUG: Face detected in ULTRA-BRIGHT mode")
                    else:
                        return None
                else:
                    img = enhanced_pil 
                    print("DEBUG: Face detected in DENOISED-ENHANCED mode")

            print(f"DEBUG: Face detected (Prob: {probs[0]:.2f})")
            box = boxes[0].tolist()
            prob = probs[0]

            if self.resnet is None: 
                print("DEBUG: ResNet model not loaded")
                return None
                
            face_tensor = self.mtcnn(img, return_prob=False)
            if face_tensor is None: 
                print("DEBUG: mtcnn crop failed")
                return None
            
            # Save cropped face for visual debug
            face_img = np.transpose(face_tensor.numpy(), (1, 2, 0))
            face_img = ((face_img + 1.0) / 2.0 * 255).astype(np.uint8)
            cv2.imwrite("debug_face.jpg", cv2.cvtColor(face_img, cv2.COLOR_RGB2BGR))
            
            face_tensor = face_tensor.unsqueeze(0).to(self.device)
            import torch
            with torch.no_grad():
                embedding = self.resnet(face_tensor).detach().cpu().numpy()
            if self.resnet is not None and self.embeddings is not None and self.labels is not None:
                sims = cosine_similarity(embedding, self.embeddings)[0]
                top_idx = np.argsort(sims)[-3:][::-1]
                print(f"DEBUG: Top-3 candidates: {[(self.labels[i], round(float(sims[i]), 3)) for i in top_idx]}")

            # Always use Cosine Similarity for best accuracy with reconstructed embeddings
            similarity = cosine_similarity(embedding, self.embeddings)
            best_index = np.argmax(similarity)
            score = float(similarity[0][best_index])
            roll_no = str(self.labels[best_index])
            print(f"DEBUG: Cosine Result - Roll: {roll_no}, Score: {score:.4f}")

            if score < 0.45:  # Lowered from 0.65 to handle noisy/dark ESP32-CAM stream
                # Persistent Unknown Tracking Logic
                unknown_label = "Unknown"
                
                if len(self.unknown_embeddings) > 0:
                    # Check if this face matches a previously seen unknown
                    u_sims = cosine_similarity(embedding, np.array(self.unknown_embeddings))[0]
                    u_best_idx = np.argmax(u_sims)
                    u_best_score = float(u_sims[u_best_idx])
                    
                    if u_best_score > 0.85: # High threshold for "same person"
                        unknown_label = self.unknown_labels[u_best_idx]
                        print(f"DEBUG: Persistent Unknown Match: {unknown_label} (Score: {u_best_score:.2f})")
                    else:
                        new_id = len(self.unknown_labels) + 1
                        unknown_label = f"Unknown{new_id}"
                        self.unknown_embeddings.append(embedding[0])
                        self.unknown_labels.append(unknown_label)
                        print(f"DEBUG: New Unknown Registered: {unknown_label}")
                else:
                    # First unknown of the session
                    unknown_label = "Unknown1"
                    self.unknown_embeddings.append(embedding[0])
                    self.unknown_labels.append(unknown_label)
                    print(f"DEBUG: First Unknown Registered: Unknown1")

                return {
                    "roll_no": "UNKNOWN", "name": unknown_label, "confidence": score,
                    "status": "Unknown", "face_prob": prob, "rgb_img": frame_rgb,
                    "box": box, "dob": None
                }

            name = "Unknown"
            dob = "Unknown"
            photo_path = None
            if self.students_df is not None:
                roll_no_clean = str(roll_no).strip()
                student = self.students_df[self.students_df["ROLL_NO"] == roll_no_clean]
                if len(student) > 0:
                     name = str(student["NAME"].values[0])
                     dob = str(student["DOB"].values[0]) if "DOB" in student.columns else "Unknown"
                     stu_dir = os.path.join("D:/dataset", roll_no_clean)
                     if os.path.exists(stu_dir):
                         imgs = [f for f in os.listdir(stu_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                         if imgs: photo_path = f"/api/student_images/{roll_no_clean}/{imgs[0]}" 

            return {
                "roll_no": roll_no, "name": name, "confidence": score, "status": "Authorized",
                "face_prob": prob, "rgb_img": frame_rgb, "box": box, "dob": dob, "photo_path": photo_path
            }

        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error in face recognition: {e}")
            return None

recognizer = FaceRecognizer()
