import cv2
import numpy as np
import sys

if len(sys.argv) < 2:
    print("Error: No image file provided.")
    sys.exit(1)

image_path = sys.argv[1]

image = cv2.imread(image_path)

if image is None:
    print(f"Error: Unable to load image {image_path}. Check the file path.")
    sys.exit(1)

target_color = np.array([40, 40, 40])
tolerance = 20
first_target_point = None

for x in range(len(image[0])):
    pixel = image[0, x]
    if np.all(np.abs(pixel - target_color) <= tolerance):
        if all(np.all(np.abs(image[0, x + i] - target_color) <= tolerance) for i in range(1, 6) if x + i < image.shape[1]):
            first_target_point = (x,)
            break

if first_target_point:
    print((first_target_point - 2) * 100 / 238)
else:
    print("No matching point found.")
