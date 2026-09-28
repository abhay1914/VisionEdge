YOLO_CLASS_NAMES = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}


def get_class_name(class_id: int) -> str:
    return YOLO_CLASS_NAMES.get(
        class_id,
        f"class_{class_id}",
    )