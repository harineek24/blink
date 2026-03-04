#!/bin/bash

# AEYE Health - Background Camera Starter
# This script starts the eye tracking camera in background mode

echo "=================================================="
echo "AEYE Health - Background Camera Mode"
echo "=================================================="
echo "Starting camera in background mode..."
echo "The camera will monitor your blinks without showing any GUI"
echo "Press Ctrl+C to stop the camera"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "engine/faces.py" ]; then
    echo "Error: Could not find engine/faces.py"
    echo "Make sure you're running this from the AEYE Health root directory"
    exit 1
fi

# Check if conda environment exists and activate it
if command -v conda &> /dev/null; then
    if conda env list | grep -q "aeyehealth"; then
        echo "Activating conda environment: aeyehealth"
        source $(conda info --base)/etc/profile.d/conda.sh
        conda activate aeyehealth
    else
        echo "Warning: conda environment 'aeyehealth' not found"
        echo "Make sure you have the required dependencies installed"
    fi
fi

# Run the camera in background mode
python3 run_camera_background.py 