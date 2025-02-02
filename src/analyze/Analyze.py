import json
import numpy as np
from scipy.interpolate import CubicSpline
import matplotlib.pyplot as plt
from scipy.integrate import quad
import sys
import os

inp = sys.stdin.read().split("\n")
json_file_path = inp[0]
plots_path = inp[1]
base_dir = os.path.abspath(os.path.dirname(__file__))
save_dir = os.path.join(base_dir, plots_path)

os.makedirs(save_dir, exist_ok=True)
print(f"Save directory created: {save_dir}")

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

time_points = []
ship_speeds = []
booster_nonpolated_speeds = []
ship_altitudes = []
ship_lox_percent = []
ship_ch4_percent = []
booster_altitudes = []
booster_lox_percent = []
booster_ch4_percent = []

for entry in data:
    if 'time' in entry:
        time_sec = time_to_seconds(entry['time'])
        time_points.append(time_sec)
        ship_speeds.append(entry.get('ship_speed', 0))
        booster_nonpolated_speeds.append(entry.get('booster_speed', 0))
        ship_altitudes.append(entry.get('ship_altitude', 0))
        ship_lox_percent.append(entry.get('ship_LOX_Percent', 0))
        ship_ch4_percent.append(entry.get('ship_CH4_Percent', 0))
        booster_altitudes.append(entry.get('booster_altitude', 0))
        booster_lox_percent.append(entry.get('booster_LOX_Percent', 0))
        booster_ch4_percent.append(entry.get('booster_CH4_Percent', 0))

time_points = np.array(time_points)

metrics = [
    ("ship_speeds", ship_speeds, "Ship Speed"),
    ("booster_speeds", booster_nonpolated_speeds, "Booster Speed"),
    ("ship_altitudes", ship_altitudes, "Ship Altitude"),
    ("booster_altitudes", booster_altitudes, "Booster Altitude"),
    ("ship_lox_percent", ship_lox_percent, "Ship LOX Percent"),
    ("ship_ch4_percent", ship_ch4_percent, "Ship CH4 Percent"),
    ("booster_lox_percent", booster_lox_percent, "Booster LOX Percent"),
    ("booster_ch4_percent", booster_ch4_percent, "Booster CH4 Percent")
]

for metric_name, metric_values, metric_label in metrics:
    metric_values = np.array(metric_values)
    plt.plot(time_points, metric_values, label=metric_label)
    plt.xlabel('Time (seconds)')
    plt.ylabel(metric_label)
    plt.legend()
    
    # Save the plot
    save_path = os.path.join(save_dir, f"{metric_name}.png")
    if (metric_name == "booster_speeds" or metric_name == "booster_altitudes" or metric_name == "booster_ch4_percent") and len(time_points) > 1:
        plt.savefig(save_path)
        plt.clf()
        print(f"Plot saved: {save_path}")

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
            continue

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
    
    # Save the plot
    save_path = os.path.join(save_dir, "natural_cubic_spline.png")
    plt.savefig(save_path)
    print(f"Plot saved: {save_path}")
    plt.clf()  # Clear the current figure

    cs_derivative = cs.derivative()
    y_fine_derivative = cs_derivative(x_fine)

    plt.plot(x_fine, y_fine_derivative, label='Derivative of Natural Cubic Spline')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Derivative of Booster Altitude')
    plt.legend()
    
    # Save the plot
    save_path = os.path.join(save_dir, "derivative_natural_cubic_spline.png")
    plt.savefig(save_path)
    print(f"Plot saved: {save_path}")
    plt.clf()  # Clear the current figure

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
    
    # Save the plot
    save_path = os.path.join(save_dir, "displacement_vs_time.png")
    plt.savefig(save_path)
    print(f"Plot saved: {save_path}")
    plt.clf()  # Clear the current figure
