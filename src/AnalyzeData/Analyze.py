import json
import numpy as np
from scipy.interpolate import CubicSpline
import matplotlib.pyplot as plt
from scipy.integrate import quad
import sys

json_file_path = sys.stdin.read()
with open(json_file_path, 'r') as file:
    data = json.load(file)

def time_to_seconds(t):
    h, m, s = map(int, t.split(':'))
    return h * 3600 + m * 60 + s

x_points = []
y_points = []
booster_speeds = []

last_time_sec = -1
last_altitude = None

for entry in data:
    if 'time' in entry and 'booster_altitude' in entry and 'booster_speed' in entry:
        time_sec = time_to_seconds(entry['time'])
        altitude = entry['booster_altitude']
        booster_speed = entry['booster_speed']
        if (time_sec > last_time_sec) and (altitude != last_altitude):
            x_points.append(time_sec)
            y_points.append(altitude)
            booster_speeds.append(booster_speed)
            last_time_sec = time_sec
            last_altitude = altitude
        else:
            print(f"Duplicate or non-increasing time value found and skipped: time = {entry['time']}, altitude = {altitude}")

x_points = np.array(x_points)
y_points = np.array(y_points)
booster_speeds = np.array(booster_speeds)

if len(x_points) < 2 or len(y_points) < 2:
    print("Not enough unique data points for interpolation.")
else:
    cs = CubicSpline(x_points, y_points, bc_type='natural')

    coefficients = cs.c

    spline_segments = []
    for i in range(len(coefficients[0])):
        segment = {
            "a": float(coefficients[0][i]),
            "b": float(coefficients[1][i]),
            "c": float(coefficients[2][i]),
            "d": float(coefficients[3][i]),
        }
        spline_segments.append(segment)

    x_fine = np.linspace(x_points[0], x_points[-1], 200)
    y_fine = cs(x_fine)

    plt.plot(x_points, y_points, 'o', label='Data Points')
    plt.plot(x_fine, y_fine, label='Natural Cubic Spline')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Booster Altitude')
    plt.legend()
    plt.show()

    cs_derivative = cs.derivative()
    y_fine_derivative = cs_derivative(x_fine)

    plt.plot(x_fine, y_fine_derivative, label='Derivative of Natural Cubic Spline')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Derivative of Booster Altitude')
    plt.legend()
    plt.show()

    sq_speed = booster_speeds[:len(y_fine_derivative)]**2
    sq_dy = (y_fine_derivative[:len(booster_speeds)]*3600)**2
    Dx = np.sqrt(np.abs(sq_speed - sq_dy))
    Dx[sq_dy > sq_speed] *= -1

    def integrand(x):
        return np.interp(x, x_fine[:len(Dx)], Dx)

    Dx_km_per_s = Dx / 3600

    displacement = np.cumsum((Dx_km_per_s[:-1] + Dx_km_per_s[1:]) / 2 * np.diff(x_fine[:len(Dx)]))
    displacement = np.insert(displacement, 0, 0)

    plt.plot(x_fine[:len(displacement)], displacement, label='Cumulative Displacement (km)')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Displacement (km)')
    plt.legend()
    plt.title('Displacement vs. Time')
    plt.show()
