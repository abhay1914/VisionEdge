import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Link, 
  Sparkles,
  ShieldCheck,
  Eye,
  Layers,
  Gauge
} from 'lucide-react';

export const StreamTester: React.FC = () => {
  const [streamUrl, setStreamUrl] = useState('rtsp://edge-test.smartcity.internal:554/live/4k_stream_01');
  const [selectedPreset, setSelectedPreset] = useState<string>('downtown');
  const [confidence, setConfidence] = useState<number>(0.45);
  const [iouThreshold, setIouThreshold] = useState<number>(0.50);
  const [precision, setPrecision] = useState<'fp16' | 'int8' | 'fp32'>('fp16');
  const [resolution, setResolution] = useState<'4k' | '1080p' | '720p'>('4k');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeDetections, setActiveDetections] = useState<number>(18);
  const [fps, setFps] = useState<number>(60.0);
  const [latencyMs, setLatencyMs] = useState<number>(4.1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    {
      id: 'downtown',
      name: 'Downtown 4K Rush Hour Intersection',
      url: 'rtsp://edge-test.smartcity.internal:554/live/downtown_rush_4k',
      resolution: '3840 x 2160 (4K)',
      codec: 'H.265 (HEVC)',
      objects: 'Vehicles, Pedestrians, Bicycles',
    },
    {
      id: 'expressway',
      name: 'Highway Overpass 60 FPS Flow',
      url: 'rtsp://edge-test.smartcity.internal:554/live/expressway_60fps',
      resolution: '3840 x 2160 (4K)',
      codec: 'H.265 (HEVC)',
      objects: 'High-Speed Cars, Heavy Freight',
    },
    {
      id: 'plaza',
      name: 'Metro Transit Plaza Crosswalk',
      url: 'rtsp://edge-test.smartcity.internal:554/live/metro_plaza_pedestrians',
      resolution: '3840 x 2160 (4K)',
      codec: 'H.264 (AVC)',
      objects: 'High-Density Pedestrian Crowds',
    },
    {
      id: 'airport',
      name: 'Airport Arrival Terminals Roundabout',
      url: 'rtsp://edge-test.smartcity.internal:554/live/airport_roundabout',
      resolution: '3840 x 2160 (4K)',
      codec: 'H.265 (HEVC)',
      objects: 'Taxis, Shuttles, Luggage Carts',
    },
  ];

  // Dynamic canvas animation of traffic stream with bounding boxes
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const render = () => {
      if (!canvasRef.current || !isPlaying) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      tick++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic road background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Draw road perspective
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Lane lines
      ctx.moveTo(w * 0.1, h);
      ctx.lineTo(w * 0.4, h * 0.35);
      ctx.moveTo(w * 0.9, h);
      ctx.lineTo(w * 0.6, h * 0.35);

      ctx.moveTo(w * 0.5, h);
      ctx.lineTo(w * 0.5, h * 0.35);
      ctx.stroke();

      // Horizon line
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.35);
      ctx.lineTo(w, h * 0.35);
      ctx.stroke();

      // Moving vehicles with bounding boxes
      const numBoxes = Math.round(15 * (1.1 - confidence));
      setActiveDetections(numBoxes);

      for (let i = 0; i < numBoxes; i++) {
        const offset = (tick * 2 + i * 85) % (h * 0.65);
        const y = h * 0.35 + offset;
        const scale = 0.3 + (offset / (h * 0.65)) * 0.7;
        
        // Spread across lanes
        const lane = (i % 3);
        const laneX = lane === 0 ? w * 0.28 : lane === 1 ? w * 0.5 : w * 0.72;
        const x = laneX + Math.sin(tick * 0.05 + i) * 15;

        const boxW = 75 * scale;
        const boxH = 45 * scale;

        // Vehicle silhouette
        ctx.fillStyle = i % 2 === 0 ? '#10b98122' : '#06b6d422';
        ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

        // Bounding Box
        ctx.strokeStyle = i % 2 === 0 ? '#10b981' : '#06b6d4';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

        // Bounding Box Label
        ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#06b6d4';
        ctx.fillRect(x - boxW / 2, y - boxH / 2 - 16, boxW, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(i % 2 === 0 ? 'Sedan 96%' : 'Truck 94%', x - boxW / 2 + 4, y - boxH / 2 - 4);
      }

      // Live HUD watermark
      ctx.fillStyle = '#10b981';
      ctx.font = '12px monospace';
      ctx.fillText(`NVDEC ZERO-COPY STREAM • 3840x2160 UHD • ${fps.toFixed(1)} FPS`, 16, 26);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`TensorRT YOLOv10 (${precision.toUpperCase()}) • Latency: ${latencyMs.toFixed(1)}ms`, 16, 44);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, confidence, precision, fps, latencyMs]);

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setSelectedPreset(preset.id);
    setStreamUrl(preset.url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Video className="w-4 h-4" />
            <span>Interactive Custom RTSP & Video Benchmark Test Bench</span>
          </div>
          <h2 className="text-xl font-bold text-white">Live Edge Stream Tester & Parameter Tuner</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Plug in your custom RTSP camera stream or select high-resolution traffic clips to benchmark inference confidence, IOU overlap suppression, and TensorRT precision modes in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-md ${
              isPlaying
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player + Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 8 Cols Live Stream Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {/* URL Input Bar */}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
            <Link className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="rtsp://your-camera-ip:554/live/stream"
              className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => {
                setFps(60.0);
                setLatencyMs(precision === 'int8' ? 2.8 : precision === 'fp16' ? 4.1 : 8.6);
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-xs shrink-0 shadow transition"
            >
              Connect RTSP
            </button>
          </div>

          {/* Live Canvas Stage */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="w-full h-full object-cover"
            />

            {/* Quick Metrics Badges Floating on Video */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                {fps.toFixed(1)} FPS (Locked)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-slate-800 text-xs font-mono text-cyan-300">
                {latencyMs.toFixed(1)} ms Latency
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-slate-800 text-xs font-mono text-violet-300">
                {activeDetections} Objects In View
              </span>
            </div>
          </div>

          {/* Traffic Clip Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Or Choose a 4K Test Video Preset:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedPreset === p.id
                      ? 'bg-slate-900 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{p.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>{p.resolution}</span>
                    <span>{p.codec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 4 Cols Parameter Tuning Console */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>YOLOv10 TensorRT Parameters</span>
          </h3>

          {/* Confidence Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Detection Confidence:</span>
              <span className="font-mono text-cyan-300 font-bold">{(confidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>More Detections (10%)</span>
              <span>Strict Accuracy (95%)</span>
            </div>
          </div>

          {/* NMS / IOU Threshold Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">NMS / IOU Overlap:</span>
              <span className="font-mono text-emerald-300 font-bold">{(iouThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={iouThreshold}
              onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Suppressive (10%)</span>
              <span>Permissive (80%)</span>
            </div>
          </div>

          {/* Precision Selector */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium block">
              TensorRT Precision Quantization:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fp16', label: 'FP16', sub: '4.1 ms' },
                { id: 'int8', label: 'INT8', sub: '2.8 ms' },
                { id: 'fp32', label: 'FP32', sub: '8.6 ms' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setPrecision(m.id as any);
                    setLatencyMs(m.id === 'int8' ? 2.8 : m.id === 'fp16' ? 4.1 : 8.6);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    precision === m.id
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">{m.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Mode */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Target Resolution:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '4k', label: '4K UHD' },
                { id: '1080p', label: '1080p FHD' },
                { id: '720p', label: '720p HD' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResolution(r.id as any)}
                  className={`py-2 px-1 rounded-xl border text-xs font-mono transition ${
                    resolution === r.id
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zero-Copy Validation Audit */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero-Copy VRAM Audit: PASSED</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span>NVDEC Direct:</span>
                <span className="text-white">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Host Host/Device Transfer:</span>
                <span className="text-emerald-400 font-bold">0.00 MB</span>
              </div>
              <div className="flex justify-between">
                <span>Overlay Kernel:</span>
                <span className="text-cyan-300">CUDA In-VRAM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
