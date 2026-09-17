from ultralytics import YOLO


MODEL_PATH = "yolo11n.pt"
IMAGE_SIZE = 640


def main() -> None:
    print(f"Loading model: {MODEL_PATH}")

    model = YOLO(MODEL_PATH)

    print("Exporting YOLO model to ONNX...")

    model.export(
        format="onnx",
        imgsz=IMAGE_SIZE,
    )

    print("ONNX export completed successfully.")


if __name__ == "__main__":
    main()