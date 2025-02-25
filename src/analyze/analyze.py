import json
import numpy as np
from scipy.interpolate import CubicSpline
import matplotlib.pyplot as plt
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

def cspline(metric_name, metric_label):
    last_time_sec = -1
    x_points = []
    y_points = []
    
    for entry in data:
        if 'time' in entry and metric_name in entry:
            time_sec = time_to_seconds(entry['time'])
            metric = entry[metric_name]

            if time_sec <= last_time_sec:
                print(f"Skipping duplicate or non-increasing time: {entry['time']}")
                continue
            if metric is None:
                print(f"Skipping None value for {metric_name} at time {entry['time']}")
                continue
            try:
                metric = float(metric) 
                if not np.isfinite(metric):
                    print(f"Skipping invalid value {metric} for {metric_name} at time {entry['time']}")
                    continue
            except ValueError:
                print(f"Skipping non-numeric value {metric} for {metric_name} at time {entry['time']}")
                continue

            x_points.append(time_sec)
            y_points.append(metric)
            last_time_sec = time_sec

    x_points = np.array(x_points, dtype=float)
    y_points = np.array(y_points, dtype=float)

    # # Debugging output
    # print(f"\nProcessing {metric_name}...")
    # print(f"x_points: {x_points}")
    # print(f"y_points: {y_points}")

    if len(x_points) < 2:
        print(f"Not enough unique data points for {metric_name}. Skipping interpolation.")
        return

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
    
    # for debugging purposes to see datapoints
    # plt.plot(x_points, y_points, 'o', label='Data Points') 
    plt.plot(x_fine, y_fine, label=metric_label)
    plt.xlabel('Time (seconds)')
    if ( len(time_points) > 1):
        if( metric_name == "booster_speed"):
            plt.ylabel('Speed ( Km/Hr )')
            plt.legend()
            plt.savefig(os.path.join(save_dir, f"Speed_spline.png"))
            plt.clf()
        if ( metric_name == "booster_altitude"):
            plt.ylabel('Altitude ( Km )')
            plt.legend()
            plt.savefig(os.path.join(save_dir, f"Altitude_spline.png"))
            plt.clf()
        if ( metric_name == "booster_CH4_Percent"):
            plt.ylabel('Fuel %')
            plt.legend()
            plt.savefig(os.path.join(save_dir, f"Fuel_spline.png"))
            plt.clf()
        if ( metric_name == "ship_Tilt" ):
            plt.ylabel('Tilt Angle')
            plt.legend()
            plt.savefig(os.path.join(save_dir, f"Tilt_spline.png"))
            plt.clf()

time_points = []
for entry in data:
    if 'time' in entry:
        time_sec = time_to_seconds(entry['time'])
        time_points.append(time_sec)

time_points = np.array(time_points)

metrics = [
    ("ship_speed", "Ship Speed"),
    ("booster_speed", "Booster Speed"),
    ("ship_altitude", "Ship Altitude"),
    ("booster_altitude", "Booster Altitude"),
    ("ship_LOX_Percent", "Ship LOX Percent"),
    ("ship_CH4_Percent", "Ship CH4 Percent"),
    ("booster_LOX_Percent", "Booster LOX Percent"),
    ("booster_CH4_Percent", "Booster CH4 Percent"),
    ("booster_tilt", "Booster Tilt Angle"),
    ("ship_Tilt", "Ship Tilt Angle")
]


for metric_name, metric_label in metrics:
    cspline(metric_name, metric_label)
