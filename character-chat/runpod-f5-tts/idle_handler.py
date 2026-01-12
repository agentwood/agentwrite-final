
import time
import os
import sys
import runpod

# Simple idle checker
# Usage: Call update_activity() on every request
# Call check_idle() periodically in a background thread or check before/after requests

last_activity = time.time()
IDLE_TIMEOUT = 300 # 5 minutes

def update_activity():
    global last_activity
    last_activity = time.time()

def check_idle():
    if time.time() - last_activity > IDLE_TIMEOUT:
        print(f"Idle for {IDLE_TIMEOUT}s. Shutting down...")
        # If running as a Pod, we might want to self-terminate or exit the process
        # runpod.api.stop_pod(os.environ.get("RUNPOD_POD_ID")) # Requires API Key env var
        sys.exit(0) # Exit process -> Container restarts or Pod stops? (Depends on restart policy)
