# Plan: Website UI — Phase 2 Redesign (Dashboard + Map)

> Status: [ ] draft → [ ] in progress → [ ] done
> Date: 2026-06-22

---

## Type
- [x] Website — backend
- [x] Website — frontend / UX

---

## Objective
Rebuild the Enforcement Panel (`/dashboard`) into a time-aware congestion view and clean up the Live Map (`/map`) into a focused, full-screen intelligence tool — removing placeholder/unfinished features and replacing them with ML-backed, demo-ready UI.

## Why this matters for the demo
Judges need to *feel* that the map is live and intelligent. Right now the dashboard is static — 300 pins with no context. After this plan:
- A traffic officer can ask "which zones are hot RIGHT NOW (today, this time of day)?" and the map answers instantly.
- The Live Map shows the full 300-cluster picture with one-click drill-down into ML risk forecasts.
- Both pages look production-grade, not prototype-grade.

---

## Data feasibility (confirmed)

`hotspots_details.json` → `priority_prediction` field:
- Coverage: **300/300 clusters**, all 7 days, all 5 time buckets
- Schema per cell: `{ predicted_risk: "HIGH" | "LOW", confidence: 0.0–1.0 }`
- Example — Monday early_morning: 185 HIGH, 115 LOW across the city
- This is the sole data source for day+bucket filtering. No new ML work needed.

Time bucket mapping (as stored in the JSON):
| Key | Display label | Hours (approx) |
|---|---|---|
| `early_morning` | Early AM | 05:00 – 09:00 |
| `late_morning` | Late AM | 09:00 – 12:00 |
| `afternoon` | Afternoon | 12:00 – 17:00 |
| `evening` | Evening | 17:00 – 21:00 |
| `night` | Night | 21:00 – 05:00 |

---

## Phase 1 — Enforcement Panel (`/dashboard` → `ControlCenter.tsx`)

### What this page becomes
A **"Right Now" enforcement command view** — the officer opens this page and immediately sees which zones are dangerous *for today and the current time of day*, with controls to browse other days/buckets.

---

### Step 1.1 — Remove citizen-reported toggle from dashboard map
- Delete the `mapMode` state and the `'ai' | 'citizen'` toggle buttons from `ControlCenter.tsx`
- Delete the `CITIZEN_HOTSPOTS` mock constant
- Map always shows AI-detected hotspots (`hotspots` prop)
- **Why:** Citizen reporting is not built yet. A broken tab is worse than no tab.

---

### Step 1.2 — Replace stat cards with live clock + time-context header
**Also delete** the existing broken `fetch('/api/hotspots/details')` useEffect from `ControlCenter.tsx` — it uses a non-existent `hourly_congestion` field and violates the single-source rule. `hotspotDetails` will come from the App.tsx prop added in Step 6.

Replace the two current stat cards (Active Violations, Peak Congestion Hour) with a new 3-card header row:

**Card A — Live Clock**
- Large digital clock: `HH:MM:SS AM/PM` updating every second via `setInterval`
- Sub-line: full date `Monday, 23 June 2026`
- Sub-line: current time bucket label (e.g. `LATE AM — 09:00–12:00`) derived from current hour

**Card B — Active Hotspots (context-aware)**
- Shows count of HIGH risk clusters for the currently selected day + bucket
- Label: `{N} HIGH RISK ZONES` with sub-text `{day} · {bucket label}`
- Derived entirely from `priority_prediction` in the already-fetched details

**Card C — City-wide Congestion Level**
- Show the % of clusters that are HIGH for the selected day+bucket: e.g. `61.7% of zones active`
- Color: red if >50%, orange if 30–50%, green if <30%

**Single data source rule:** All pages get their data from `App.tsx`. No page fetches from the API on its own. `App.tsx` is the only file that calls the backend.

**App.tsx data layer (two fetches, both on mount):**
- `fetch('/api/hotspots')` → `hotspots: HotspotSummary[]` — already exists, passed to `ControlCenter`, `InfrastructureMap`, `LandingPage`
- `fetch('/api/hotspots/details')` → `hotspotDetails: Record<string, HotspotDetail>` — **add this** — passed to `ControlCenter` (for day/bucket filtering)

**`PerformanceReports` change:** Currently fetches `/api/hotspots` internally. Remove that fetch. Accept `hotspots: HotspotSummary[]` as a prop from App.tsx (same `filteredHotspots` already passed to the map pages). Remove `useState<HotspotSummary[]>` and `loading` state — data arrives pre-loaded.

**Result — every page's data origin:**
| Page | Data | Source |
|---|---|---|
| `/dashboard` | `hotspots` + `hotspotDetails` | App.tsx props |
| `/map` | `hotspots` | App.tsx props |
| `/analytics` | `hotspots` | App.tsx props (remove internal fetch) |
| `/` (landing) | `hotspots` | App.tsx props |

---

### Step 1.3 — Add day + time bucket selectors

Below the stat cards, add a compact control bar:

```
[Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun]        [Early AM] [Late AM] [Afternoon] [Evening] [Night]
```

- Day defaults to current day of week (derived from `new Date().getDay()`)
- Bucket defaults to current time bucket (derived from `new Date().getHours()`)
- Both are local state in `ControlCenter`: `selectedDay` (string) and `selectedBucket` (string key)
- Selecting a day or bucket immediately re-colors the map markers

State shape:
```ts
const [selectedDay, setSelectedDay] = useState<string>('Monday'); // auto-init from date
const [selectedBucket, setSelectedBucket] = useState<string>('early_morning'); // auto-init from hour
```

---

### Step 1.4 — Time-aware map coloring

When day+bucket are selected, map markers reflect the ML prediction for that cell:

| Condition | Marker color | Pulse? |
|---|---|---|
| `predicted_risk === 'HIGH'` AND confidence ≥ 0.80 | Red `#ef4444` | Yes |
| `predicted_risk === 'HIGH'` AND confidence < 0.80 | Orange `#f97316` | No |
| `predicted_risk === 'LOW'` | Gray/dim `#4b5563` | No |

To implement:
- Pass `hotspotDetails` and `selectedDay + selectedBucket` as props to `MapComponent`
- Inside `MapComponent`, compute a `Map<cluster_id, RiskCell>` for the selected combination
- Use this map to override the pin color instead of the static `priority_level` from summary

This means `MapComponent` needs a new optional prop:
```ts
riskOverride?: Map<number, { predicted_risk: string; confidence: number }>;
```

When `riskOverride` is provided, use it for color. When absent (e.g. on `/map` page), fall back to `priority_level` as today.

---

### Step 1.5 — Map layer controls (both `/dashboard` and `/map`)

This panel serves as **both the toggle control and the map legend** — a colored dot on each row makes the separate legend redundant.

**Panel content:**
```
LAYERS
[✓]  ●  Critical       31 zones    (red    #ef4444)
[✓]  ●  High           60 zones    (orange #f97316)
[✓]  ●  Medium         90 zones    (yellow #eab308)
[ ]  ●  Low           119 zones    (gray   #4b5563)
[✓]  🔵  Police Stations            (blue   #3b82f6)
```

**Behaviour:**
- Checkboxes are stored as `visibleLayers: Set<string>` state — values: `'CRITICAL'`, `'HIGH'`, `'MEDIUM'`, `'LOW'`, `'POLICE'`
- When a layer is unchecked, its markers are skipped during the render pass (not added to `markersGroupRef`)
- Low priority is unchecked by default — 119 LOW zones clutter the map, officers care about HIGH/CRITICAL
- Zone counts are derived from the already-loaded `hotspots` summary array on the frontend — no API call needed
- `visibleLayers` state lives in the parent page (`ControlCenter` / `InfrastructureMap`) and is passed as a prop to `MapComponent`

**Placement:**
- `/dashboard` — floating panel **inside** the map card, bottom-left corner, above the map border
- `/map` — floating panel bottom-left, **replacing** the current Occupancy/Sensors radio buttons (Step 2.1 removes those)

**Shared implementation:**
- `MapComponent` receives `visibleLayers: Set<string>` as a new prop
- The panel UI (checkboxes + dots) is rendered by the **parent** (`ControlCenter` / `InfrastructureMap`), not inside `MapComponent` itself — keeps the map component clean and the state in the right place

**Layer mapping in time-aware mode** (when `riskOverride` is active on `/dashboard`):
| Checkbox | Filters markers where... |
|---|---|
| CRITICAL | `predicted_risk === 'HIGH'` AND `confidence ≥ 0.80` |
| HIGH | `predicted_risk === 'HIGH'` AND `confidence < 0.80` |
| MEDIUM | unused in time-aware mode — always pass-through |
| LOW | `predicted_risk === 'LOW'` |
| POLICE | police station markers |

Zone counts next to each label update to reflect the current day+bucket selection (not the static `priority_level` counts).

---

### Step 1.6 — Remove "Deploy Unit" button from Sidebar (if present)
- The `Sidebar.tsx` currently has no deploy button (was removed). Confirm — nothing to do.

---

## Phase 0 — MapComponent shared cleanup (`MapComponent.tsx`)

> These changes apply to the map on BOTH `/dashboard` and `/map`. Do these first — they are the smallest, most visible fixes and affect every page that uses the map.

---

### Step 0.1 — Popup content cleanup

**Problem:** The current popup on pin-click shows redundant and noisy information:
```
BTP082 - KR Market Junction Cluster Hub   ← "Cluster Hub" is ugly, from the data field cluster_name
📍 Junction: BTP082 - KR Market Junction  ← duplicate of the name above
👮 Police Station: Upparpet
CRITICAL Priority  |  Impact: 100
```

**Fix:** Use `representative_junction` (already the clean name) instead of `cluster_name`. Remove the Junction line entirely since the name already is the junction.

```
BTP082 - KR Market Junction               ← spot.representative_junction
👮 Police Station: Upparpet               ← keep
CRITICAL Priority  |  Impact: 100         ← keep
```

**Data note:** `"Cluster Hub"` is stored in `cluster_name` in the source JSON — it was added during the ML clustering step and is not meaningful to judges. `representative_junction` is the correct display name.

---

### Step 0.2 — Police station marker blinks when its hotspot is selected

**Behaviour:** When a user clicks a hotspot pin, the police station badge that covers that hotspot's jurisdiction should start pulsing/blinking to visually connect the two.

**Implementation:**
- Add `psMarkersRef = useRef<Map<string, LeafletMarker>>(new Map())` to track PS markers by station name
- When creating PS markers, store each in `psMarkersRef.current.set(stationName, marker)`
- Add a `useEffect` watching `selectedId`:
  1. Reset all PS markers to the normal blue icon
  2. Find `hotspots.find(h => h.cluster_id === selectedId).police_station_jurisdiction`
  3. Look up that station in `psMarkersRef` and update its icon to a blinking variant
- Blinking icon: same PS marker HTML but with a `marker-pulse` ring added (the `.marker-pulse` CSS class already exists in `index.css` and does the expanding ring animation)
- Normal PS color: `#3b82f6` (blue). Blinking PS color: `#00f0ff` (cyan primary) to match the selected hotspot highlight

---

### Step 0.3 — ~~Map Legend~~ DROPPED

~~Add a standalone Map Legend panel.~~

**Decision:** A standalone legend is wasted space — it just labels things without doing anything. The Layer Controls panel (Step 1.5) already needs a colored dot per checkbox to identify each layer, so it *is* the legend. No separate panel needed.

---

## Phase 2 — Live Map (`/map` → `InfrastructureMap.tsx`)

### What this page becomes
A **full-screen intelligence map** — all 300 hotspots visible, click any pin to see the simplified popup (junction name + PS + priority). No side panel. Clean.

---

### Step 2.1 — Replace Occupancy/Sensors radio buttons with Layer Controls
- Delete `selectedLayer` state and the existing floating bottom-left radio group
- Delete any logic that references `selectedLayer`
- The Layer Controls panel (Step 1.5) slots into the same bottom-left position — so the space is reused, not left empty
- **Why:** Occupancy/Sensors does nothing; no layer data exists for it. Looks broken to judges. The layer controls panel is the correct replacement.

---

### Step 2.2 — Remove citizen-reported toggle from /map
- Same as Step 1.1: delete `mapMode` state, `CITIZEN_HOTSPOTS` constant, and the top-left toggle button
- Map always shows all 300 AI-detected hotspots

---

### Step 2.3 — Remove Cluster Intelligence Panel entirely

The floating right-side panel (Selected Facility / AI Risk Forecast grid) is removed from `/map` completely.

- Delete all panel JSX from `InfrastructureMap.tsx`
- Delete `hotspotDetails`, `loadingDetails`, `hoveredCell` state
- Delete the `useEffect` that fetches `/api/hotspots/{cluster_id}` on selection
- Delete `activeHotspotId` and `setActiveHotspotId` props from `InfrastructureMapProps` — the map no longer needs a selected state
- Also delete: `RiskCell`, `PriorityPrediction`, `HotspotDetails` interfaces (lines 17–34) — only used by the panel
- Also delete: `DAYS`, `DAY_LABELS`, `BUCKETS` constants (lines 36–44) — only used by the panel grid
- Also delete: `activeHotspot` computed variable (line 75) — uses `CITIZEN_HOTSPOTS` and `mapMode`, goes away with the panel
- **Also update `App.tsx` `/map` route** (lines 261–267): stop passing `activeHotspotId={activeHotspotId}` and `setActiveHotspotId={setActiveHotspotId}` to `<InfrastructureMap>`. Without this, TypeScript will throw on the removed props.
- The map click handler (`onSelectHotspot`) is removed from MapComponent on this page; pins no longer need to be "selectable" here
- `/map` becomes a clean full-screen map: pins, layer controls, and the simplified popup on click (Step 0.1) — nothing else

---

## Phase 3 — Analytics Page (`/analytics` → `PerformanceReports.tsx`) Makeover

---

### Audit summary

| Element | Status | Decision |
|---|---|---|
| Total Violations 278k | Real — from API | Keep |
| Avg Speed Reduction 53.4% | **Completely fake** | Remove |
| Critical Hotspots 31 | Real — from API | Keep |
| Tier 2 Model Accuracy 65.5% | **Remove** — accuracy alone doesn't impress judges | Remove |
| Monthly bar chart | **Broken** — bars invisible (CSS % height fails in flex context) | Fix |
| Violation Breakdown 68%/20%/12% | Real values, hardcoded from dataset | Keep |
| Hourly Distribution chart | **Broken** — same CSS bug as monthly | Fix |
| Top 10 Hotspots list | Real — from API | Keep |
| Anomaly stats (531 spikes, 8.65σ) | Real — from ML output, hardcoded | Keep |
| Export PDF / Export CSV | Works | Keep |

---

### Step 3.1 — Hero metrics row: fix 2 cards, remove 2

**Before (4 cards):** Total Violations · Avg Speed Reduction · Critical Hotspots · Tier 2 Accuracy

**After (3 cards):**

| Card | Value | Source |
|---|---|---|
| Total Violations Logged | `278k` | API — `sum(total_incident_count)` |
| Critical Hotspots | `31` in red + `+ 60 HIGH priority zones` | API — filter by `priority_level` |
| Police Jurisdictions | `53` + `"Bengaluru city-wide coverage"` | API — `new Set(police_station_jurisdiction).size` |

- Remove: "Avg Speed Reduction 53.4%" — fabricated, damages credibility if a judge probes it
- Remove: "Tier 2 Model Accuracy 65.5%" — a raw accuracy number without context means nothing to non-ML judges; the anomaly section already signals ML depth

---

### Step 3.2 — Fix broken bar charts (CSS bug)

Both the **Monthly Violations** and **Hourly Distribution** charts use `style={{ height: \`${pct}%\` }}` on a flex child — percentage height doesn't resolve correctly in this context, so bars render at 0px.

**Fix:** Replace percentage height with computed pixel height:
```
// Container is h-56 = 224px
style={{ height: `${(d.value / maxValue) * 224}px` }}
```
Apply the same fix to both charts. No logic change — just the height unit.

---

### Step 3.3 — Add Day-of-Week risk bar chart

New chart placed next to (or below) the hourly distribution. 7 bars, Mon–Sun.

**Data — computed from `risk_by_day_hour` aggregated across all 300 clusters (already verified):**
| Day | Avg Risk Score |
|---|---|
| Sunday | 24.1 — peak |
| Thursday | 23.1 |
| Wednesday | 23.0 |
| Tuesday | 22.6 |
| Saturday | 22.3 |
| Friday | 21.3 |
| Monday | 20.1 — lowest |

**Source:** Hardcoded from pre-computed values (same pattern as MONTHLY_DATA and HOURLY_DATA — avoids loading the full 2.6MB details file on this page).

Sunday peak and Monday trough is a real, interesting, explainable insight — commercial/market activity peaks on weekends.

---

### Step 3.4 — Add Vehicle Composition chart

New panel placed alongside the Violation Breakdown donut. Horizontal bar chart, top 6 vehicle types.

**Data — aggregated from `vehicle_composition` across all 300 clusters:**
| Vehicle | Share |
|---|---|
| CAR | 34.3% |
| SCOOTER | 28.0% |
| MOTOR CYCLE | 14.1% |
| PASSENGER AUTO | 8.5% |
| MAXI-CAB | 3.5% |
| LGV | 3.0% |

**Source:** Hardcoded (pre-computed). These are averages across all clusters — no live fetch needed.

Story for judges: cars + scooters = 62% of all illegal parking. Two-wheelers dominate in numbers but cars dominate by road space consumed.

---

### Step 3.5 — Police Station Rankings table (new, full-width)

New full-width section above the Anomaly Detection block. This is the highest-impact addition — directly actionable for traffic police judges.

**Data — computed client-side from the `hotspots` prop (single-source rule — no API call):**

| Rank | Police Station | Total Incidents | CRITICAL zones | HIGH zones |
|---|---|---|---|---|
| 1 | Upparpet | 61,217 | 1 | 0 |
| 2 | Shivajinagar | 28,625 | 1 | 2 |
| 3 | Malleshwaram | 20,979 | 2 | 1 |
| 4 | HAL Old Airport | 20,590 | 4 | 1 |
| 5 | Rajajinagar | 17,437 | 1 | 3 |
| ... | ... | ... | ... | ... |

**Implementation:**
- Computed client-side by grouping the already-loaded `hotspots` array by `police_station_jurisdiction`
- No new API call, no new backend work
- Each row has a horizontal progress bar showing incidents relative to Upparpet (max)
- CRITICAL count shown in red, HIGH in orange

**Why this matters:** A Bengaluru Traffic Police judge seeing "Upparpet: 61,217 incidents" will immediately recognise KR Market — one of the city's worst congestion points. This grounds the demo in reality they know.

---

### Step 3.6 — Fix anomaly label

Change `"Cluster 62 · Jan 24"` → `"Dr Rajkumar Puniya Bhoomi Rd · Jan 24"` — use the actual junction name so it reads as a real location, not a meaningless cluster ID.

---

### Step 3.7 — Update Export CSV

Currently exports only the top 10 hotspots. Change to export all 300, sorted by `congestion_impact_score` desc. A judge who downloads this and sees 300 real Bengaluru locations is far more impressed than seeing 10.

---

## Phase 4 — Backend (already complete)

**All three endpoints are in place** — confirmed by `git diff`:
- `GET /api/hotspots` → summary list from `hotspots_summary.json`
- `GET /api/hotspots/details` → full details dict from `hotspots_details.json` ← **added in current uncommitted batch**
- `GET /api/hotspots/{id}` → single cluster entry

No further backend work is needed.

---

## Current state — what the uncommitted diff already covers

Before starting implementation, note what has already been changed (not yet committed):

| File | Already changed |
|---|---|
| `backend/routes/hotspots.py` | `/api/hotspots/details` endpoint added |
| `backend/services/hotspot_service.py` | `get_all_hotspot_details()` added |
| `MapComponent.tsx` | `psMarkersRef` added; marker colors updated (red/orange/yellow); PS markers added; pulse limited to CRITICAL only |
| `ControlCenter.tsx` | `EVENTS` array + "Live Violation Feed" panel removed; `peakHourString` state + `/api/hotspots/details` fetch added (uses wrong field `hourly_congestion` — bug, scheduled to be replaced by Phase 1 clock cards); map expanded to full 12 cols |
| `InfrastructureMap.tsx` | `RiskCell`/`PriorityPrediction`/`HotspotDetails` interfaces added; `DAYS`/`DAY_LABELS`/`BUCKETS` constants added; `hotspotDetails`/`loadingDetails`/`hoveredCell` states added; per-cluster fetch useEffect added; full AI Risk Forecast Grid panel added — **all of this will be deleted by Step 2.3** |
| `PerformanceReports.tsx` | `HotspotSummary` interface added; `fetch('/api/hotspots')` added; `MONTHLY_DATA`/`HOURLY_DATA` hardcoded arrays added; real Top 10 list from API; stat cards partially updated; anomaly section added |

**PerformanceReports fetch — will be removed:** `PerformanceReports` currently has its own `fetch('/api/hotspots')` call. This violates the single-source rule. It will be replaced by receiving `hotspots` as a prop from App.tsx (same as every other page). The `loading` state and `HotspotSummary` interface inside PerformanceReports are also deleted — App.tsx already handles loading and the type is defined there.

---

## Execution order (recommended)

1. **Phase 0, Step 0.1** — Popup cleanup in MapComponent (10 min — instant visible win)
2. **Phase 0, Step 0.2** — PS marker blink on selection (20 min)
3. **Phase 1, Step 1.1** — Remove citizen toggle from dashboard (5 min)
4. **Phase 2, Step 2.2** — Remove citizen toggle from /map (5 min)
5. **Phase 2, Step 2.1** — Remove Occupancy/Sensors, prep slot for layer controls (5 min)
6. **App.tsx** — Add `hotspotDetails` fetch + state; pass `hotspots` to `PerformanceReports`; pass `hotspotDetails` to `ControlCenter` (15 min)
7. **Phase 1, Step 1.2** — Live clock + time-context cards (20 min)
8. **Phase 1, Step 1.3** — Day + bucket selectors (20 min)
9. **Phase 1, Step 1.4** — Time-aware map coloring via `riskOverride` prop in MapComponent (30 min)
10. **Phase 1, Step 1.5** — Layer controls panel on both `/dashboard` + `/map` (25 min)
11. **Phase 2, Step 2.3** — Remove Cluster Intelligence Panel from /map (10 min)
12. **Phase 3, Step 3.1** — Hero metrics: remove fake cards, add Jurisdictions card (10 min)
13. **Phase 3, Step 3.2** — Fix broken bar chart CSS on both charts (10 min)
14. **Phase 3, Step 3.3** — Day-of-week risk chart (15 min)
15. **Phase 3, Step 3.4** — Vehicle composition chart (15 min)
16. **Phase 3, Step 3.5** — Police Station Rankings table (25 min)
17. **Phase 3, Step 3.6 + 3.7** — Fix anomaly label + CSV export (10 min)

**Total estimate: ~3.5 hours of focused implementation**

---

## What success looks like
- [ ] `/dashboard` map color changes when you switch day or time bucket
- [ ] Clock shows live time, date, and current bucket label
- [ ] No citizen-reported UI anywhere (dashboard or map)
- [ ] No occupancy/sensors toggle on /map
- [ ] Clicking a pin on /map shows the simplified popup only (no Cluster Intelligence Panel)
- [ ] Layer control checkboxes actually hide/show pin groups on dashboard map
- [ ] Demo runs start-to-finish in under 2 minutes with no broken UI elements
- [ ] `/analytics` bar charts render correctly (not blank)
- [ ] No fake stats (Speed Reduction, Model Accuracy removed)
- [ ] Police Station Rankings table shows real PS names and incident counts
- [ ] Day-of-week chart shows Sunday as peak
- [ ] Vehicle composition chart shows CAR + Scooter dominance
- [ ] CSV export includes all 300 hotspots

---

## Files changed

| File | Change |
|---|---|
| `website/frontend/src/App.tsx` | Add `hotspotDetails` fetch + state, pass as prop |
| `website/frontend/src/views/ControlCenter.tsx` | Full redesign: remove citizen toggle, add clock, day/bucket selectors, time-aware map |
| `website/frontend/src/views/InfrastructureMap.tsx` | Remove occupancy/sensors, citizen toggle, and Cluster Intelligence Panel entirely — clean full-screen map only |
| `website/frontend/src/components/MapComponent.tsx` | Popup cleanup (use `representative_junction`, remove Junction line); PS blink on selection; Map Legend panel; `riskOverride` prop; `visibleLayers` prop |
| `website/frontend/src/views/PerformanceReports.tsx` | Accept `hotspots` prop from App.tsx; remove internal fetch + state; remove fake cards; fix bar chart CSS; add day-of-week chart, vehicle composition chart, PS rankings table; fix anomaly label; update CSV export |
| `website/backend/src/routes/hotspots.py` | Already done (uncommitted) — `/api/hotspots/details` endpoint |
| `website/backend/src/services/hotspot_service.py` | Already done (uncommitted) — `get_all_hotspot_details()` |
