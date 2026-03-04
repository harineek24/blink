import sys
import cv2
import dlib
import time
import imutils
import json
import requests
import signal
import os
from datetime import datetime, timedelta
from collections import defaultdict

from scipy.spatial import distance as dist
from imutils import face_utils

# Global flag for clean shutdown
running = True


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global running
    print("\nShutting down camera gracefully...")
    running = False


# Register signal handlers for clean shutdown
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# definitions
history_interval = 10
blink_thresh = 0.2
frame_counter = 0
frame_limit = 3
blink_counter = 0
max_blinks = 250
previous_blink_counter = 0

# Load existing data
with open("gui/storage.json", "r") as read_file:
    data = json.load(read_file)

blink_counter = data["blinkcounter"] if data["blinkcounter"] != None else 0
previous_blink_counter = blink_counter

data["maxblinks"] = max_blinks

# Initialize new data structure if not exists
if "daily_data" not in data:
    data["daily_data"] = {}
if "current_day_intervals" not in data:
    data["current_day_intervals"] = []
if "last_interval_update" not in data:
    data["last_interval_update"] = datetime.now().isoformat()

json_data = json.dumps(data)
with open("gui/storage.json", "w") as file:
    file.write(json_data)

print("AEYE Health - Camera started in background mode")
print("Press Ctrl+C to stop the camera")


def get_current_date():
    """Get current date in YYYY-MM-DD format"""
    return datetime.now().strftime("%Y-%m-%d")


def get_current_time():
    """Get current time in HH:MM format"""
    return datetime.now().strftime("%H:%M")


def aggregate_daily_data():
    """Aggregate current day intervals into daily total"""
    current_date = get_current_date()
    if current_date not in data["daily_data"]:
        data["daily_data"][current_date] = 0

    # Sum all intervals for current day
    daily_total = sum(data["current_day_intervals"])
    data["daily_data"][current_date] = daily_total


def update_interval_data():
    """Update 5-minute interval data for current day"""
    global data, previous_blink_counter

    current_time = datetime.now()
    last_update = datetime.fromisoformat(data["last_interval_update"])

    # Check if 5 minutes have passed
    if (current_time - last_update).total_seconds() >= 300:  # 5 minutes = 300 seconds
        # Add current interval blinks to intervals
        interval_blinks = blink_counter - previous_blink_counter
        if interval_blinks > 0:
            data["current_day_intervals"].append(interval_blinks)

        # Keep only last 288 intervals (24 hours worth of 5-minute intervals)
        if len(data["current_day_intervals"]) > 288:
            data["current_day_intervals"] = data["current_day_intervals"][-288:]

        data["last_interval_update"] = current_time.isoformat()
        previous_blink_counter = blink_counter

        # Aggregate daily data
        aggregate_daily_data()

        # Save updated data
        json_data = json.dumps(data)
        with open("gui/storage.json", "w") as file:
            file.write(json_data)


def calculate_ear(eye):

    delta_y1 = dist.euclidean(eye[1], eye[5])
    delta_y2 = dist.euclidean(eye[2], eye[4])

    delta_x1 = dist.euclidean(eye[0], eye[3])

    return (delta_y1 + delta_y2) / (2 * delta_x1)


cam = cv2.VideoCapture(0)

# Check if camera opened successfully
if not cam.isOpened():
    print("Error: Could not open camera. Please check camera permissions and try again.")
    print("On macOS, you may need to grant camera access in System Preferences > Security & Privacy > Camera")
    sys.exit(1)

print("Camera initialized successfully - running in background")

(L_start, L_end) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(R_start, R_end) = face_utils.FACIAL_LANDMARKS_IDXS['right_eye']

detector = dlib.get_frontal_face_detector()
landmark_predict = dlib.shape_predictor(
    'engine/shape_predictor_68_face_landmarks.dat')

time_limit = 10
time_counter = 0
start = time.perf_counter()
start_update = time.perf_counter()

# async def send_data():
#     async with websockets.connect('ws://localhost:8080') as websocket:
#         await websocket.send(blink_counter)

while running:

    ret, frame = cam.read()

    # Check if frame was successfully captured
    if not ret or frame is None:
        print("Error: Could not read frame from camera. Please check camera connection.")
        break

    frame = imutils.resize(frame, width=640)

    img_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = detector(img_gray)

    for face in faces:
        shape = landmark_predict(img_gray, face)
        shape = face_utils.shape_to_np(shape)

        left_eye = shape[L_start:L_end]
        right_eye = shape[R_start:R_end]

        left_ear = calculate_ear(left_eye)
        right_ear = calculate_ear(right_eye)

        avg = (left_ear + right_ear) / 2
        # if blinking frame counted
        if avg < blink_thresh:
            frame_counter += 1
        # check if blinking frame not detected
        else:
            if frame_counter >= frame_limit:
                blink_counter += 1
                frame_counter = 0
                print(f"Blink detected! Total blinks: {blink_counter}")
            else:
                frame_counter = 0

    # change: 600000 -> 10000
    if time.perf_counter() - start >= 0.5:
        start = time.perf_counter()
        data["blinkcounter"] = blink_counter
        json_data = json.dumps(data)
        with open("gui/storage.json", "w") as file:
            file.write(json_data)

        # Update interval data
        update_interval_data()

    if time.perf_counter() - start_update >= history_interval:

        start_update = time.perf_counter()

        with open("gui/storage.json", "r") as read_file:
            data = json.load(read_file)

        blink_data = []
        if "blinkhistory" in data:
            blink_data = data["blinkhistory"]

        blink_data.append(blink_counter - previous_blink_counter)
        blink_data = blink_data[1:]

        data["blinkhistory"] = blink_data

        json_data = json.dumps(data)
        with open("gui/storage.json", "w") as file:
            file.write(json_data)

        previous_blink_counter = blink_counter

print("Releasing camera...")
cam.release()
print("Camera stopped successfully")
