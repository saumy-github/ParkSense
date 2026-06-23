from pathlib import Path

# src/config/settings.py is 2 levels deep from backend root
BASE_DIR = Path(__file__).resolve().parents[2]

PROCESSED_DIR = BASE_DIR / "data"

SUMMARY_PATH        = PROCESSED_DIR / "hotspots_summary.json"
DETAILS_PATH        = PROCESSED_DIR / "hotspots_details.json"
VISUAL_SUMMARY_PATH = PROCESSED_DIR / "hotspot_visual_summary.json"
FRAMES_DIR          = PROCESSED_DIR / "hotspot_frames"

API_PREFIX = "/api"
