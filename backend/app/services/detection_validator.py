from typing import List, Dict, Any


def validate_detections(
    detections: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Validate YOLO detection results."""

    valid_detections = []

    for detection in detections:
        class_name = detection.get("class_name")
        confidence = detection.get("confidence")

        if not class_name:
            continue

        if not isinstance(confidence, (int, float)):
            continue

        if not 0 <= confidence <= 1:
            continue

        valid_detections.append(detection)

    return valid_detections
