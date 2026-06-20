import json
from fastapi import HTTPException
from src.config.settings import SUMMARY_PATH, DETAILS_PATH  # both now point to ML/data/processed/


def get_all_hotspots() -> list:
    if not SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="hotspots_summary.json not found.")
    try:
        with open(SUMMARY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read hotspots summary: {e}")


def get_hotspot_by_id(cluster_id: str) -> dict:
    if not DETAILS_PATH.exists():
        raise HTTPException(status_code=404, detail="hotspots_details.json not found.")
    try:
        with open(DETAILS_PATH, "r", encoding="utf-8") as f:
            details = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read hotspot details: {e}")

    if cluster_id not in details:
        raise HTTPException(status_code=404, detail=f"Cluster {cluster_id} not found.")
    return details[cluster_id]
