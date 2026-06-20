# Notebook 1 — Data Cleaning & Feature Engineering

**File:** `1.ipynb`
**Input:** `ML/data/raw/raw.csv` (298,450 records)
**Outputs:** `parking_violations_clean.csv`, `parking_violations_exploded.csv`

---

## What this notebook does

Transforms the raw Bengaluru parking violation dataset into two clean, analysis-ready CSVs. Covers schema cleanup, datetime parsing, temporal feature extraction, and a one-violation-per-row exploded table.

---

## Key decisions

**Dropped columns:** `description`, `closed_datetime`, `action_taken_timestamp` — all 100% null, no information value.

**Timezone:** Both datetime columns converted from UTC → IST (`Asia/Kolkata`). All time features are local.

**Processing duration flagged as unreliable:** The `modified_datetime − created_datetime` delta ranges from −4318 to 161,183 minutes. Negative values are data entry artifacts (cameras batch-dumping at midnight). Column renamed to `record_lifecycle_minutes_RAW_UNRELIABLE`. A p95-capped version (`record_lifecycle_minutes_capped_p95`) is provided for safe use.

**Violation type parsing:** `violation_type` and `offence_code` are stored as JSON strings (e.g., `["NO PARKING"]`). Parsed into Python lists; `has_parking_violation` and `is_pure_parking` flags derived.

**Vehicle footprint weight:** Custom lookup table mapping each vehicle type to a road-space weight (SCOOTER = 1.0, HGV = 5.5). Used downstream for congestion impact scoring.

**Exploded table:** One incident can contain multiple violations. `build_exploded()` creates one row per violation per incident — 348,449 rows from 298,445 incidents. Required for per-violation-type analysis.

---

## Outputs

| File | Rows | Description |
|---|---|---|
| `parking_violations_clean.csv` | 298,445 | One row per incident, all features cleaned |
| `parking_violations_exploded.csv` | 348,449 | One row per violation type per incident |

---

## Notable findings

- Only 5 records dropped due to unparseable datetimes (data quality is high).
- 75–90% of ticketed vehicles are unique — low repeat-offender rate in the raw data.
- Midnight processing spikes are a camera batch-dump artifact, not real enforcement delays.
