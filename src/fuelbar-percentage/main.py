import cv2
import numpy as np
from matplotlib import pyplot as plt
import sys

image_path = sys.stdin.read()
image = cv2.imread(image_path)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

_, thresh1 = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
contours1, _ = cv2.findContours(thresh1, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
progress_bars1 = []
for contour in contours1:
    x, y, w, h = cv2.boundingRect(contour)
    aspect_ratio = w / h
    if 5 < aspect_ratio < 50 and h > 5:
        progress_bars1.append((x, y, w, h))

_, thresh2 = cv2.threshold(gray, 65, 255, cv2.THRESH_BINARY)
contours2, _ = cv2.findContours(thresh2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

progress_bars2 = []
for contour in contours2:
    x, y, w, h = cv2.boundingRect(contour)
    aspect_ratio = w / h
    if 5 < aspect_ratio < 50 and h > 5:
        progress_bars2.append((x, y, w, h))

output = []
for x, y, w, h in progress_bars1:
    output.append(x-y)
for x, y, w, h in progress_bars2:
    output.append(x-y)

print((output[0]*100)/output[1])
print((output[2]*100)/output[3])