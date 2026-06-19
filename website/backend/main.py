import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Parking-Induced Congestion API",
    description="Proxy backend for Flipkart Gridlock Hackathon prototype",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve paths dynamically relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DOCS_DIR = BASE_DIR / "docs"
SUMMARY_PATH = DOCS_DIR / "hotspots_summary.json"
DETAILS_PATH = DOCS_DIR / "hotspots_details.json"

@app.get("/api/hotspots")
def get_hotspots_summary():
    """Serve the hotspots summary array from the docs directory."""
    if not SUMMARY_PATH.exists():
        raise HTTPException(status_code=404, detail="hotspots_summary.json not found in docs directory.")
    
    try:
        with open(SUMMARY_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read hotspots summary: {str(e)}")

@app.get("/api/hotspots/{cluster_id}")
def get_hotspot_details(cluster_id: str):
    """Dynamically return the dictionary sub-object based on the ID passed."""
    if not DETAILS_PATH.exists():
        raise HTTPException(status_code=404, detail="hotspots_details.json not found in docs directory.")
    
    try:
        with open(DETAILS_PATH, "r", encoding="utf-8") as f:
            details_dict = json.load(f)
            
        if cluster_id in details_dict:
            return details_dict[cluster_id]
        
        # If integer index is passed but stored as string, or vice versa
        # Check string or try converting
        raise HTTPException(status_code=404, detail=f"Details for hotspot cluster {cluster_id} not found.")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read hotspot details: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
