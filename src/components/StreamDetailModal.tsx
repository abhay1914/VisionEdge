import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Cpu, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Copy, 
  Check, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Filter,
  Eye,
  Navigation,
  Flame
} from 'lucide-react';
import { CameraStream } from '../types';
import { CameraFeedCanvas } from './CameraFeedCanvas';

interface StreamDetailModalProps {
  stream: CameraStream | null;
  isZeroCopy: boolean;
  onClose: () => void;
  onTriggerAlert: (streamId: string) => void;
}

export const StreamDetailModal: React.FC<StreamDetailModalProps> = ({
  stream,
  isZeroCopy,
  onClose,
  onTriggerAlert,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'tensorrt' | 'detections' | 'webrtc'>('telemetry');
  
  // Digital PTZ (Pan / Tilt / Zoom) State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Live Detection Filter Toggles
  const [filterSedans, setFilterSedans] = useState(true);
  const [filterTrucks, setFilterTrucks] = useState(true);
  const [filterPedestrians, setFilterPedestrians] = useState(true);
  const [filterCyclists, setFilterCyclists] = useState(true);
  const [filterEmergency, setFilterEmergency] = useState(true);
  const [showSpeedHeatmap, setShowSpeedHeatmap] = useState(false);
  const [showVectors, setShowVectors] = useState(true);

  if (!stream) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(stream.rtspUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(Number((prev + delta).toFixed(1)), 1), 4));
  };

  const handleResetPtz = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Video className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{stream.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {stream.zone}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  NVDEC Engine #{stream.nvdecInstance}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{stream.rtspUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Copy RTSP Stream URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied RTSP' : 'Copy RTSP'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* PTZ Toolbar & Detection Filters */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Digital PTZ Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                Digital PTZ:
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 font-mono">
                {[1, 1.5, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setZoomLevel(lvl)}
                    className={`px-2 py-0.5 rounded text-xs transition ${
                      zoomLevel === lvl
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleZoom(-0.5)}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom(0.5)}
                  disabled={zoomLevel >= 4}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetPtz}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  title="Reset PTZ (1.0x)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Filter Toggles */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterSedans(!filterSedans)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
                  filterSedans ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Cars ({stream.vehicleCount})
              </button>
              <button
                onClick={() => setFilterTrucks(!filterTrucks)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
                  filterTrucks ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Trucks & Buses
              </button>
              <button
                onClick={() => setFilterPedestrians(!filterPedestrians)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
                  filterPedestrians ? 'bg-violet-950 text-violet-300 border-violet-700' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                Pedestrians ({stream.pedestrianCount})
              </button>
              <button
                onClick={() => setShowVectors(!showVectors)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
                  showVectors ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span>Vectors</span>
              </button>
              <button
                onClick={() => setShowSpeedHeatmap(!showSpeedHeatmap)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition ${
                  showSpeedHeatmap ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Heatmap</span>
              </button>
            </div>
          </div>

          {/* Main 4K Canvas Stream with PTZ Transformation */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-black">
            <div 
              style={{
                transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
              }}
              className="w-full h-full"
            >
              <CameraFeedCanvas
                stream={stream}
                isZeroCopy={isZeroCopy}
                showBoxes={true}
                showVectors={showVectors}
                showTelemetryOverlay={true}
                isCompact={false}
              />
            </div>

            {/* PTZ Zoom Badge on Top-Right */}
            {zoomLevel > 1 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shadow-lg">
                DIGITAL PTZ: {zoomLevel.toFixed(1)}x ZOOM ACTIVE
              </div>
            )}
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'telemetry' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hardware Telemetry
              </button>
              <button
                onClick={() => setActiveTab('tensorrt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'tensorrt' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TensorRT Execution Graph
              </button>
              <button
                onClick={() => setActiveTab('webrtc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'webrtc' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                aiortc WebRTC Stats
              </button>
            </div>

            <button
              onClick={() => onTriggerAlert(stream.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Emergency Clearance Priority</span>
            </button>
          </div>

          {/* Tab 1: Hardware Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>NVDEC Decoder Status</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {isZeroCopy ? 'DIRECT VRAM' : 'CPU FALLBACK'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isZeroCopy ? 'Decoding directly to cudaArray_t surface' : 'Heavy cv2.VideoCapture decode on host'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Stream Throughput</span>
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-bold font-mono text-cyan-300">
                  {isZeroCopy ? `${stream.fps}.0 FPS` : '6.8 FPS (Choked)'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {stream.resolution} • {stream.codec}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>VRAM Allocation</span>
                  <Cpu className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-xl font-bold font-mono text-violet-300">
                  {stream.vramUsageMb} MB
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pointer: 0x7f{stream.id.replace('cam-', '')}a9b00000 (CuPy)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Pipeline Latency</span>
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-300">
                  {isZeroCopy ? `${stream.inferenceTimeMs} ms` : '312 ms'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isZeroCopy ? 'TensorRT FP16 Tensor Cores' : 'PCIe bus host-device copy delay'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: TensorRT Execution Graph */}
          {activeTab === 'tensorrt' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Hardware-Compiled Engine: yolov10x_4k_fp16.engine
                </h4>
                <span className="text-xs font-mono text-emerald-400">FP16 Tensor Cores Enabled</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Input Tensor Shape:</span>
                  <span className="font-mono text-cyan-300 font-bold">[10, 3, 640, 640]</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Preprocessed in VRAM via CuPy</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">CUDA Stream:</span>
                  <span className="font-mono text-emerald-300 font-bold">non_blocking=True (Stream #{stream.nvdecInstance})</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Async launch without CPU sync barrier</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Inference Kernel Latency:</span>
                  <span className="font-mono text-amber-300 font-bold">{stream.inferenceTimeMs} ms / batch</span>
                  <span className="text-[10px] text-slate-500 block mt-1">500 iterations benchmark avg</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: WebRTC Stats */}
          {activeTab === 'webrtc' && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>WebRTC Session: aiortc PeerConnection</span>
                <span className="text-emerald-400">STATE: CONNECTED</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Round-Trip Time (RTT):</span>
                  <span className="text-white font-bold">{stream.webrtcLatencyMs} ms</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Hardware Encoder:</span>
                  <span className="text-white font-bold">NVENC H.264</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Transport Bitrate:</span>
                  <span className="text-white font-bold">{stream.bitrateMbps} Mbps</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Packet Loss:</span>
                  <span className="text-emerald-400 font-bold">0.00%</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Traffic Alerts */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Active Edge AI Smart-City Intelligence Events
            </h4>
            <div className="flex flex-wrap gap-2">
              {stream.alerts.map((alert, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs bg-slate-800/90 text-slate-300 border border-slate-700 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {alert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
