import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  ArrowRight, 
  Cpu, 
  Server, 
  Layers, 
  CheckCircle2, 
  XCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  HardDrive
} from 'lucide-react';

export const ArchitectureFlow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'pcie' | 'vram'>('comparison');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
            SYSTEM ARCHITECTURE & ZERO-COPY VRAM PIPELINE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">
            Bypassing the CPU & Eliminating the PCIe Bus Bottleneck
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            In standard computer vision backends (OpenCV + PyTorch), decoding high-resolution 4K video consumes massive CPU cycles, and constantly copying uncompressed arrays back and forth across the PCIe bus chokes bandwidth. VisionEdge locks video frames entirely inside NVIDIA GPU VRAM from demux to WebRTC streaming.
          </p>
        </div>
      </div>

      {/* Side-by-Side Architectural Flowcharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legacy Bottleneck Architecture */}
        <div className="p-5 bg-slate-900/70 rounded-2xl border border-rose-900/40 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-900/30">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Legacy Pipeline (OpenCV + PyTorch)</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-rose-950 text-rose-300 border border-rose-800">
                Severe PCIe Choke
              </span>
            </div>

            {/* Step-by-Step Flow */}
            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
                  <span>10x 4K RTSP Video Streams</span>
                </div>
                <span className="text-slate-500">H.264/H.265</span>
              </div>

              {/* Step 2: CPU Decode */}
              <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/40">
                <div className="flex items-center justify-between text-rose-300 font-semibold">
                  <span>2. Host CPU Decode (cv2.VideoCapture)</span>
                  <span className="text-rose-400 font-bold">CPU 99% Overload</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  CPU software decodes 10x 4K frames into numpy arrays in host RAM. Single core saturates immediately.
                </p>
              </div>

              {/* Choke 1: PCIe Copy 1 */}
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/40">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span>⚠️ PCIe Transfer #1: Host RAM ➔ GPU VRAM</span>
                  <span className="text-amber-400 font-bold">7.46 GB/s</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  10 streams * (3840x2160x3 bytes) * 60 FPS = massive raw uncompressed memory transit across bus.
                </p>
              </div>

              {/* Step 3: GPU Inference */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-slate-300">
                  <span>3. PyTorch Inference (torch.nn)</span>
                  <span className="text-slate-400">YOLO Model</span>
                </div>
              </div>

              {/* Choke 2: PCIe Copy 2 */}
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/40">
                <div className="flex items-center justify-between text-amber-300 font-semibold">
                  <span>⚠️ PCIe Transfer #2: GPU VRAM ➔ Host RAM</span>
                  <span className="text-amber-400 font-bold">7.46 GB/s</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Must download tensor frames back to host CPU to draw bounding boxes using OpenCV `cv2.rectangle`.
                </p>
              </div>

              {/* Step 4: CPU Drawing & Encode */}
              <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/40">
                <div className="flex items-center justify-between text-rose-300 font-semibold">
                  <span>4. CPU Box Annotation & WebRTC</span>
                  <span className="text-rose-400 font-bold">Total Latency: 340ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Metric Badges */}
          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-rose-900/30">
              <span className="text-[11px] text-slate-400 block">Total Throughput:</span>
              <span className="text-lg font-bold font-mono text-rose-400">6.8 FPS / cam</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-rose-900/30">
              <span className="text-[11px] text-slate-400 block">Total PCIe Bandwidth:</span>
              <span className="text-lg font-bold font-mono text-rose-400">14.92 GB/s</span>
            </div>
          </div>
        </div>

        {/* VisionEdge Zero-Copy Architecture */}
        <div className="p-5 bg-slate-900/70 rounded-2xl border border-emerald-900/50 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">VisionEdge Zero-Copy Architecture</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                0 GB/s PCIe Video Load
              </span>
            </div>

            {/* Step-by-Step Flow */}
            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-[10px]">1</span>
                  <span>10x 4K RTSP Video Streams</span>
                </div>
                <span className="text-emerald-400">H.265 Bitstream</span>
              </div>

              {/* Step 2: NVDEC Decode in VRAM */}
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
                <div className="flex items-center justify-between text-emerald-300 font-semibold">
                  <span>2. Hardware NVDEC Decoder (PyAV)</span>
                  <span className="text-emerald-400 font-bold">Direct to VRAM</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  NVDEC hardware engine decodes directly into GPU memory as <code className="text-emerald-300">cudaArray_t</code>. Host CPU is untouched.
                </p>
              </div>

              {/* Zero-Copy Bus */}
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/30 flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">⚡ PCIe Video Bandwidth Traversed:</span>
                <span className="text-emerald-300 font-bold font-mono">0.00 GB/s</span>
              </div>

              {/* Step 3: TensorRT Engine */}
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
                <div className="flex items-center justify-between text-emerald-300 font-semibold">
                  <span>3. TensorRT 10 Execution Graph</span>
                  <span className="text-emerald-400 font-bold">4.2ms FP16 Batched</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  YOLOv10 compiled engine takes CuPy GPU pointer directly. Asynchronous CUDA stream execution without CPU wait locks.
                </p>
              </div>

              {/* Step 4: CuPy In-VRAM Drawing */}
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
                <div className="flex items-center justify-between text-emerald-300 font-semibold">
                  <span>4. In-VRAM Drawing Kernel (CuPy)</span>
                  <span className="text-emerald-400 font-bold">Sub-microsecond</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Custom CUDA RawKernel renders anti-aliased bounding boxes directly into the VRAM frame buffer. Zero CPU roundtrip!
                </p>
              </div>

              {/* Step 5: WebRTC NVENC */}
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
                <div className="flex items-center justify-between text-emerald-300 font-semibold">
                  <span>5. Hardware NVENC Encode ➔ aiortc</span>
                  <span className="text-emerald-400 font-bold">Latency: 38ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Metric Badges */}
          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-900/40">
              <span className="text-[11px] text-slate-400 block">Total Throughput:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">60.0 FPS / cam</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-900/40">
              <span className="text-[11px] text-slate-400 block">Total PCIe Bandwidth:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">0.08 GB/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Architectural Comparison Table */}
      <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Technical Metric Breakdown: Legacy vs VisionEdge Zero-Copy
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-4">Pipeline Metric</th>
                <th className="py-3 px-4 text-rose-400">Legacy (OpenCV + PyTorch)</th>
                <th className="py-3 px-4 text-emerald-400">VisionEdge (NVDEC + CuPy + TensorRT)</th>
                <th className="py-3 px-4 text-cyan-400">Improvement Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Video Decoding Method</td>
                <td className="py-3 px-4 text-rose-300">CPU libavcodec (Software)</td>
                <td className="py-3 px-4 text-emerald-300">NVIDIA NVDEC Gen 5 (Hardware ASIC)</td>
                <td className="py-3 px-4 text-cyan-300">100% CPU Offload</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">PCIe Bus Bandwidth (10x 4K)</td>
                <td className="py-3 px-4 text-rose-300">14.92 GB/s (Bus Saturated)</td>
                <td className="py-3 px-4 text-emerald-300">0.08 GB/s (Control signals only)</td>
                <td className="py-3 px-4 text-cyan-300">186x Reduction</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Frame Rate per 4K Camera</td>
                <td className="py-3 px-4 text-rose-300">6.8 FPS (Heavy Frame Drops)</td>
                <td className="py-3 px-4 text-emerald-300">60.0 FPS (Deterministic)</td>
                <td className="py-3 px-4 text-cyan-300">8.8x Higher Throughput</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Host CPU Utilization</td>
                <td className="py-3 px-4 text-rose-300">99.1% (All Cores Pegged)</td>
                <td className="py-3 px-4 text-emerald-300">9.4% (AsyncIO Event Loop)</td>
                <td className="py-3 px-4 text-cyan-300">10.5x Less CPU Load</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Glass-to-Glass Latency</td>
                <td className="py-3 px-4 text-rose-300">340 ms (Unusable for real-time)</td>
                <td className="py-3 px-4 text-emerald-300">38 ms (Sub-100ms ultra-low)</td>
                <td className="py-3 px-4 text-cyan-300">9x Lower Latency</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-white">Bounding Box Annotation</td>
                <td className="py-3 px-4 text-rose-300">cv2.rectangle (Host CPU RAM)</td>
                <td className="py-3 px-4 text-emerald-300">CuPy RawKernel (Direct in VRAM)</td>
                <td className="py-3 px-4 text-cyan-300">Zero Host Roundtrips</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
