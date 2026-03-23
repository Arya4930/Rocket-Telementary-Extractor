import json
import time
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import sys
import os

# ================= PATH SETUP =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)

folder = sys.argv[1] if len(sys.argv) > 1 else "IFT-8"

results_path = os.path.join(ROOT_DIR, folder, "results.json")
image_path = os.path.join(ROOT_DIR, folder, "video-dataset", "latest.png")

# ================= PLOT SETUP =================

plt.ion()

fig = plt.figure(figsize=(14, 8))

# Grid: 2x3 (extra column for image)
gs = fig.add_gridspec(2, 3)

ax_speed = fig.add_subplot(gs[0, 0])
ax_alt = fig.add_subplot(gs[0, 1])
ax_fuel = fig.add_subplot(gs[1, 0])
ax_tilt = fig.add_subplot(gs[1, 1])

ax_img = fig.add_subplot(gs[0, 2])   # image on top-right
ax_text = fig.add_subplot(gs[1, 2])  # text below it

plt.show(block=False)

# ================= HELPERS =================

def parse_time(t):
    try:
        h, m, s = map(int, t.split(":"))
        return h*3600 + m*60 + s
    except:
        return 0

running = True

def on_key(event):
    global running
    if event.key == 'q':
        running = False
        plt.close('all')

fig.canvas.mpl_connect('key_press_event', on_key)

# ================= MAIN LOOP =================

while running:
    try:
        if not os.path.exists(results_path):
            print("Waiting for results.json...")
            time.sleep(0.5)
            continue

        with open(results_path, "r") as f:
            content = f.read()

        if not content.strip():
            continue

        if not content.endswith("]"):
            content = content.rstrip(",\n") + "]"

        data = json.loads(content)

        if len(data) == 0:
            continue

        # ================= EXTRACT =================

        times = [parse_time(d.get("time", "0:0:0")) for d in data]

        ship_speed = [d.get("ship_speed", 0) for d in data]
        booster_speed = [d.get("booster_speed", 0) for d in data]

        ship_alt = [d.get("ship_altitude", 0) for d in data]
        booster_alt = [d.get("booster_altitude", 0) for d in data]

        ship_lox = [d.get("ship_LOX_Percent", 0) for d in data]
        booster_lox = [d.get("booster_LOX_Percent", 0) for d in data]

        ship_ch4 = [d.get("ship_CH4_Percent", 0) for d in data]
        booster_ch4 = [d.get("booster_CH4_Percent", 0) for d in data]

        ship_tilt = [d.get("ship_Tilt", 0) for d in data]
        booster_tilt = [d.get("booster_tilt", 0) for d in data]

        latest = data[-1]

        # ================= CLEAR =================

        ax_speed.clear()
        ax_alt.clear()
        ax_fuel.clear()
        ax_tilt.clear()

        # ================= PLOTS =================

        # SPEED
        ax_speed.plot(times, ship_speed, label="Ship")
        ax_speed.plot(times, booster_speed, label="Booster")
        ax_speed.set_title("Speed")
        ax_speed.legend()
        ax_speed.grid()

        # ALTITUDE
        ax_alt.plot(times, ship_alt, label="Ship")
        ax_alt.plot(times, booster_alt, label="Booster")
        ax_alt.set_title("Altitude")
        ax_alt.legend()
        ax_alt.grid()

        # FUEL
        ax_fuel.plot(times, ship_lox, label="Ship LOX")
        ax_fuel.plot(times, booster_lox, label="Booster LOX")
        ax_fuel.plot(times, ship_ch4, label="Ship CH4")
        ax_fuel.plot(times, booster_ch4, label="Booster CH4")
        ax_fuel.set_title("Fuel %")
        ax_fuel.legend()
        ax_fuel.grid()

        # TILT
        ax_tilt.plot(times, ship_tilt, label="Ship")
        ax_tilt.plot(times, booster_tilt, label="Booster")
        ax_tilt.set_title("Tilt")
        ax_tilt.legend()
        ax_tilt.grid()

        # ================= IMAGE =================

        ax_img.clear()
        if os.path.exists(image_path):
            img = mpimg.imread(image_path)
            ax_img.imshow(img)
            ax_img.set_title("Live Frame")
            ax_img.axis("off")
        else:
            ax_img.set_title("No Image Yet")
            ax_img.axis("off")

        # ================= TEXT (LATEST VALUES) =================

        text = f"""
Time: {latest.get("time")}
Ship Speed: {latest.get("ship_speed")}
Booster Speed: {latest.get("booster_speed")}

Ship Alt: {latest.get("ship_altitude")}
Booster Alt: {latest.get("booster_altitude")}

Ship Tilt: {latest.get("ship_Tilt")}
Booster Tilt: {latest.get("booster_tilt")}

Booster LOX: {latest.get("booster_LOX_Percent")}
Booster CH4: {latest.get("booster_CH4_Percent")}

Ship LOX: {latest.get("ship_LOX_Percent")}
Ship CH4: {latest.get("ship_CH4_Percent")}
"""

        ax_text.clear()
        ax_text.axis("off")

        ax_text.text(
            0.05, 0.95, text,
            va='top',
            fontsize=10,
            family='monospace'
        )

        plt.tight_layout()
        plt.pause(0.1)

    except Exception as e:
        print("Error:", e)

    time.sleep(0.3)