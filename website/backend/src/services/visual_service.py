import json
from fastapi import HTTPException
from fastapi.responses import FileResponse
from src.config.settings import VISUAL_SUMMARY_PATH, FRAMES_DIR


def get_visual_summary(cluster_id: str) -> dict:
    if not VISUAL_SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="hotspot_visual_summary.json not found.")
    try:
        with open(VISUAL_SUMMARY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read visual summary: {e}")

    if cluster_id not in data:
        raise HTTPException(status_code=404, detail=f"No visual evidence for cluster {cluster_id}.")
    return data[cluster_id]


def get_annotated_frame(cluster_id: str) -> FileResponse:
    frame_path = FRAMES_DIR / f"{cluster_id}_annotated.jpg"
    if not frame_path.exists():
        raise HTTPException(status_code=404, detail=f"Annotated frame for cluster {cluster_id} not found.")
    return FileResponse(path=str(frame_path), media_type="image/jpeg")
