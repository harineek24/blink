#!/usr/bin/env python3
"""
AEYE Health - Background Camera Runner

This script runs the eye tracking camera in the background without showing any GUI.
The camera will continuously monitor for blinks and save data to storage.json.

Usage:
    python3 run_camera_background.py

To stop:
    Press Ctrl+C or kill the process
"""

import subprocess
import sys
import signal
import time
import os
from pathlib import Path


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("\nStopping background camera...")
    sys.exit(0)


def main():
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Get the directory of this script
    script_dir = Path(__file__).parent
    faces_script = script_dir / "engine" / "faces.py"

    if not faces_script.exists():
        print(f"Error: Could not find {faces_script}")
        print("Make sure you're running this from the AEYE Health root directory")
        sys.exit(1)

    print("=" * 50)
    print("AEYE Health - Background Camera Mode")
    print("=" * 50)
    print("Starting camera in background mode...")
    print("The camera will monitor your blinks without showing any GUI")
    print("Press Ctrl+C to stop the camera")
    print("=" * 50)

    try:
        # Run the faces.py script
        process = subprocess.Popen(
            [sys.executable, str(faces_script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )

        # Stream output in real-time
        for line in process.stdout:
            print(line.rstrip())

    except KeyboardInterrupt:
        print("\nReceived interrupt signal, stopping camera...")
        if 'process' in locals():
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        print("Camera stopped successfully")
    except Exception as e:
        print(f"Error running camera: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
