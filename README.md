# VisionEdge

Hardware-Accelerated Real-Time Video Pipeline for Object Detection and Edge Computing.

VisionEdge is a real-time video processing and object detection platform designed to process video streams asynchronously, perform AI-based object detection, deliver video through WebRTC, and monitor runtime processing performance.

## Project Overview

Real-time video applications need to handle continuous video frames while performing computationally expensive AI inference with minimal delay.

VisionEdge addresses this by combining:

- Asynchronous video stream processing
- YOLO-based object detection
- FastAPI backend services
- PyAV video decoding
- WebRTC video delivery
- React-based visualization
- Runtime performance monitoring
- TensorRT acceleration support for NVIDIA environments

## Key Features

### Real-Time Video Processing

- Video decoding using PyAV
- Support for local video sources
- Support for network-based sources including RTSP, RTMP, HTTP and HTTPS
- Frame-by-frame asynchronous processing
- Configurable real-time frame playback

### AI Object Detection

- YOLO11n-based object detection pipeline
- Bounding-box detection
- Object class identification
- Confidence scoring
- YOLO confidence threshold for inference
- TensorRT pipeline support in NVIDIA environments

Currently supported detection classes include:

- Person
- Bicycle
- Car
- Motorcycle
- Bus
- Truck

### Asynchronous Stream Management

VisionEdge uses an asynchronous `StreamManager` to control the lifecycle of video streams.

Supported stream states include:

```text
CREATED
STARTING
RUNNING
STOPPING
STOPPED
ERROR
```

The StreamManager is responsible for:

- Creating and tracking streams
- Starting asynchronous processing tasks
- Stopping and cancelling stream tasks
- Managing stream lifecycle states
- Connecting video sources with the detection pipeline
- Collecting runtime metrics
- Storing the latest detection results

### WebRTC Video Delivery

VisionEdge uses WebRTC to deliver video to the React frontend.

The frontend:

1. Creates a WebRTC peer connection
2. Generates an SDP offer
3. Sends the offer to the FastAPI WebRTC endpoint
4. Receives the SDP answer
5. Sets the remote description
6. Establishes the WebRTC connection
7. Displays the received video stream

The frontend also monitors the WebRTC connection state and automatically attempts to reconnect when the connection is lost or fails.

### Detection Visualization

Detection results are retrieved from the FastAPI backend and displayed over the WebRTC video.

The React frontend:

- Requests the latest detection results
- Applies a 50% confidence threshold for visualization
- Calculates the required video scaling and offsets
- Draws bounding boxes on a canvas overlay
- Displays the detected class and confidence percentage

The detection data flow is:

```text
Video Source
     ↓
StreamManager
     ↓
YOLO Pipeline
     ↓
Detection Results
     ↓
FastAPI Detection API
     ↓
React Frontend
     ↓
Canvas Overlay
```

### Runtime Performance Monitoring

VisionEdge includes runtime metrics for monitoring stream processing performance.

The system tracks:

- Source FPS
- Processing FPS
- Frames processed
- Average inference latency
- Last inference latency
- Processing errors
- Stream start time
- Last processed frame time

Example runtime metrics displayed in the frontend:

```text
Source FPS       30.0
Processing FPS    8.7
Frames           392
Avg Inference  115.4 ms
Last Inference 103.9 ms
Errors             0
```

These values are runtime examples and can vary depending on the system and workload.

## System Architecture

```text
Video Input
     ↓
Video Processing
     ↓
YOLO / Detection Pipeline
     ↓
Stream Management
     ↓
FastAPI Backend
     ↓
WebRTC
     ↓
React Frontend
     ↓
Real-Time Detection Display
```

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend and processing |
| FastAPI | Backend API services |
| PyTorch | AI inference support |
| YOLO11n | Object detection |
| PyAV | Video decoding and frame processing |
| WebRTC | Real-time video delivery |
| React | Frontend interface |
| TensorRT | NVIDIA inference acceleration |

## API Endpoints

### Stream Management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/streams/` | Create a stream |
| GET | `/api/v1/streams/` | List streams |
| GET | `/api/v1/streams/{stream_id}` | Get stream information |
| POST | `/api/v1/streams/{stream_id}/start` | Start stream processing |
| POST | `/api/v1/streams/{stream_id}/stop` | Stop stream processing |

### Monitoring and Detection

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/streams/{stream_id}/metrics` | Get runtime metrics |
| GET | `/api/v1/streams/{stream_id}/detections` | Get latest detection results |

### WebRTC

```text
POST /api/v1/webrtc/offer
```

Used by the React frontend to perform WebRTC offer/answer negotiation with the FastAPI backend.

## Processing Flow

```text
Video File / Network Source
          ↓
       VideoSource
          ↓
     StreamManager
          ↓
    YOLO Detection
          ↓
   Detection Results
          ↓
     Runtime Metrics
          ↓
    FastAPI Services
          ↓
   ┌──────┴──────┐
   ↓             ↓
WebRTC       Detection API
   ↓             ↓
React Video   React Canvas
   └──────┬──────┘
          ↓
 Real-Time Detection View
```

## Runtime Recovery

VisionEdge includes WebRTC connection recovery.

When the WebRTC connection becomes disconnected or fails:

```text
WebRTC Connected
       ↓
Connection Lost
       ↓
Frontend Detects Failure
       ↓
Reconnect Attempt
       ↓
FastAPI/WebRTC Available
       ↓
WebRTC Negotiation
       ↓
Video Reconnected
```

The frontend prevents duplicate reconnect timers and retries the WebRTC connection after a short delay.

## Project Structure

```text
VisionEdge/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── pipelines/
│       ├── schemas/
│       ├── services/
│       └── sources/
│
├── src/
│   └── App.tsx
│
├── data/
│   └── videos/
│
├── README.md
└── package.json
```

## Running the Project

### Backend

Activate the Python virtual environment and run:

```powershell
python -m uvicorn backend.app.main:app --reload
```

The FastAPI backend runs on:

```text
http://127.0.0.1:8000
```

### Frontend

From the project root:

```powershell
npm run dev
```

The React development server runs on:

```text
http://localhost:5173/
```

## Current Development Status

The current implementation includes:

- [x] FastAPI backend
- [x] Asynchronous stream management
- [x] PyAV video processing
- [x] YOLO object detection
- [x] Detection API
- [x] WebRTC video delivery
- [x] WebRTC reconnection handling
- [x] Runtime performance metrics
- [x] React detection visualization
- [x] Stream start/stop lifecycle management

## Future Improvements

Potential future improvements include:

- Multi-camera stream management
- Further GPU/TensorRT optimization
- Extended performance benchmarking
- Additional detection classes
- Improved monitoring and telemetry
- Production deployment configuration