import cv2
import numpy as np
import sys

if len(sys.argv) < 2:
    print("Usage: python script.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]
img = cv2.imread(image_path, cv2.IMREAD_COLOR)

if img is None:
    print("Error: Could not load the image.")
    sys.exit(1)


gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray_blurred = cv2.GaussianBlur(gray, (5, 5), 0)
detected_circles = cv2.HoughCircles(
    gray_blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=18,
    param1=40, param2=25, minRadius=4, maxRadius=42
)

on_engine_count = 0

if detected_circles is not None:
    detected_circles = np.uint16(np.around(detected_circles))
    for pt in detected_circles[0, :]:
        x, y, r = pt[0], pt[1], pt[2]
        mask = np.zeros_like(gray)
        cv2.circle(mask, (x, y), r, 255, -1)
        mean_color = cv2.mean(img, mask=mask)[:3]
        if mean_color[0] > 200 and mean_color[1] > 200 and mean_color[2] > 200:
            on_engine_count += 1
print(on_engine_count)
