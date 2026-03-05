/**
 * Offscreen document for blink detection using the webcam.
 * Uses Eye Aspect Ratio (EAR) algorithm — same approach as the desktop app's
 * Python engine, but computed from MediaPipe FaceMesh landmarks in JS.
 *
 * MediaPipe FaceMesh provides 468 landmarks. The eye landmarks used:
 *   Left eye:  [362, 385, 387, 263, 373, 380]
 *   Right eye: [33,  160, 158, 133, 153, 144]
 * Each eye array is ordered: [lateral, top-outer, top-inner, medial, bottom-inner, bottom-outer]
 */

// ── Configuration ──────────────────────────────────────────────────
const EAR_THRESHOLD = 0.2;      // Same as desktop app's blink_thresh
const CONSEC_FRAMES = 3;        // Same as desktop app's frame_limit
const DETECTION_INTERVAL = 100; // ms between detections (≈10 fps)

// MediaPipe FaceMesh landmark indices for eyes
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

// ── State ──────────────────────────────────────────────────────────
let frameCounter = 0;
let blinkCount = 0;
let isRunning = false;
let detectionLoop = null;
let model = null;

// ── EAR Calculation ────────────────────────────────────────────────
function euclidean(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateEAR(landmarks, eyeIndices) {
  const p = eyeIndices.map(i => [landmarks[i].x, landmarks[i].y]);
  // p[0]=lateral, p[1]=top-outer, p[2]=top-inner, p[3]=medial, p[4]=bottom-inner, p[5]=bottom-outer
  const vertical1 = euclidean(p[1], p[5]);
  const vertical2 = euclidean(p[2], p[4]);
  const horizontal = euclidean(p[0], p[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// ── Camera Setup ───────────────────────────────────────────────────
async function startCamera() {
  const video = document.getElementById('webcam');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: 'user' }
  });
  video.srcObject = stream;
  await video.play();
  return video;
}

function stopCamera() {
  const video = document.getElementById('webcam');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// ── Model Loading ──────────────────────────────────────────────────
async function loadModel() {
  if (model) return model;

  // Use the TensorFlow.js FaceMesh via CDN-loaded script
  // The face-landmarks-detection library is loaded in offscreen.html
  if (typeof faceLandmarksDetection === 'undefined') {
    throw new Error('face-landmarks-detection library not loaded');
  }

  model = await faceLandmarksDetection.createDetector(
    faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
    {
      runtime: 'tfjs',
      refineLandmarks: true,
      maxFaces: 1
    }
  );
  return model;
}

// ── Detection Loop ─────────────────────────────────────────────────
async function detectBlinks(video) {
  if (!isRunning || !model) return;

  try {
    const faces = await model.estimateFaces(video);

    if (faces.length > 0) {
      const landmarks = faces[0].keypoints;
      const leftEAR = calculateEAR(landmarks, LEFT_EYE);
      const rightEAR = calculateEAR(landmarks, RIGHT_EYE);
      const avgEAR = (leftEAR + rightEAR) / 2;

      if (avgEAR < EAR_THRESHOLD) {
        frameCounter++;
      } else {
        if (frameCounter >= CONSEC_FRAMES) {
          blinkCount++;
          // Notify background script
          chrome.runtime.sendMessage({
            type: 'BLINK_DETECTED',
            count: blinkCount
          });
        }
        frameCounter = 0;
      }
    }
  } catch (err) {
    console.error('Detection error:', err);
  }
}

// ── Message Handling ───────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_DETECTION') {
    startDetection().then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // async response
  }

  if (message.type === 'STOP_DETECTION') {
    stopDetection();
    sendResponse({ success: true });
  }

  if (message.type === 'GET_STATUS') {
    sendResponse({
      isRunning,
      blinkCount
    });
  }

  if (message.type === 'RESET_COUNT') {
    blinkCount = 0;
    frameCounter = 0;
    sendResponse({ success: true });
  }
});

// ── Start / Stop ───────────────────────────────────────────────────
async function startDetection() {
  if (isRunning) return;

  const video = await startCamera();
  await loadModel();
  isRunning = true;

  detectionLoop = setInterval(() => detectBlinks(video), DETECTION_INTERVAL);
  console.log('Blink detection started');
}

function stopDetection() {
  isRunning = false;
  if (detectionLoop) {
    clearInterval(detectionLoop);
    detectionLoop = null;
  }
  stopCamera();
  console.log('Blink detection stopped');
}
