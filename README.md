Blink- Smart Eye Care

A modern, intelligent eye health monitoring application that helps you maintain healthy blinking habits and reduce digital eye strain.

## 🌟 Features

- **Real-time Blink Tracking**: Advanced computer vision technology monitors your blinking patterns
- **Smart Analytics**: Detailed insights into your eye health with beautiful visualizations
- **Intelligent Alerts**: Timely reminders to maintain healthy eye habits
- **Modern UI**: Professional, responsive design with smooth animations
- **Health Suggestions**: Personalized recommendations based on your usage patterns

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- Webcam access
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blink
   ```

2. **Set up the Python environment**
   ```bash
   conda create -n blink python=3.11
   conda activate blink
   pip install opencv-python dlib imutils scipy requests
   ```

3. **Download the face landmark model**
   ```bash
   # You'll need to download the shape_predictor_68_face_landmarks.dat file
   # and place it in the engine/ directory
   ```

### Running the Application

1. **Start the eye tracking engine**
   ```bash
   conda activate blink
   python3 engine/faces.py
   ```

2. **Open the web interface**
   ```bash
   cd gui
   python3 -m http.server 8000
   ```

3. **Access the dashboard**
   Open your browser and navigate to `http://localhost:8000`

### Running Camera in Background Mode

If you want to run the camera without showing any GUI (useful for background monitoring):

**Option 1: Using the shell script (Recommended)**
```bash
./start_camera.sh
```

**Option 2: Using the Python runner**
```bash
python3 run_camera_background.py
```

**Option 3: Direct execution**
```bash
conda activate blink
python3 engine/faces.py
```

The background mode will:
- Run the camera without displaying any GUI windows
- Print blink detection messages to the console
- Save data to `gui/storage.json` as usual
- Allow you to stop with Ctrl+C

This is perfect for:
- Running the camera while working on other tasks
- Server environments without display
- Automated monitoring setups

## 🎨 Modernized GUI Features

### Design System
- **Modern Color Palette**: Professional indigo and emerald color scheme
- **Glass Morphism**: Beautiful backdrop blur effects
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Responsive Design**: Works perfectly on all screen sizes

### Enhanced Components
- **Interactive Charts**: Real-time data visualization with Chart.js
- **Smart Progress Indicators**: Animated progress bars and counters
- **Feature Cards**: Highlighting key application capabilities
- **Team Showcase**: Professional team member profiles
- **Loading States**: Smooth loading animations and feedback

### User Experience
- **Smooth Navigation**: One-page scrolling with active state indicators
- **Accessibility**: ARIA labels and semantic HTML
- **Error Handling**: Graceful error states and user feedback
- **Performance**: Optimized animations and efficient data updates
- **External Links**: GitHub profile links and external URLs open in the default browser

## 📊 Dashboard Sections

### Main Dashboard
- **Daily Summary**: Overview of your eye health metrics
- **Screen Time Progress**: Visual representation of daily screen time
- **Recent Health Trends**: Line chart showing blink frequency over time
- **Smart Suggestions**: Personalized recommendations based on your data

### Analytics
- **Health History**: Comprehensive chart showing long-term trends
- **Baseline Comparison**: Compare your patterns against healthy benchmarks

### About & Contact
- **Feature Overview**: Detailed explanation of app capabilities
- **Team Information**: Meet the developers behind Blink Health
- **Contact Links**: Connect with the team via GitHub

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern design system with CSS custom properties
- **JavaScript (ES6+)**: Modular code with async/await patterns
- **Chart.js**: Beautiful, responsive data visualizations

### Backend
- **Python**: Core eye tracking engine
- **OpenCV**: Computer vision for blink detection
- **dlib**: Facial landmark detection
- **JSON**: Data storage and communication

## 🎯 Key Improvements

### Visual Design
- ✅ Modern color scheme with better contrast
- ✅ Professional typography using Inter font
- ✅ Consistent spacing and layout system
- ✅ Smooth animations and transitions
- ✅ Glass morphism effects

### User Experience
- ✅ Responsive design for all devices
- ✅ Improved navigation with smooth scrolling
- ✅ Better error handling and loading states
- ✅ Enhanced accessibility features
- ✅ Interactive charts with tooltips

### Code Quality
- ✅ Modular JavaScript architecture
- ✅ Modern CSS with custom properties
- ✅ Semantic HTML structure
- ✅ Better error handling and logging
- ✅ Performance optimizations

## 🐛 Troubleshooting

### Camera Issues
If you encounter camera permission errors:
1. Grant camera access in your system preferences
2. On macOS: System Preferences > Security & Privacy > Camera
3. Restart the application after granting permissions

### Environment Issues
If you have dependency problems:
```bash
conda activate blink
pip install --upgrade pip
pip install -r requirements.txt
```

### Developer Tools
If you need to access developer tools for debugging:
- **Keyboard Shortcut**: Press `F12` (Windows/Linux) or `Cmd+Option+I` (macOS)
- **Menu Option**: Go to Developer > Toggle Developer Tools
- **Note**: Developer tools are disabled by default for a cleaner user