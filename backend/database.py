import os
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base

# Absolute path so it works regardless of working directory
_DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(_DB_DIR, exist_ok=True)
DATABASE_URL = f"sqlite:///{os.path.join(_DB_DIR, 'detections.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class DetectionRecord(Base):
    __tablename__ = "detections"

    id            = Column(Integer, primary_key=True, index=True)
    roll_no       = Column(String, index=True)
    name          = Column(String)
    confidence    = Column(Float)
    camera        = Column(String)
    timestamp     = Column(String)
    status        = Column(String)
    snapshot_path = Column(String, nullable=True)
    photo_path    = Column(String, nullable=True)   # student's official photo
    dob           = Column(String, nullable=True)


class PersonCardRecord(Base):
    __tablename__ = "person_cards"

    roll_no              = Column(String, primary_key=True, index=True)
    name                 = Column(String)
    latest_detection_time = Column(String)
    camera               = Column(String)
    status               = Column(String)
    photo_path           = Column(String, nullable=True)
    dob                  = Column(String, nullable=True)


def init_db():
    Base.metadata.create_all(bind=engine)


# Keys that belong in DetectionRecord  (box / id are NOT columns)
_DETECTION_COLUMNS = {
    "roll_no", "name", "confidence", "camera",
    "timestamp", "status", "snapshot_path", "photo_path", "dob"
}


def save_detection(detection_data: dict):
    db = SessionLocal()
    try:
        # Strip any extra keys (box, id, etc.) before writing to DB
        db_dict = {k: v for k, v in detection_data.items() if k in _DETECTION_COLUMNS}
        db_detection = DetectionRecord(**db_dict)
        db.add(db_detection)

        # Update or create person card
        card = db.query(PersonCardRecord).filter(
            PersonCardRecord.roll_no == detection_data["roll_no"]
        ).first()

        if card:
            card.latest_detection_time = detection_data["timestamp"]
            card.camera = detection_data["camera"]
            card.status = detection_data["status"]
            # Prefer actual student photo over snapshot
            if detection_data.get("photo_path"):
                card.photo_path = detection_data["photo_path"]
            elif detection_data.get("snapshot_path") and not card.photo_path:
                card.photo_path = detection_data["snapshot_path"]
            if detection_data.get("dob"):
                card.dob = detection_data["dob"]
        else:
            new_card = PersonCardRecord(
                roll_no=detection_data["roll_no"],
                name=detection_data["name"],
                latest_detection_time=detection_data["timestamp"],
                camera=detection_data["camera"],
                status=detection_data["status"],
                photo_path=detection_data.get("photo_path") or detection_data.get("snapshot_path"),
                dob=detection_data.get("dob"),
            )
            db.add(new_card)

        db.commit()
        db.refresh(db_detection)
        return db_detection
    finally:
        db.close()


def get_recent_detections(limit: int = 50):
    db = SessionLocal()
    try:
        return (
            db.query(DetectionRecord)
            .order_by(DetectionRecord.id.desc())
            .limit(limit)
            .all()
        )
    finally:
        db.close()


def get_person_cards():
    db = SessionLocal()
    try:
        return db.query(PersonCardRecord).all()
    finally:
        db.close()
