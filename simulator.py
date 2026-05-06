import json
import random
import time
from datetime import datetime

FILE_PATH = 'data/gym_status.json'

def get_occupancy_probability():
    """Adjusts occupancy chance based on the time of day."""
    hour = datetime.now().hour
    # Peak Hours: 7-9 AM and 5-8 PM (17-20)
    if (7 <= hour <= 9) or (17 <= hour <= 20):
        return 0.8  # 80% chance machines are In-Use
    # Off-Peak: Late night
    elif (0 <= hour <= 5):
        return 0.1  # 10% chance
    else:
        return 0.4  # 40% chance during standard hours

def run_simulation():
    try:
        with open(FILE_PATH, 'r') as f:
            data = json.load(f)

        chance_in_use = get_occupancy_probability()
        
        for machine in data['equipment']:
            # 10% chance a machine breaks/needs maintenance regardless of time
            if random.random() < 0.05:
                machine['status'] = "Maintenance"
            # Otherwise, set status based on peak-hour probability
            elif random.random() < chance_in_use:
                machine['status'] = "In-Use"
            else:
                machine['status'] = "Available"
        
        data['last_updated'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with open(FILE_PATH, 'w') as f:
            json.dump(data, f, indent=4)
        
        print(f"[{data['last_updated']}] Sync Successful. Mode: {'PEAK' if chance_in_use > 0.5 else 'NORMAL'}")

    except FileNotFoundError:
        print("Error: Ensure data/gym_status.json exists.")

if __name__ == "__main__":
    print("--- Pro Gym Digital Twin Simulator Active ---")
    while True:
        run_simulation()
        time.sleep(10) # 10 seconds is plenty for a live demo