from typing import List, Dict, Any


def filter_detections(
    detections: List[Dict[str, Any]],
    allowed_classes: List[str]
) -> List[Dict[str, Any]]:
    """
    Filter object detection results based on allowed object classes.
    """

    allowed_classes = {name.lower() for name in allowed_classes}

    filtered_detections = [
        detection
        for detection in detections
        if detection.get("class_name", "").lower() in allowed_classes
    ]

    return filtered_detections
