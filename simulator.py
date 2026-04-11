import json
import random
import time
from datetime import datetime

# Path to our Digital Twin data
FILE_PATH = 'data/gym_status.json'

def run_simulation():
    try:
        # 1. Open the "Digital Twin"
        with open(FILE_PATH, 'r') as f:
            data = json.load(f)

        # 2. Randomly change machine statuses
        statuses = ["Available", "In-Use", "Maintenance"]
        for machine in data['equipment']:
            # 30% chance a machine changes what it's doing
            if random.random() < 0.3:
                machine['status'] = random.choice(statuses)
        
        # 3. Update the timestamp so the Chatbot knows the data is "Live"
        data['last_updated'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 4. Save the changes back to the file
        with open(FILE_PATH, 'w') as f:
            json.dump(data, f, indent=4)
        
        print(f"[{data['last_updated']}] Digital Twin Updated: Simulation Sync Successful.")

    except FileNotFoundError:
        print("Error: Could not find gym_status.json in the 'data' folder.")

if __name__ == "__main__":
    print("--- Gym Digital Twin Simulator Started ---")
    print("Keep this running to simulate real-time gym activity.")
    while True:
        run_simulation()
        time.sleep(5) # Updates every 5 seconds for testing