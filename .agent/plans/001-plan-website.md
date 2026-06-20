# Plan: Website Integration of ML Outputs

*Date: 2026-06-20*
*Status: [ ] draft -> [ ] in progress -> [ ] done*

---

## Objective

Replace every hardcoded/fake value in the website with real data produced by the ML pipeline.
Every number a judge sees must trace back to a notebook output.

---

## What is currently fake

| View | Fake element | What it should be |
|---|---|---|
| InfrastructureMap | "EV Status: 08 FREE" | vehicle_composition from hotspots_details |
| InfrastructureMap | "Sensor Health" (3 hardcoded rows) | top_violations (top 3 violation types) |
| InfrastructureMap | "98.4% ONLINE" | SCITA sync rate from operational_metrics |
| InfrastructureMap | "Junction Peak Load" bar chart (8 fixed bars) | risk_by_day_hour for current day (notebook 2.5) |
| InfrastructureMap | primary_peak_time_string field (does not exist) | morning_peak_string + evening_peak_string |
| ControlCenter | "Active Violations: 18" | count of CRITICAL clusters from hotspots_summary |
| ControlCenter | "AI Detection Health: 98.4%" | avg detection_confidence_avg from hotspot_visual_summary |
| ControlCenter | "Peak Congestion Hour: 09:20 AM" | most common morning_peak_hour across top clusters |
| ControlCenter | "Est. Congestion Loss: $14.2k/hr" | derived from total raw_impact_score (notebook 2) |
| ControlCenter | Live Violation Feed (3 hardcoded events) | top_violations from top 3 CRITICAL clusters |
| PerformanceReports | All 4 metric cards (ARPU, CLV, Churn, Efficiency) | real ML stats (total incidents, avg impact score, SCITA sync, cluster count) |
| PerformanceReports | "Revenue Growth Forecast" line chart | monthly violation trend (Nov 2023 - Apr 2024) |
| PerformanceReports | "Peak Hour Efficiency" bar chart (12 fake bars) | citywide hourly distribution (notebook 3 EDA output) |
| PerformanceReports | "Infrastructure ROI: 75%" | replaced with real cluster coverage stats |

---

## Data available from ML pipeline

| Field | Source file | Notebook |
|---|---|---|
| congestion_impact_score, priority_level, morning_peak_string, evening_peak_string, total_incident_count | hotspots_summary.json | notebook-2 |
| vehicle_composition, top_violations, temporal_distribution, operational_metrics | hotspots_details.json | notebook-2 |
| risk_by_day_hour | hotspots_details.json | notebook-2.5 |
| total_vehicles_detected, vehicle_breakdown, detection_confidence_avg | hotspot_visual_summary.json | notebook-4 |

---

## Phase 1 -- Backend: add aggregate stats endpoint

**Why first:** Frontend needs one new API endpoint that returns city-level summary stats.
The existing endpoints only return per-cluster data.

### ML change needed
- Compute and save `ML/data/processed/city_stats.json` in a new cell at the end of notebook-2 or in a separate script
- Fields:
  - total_clusters: 300
  - critical_count: count of CRITICAL clusters
  - high_count, medium_count, low_count
  - total_incidents: sum of all total_incident_count
  - avg_congestion_score: mean congestion_impact_score
  - most_common_morning_peak_hour: mode of morning_peak_hour across all clusters
  - monthly_trend: { "2023-11": 44117, "2023-12": 63554, ... } (from notebook-3 EDA)
  - hourly_distribution: { "0": count, "1": count, ..., "23": count } (from notebook-3 EDA)

### Backend change
- Add `city_stats.py` service in `src/services/`
- Add `stats.py` route in `src/routes/`
- Endpoint: `GET /api/stats` returns city_stats.json

---

## Phase 2 -- InfrastructureMap.tsx: wire real hotspot details

**File:** `website/frontend/src/views/InfrastructureMap.tsx`

### Changes
1. Fix TypeScript interface -- rename `primary_peak_time_string` to `morning_peak_string` + `evening_peak_string`
2. On hotspot select: fetch `GET /api/hotspots/{cluster_id}` to load details
3. Store details in `useState<HotspotDetails | null>`

### Replace fake sections with real data

| Section | Replace with |
|---|---|
| "EV Status: 08 FREE" | vehicle_composition -- top 3 vehicle types as % bars |
| Sensor health rows (3 hardcoded) | top_violations -- violation type, count, percentage |
| "98.4% ONLINE" badge | operational_metrics.scita_sync_rate as % |
| Junction Peak Load bar chart | risk_by_day_hour for today's day-of-week, 8am-8pm window |
| Stats grid: second card | morning_peak_string + evening_peak_string side by side |

---

## Phase 3 -- ControlCenter.tsx: wire real summary stats

**File:** `website/frontend/src/views/ControlCenter.tsx`

### Changes
1. Fetch `GET /api/stats` on mount
2. Replace 4 hardcoded stat cards:

| Card | Fake value | Real value |
|---|---|---|
| Active Violations | "18 Ongoing Hotspots" | city_stats.critical_count + city_stats.high_count |
| AI Detection Health | "98.4%" | avg detection_confidence_avg from hotspot_visual_summary (notebook-4) |
| Peak Congestion Hour | "09:20 AM" | city_stats.most_common_morning_peak_hour |
| Est. Congestion Loss | "$14.2k/hr" | remove entirely -- replace with "Total Incidents: {total_incidents} logged" |

3. Live Violation Feed: replace 3 hardcoded EVENTS with top 3 CRITICAL clusters from hotspots_summary
   - Use cluster_name, morning_peak_string, total_incident_count, priority_level
   - Remove external image URLs -- use a colored priority badge instead

---

## Phase 4 -- PerformanceReports.tsx: wire real aggregate data

**File:** `website/frontend/src/views/PerformanceReports.tsx`

### Replace 4 metric cards

| Card | Fake label | Real label | Real value |
|---|---|---|---|
| ARPU $42.80 | Total Hotspots Detected | city_stats.total_clusters |
| CLV $1,240 | Total Violations Logged | city_stats.total_incidents |
| Churn Rate 2.1% | CRITICAL Hotspots | city_stats.critical_count |
| Efficiency 34.2% | Avg Impact Score | city_stats.avg_congestion_score |

### Replace "Revenue Growth Forecast" line chart
- Rename to "Monthly Violation Trend (Nov 2023 - Apr 2024)"
- Data: city_stats.monthly_trend
- X-axis: month labels, Y-axis: violation count

### Replace "Peak Hour Efficiency" bar chart
- Rename to "Citywide Hourly Violation Distribution"
- Data: city_stats.hourly_distribution (24 bars, 0-23)
- Highlight peak hour bar in primary color

### Replace "Infrastructure ROI" gauge
- Rename to "Cluster Coverage"
- Show: CRITICAL % of total clusters (donut gauge)
- Progress bars: replace "Fleet Utilization" / "Sensor Health" with:
  - "Parking Violations Clustered" (clustered / total incidents %)
  - "SCITA Sync Rate" (avg operational_metrics.scita_sync_rate)

---

## Phase 5 -- MapComponent.tsx: fix interface mismatch

**File:** `website/frontend/src/components/MapComponent.tsx`

### Changes
- Fix TypeScript interface: rename `primary_peak_time_string` -> `morning_peak_string` + `evening_peak_string`
- Update popup HTML to show both morning and evening peak times
- Remove hardcoded emoji characters (use text or material icons instead)

---

## Implementation order

1. Phase 1 (ML + backend stats endpoint) -- everything else depends on this
2. Phase 5 (fix interface mismatch) -- quick, unblocks Phase 2
3. Phase 2 (InfrastructureMap) -- highest judge visibility
4. Phase 3 (ControlCenter) -- second highest
5. Phase 4 (PerformanceReports) -- last, least critical for demo

---

## What success looks like
- [ ] Every number on the website traces back to a notebook output or hotspots JSON
- [ ] No hardcoded metric values remain in any view
- [ ] InfrastructureMap sidebar shows real vehicle breakdown and violation types on click
- [ ] InfrastructureMap bar chart shows real risk_by_day_hour data for selected cluster
- [ ] ControlCenter stat cards show real cluster counts and peak hour
- [ ] PerformanceReports shows real monthly trend and hourly distribution charts
- [ ] Backend test: `GET /api/stats` returns valid JSON
- [ ] All 4 API endpoints respond correctly: /api/hotspots, /api/hotspots/{id}, /api/stats, /api/hotspots/{id}/visual-summary
