import numpy as np
import pandas as pd
import os

def setup():
    data_dir = "d:/AIML Project/backend/data"
    models_dir = "d:/AIML Project/backend/models"
    
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(os.path.join(data_dir, "snapshots"), exist_ok=True)

    csv_path = os.path.join(data_dir, "students.csv")
    if not os.path.exists(csv_path):
        data = {
            "ROLL_NO": ["23EC001", "23EC002", "23EC003"],
            "NAME": ["ABINANDHAN S", "BHARANIDHARAN R", "ELANGOVAN T"],
            "DOB": ["2005-01-01", "2005-02-02", "2005-03-03"]
        }
        pd.DataFrame(data).to_csv(csv_path, index=False)
        print(f"Created {csv_path}")

    emb_path = os.path.join(models_dir, "face_embeddings.npy")
    lbl_path = os.path.join(models_dir, "labels.npy")

    if not os.path.exists(emb_path):
        # Create dummy embeddings (512-dim for FaceNet)
        dummy_embeddings = np.random.rand(3, 512).astype(np.float32)
        np.save(emb_path, dummy_embeddings)
        print(f"Created {emb_path}")

    if not os.path.exists(lbl_path):
        dummy_labels = np.array(["23EC001", "23EC002", "23EC003"])
        np.save(lbl_path, dummy_labels)
        print(f"Created {lbl_path}")

if __name__ == "__main__":
    setup()
