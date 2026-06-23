# ParkSense: AI-Driven Congestion & Parking Intelligence
*Built for the Flipkart Gridlock Hackathon 2.0*

## Overview
ParkSense is an intelligent surveillance and traffic management portal designed to detect illegal parking hotspots and quantify their impact on traffic congestion in real-time. By leveraging geospatial clustering, machine learning, and an interactive command center, ParkSense enables municipal traffic authorities to deploy targeted enforcement and restore road capacities.

## Key Features
- **Hotspot Detection & Risk Scoring**: Clusters parking violations into actionable hotspots with a calculated "Congestion Impact Score".
- **Traffic Officer Dashboard**: A secure command center providing situational awareness, spatial mapping, and performance analytics.
- **Citizen Reporting Flow**: An anonymized portal for citizens to quickly flag double-parking and sidewalk blockages.
- **Predictive Analytics**: Utilizes CatBoost forecasting to identify high-risk temporal windows (e.g., peak congestion hours) and vehicle composition.

## System Architecture
ParkSense is built with a decoupled architecture for maximum scalability and performance:
- **Frontend (Vercel)**: React + Vite + Tailwind CSS. Features dynamic routing, interactive geospatial mapping, and rich data visualization.
- **Backend (Render)**: FastAPI (Python). Provides a lightweight, lightning-fast RESTful API serving pre-computed ML inferences.
- **ML Pipeline**: Python, Pandas, Scikit-learn, CatBoost. Processes massive datasets (>100MB CSVs) to generate optimized JSON summaries for the backend.

## Live Demo
- **Frontend / Operator Portal**: [https://parksense-pi.vercel.app](https://parksense-pi.vercel.app)
- **Backend API**: [https://parksense-tksc.onrender.com](https://parksense-tksc.onrender.com)

## Running Locally

### 1. Backend (FastAPI)
```bash
cd website/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`.

### 2. Frontend (React/Vite)
```bash
cd website/frontend
npm install
```

Start the development server:
```bash
npm run dev
```
The portal will be available at `http://localhost:5173`.

## Deployment Architecture
- **Frontend**: Deployed seamlessly on Vercel. `VITE_API_URL` is injected at build time to connect to the production API.
- **Backend**: Hosted on Render as a Web Service. The backend is fully self-contained, serving ML-processed `.json` data directly from the `data/` directory to avoid pushing massive raw CSV datasets to the repository.

---
*Developed for Flipkart Gridlock Hackathon 2.0*