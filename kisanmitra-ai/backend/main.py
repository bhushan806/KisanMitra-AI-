from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
import sys
from dotenv import load_dotenv

from routes.predict import router as predict_router
from routes.alerts import router as alerts_router
from routes.crops import router as crops_router
from routes.dashboard import router as dashboard_router

load_dotenv()

app = FastAPI(title="KisanMitra AI Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(crops_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "KisanMitra AI Backend"}


@app.post("/api/retrain")
async def retrain(commodity: str = "all"):
    """Trigger model retraining for a specific commodity or all."""
    try:
        script_path = os.path.join(
            os.path.dirname(__file__), "scripts", "train_all_models.py"
        )
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=os.path.dirname(__file__),
        )
        if result.returncode == 0:
            return {
                "status": "success",
                "message": f"Retraining completed for: {commodity}",
                "output": (
                    result.stdout[-500:] if len(result.stdout) > 500 else result.stdout
                ),
            }
        else:
            return {
                "status": "error",
                "message": "Retraining failed",
                "stderr": (
                    result.stderr[-500:] if len(result.stderr) > 500 else result.stderr
                ),
            }
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Retraining timed out (5 min limit)"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
