try:
    import torch
    import facenet_pytorch
    import cv2
    import fastapi
    print("SUCCESS: Essential libraries are available.")
except ImportError as e:
    print(f"MISSING: {e}")
