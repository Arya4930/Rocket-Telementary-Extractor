import cv2
import numpy as np
import sys

def is_color_match(pixel, target, tolerance):
    return np.all(np.abs(pixel - target) <= tolerance)

def verify_next_pixels(image, x, y, target_color, tolerance):
    for i in range(1, 3):
        if x + i < image.shape[1]: 
            if not is_color_match(image[y, x + i], target_color, tolerance):
                return False
        else:
            return False
    return True

file_paths = sys.stdin.read().strip().split("\n")

if len(file_paths) < 2:
    print("Error: Expected two file paths.")
    sys.exit(1)

for image_path in file_paths:
    image = cv2.imread(image_path)

    if image is None:
        print("Error: Unable to load image. Check the file path.")
        sys.exit(1)

    target_color = np.array([40, 40, 40])
    tolerance = 15

    first_target_point = None
    for x in range(len(image[5])):
        pixel = image[6, x]
        if is_color_match(pixel, target_color, tolerance):
            if verify_next_pixels(image, x, 6, target_color, tolerance):
                first_target_point = (x, 6)
                break

    if first_target_point:
        print((x-1)*100/238)
    else:
        print(0)