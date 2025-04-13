import cv2
import numpy as np
import sys
import os
import matplotlib.pyplot as plt

if len(sys.argv) < 2:
    print("Error: No image file provided.")
    sys.exit(1)

image_path = sys.argv[1]
image = cv2.imread(image_path)

if image is None:
    print(f"Error: Unable to load image {image_path}. Check the file path.")
    sys.exit(1)

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
_, mask = cv2.threshold(gray, 123, 255, cv2.THRESH_BINARY)
coordinates = np.column_stack(np.where(mask > 0))

if coordinates.size == 0:
    print(0)
    sys.exit(1)

y_coords = coordinates[:, 0]
x_coords = coordinates[:, 1] 

if len(x_coords) > 1 and len(y_coords) > 1:
    cov_matrix = np.cov(x_coords, y_coords)
    eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)
    angles = np.degrees(np.arctan2(eigenvectors[1, :], eigenvectors[0, :]))
    angles[1] += 90
    if angles[1] < -45:
        angles[1] += 90
    elif angles[1] > 45:
        angles[1] -= 90
    
    if angles[1] > 75:
        angles[1] -= 180
    print(angles[1])

    mean_x = np.mean(x_coords)
    mean_y = np.mean(y_coords)

    # Plotting
    plt.figure(figsize=(8, 6))
    plt.scatter(x_coords, y_coords, alpha=0.6, marker='o', label="Data Points")
    plt.scatter(mean_x, mean_y, color="red", marker="x", label="Mean Point", s=100)

    scale_factor = 2
    for i in range(2):
        eigenvector = eigenvectors[:, i] * np.sqrt(eigenvalues[i]) * scale_factor
        plt.quiver(
            mean_x, mean_y,
            eigenvector[0], eigenvector[1],
            color=['green', 'blue'][i], angles='xy', scale_units='xy', scale=1,
            width=0.005, label=f"Eigenvector {i+1} (λ={eigenvalues[i]:.2f})"
        )

    plt.xlabel("X Coordinate")
    plt.ylabel("Y Coordinate")
    plt.title("Eigenvectors Overlaid on Original Data Pattern")
    plt.legend()
    plt.grid(True)
    plt.axis("equal")
    plt.gca().invert_yaxis()  # Flip Y to match OpenCV view
    filename = os.path.splitext(os.path.basename(image_path))[0]
    output_plot_path = f"./eigenvector.png"
    plt.savefig(output_plot_path, dpi=300)
    plt.close() 
else:
    print(0)
    sys.exit(1)
