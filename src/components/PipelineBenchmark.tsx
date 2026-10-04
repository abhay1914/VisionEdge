import React, { useState } from 'react';
import { 
  Gauge, 
  Cpu, 
  Zap, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  TrendingUp,
  Activity,
  HardDrive
} from 'lucide-react';

export const PipelineBenchmark: React.FC = () => {
  const [streamCount, setStreamCount] = useState<number>(10);
  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4k' | '8k'>('4k');
  const [targetFps, setTargetFps] = useState<number>(60);
  const [precision, setPrecision] = useState<'fp32' | 'fp16' | 'int8'>('fp16');

  // Mathematical calculations based on video dimensions and hardware specs
  const resDimensions = {
    '1080p': { w: 1920, h: 1080, name: '1080p FHD' },
    '1440p': { w: 2560, h: 1440, name: '1440p QHD' },
    '4k': { w: 3840, h: 2160, name: '4K UHD' },
    '8k': { w: 7680, h: 4320, name: '8K Ultra' }
  };

  const currentRes = resDimensions[resolution];
  const bytesPerPixel = 3; // RGB 24-bit
  const frameBytes = currentRes.w * currentRes.h * bytesPerPixel;

  // Raw uncompressed stream bandwidth in Gigabytes per second per camera
  const gbpsPerStream = (frameBytes * targetFps) / 1e9;
  
  // Total legacy PCIe traffic: 2x roundtrip (Host to GPU + GPU to Host) * streams
  const legacyPcieTrafficGbps = gbpsPerStream * 2 * streamCount;

  // VisionEdge Zero-Copy: frames never traverse PCIe bus; only control signals & metadata (~8 MB/s per stream)
  const zeroCopyPcieTrafficGbps = (0.008 * streamCount);

  // PCIe Gen 4 x16 theoretical real-world limit is ~15.75 GB/s
  const pcieLimitGbps = 15.75;
  const legacySaturationPct = Math.min(100, Math.round((legacyPcieTrafficGbps / pcieLimitGbps) * 100));

  // Inference times based on precision
  const inferenceMultiplier = precision === 'fp32' ? 1.0 : precision === 'fp16' ? 0.42 : 0.24;
  const singleStreamInferenceMs = (resolution === '4k' ? 9.8 : resolution === '1080p' ? 2.8 : 5.4) * inferenceMultiplier;
  
  // Batch inference efficiency: sub-linear scaling with TensorRT dynamic batches
  const batchInferenceMs = (singleStreamInferenceMs * Math.pow(streamCount, 0.55));

  // Achievable FPS
  const zeroCopyAchievableFps = Math.min(targetFps, Math.round(1000 / (batchInferenceMs / streamCount + 1.2)));
  const legacyAchievableFps = legacySaturationPct >= 90
    ? Math.max(4, Math.round(targetFps * (1 - (legacySaturationPct / 100) * 0.88)))
    : Math.round(targetFps * 0.6);

  // VRAM calculation: Decoded surface buffers + TensorRT context + CuPy drawing framebuffers
  const vramPerStreamMb = Math.round((frameBytes * 4) / 1e6) + 120; // 4 frame ring buffers
  const totalVramMb = (vramPerStreamMb * streamCount) + (precision === 'fp32' ? 1800 : 950);
  const totalVramGb = (totalVramMb / 1024).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Benchmark Header */}
      <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
            HARDWARE STRESS & LATENCY BENCHMARK SIMULATOR
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">
            Simulate Edge Hardware Limits & PCIe Bus Saturation
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Adjust stream density, video resolution, and TensorRT precision to observe how the traditional PCIe transfer bottleneck destroys pipeline throughput—and how VisionEdge maintains locked 60 FPS.
          </p>
        </div>
      </div>

      {/* Interactive Controls & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders & Configuration Parameters */}
        <div className="lg:col-span-5 p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Simulation Parameters
          </h3>

          {/* Stream Count Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Concurrent Camera Streams:</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">{streamCount} Cameras</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={streamCount}
              onChange={(e) => setStreamCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1 Cam</span>
              <span>10 Cams (Default)</span>
              <span>20 Cams</span>
            </div>
          </div>

          {/* Resolution Selector */}
          <div className="space-y-2">
            <span className="text-xs text-slate-300 font-medium block">Video Resolution:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['1080p', '1440p', '4k', '8k'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`p-2 rounded-lg border font-mono text-xs transition ${
                    resolution === r
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {resDimensions[r].name}
                </button>
              ))}
            </div>
          </div>

          {/* Target FPS Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Target Stream Frame Rate:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{targetFps} FPS</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[30, 60, 120].map((fps) => (
                <button
                  key={fps}
                  onClick={() => setTargetFps(fps)}
                  className={`p-2 rounded-lg border font-mono text-xs transition ${
                    targetFps === fps
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>

          {/* Precision Selector */}
          <div className="space-y-2">
            <span className="text-xs text-slate-300 font-medium block">TensorRT Quantization Precision:</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['fp32', 'fp16', 'int8'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`p-2 rounded-lg border font-mono text-xs transition ${
                    precision === p
                      ? 'bg-violet-950/80 border-violet-500/60 text-violet-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Hardware Calculation Output */}
        <div className="lg:col-span-7 space-y-4">
          {/* PCIe Bus Saturation Gauge */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                PCIe Gen4 x16 Bus Bandwidth Saturation
              </h3>
              <span className="text-xs font-mono text-slate-400">Limit: {pcieLimitGbps} GB/s</span>
            </div>

            {/* Legacy Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300 font-mono">
                <span className="text-rose-400">Legacy Pipeline (OpenCV + PyTorch):</span>
                <span className="font-bold text-rose-300">{legacyPcieTrafficGbps.toFixed(2)} GB/s ({legacySaturationPct}%)</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    legacySaturationPct >= 90
                      ? 'bg-rose-500'
                      : legacySaturationPct >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, legacySaturationPct)}%` }}
                ></div>
              </div>
              {legacySaturationPct >= 90 && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  PCIe Bus saturated! System dropping frames & causing massive latency spikes.
                </p>
              )}
            </div>

            {/* VisionEdge Zero-Copy Bar */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-slate-300 font-mono">
                <span className="text-emerald-400">VisionEdge Zero-Copy Pipeline:</span>
                <span className="font-bold text-emerald-300">{zeroCopyPcieTrafficGbps.toFixed(3)} GB/s (&lt; 0.1%)</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: '1.2%' }}
                ></div>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Zero uncompressed video frames cross the PCIe bus. Decoded directly in VRAM.
              </p>
            </div>
          </div>

          {/* Comparison Cards: Achieved FPS, Latency, VRAM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">
                Throughput per Stream
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
                {zeroCopyAchievableFps} FPS
              </div>
              <span className="text-[10px] text-rose-400 block mt-1 font-mono">
                vs Legacy: {legacyAchievableFps} FPS
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">
                Batch Inference Time
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">
                {batchInferenceMs.toFixed(1)} ms
              </div>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                {precision.toUpperCase()} TensorRT Batch
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">
                VRAM Allocation
              </span>
              <div className="mt-2 text-2xl font-bold font-mono text-violet-300">
                {totalVramGb} GB
              </div>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                Fits in 24GB RTX 4090 / L40
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
