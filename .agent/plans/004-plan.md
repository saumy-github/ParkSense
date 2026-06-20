# Plan: Visual Evidence Layer — Vehicle Detection on Hotspot Frames using VehicleNet-Y26s

---

## Type
- [x] ML / data analysis
- [ ] Feature engineering
- [ ] Website — backend
- [ ] Website — frontend / UX
- [x] Integration (ML model → website)

---

## Objective
Run a pre-trained Bengaluru CCTV vehicle detector (VehicleNet-Y26s, trained on IISc UVH-26 dataset) on static frames from our top CRITICAL hotspot junctions and export annotated images + vehicle count summaries that feed into the website as visual proof.

---

## Why this matters for the demo
Every other team will show a heatmap of recorded violations. We show **what the camera actually sees** — annotated bounding boxes, vehicle type breakdown, illegal parking count — at the exact junctions our model flagged as CRITICAL. The judge sees a cluster on the map, clicks it, and sees a real camera frame with boxes drawn around the parked vehicles. That's the wow moment.

It also directly uses the **same CCTV camera network** (Bengaluru Safe-City) that ASTraM operates — closing the loop between their data and our output.

---

## Hypothesis / expected outcome
Frames from our top 5 CRITICAL junctions (KR Market, Safina Plaza, Modi Bridge, Kadubeesanahalli Underpass, 80 Feet Ring Road) will show high vehicle density and detectable stationary vehicles. VehicleNet-Y26s will detect 10+ vehicles per frame with >70% confidence, giving us a visible, annotated "ground truth" that corroborates our DBSCAN cluster scores.

---

## Approach

### Step 1 — Environment setup
- Install `ultralytics` (YOLO26 compatible) and `huggingface_hub`
- Pull `Perception365/VehicleNet-Y26s` weights from HuggingFace
- Verify model loads and runs inference on a test image

### Step 2 — Source hotspot frames
- Take our top 10 CRITICAL clusters from `hotspots_summary.json`
- For each: find a representative static frame using the **Mapillary API** (free, no billing account needed — only requires a free Mapillary account + access token)
  - Call `GET https://graph.mapillary.com/images` with `bbox` centred on the cluster's `center_latitude` / `center_longitude` (±0.001° box), filter by `is_pano=false`, sort by `captured_at` descending to get the most recent image
  - Download the image via the `thumb_2048_url` field (2048px, free tier)
  - **Fallback:** if Mapillary returns no image within bbox, widen to ±0.003° and retry once. If still empty, flag cluster as `"frame_source": "unavailable"` and skip
- Save raw frames to `ML/data/raw/hotspot_frames/<cluster_id>_raw.jpg`
- Required: `MAPILLARY_ACCESS_TOKEN` environment variable (free token from mapillary.com/developer)

### Step 3 — Run VehicleNet-Y26s inference
- For each frame: run inference at confidence threshold 0.4
- Save annotated frame (bounding boxes + class labels) to `ML/data/processed/hotspot_frames/<cluster_id>_annotated.jpg`
- Extract per-frame summary:
  - total vehicles detected
  - count per vehicle class (2-wheeler, car, auto, bus, truck, etc.)
  - estimated stationary vs moving (heuristic: vehicles touching/overlapping road edge or parked in no-parking zone pixels)

### Step 4 — Build detection summary JSON
- Merge detection results into existing `hotspots_details.json` as a new `visual_evidence` field:
```json
"visual_evidence": {
  "frame_source": "Google Street View / manual",
  "annotated_image_path": "hotspot_frames/2_annotated.jpg",
  "total_vehicles_detected": 23,
  "vehicle_breakdown": {"2-wheeler": 11, "car": 7, "auto": 3, "bus": 2},
  "detection_confidence_avg": 0.76
}
```
- Also export standalone `hotspot_visual_summary.json` for the backend API

### Step 5 — Backend API endpoint
- Add `/hotspots/{cluster_id}/frame` endpoint in `website/backend/main.py`
  - Returns the annotated image as a file response
- Add `/hotspots/{cluster_id}/visual-summary` endpoint
  - Returns the `visual_evidence` JSON block

### Step 6 — Frontend integration
- In the hotspot sidebar/popup: add a "Visual Evidence" tab
- Shows the annotated frame image + vehicle breakdown bar chart
- Label: "Camera-detected vehicles at this junction (VehicleNet-Y26s · IISc UVH-26)"

---

## Inputs
- `ML/data/processed/hotspots_summary.json` — top cluster lat/lon and names
- `ML/data/processed/hotspots_details.json` — to merge visual_evidence into
- `Perception365/VehicleNet-Y26s` — HuggingFace model weights (downloaded at runtime)
- Static frames sourced from Google Street View or manual capture

---

## ML details
- **Algorithm:** YOLO26s fine-tuned on UVH-26-MV (26,646 Bengaluru CCTV frames, 1.8M bounding boxes, 14 Indian vehicle classes)
- **CV strategy:** N/A — inference only, no training
- **Params file:** N/A (using pretrained weights as-is)
- **Confidence threshold:** 0.40 (low enough to catch partially occluded parked vehicles)
- **Expected output:** annotated JPEG + per-class vehicle count dict per hotspot frame

---

## Website details
- **Pages/components affected:** Hotspot sidebar popup (new "Visual Evidence" tab)
- **API endpoints needed:**
  - `GET /hotspots/{cluster_id}/frame` → returns annotated JPEG
  - `GET /hotspots/{cluster_id}/visual-summary` → returns detection JSON
- **What judges will see:** Click any CRITICAL hotspot → see a real camera frame with AI-drawn bounding boxes around vehicles, plus a breakdown of vehicle types detected

---

## What success looks like
- [ ] VehicleNet-Y26s loads and runs inference without error
- [ ] At least 5 of our top 10 CRITICAL clusters have a usable annotated frame
- [ ] Each annotated frame shows ≥5 detected vehicles with visible bounding boxes
- [ ] `visual_evidence` field merged into `hotspots_details.json` for all processed clusters
- [ ] Backend serves annotated frame as image via API
- [ ] Frontend shows the annotated image in the hotspot popup

---

## Risks / unknowns
- **Mapillary coverage is crowdsourced** — some junctions may have sparse or outdated imagery. Widening the bbox fallback (±0.003°) handles most gaps; a cluster with no coverage at all is skipped and flagged.
- **VehicleNet-Y26s requires YOLO26 / Ultralytics compatibility** — may need specific ultralytics version. Pin to working version.
- **Model weights size** — Y26s is a small variant, should be fast enough to run on CPU in the notebook. Full inference on 10 frames should take < 2 minutes.
- **No live feed** — this is a static demo. Frame should be labelled clearly as "representative frame" to avoid misrepresenting as real-time.

---

## Outputs
- `ML/notebooks/notebook-4/4.ipynb` — detection pipeline notebook
- `ML/data/raw/hotspot_frames/<cluster_id>_raw.jpg` — sourced frames (10 total)
- `ML/data/processed/hotspot_frames/<cluster_id>_annotated.jpg` — annotated output frames
- `ML/data/processed/hotspot_visual_summary.json` — detection results per cluster
- `ML/data/processed/hotspots_details.json` — updated with `visual_evidence` field
- `website/backend/main.py` — 2 new endpoints
- `website/frontend/src/` — updated hotspot popup with Visual Evidence tab

---

*Date:* 2026-06-20
*Status:* [x] draft → [ ] in progress → [ ] done
