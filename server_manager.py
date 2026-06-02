import subprocess
import time
import socket
import sys
import os

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def run_server():
    print("Starting DesignAI Studio in Production Mode...")

    # In production mode, the backend serves the built frontend.
    # We only need to start the backend.
    print("Starting backend server (serving frontend from /dist) on port 3001...")
    backend_proc = subprocess.Popen(
        ["node", "index.js"],
        cwd=os.path.join(os.getcwd(), "server"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Monitor port
    backend_ready = False
    timeout = 30
    start_time = time.time()

    while time.time() - start_time < timeout:
        if not backend_ready and is_port_open(3001):
            print("DesignAI Studio is ready on http://localhost:3001")
            backend_ready = True
            break

        time.sleep(1)
    else:
        print("Timeout waiting for server to start.")
        backend_proc.terminate()
        sys.exit(1)

    try:
        while True:
            # Check if process is still running
            if backend_proc.poll() is not None:
                print("Server process terminated unexpectedly.")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down server...")
        backend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    run_server()
