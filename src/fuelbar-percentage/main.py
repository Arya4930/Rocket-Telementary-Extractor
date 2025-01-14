import cv2
import numpy as np
from matplotlib import pyplot as plt
import sys

# Load the uploaded image
image_path = sys.stdin.read().strip()
image = cv2.imread(image_path)
if image is None:
    print("Error: Unable to load image. Check the file path.")
    sys.exit(1)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply histogram equalization to improve the contrast
equalized = cv2.equalizeHist(gray)

# Apply Gaussian blur to reduce noise
blurred = cv2.GaussianBlur(equalized, (17, 17), 0)

# Apply Canny edge detection with adjusted parameters
edges = cv2.Canny(blurred, 95, 150)

# Perform morphological operations to close gaps in the edges
kernel = np.ones((5, 5), np.uint8)
closed_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

# Apply dilation to enhance the edges
dilated = cv2.dilate(closed_edges, kernel, iterations=2)

# Apply erosion to remove small noise
eroded = cv2.erode(dilated, kernel, iterations=1)

# Find contours from eroded edges
contours, _ = cv2.findContours(eroded, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter contours by aspect ratio and size (to detect horizontal bars)
progress_bars = []
for contour in contours:
    x, y, w, h = cv2.boundingRect(contour)
    aspect_ratio = w / h
    if 5 < aspect_ratio < 50 and h > 5:  # Aspect ratio and height threshold for progress bars
        progress_bars.append((x, y, w, h))
# Calculate widths of the progress bars
output = [w for x, y, w, h in progress_bars]

# Calculate percentages
percentage_1 = (output[0]*100)/243 if len(output) > 0 else 0
percentage_2 = (output[1]*100)/243 if len(output) > 1 else 0

print(percentage_1, percentage_2)
