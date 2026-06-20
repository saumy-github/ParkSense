from pathlib import Path

# src/config/settings.py is 4 levels deep from project root
BASE_DIR = Path(__file__).resolve().parents[4]

PROCESSED_DIR = BASE_DIR / "ML" / "data" / "processed"

SUMMARY_PATH        = PROCESSED_DIR / "hotspots_summary.json"
DETAILS_PATH        = PROCESSED_DIR / "hotspots_details.json"
VISUAL_SUMMARY_PATH = PROCESSED_DIR / "hotspot_visual_summary.json"
FRAMES_DIR          = PROCESSED_DIR / "hotspot_frames"

API_PREFIX = "/api"
