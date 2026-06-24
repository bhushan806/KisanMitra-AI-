<div align="center">
  <h1>🌿 KisanMitra AI</h1>
  <p><strong>Predict. Protect. Prosper.</strong></p>
  <p>A Smart Agricultural Commodity Price Forecasting Platform for BIOTHON 2026.</p>
  <p>
    <img src="https://img.shields.io/badge/Status-MVP-green.svg" alt="Status" />
    <img src="https://img.shields.io/badge/Hackathon-BIOTHON_2026-blue.svg" alt="Hackathon" />
  </p>
</div>

## Problem Statement
Farmers and Farmer Producer Organizations (FPOs) face immense difficulty in planning their sales due to extreme volatility in agricultural commodity prices (specifically Onion, Potato, Tomato). Government departments also need reliable foresight to manage supply chains and control inflation.

## Solution Overview
**KisanMitra AI** uses advanced machine learning models (SARIMA, XGBoost, LSTM, and an ensemble) to forecast prices for the next 7, 15, and 30 days based on historical Agmarknet data and Open-Meteo weather features. 

The platform provides a modern, intuitive dashboard with:
- Predictive insights and price confidence intervals
- Market alerts for abnormal price surges
- Crop health metrics leveraging weather-based proxy indicators
- Actionable farmer advisories

## Tech Stack
| Component | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Recharts |
| Backend | Python 3.11, FastAPI, Motor (async MongoDB) |
| Machine Learning | XGBoost, TensorFlow (LSTM), statsmodels (SARIMA) |
| Data Integration | httpx, apscheduler, Agmarknet API, Open-Meteo API |

## Folder Structure
```
kisanmitra-ai/
├── backend/          # FastAPI Python backend & ML model scripts
├── frontend/         # React + Vite + Tailwind application
└── ml_notebooks/     # Jupyter Notebooks for data exploration & training
```

## Setup Instructions

### Backend Setup
1. `cd backend`
2. Create and activate a virtual environment: `python -m venv venv` and `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and configure `MONGODB_URI` and `DATA_GOV_API_KEY`.
5. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` (ensure `VITE_API_BASE_URL` is set).
4. Run the development server: `npm run dev`

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/predict` | Get price forecasts for a commodity |
| `GET` | `/api/alerts` | Get current price anomaly alerts |
| `GET` | `/api/commodities` | Get summary of all tracked commodities |
| `GET` | `/api/dashboard/summary` | Overall dashboard metrics |
| `GET` | `/api/crop-health` | Region-specific crop health proxies |
| `GET` | `/api/farmer-advisory` | Actionable recommendations |

## Team
Built by **DATA2DNA**  
* Jayesh Vispute
* Bhushan Patil
