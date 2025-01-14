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

    # Convert the image to the HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define the color range for the dark gray progress bar (you might need to adjust these values)
    lower_gray = np.array([0, 0, 20])
    upper_gray = np.array([180, 255, 135])

    # Create a mask for the gray color
    mask = cv2.inRange(hsv, lower_gray, upper_gray)

    # Apply the mask to the image
    masked_image = cv2.bitwise_and(image, image, mask=mask)

    # Convert the masked image to grayscale
    gray_masked = cv2.cvtColor(masked_image, cv2.COLOR_BGR2GRAY)

    # Apply thresholding to the masked grayscale image
    _, thresh = cv2.threshold(gray_masked, 1, 255, cv2.THRESH_BINARY)

    # Find contours for the thresholded image
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter contours by aspect ratio and size (to detect horizontal bars)
    progress_bars = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = w / h
        if 5 < aspect_ratio < 50 and h > 5:  # Aspect ratio and height threshold for progress bars
            progress_bars.append((x, y, w, h))

    # Output detected widths
    for x, y, w, h in progress_bars:
        if x != 0:
            print(x * 10 / 24)
        elif x == 0:
            print(w * 10 / 24)
        else:
            print(0)