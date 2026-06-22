# ParkSense: Data Audit & Integration Report

This document reviews the data displayed across all views and components in the **ParkSense** application, audits whether the telemetry is real or mocked, and outlines RTO/sensor integrations required for production.

---

## 1. Audited Component Telemetry

### Dashboard (Control Center)
* **Active Violations Count:**
  * *Status:* Partially Real. Reads base active hotspots from `/api/hotspots` and adds active Citizen Reports logged in the current session.
  * *Backend Integration:* Needs an endpoint (`/api/violations/active/count`) returning dynamic, real-time database counts.
* **AI Detection Health (98.4%):**
  * *Status:* Mocked. Represents aggregate camera offline statuses and model accuracies.
  * *Backend Integration:* Needs integration with edge device heartbeat APIs (`/api/system/health`).
* **Peak Congestion Hour ("09:20 AM"):**
  * *Status:* Mocked. Derived from static peak minutes of day in hotspot data.
  * *Backend Integration:* Needs time-series aggregator endpoint (`/api/analytics/peaks`) querying traffic speed loops.
* **Estimated Congestion Loss ($14.2k/hr):**
  * *Status:* Mocked. Combines speed drops and EWR math in React.
  * *Backend Integration:* Needs cost-index calculator integrating vehicular value of time (VoT) formulas.
* **Live Map Canvas:**
  * *Status:* **REAL**. Coordinates, priority levels, jurisdictions, and names are loaded from `/api/hotspots` (FastAPI backend).
* **Live Violation Feed:**
  * *Status:* Mocked (React state). Prepend logs submitted in the Citizen Reporting view.
  * *Backend Integration:* Needs WebSockets or SSE (Server-Sent Events) stream subscription from `/api/violations/stream`.

### Map View
* **Leaflet Coordinates & Markers:**
  * *Status:* **REAL**. Fetches active cluster centers dynamically from `/api/hotspots`.
* **Detail Drill-Down Sidebar:**
  * *Status:* **REAL** for name, jurisdiction, and priority levels. Mocked for sensor status list (CAM-12, Radar) and peak load chart.
  * *Backend Integration:* Needs details endpoint `/api/hotspots/{id}/sensors` and `/api/hotspots/{id}/trends` serving historical hourly traffic speed charts.

### Active Alerts Queue
* **Enforcement Status Bar:**
  * *Status:* Mocked. Core status (Operational), CPU Load (42%), Active Patrols (14/20).
  * *Backend Integration:* Integrate municipal patrol vehicle GPS telemetry from `/api/patrols/status`.
* **Alert Feed cards:**
  * *Status:* Mocked (base queue) + Citizen Reports (React state).
  * *Backend Integration:* Needs alert manager database endpoint (`/api/alerts/pending`) to load unresolved camera triggers.
* **Dispatch Unit & Issue Challan Actions:**
  * *Status:* Simulated. Alerts user and resolves locally.
  * *Backend Integration:* Needs POST integration:
    * `/api/dispatch` (Params: `alert_id`, `patrol_unit_id`) triggering patrol notification.
    * `/api/challan/issue` (Params: `alert_id`, `fine_amount`) pushing offense data to the National Informatics Centre (NIC) e-challan RTO gateway.

### Citizen Reporter
* **GPS Geolocation Lookup:**
  * *Status:* **REAL**. Uses HTML5 Geolocation API (`navigator.geolocation.getCurrentPosition`).
* **Manual Address Input:**
  * *Status:* **REAL**. Takes typed text.
* **AI OCR Plate Scan & SPI Calculation:**
  * *Status:* Mocked. Simulates scanning license plates and calculates EWR/SPI indexes.
  * *Backend Integration:* Needs POST `/api/violations/analyze` (Multipart Image upload) returning OCR vehicle plate (e.g. via EasyOCR) and GIS polygon encroachment.
* **Submission Ticket (QR Receipt):**
  * *Status:* Simulated.
  * *Backend Integration:* Needs POST `/api/violations/submit` writing the citizen infraction report to the SQL database.

### Congestion Analytics
* **Ecosystem KPIs (Avg Delay, Speed Reduction %, Challans):**
  * *Status:* Mocked. Aligned with ML observations in `ML/notebooks/notebook-3/`.
  * *Backend Integration:* Needs aggregations endpoint `/api/analytics/summary` serving calculated values.
* **Monthly Trends, Vehicle Class, Hourly Peaks Charts:**
  * *Status:* Mocked. SVGs rendering static points mapped from ML notebook experiments.
  * *Backend Integration:* Query endpoint `/api/analytics/historical` supplying JSON data arrays for chart libraries (e.g. Chart.js, Recharts).

---

## 2. Developer Integration Checklist

To transition the proxy backend into full production, implement the following endpoints and database models:

### Database Schemas (SQLAlchemy / PostgreSQL)
- [ ] **Violations Table:** `id`, `timestamp`, `license_plate`, `location_lat`, `location_lng`, `address`, `violation_type`, `severity`, `status` (pending, dispatched, challaned, dismissed), `evidence_image_url`.
- [ ] **PatrolUnits Table:** `unit_id`, `vehicle_number`, `status` (idle, responding, active), `current_lat`, `current_lng`, `assigned_alert_id`.
- [ ] **Hotspots Table:** `cluster_id`, `cluster_name`, `center_lat`, `center_lng`, `police_jurisdiction`, `representative_junction`, `congestion_score`.

### FastAPI Backend Endpoints (`website/backend/main.py`)
- [ ] **POST `/api/auth/login`:** Authenticates badge ID and session tokens.
- [ ] **GET `/api/violations/active`:** Returns real-time pending violations count.
- [ ] **POST `/api/violations/submit`:** Ingests citizen incident reporting payloads.
- [ ] **POST `/api/violations/analyze`:** Connects to the computer vision model to run license plate ANPR OCR.
- [ ] **POST `/api/dispatch`:** Assigns an idle patrol unit to coordinates.
- [ ] **POST `/api/challan/issue`:** Pushes evidence metadata to RTO gateway APIs.
- [ ] **GET `/api/analytics/historical`:** Serves hourly congestion peaks and monthly trend datasets.
