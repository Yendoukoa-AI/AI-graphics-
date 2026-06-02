import subprocess
import os
import sys
import time
import signal

def start_backend():
    print("Starting backend server...")
    return subprocess.Popen(["node", "server/index.js"])

def start_frontend():
    print("Starting frontend server...")
    return subprocess.Popen(["npm", "start"])

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "Development"

    processes = []

    try:
        if mode == "Production":
            print("Running in Production Mode")
            # In production, the backend serves the frontend
            p_backend = start_backend()
            processes.append(p_backend)
        else:
            print("Running in Development Mode")
            p_backend = start_backend()
            p_frontend = start_frontend()
            processes.append(p_backend)
            processes.append(p_frontend)

        print("Servers started. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
            for p in processes:
                if p.poll() is not None:
                    print(f"Process {p.args} exited with code {p.returncode}")
                    return

    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        for p in processes:
            p.terminate()

if __name__ == "__main__":
    main()
