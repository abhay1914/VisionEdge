from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes.streams import router as streams_router
from backend.app.webrtc.router import router as webrtc_router


app = FastAPI(
    title="VisionEdge API",
    description="Backend API for the VisionEdge real-time video processing system",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(streams_router)
app.include_router(webrtc_router)


@app.get("/")
async def root():
    return {
        "message": "VisionEdge API is running",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "VisionEdge Backend",
    }