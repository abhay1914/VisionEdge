import time

import cv2
import torch
from ultralytics import YOLO


VIDEO_PATH = "data/videos/video.mp4"
MODEL_PATH = "yolo11n.pt"


def main():
    print("Loading YOLO model...")

    model = YOLO(MODEL_PATH)

    device = 0

    print("GPU:", torch.cuda.get_device_name(0))

    # Read a limited number of frames
    print("Reading video frames...")

    cap = cv2.VideoCapture(VIDEO_PATH)

    frames = []

    for _ in range(100):
        success, frame = cap.read()

        if not success:
            break

        frames.append(frame)

    cap.release()

    print(f"Frames loaded: {len(frames)}")

    if not frames:
        print("ERROR: No video frames loaded.")
        return

    # Warm-up using one image
    print("Warming up GPU...")

    model.predict(
        source=frames[0],
        device=device,
        imgsz=640,
        conf=0.25,
        verbose=False,
    )

    torch.cuda.synchronize()

    print("Warm-up complete.")

    # Reset GPU memory statistics
    torch.cuda.reset_peak_memory_stats()

    print("Starting benchmark...")

    start_time = time.perf_counter()

    processed_frames = 0

    for frame in frames:
        model.predict(
            source=frame,
            device=device,
            imgsz=640,
            conf=0.25,
            verbose=False,
        )

        processed_frames += 1

    torch.cuda.synchronize()

    elapsed = time.perf_counter() - start_time

    fps = (
        processed_frames / elapsed
        if elapsed > 0
        else 0.0
    )

    latency_ms = (
        elapsed / processed_frames * 1000
        if processed_frames > 0
        else 0.0
    )

    memory_mb = (
        torch.cuda.max_memory_allocated()
        / 1024**2
    )

    print()
    print("========== PyTorch GPU Benchmark ==========")
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"Frames: {processed_frames}")
    print(f"Elapsed time: {elapsed:.2f} seconds")
    print(f"Processing FPS: {fps:.2f}")
    print(f"Average frame latency: {latency_ms:.2f} ms")
    print(f"Peak GPU memory: {memory_mb:.2f} MB")
    print("============================================")


if __name__ == "__main__":
    main()