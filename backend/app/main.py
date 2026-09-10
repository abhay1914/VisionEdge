from fastapi import FastAPI

from backend.app.api.routes.streams import router as streams_router

app = FastAPI(
    title="VisionEdge API",
    description="Backend API for the VisionEdge real-time video processing system",
    version="0.1.0",
)

app.include_router(streams_router)

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