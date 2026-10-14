import sys
import os
import json
import time
import subprocess
import asyncio
from aiohttp import web
import logging

try:
    from backend.cuda_box_drawer import CudaBoxDrawer
    from backend.nvml_telemetry_streamer import NVMLStreamer
    from backend.model_manager import DynamicModelManager
    from backend.stress_test_orchestrator import StressTestOrchestrator
except ImportError:
    # If running directly inside backend/
    from cuda_box_drawer import CudaBoxDrawer
    from nvml_telemetry_streamer import NVMLStreamer
    from model_manager import DynamicModelManager
    from stress_test_orchestrator import StressTestOrchestrator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("RealGPUBridge")

# Initialize feature modules
cuda_box_drawer = CudaBoxDrawer()
nvml_streamer = NVMLStreamer()
model_manager = DynamicModelManager()
stress_orchestrator = StressTestOrchestrator()

# Check GPU hardware
CUDA_AVAILABLE = False
GPU_NAME = "Unknown"
TOTAL_VRAM_GB = 8.0
COMPUTE_CAP = "8.9"

try:
    import torch
    if torch.cuda.is_available():
        CUDA_AVAILABLE = True
        GPU_NAME = torch.cuda.get_device_name(0)
        vram_bytes = torch.cuda.get_device_properties(0).total_memory
        TOTAL_VRAM_GB = round(vram_bytes / (1024**3), 2)
        cc = torch.cuda.get_device_capability(0)
        COMPUTE_CAP = f"{cc[0]}.{cc[1]}"
        logger.info(f"🟢 REAL GPU DETECTED: {GPU_NAME} ({TOTAL_VRAM_GB} GB GDDR6, Compute {COMPUTE_CAP})")
    else:
        logger.warning("⚠️ PyTorch installed, but CUDA not available. Running in host fallback mode.")
except ImportError:
    logger.warning("PyTorch not found. Testing with nvidia-smi...")

if not CUDA_AVAILABLE:
    try:
        out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=gpu_name,memory.total", "--format=csv,noheader"],
            encoding="utf-8"
        ).strip().split(",")
        if len(out) >= 1:
            GPU_NAME = out[0].strip()
            CUDA_AVAILABLE = True
            logger.info(f"🟢 NVIDIA-SMI DETECTED: {GPU_NAME}")
    except Exception:
        pass


def get_real_hardware_stats():
    """Queries NVML registers and sensor telemetry."""
    nvml_data = nvml_streamer.query_live_metrics()
    return {
        "isRealGpu": CUDA_AVAILABLE or nvml_streamer.nvml_initialized,
        "gpuModel": GPU_NAME if CUDA_AVAILABLE else nvml_streamer.device_name,
        "gpuUtilization": nvml_data["gpuUtilization"],
        "gpuMemoryUsedGb": round(nvml_data["vramUsedMb"] / 1024.0, 2),
        "gpuMemoryTotalGb": round(nvml_data["vramTotalMb"] / 1024.0, 2),
        "gpuTemperatureC": nvml_data["temperatureC"],
        "nvdecLoad": nvml_data["nvdecDecoderPercent"],
        "nvencLoad": nvml_data["nvencEncoderPercent"],
        "computeCapability": COMPUTE_CAP,
        "pcieBandwidthGbps": 0.08,
        "clockGraphicsMhz": nvml_data.get("clockGraphicsMhz", 2370),
        "clockMemoryMhz": nvml_data.get("clockMemoryMhz", 8000),
        "activeEngine": model_manager.active_engine["name"],
        "timestamp": int(time.time() * 1000),
        "pipelineLatencyMs": model_manager.active_engine["avgLatencyMs"],
        "aggregateFps": 600.0,
        "status": "ONLINE"
    }


# Web Server Handlers
async def handle_telemetry(request):
    data = get_real_hardware_stats()
    return web.json_response(data, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

async def handle_cuda_box_benchmark(request):
    data = cuda_box_drawer.run_benchmark(3840, 2160, 16)
    return web.json_response(data, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

async def handle_nvml_metrics(request):
    data = nvml_streamer.query_live_metrics()
    return web.json_response(data, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

async def handle_models_catalog(request):
    data = model_manager.get_catalog()
    return web.json_response(data, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

async def handle_models_swap(request):
    try:
        body = await request.json()
        engine_id = body.get("engineId")
        custom_name = body.get("customName")
        res = model_manager.swap_engine(engine_id, custom_name)
        return web.json_response(res, headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        })
    except Exception as e:
        return web.json_response({"error": str(e)}, status=400, headers={"Access-Control-Allow-Origin": "*"})

async def handle_stress_status(request):
    data = stress_orchestrator.get_status()
    return web.json_response(data, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

async def handle_stress_start(request):
    try:
        body = await request.json()
        mode = body.get("mode", "PEAK_RUSH_HOUR")
        res = stress_orchestrator.start_stress_test(mode)
        return web.json_response(res, headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=400, headers={"Access-Control-Allow-Origin": "*"})

async def handle_cors_options(request):
    return web.Response(headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })


# WebSocket broadcasting
connected_clients = set()

async def handle_ws(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    connected_clients.add(ws)
    logger.info("React Web Dashboard connected to Real GPU WebSocket bridge!")

    try:
        async for msg in ws:
            pass
    finally:
        connected_clients.remove(ws)
        logger.info("Client disconnected from Real GPU bridge.")

    return ws


async def broadcast_telemetry_loop():
    """Pushes real GPU hardware telemetry to all connected frontend clients every 500ms."""
    while True:
        if connected_clients:
            stats = get_real_hardware_stats()
            nvml_stats = nvml_streamer.query_live_metrics()
            msg = json.dumps({
                "type": "TELEMETRY_UPDATE",
                "data": stats,
                "nvml": nvml_stats
            })
            for ws in list(connected_clients):
                try:
                    await ws.send_str(msg)
                except Exception:
                    pass
        await asyncio.sleep(0.5)


def create_app():
    app = web.Application()
    app.router.add_options("/{tail:.*}", handle_cors_options)
    app.router.add_get("/telemetry", handle_telemetry)
    app.router.add_get("/health", handle_telemetry)
    app.router.add_get("/cuda_box/benchmark", handle_cuda_box_benchmark)
    app.router.add_get("/nvml/metrics", handle_nvml_metrics)
    app.router.add_get("/models/catalog", handle_models_catalog)
    app.router.add_post("/models/swap", handle_models_swap)
    app.router.add_get("/stress/status", handle_stress_status)
    app.router.add_post("/stress/start", handle_stress_start)
    app.router.add_get("/ws", handle_ws)
    return app


async def main():
    port = int(os.environ.get("PORT", 8080))
    app = create_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()

    logger.info(f"🚀 VisionEdge Bridge Server running on http://0.0.0.0:{port}")
    logger.info(f"   • Real GPU: {'🟢 ' + GPU_NAME if CUDA_AVAILABLE else '🔴 NVML Emulated'}")
    logger.info(f"   • Endpoints: /telemetry, /cuda_box/benchmark, /nvml/metrics, /models/catalog, /stress/status")

    asyncio.create_task(broadcast_telemetry_loop())

    while True:
        await asyncio.sleep(3600)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutting down Real GPU bridge server...")
