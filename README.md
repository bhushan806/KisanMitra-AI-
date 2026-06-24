# KisanMitra AI: Predict. Protect. Prosper. 🌾

KisanMitra AI is an advanced, end-to-end agricultural commodity price forecasting and advisory system built for Indian farmers. It leverages real-time market data, satellite imagery, and historical weather data to power a highly accurate Machine Learning ensemble, providing farmers with actionable insights to maximize their profits.

---

## 🚀 Features

*   **📈 Real-Time Price Forecasting:** 7-day to 30-day price predictions for major commodities (Onion, Potato, Tomato, Garlic, etc.) using a weighted ensemble of **XGBoost, SARIMA, and Neural Networks (MLP)**.
*   **🛰️ Crop Health Monitoring:** Integrates directly with **Google Earth Engine (Sentinel-2)** to extract live NDVI (Normalized Difference Vegetation Index) metrics to assess physical crop health in the Maharashtra region.
*   **🌦️ Climate Integration:** Pulls historical and real-time weather metrics from the **NASA POWER API** to factor temperature and rainfall into price volatility.
*   **⚠️ Volatility Alerts:** Automated alert engine that monitors market thresholds and pushes warnings when prices are expected to drop or spike significantly.
*   **🗣️ Multilingual Farmer Advisory:** Context-aware recommendations telling farmers exactly when to sell, hold, or harvest, complete with a **Hindi translation** toggle.

---

## 🏗️ Tech Stack

### Backend (Data & ML Pipeline)
*   **FastAPI:** High-performance Python backend API.
*   **MongoDB Atlas:** Cloud NoSQL database storing live prices, weather caches, and engineered ML features.
*   **Machine Learning:** `scikit-learn`, `xgboost`, `statsmodels` (SARIMA), trained via automated background jobs.
*   **Geospatial:** `earthengine-api` (Google Earth Engine) for NDVI extraction.

### Frontend (Dashboard UI)
*   **React + Vite:** Lightning-fast frontend tooling.
*   **Tailwind CSS:** Modern, responsive, and beautiful utility-first styling.
*   **Recharts:** Interactive, real-time data visualization charts.

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   MongoDB Atlas Account
*   Google Earth Engine Project (Registered for API access)

### 2. Clone the Repository
```bash
git clone https://github.com/bhushan806/KisanMitra-AI-.git
cd KisanMitra-AI-/kisanmitra-ai
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```
**Environment Variables (`backend/.env`):**
```env
MONGODB_URI=your_mongodb_connection_string
GEE_PROJECT_ID=your_google_cloud_project_id
```
**Start the Backend Server:**
```bash
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup
Open a new terminal window.
```bash
cd kisanmitra-ai/frontend
npm install
```
**Start the Frontend Server:**
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the dashboard!

---

## 🤖 Machine Learning Pipeline

The project includes an automated ML pipeline (`backend/scripts/train_all_models.py`) that handles the entire lifecycle:
1.  **Ingestion:** Fetches real market prices (or synthesizes them during API downtime).
2.  **Engineering:** Merges 30-day lag features, rolling means, NDVI values, and weather metrics.
3.  **Training:** Trains SARIMA (Time Series), XGBoost (Gradient Boosting), and LSTM/MLP (Neural Net) for 8 distinct crops.
4.  **Ensembling:** Dynamically weights the models (XGB: 50%, LSTM: 30%, SARIMA: 20%) to achieve highly accurate MAPE scores (e.g., ~1.17% error on Garlic).

---

## 📜 License
This project was developed for real users. All rights reserved.
