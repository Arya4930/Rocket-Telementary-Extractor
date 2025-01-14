import cv2
import numpy as np
import sys

# Read multiple file paths from stdin
file_paths = sys.stdin.read().strip().split("\n")

if len(file_paths) < 2:
    print("Error: Expected two file paths.")
    sys.exit(1)

# Process each image
for image_path in file_paths:
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Unable to load image '{image_path}'. Check the file path.")
        continue

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 17, 2
    )

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter contours to detect progress bars
    progress_bars = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = w / h
        if 5 < aspect_ratio < 50 and h > 5:
            progress_bars.append((x, y, w, h))

    # Output detected widths
    for x, y, w, h in progress_bars:
        if ( x != 0):
            print(x*10/24)
        elif ( x == 0):
            print(w*10/24)
        else:
            print(0)