import torch
import torchvision
from torchvision import transforms
from PIL import Image
import io
import numpy as np
import colorsys

detection_model = torchvision.models.detection.fasterrcnn_resnet50_fpn(pretrained=True)
detection_model.eval()


def get_image_mood(image_bytes):
    # unchanged logic, now returns dict as expected by FastAPI code
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    np_img = np.array(image)
    avg_rgb = np_img.mean(axis=(0, 1))
    r, g, b = avg_rgb / 255
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if s < 0.2 and v > 0.75:
        return {"mood": "serenity"}
    elif 0.5 <= h <= 0.7:
        if v < 0.5:
            return {"mood": "sad"}
        else:
            return {"mood": "calm"}
    elif 0.12 < h < 0.18 and v > 0.2:
        return {"mood": "joy"}
    return {"mood": "neutral"}


def detect_objects(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    transform = transforms.ToTensor()
    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = detection_model(image_tensor)[0]

    threshold = 0.5  # confidence threshold
    high_conf = outputs['scores'] > threshold
    boxes = outputs['boxes'][high_conf]
    labels = outputs['labels'][high_conf]
    scores = outputs['scores'][high_conf]
    COCO_LABELS = {
        1: 'person', 2: 'bicycle', 3: 'car', 4: 'motorcycle', 5: 'airplane',
        6: 'bus', 7: 'train', 8: 'truck', 9: 'boat', 10: 'traffic light',
        11: 'fire hydrant', 12: 'stop sign', 13: 'parking meter', 14: 'bench',
        15: 'bird', 16: 'cat', 17: 'dog', 18: 'horse', 19: 'sheep',
        20: 'cow', 21: 'elephant', 22: 'bear', 23: 'zebra', 24: 'giraffe',
        25: 'backpack', 26: 'umbrella', 27: 'handbag', 28: 'tie', 29: 'suitcase',
        30: 'frisbee', 31: 'skis', 32: 'snowboard', 33: 'sports ball', 34: 'kite',
        35: 'baseball bat', 36: 'baseball glove', 37: 'skateboard', 38: 'surfboard',
        39: 'tennis racket', 40: 'bottle', 41: 'wine glass', 42: 'cup', 43: 'fork',
        44: 'knife', 45: 'spoon', 46: 'bowl', 47: 'banana', 48: 'apple',
        49: 'sandwich', 50: 'orange', 51: 'broccoli', 52: 'carrot', 53: 'hot dog',
        54: 'pizza', 55: 'donut', 56: 'cake', 57: 'chair', 58: 'couch',
        59: 'potted plant', 60: 'bed', 61: 'dining table', 62: 'toilet', 63: 'tv',
        64: 'laptop', 65: 'mouse', 66: 'remote', 67: 'keyboard', 68: 'cell phone',
        69: 'microwave', 70: 'oven', 71: 'toaster', 72: 'sink', 73: 'refrigerator',
        74: 'book', 75: 'clock', 76: 'vase', 77: 'scissors', 78: 'teddy bear',
        79: 'hair drier', 80: 'toothbrush'
    }

    detected_objects = []
    detected_objects_for_hashtag = []
    for label, score in zip(labels, scores):
        if (COCO_LABELS.get(label.item() - 1, 'object')) != 'object':
            detected_objects.append({
                'object': COCO_LABELS.get(label.item() - 1, 'object'),  # -1 -> countering off-by-one error
                'confidence': score.item()  # confidence
            })
            detected_objects_for_hashtag.append(COCO_LABELS.get(label.item() - 1, 'object'))
        else:
            continue

    detected_objects.sort(key=lambda x: x['confidence'], reverse=True)
    return detected_objects_for_hashtag


def not_detected_objects(*input_objects):
    detected_objects_for_hashtag = []
    for obj in input_objects:
        detected_objects_for_hashtag.append(obj)
    return detected_objects_for_hashtag


# your comments and test block below remain unchanged
'''
file_path = '../temp/flower.png'
with open(file_path, 'rb') as f:
    image_bytes = f.read()
mood = get_image_mood(image_bytes)
results = detect_objects(image_bytes)
print(mood)  # list of detected objects with their probabilities
'''
