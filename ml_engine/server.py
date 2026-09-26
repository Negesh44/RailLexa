"""
RailLexa Chennai Division — FastAPI ML Backend
Exposes strict Data Gatekeeper verification, Pretrained Hugging Face Transformer inference,
and RTX GPU telemetry endpoints.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn

from .gatekeeper import DataGatekeeper
from .model_loader import PretrainedRailwayModel
from .optimizer import RailwayBlockOptimizer
from .ntes_scraper import SelfHostedNTESScraper

app = FastAPI(
    title="RailLexa ML Pretrained Optimization Engine",
    description="Southern Railway Chennai Division Pretrained Transformer & OR-Tools Optimization Microservice",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

optimizer = RailwayBlockOptimizer()

@app.get("/api/health")
def health_check():
    return {"status": "ONLINE", "service": "RailLexa ML Pretrained Engine"}

@app.get("/api/gpu-status")
def get_gpu_status():
    model_mgr = PretrainedRailwayModel.get_instance()
    return model_mgr.get_status_report()

@app.get("/api/ntes/live-status/{train_number}")
@app.get("/api/train/{train_number}/live")
def get_live_train_status(train_number: str, day: int = 0):
    """
    Direct NTES Live Train Running Status Scraper (powered by apiss-main architecture)
    with smart 45-second caching and instant fallback.
    """
    return SelfHostedNTESScraper.get_live_train_status(train_number, start_day=day)

@app.get("/api/train/{train_number}/schedule")
def get_train_schedule(train_number: str):
    """
    Train schedule / itinerary endpoint compatible with apiss-main
    """
    data = SelfHostedNTESScraper.get_live_train_status(train_number, start_day=0)
    return {
        "success": True,
        "train_number": data.get("train_number"),
        "train_name": data.get("train_name"),
        "source": data.get("source_station"),
        "destination": data.get("destination_station"),
        "stations": data.get("stations", [])
    }

@app.post("/api/validate-gates")
def validate_data_gates(payload: Dict[str, Any]):
    """
    Evaluates prerequisite data gates (Data 1: Corridors, Data 2: Timetables, Data 3: Work Orders)
    without running inference.
    """
    gate_result = DataGatekeeper.evaluate_all_gates(payload)
    return gate_result

@app.post("/api/optimize")
def optimize_blocks(payload: Dict[str, Any]):
    """
    Strict pipeline:
    1. Evaluates all prerequisite data gates.
    2. If any gate fails, HALTS immediately and returns detailed gate failure report.
    3. If all gates pass, proceeds to Hugging Face GPU transformer inference & OR-Tools scheduling.
    """
    gate_result = DataGatekeeper.evaluate_all_gates(payload)
    
    if not gate_result["all_passed"]:
        return {
            "success": False,
            "halted_at_gatekeeper": True,
            "failed_gate": gate_result["failed_gate"],
            "error_message": gate_result["message"],
            "gate_reports": gate_result["gate_reports"]
        }

    optimization_result = optimizer.optimize(payload)
    optimization_result["gatekeeper"] = gate_result
    return optimization_result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
