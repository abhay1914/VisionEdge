from fastapi import FastAPI

app = FastAPI(
    title="VisionEdge API",
    description="Backend API for the VisionEdge real-time video processing system",
    version="0.1.0",
)


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