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

mask = np.all(image > [135, 135, 135], axis=-1)
coordinates = np.column_stack(np.where(mask))

if coordinates.size == 0:
    print(0)
    sys.exit(1)

x_coords = coordinates[:, 0]
y_coords = coordinates[:, 1]

if len(x_coords) > 1 and len(y_coords) > 1:
    cov_matrix = np.cov(x_coords, y_coords)
    eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)
    angles = np.degrees(np.arctan2(eigenvectors[1, :], eigenvectors[0, :]))
    print(angles[0])
else:
    print(0)
    sys.exit(1)
