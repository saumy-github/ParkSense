# Notebook 2 — DBSCAN Spatial Clustering & Hotspot Scoring

**File:** `2.ipynb`
**Inputs:** `parking_violations_clean.csv`, `parking_violations_exploded.csv`
**Outputs:** `parking_violations_with_clusters.csv`, `parking_violations_exploded_with_clusters.csv`, `cluster_summary_checkpoint.csv`, `hotspots_summary.json`, `hotspots_details.json`

---

## What this notebook does

Runs DBSCAN on all 298,445 violation coordinates to identify spatial hotspots across Bengaluru. Scores each cluster by congestion impact, detects morning/evening peak hours, and produces the JSON files consumed by the website backend.

---

## Key decisions

**Algorithm — DBSCAN over K-Means:** DBSCAN finds arbitrarily shaped clusters and explicitly labels outliers as noise (`cluster_id = -1`). K-Means would force every point into a cluster and requires specifying K upfront. For geographic hotspot detection, DBSCAN is the correct choice.

**Parameters:**
- `eps = 100m` — two violations are neighbours if within 100 metres of each other. Chosen from the elbow of a K-Distance graph (`k=50`, haversine metric).
- `min_samples = 50` — a location needs ≥50 violations to qualify as a hotspot. Filters out one-off incidents.
- Coordinates converted to radians before fitting (required by haversine metric).

**Impact scoring:** Each violation gets a `base_impact = vehicle_footprint_weight × violation_severity_weight`. Severity weights are hand-tuned (double parking / main road = 2.0; basic no parking = 1.0). Cluster scores are summed then log-normalized to 0–100 to prevent one massive cluster from flattening all others.

**Priority tiers (percentile rank of raw impact score):**
- CRITICAL ≥ 90th percentile
- HIGH ≥ 70th
- MEDIUM ≥ 40th
- LOW < 40th

**Peak hour detection:** Separately finds the busiest hour in the morning window (7–12) and evening window (16–21) per cluster, counted by unique vehicle numbers. Falls back to 9 AM / 6 PM if a window is empty.

**Junction name fallback:** Clusters with "No Junction" as their representative name fall back to the most common street address formatted as `"<Street Name> Area"`.

---

## Outputs

| File | Type | Description |
|---|---|---|
| `parking_violations_with_clusters.csv` | CSV | Clean base data + `cluster_id` |
| `parking_violations_exploded_with_clusters.csv` | CSV | Exploded data + `cluster_id` |
| `cluster_summary_checkpoint.csv` | CSV | One row per cluster, all scoring fields |
| `hotspots_summary.json` | JSON | Flat list for map markers (id, name, lat/lon, score, priority, peak hours) |
| `hotspots_details.json` | JSON | Per-cluster detail (vehicle composition, top violations, temporal distribution, operational metrics) |

---

## Notable findings

- Top hotspot: **KR Market Junction** — congestion impact score 100.0 (CRITICAL).
- Second: **Safina Plaza Junction** — score 88.5 (CRITICAL).
- Most CRITICAL clusters show a clear bimodal pattern: morning peak 8–10 AM, evening peak 4–6 PM.
- Midnight outliers in processing duration confirmed as camera batch-dump artifacts (not real delays).
