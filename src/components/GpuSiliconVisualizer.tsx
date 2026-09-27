import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Zap, 
  Activity, 
  Server, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { PipelineTelemetry } from '../types';

interface GpuSiliconVisualizerProps {
  telemetry: PipelineTelemetry;
  isZeroCopy: boolean;
}

export const GpuSiliconVisualizer: React.FC<GpuSiliconVisualizerProps> = ({
  telemetry,
  isZeroCopy,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>('framebuffers');

  // VRAM Allocator Breakdown for 24GB VRAM
  const memoryBlocks = [
    {
      id: 'framebuffers',
      name: '10x 4K UHD Surface Buffers',
      sizeMb: 1492,
      percentage: 6.2,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      description: 'Allocated by NVDEC hardware decoders. Stored directly as cudaArray_t device memory pointers (24.8 MB per frame * 6 buffers per stream ring buffer).',
      hostCopy: '0.00 MB',
    },
    {
      id: 'tensorrt',
      name: 'TensorRT YOLOv10x FP16 Weights & Context',
      sizeMb: 480,
      percentage: 2.0,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      description: 'Pre-compiled TensorRT execution context bindings. Tensor Core FP16 weights mapped directly into High-Bandwidth Memory (HBM) with zero host residency.',
      hostCopy: '0.00 MB',
    },
    {
      id: 'cupy',
      name: 'CuPy Zero-Copy Unowned Pointers',
      sizeMb: 120,
      percentage: 0.5,
      color: 'bg-violet-500',
      textColor: 'text-violet-400',
      description: 'Wraps raw device pointers from PyAV NVDEC surfaces via cp.cuda.UnownedMemory. No CUDA memory allocations or host mirrors created.',
      hostCopy: '0.00 MB',
    },
    {
      id: 'webrtc',
      name: 'aiortc WebRTC In-Flight GPU Queues',
      sizeMb: 210,
      percentage: 0.9,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      description: 'GPUVideoTrack async queues feeding the NVENC hardware encoder for low-latency browser WebRTC streaming.',
      hostCopy: '0.00 MB',
    },
    {
      id: 'free',
      name: 'Available Free GPU VRAM',
      sizeMb: 22268,
      percentage: 90.4,
      color: 'bg-slate-800',
      textColor: 'text-slate-400',
      description: 'Headroom available for additional 4K streams or multi-model ensemble pipelines (e.g. OCR license plate recognition or re-identification embeddings).',
      hostCopy: 'N/A',
    },
  ];

  const currentBlock = memoryBlocks.find((b) => b.id === selectedBlock) || memoryBlocks[0];

  return (
    <div className="space-y-6">
      {/* Silicon Overview Header */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>NVIDIA Silicon Architecture & VRAM Memory Map</span>
          </div>
          <h2 className="text-xl font-bold text-white">Zero-Copy Hardware Co-Processor Pipeline</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Inspect how the single 24GB GPU handles 10 concurrent 4K RTSP video decodes, FP16 Tensor Core inference, and in-VRAM box drawing without ever copying frames back to CPU RAM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Host Memory Copies:</span>
            <span className="font-mono text-lg font-bold text-emerald-400">0.00 MB / sec</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">PCIe 4.0 Saturation:</span>
            <span className="font-mono text-lg font-bold text-cyan-300">0.51% (0.08 GB/s)</span>
          </div>
        </div>
      </div>

      {/* GPU Silicon Layout Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Silicon Engine 1: NVDEC Dual Hardware Decoders */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">NVDEC Engines (Dual)</h3>
                <span className="text-[11px] text-slate-400">Dedicated Silicon Video Decoders</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              {telemetry.nvdecLoad.toFixed(1)}% LOAD
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Hardware decodes 10x H.265 4K bitstreams directly into GPU VRAM. The host CPU does zero video decompressing.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">NVDEC Instance #0:</span>
              <span className="text-emerald-400 font-bold">5 Streams (Cams 01, 03, 05, 07, 09)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">NVDEC Instance #1:</span>
              <span className="text-emerald-400 font-bold">5 Streams (Cams 02, 04, 06, 08, 10)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Surface Output:</span>
              <span className="text-cyan-300 font-bold">NV12 / BGR cudaArray_t</span>
            </div>
          </div>
        </div>

        {/* Silicon Engine 2: 4th-Gen Tensor Cores */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Tensor Cores (FP16)</h3>
                <span className="text-[11px] text-slate-400">Hardware Matrix Multiply Engines</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              {telemetry.gpuUtilization.toFixed(1)}% LOAD
            </span>
          </div>

          <p className="text-xs text-slate-400">
            NVIDIA TensorRT 10 compiles YOLOv10 into native CUDA kernels, fusing conv-batchnorm-silu layers for 4.2ms inference.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Execution Mode:</span>
              <span className="text-cyan-300 font-bold">execute_async_v3()</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Precision:</span>
              <span className="text-emerald-400 font-bold">FP16 Half Precision</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">CUDA Streams:</span>
              <span className="text-violet-300 font-bold">10 Non-Blocking Streams</span>
            </div>
          </div>
        </div>

        {/* Silicon Engine 3: CUDA In-VRAM Box Overlay Kernel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                <Layers className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">In-VRAM CUDA Kernel</h3>
                <span className="text-[11px] text-slate-400">Zero-Copy Box Stamping</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800">
              16x16 THREADS
            </span>
          </div>

          <p className="text-xs text-slate-400">
            A C++ CUDA RawKernel (`draw_bounding_boxes_kernel`) stamps boxes directly into the 4K framebuffer in GPU memory.
          </p>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">OpenCV CPU Stamping:</span>
              <span className="text-rose-400 font-bold line-through">cv2.rectangle (BANNED)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">CUDA RawKernel:</span>
              <span className="text-emerald-400 font-bold">Parallel VRAM Stamping</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Latency Cost:</span>
              <span className="text-emerald-400 font-bold">&lt; 0.15 ms per 4K frame</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24 GB VRAM Allocator Map */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>24 GB VRAM Device Memory Allocation Map</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              NVIDIA High-Bandwidth Memory (HBM3 / GDDR6X) Physical Distribution
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500">Allocated:</span>{' '}
              <span className="text-emerald-400 font-bold">2.30 GB</span>
            </div>
            <div>
              <span className="text-slate-500">Free Headroom:</span>{' '}
              <span className="text-slate-300 font-bold">21.70 GB (90.4%)</span>
            </div>
          </div>
        </div>

        {/* Visual Continuous Memory Bar */}
        <div className="space-y-2">
          <div className="w-full h-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex p-0.5 gap-0.5">
            {memoryBlocks.map((block) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                style={{ width: `${Math.max(block.percentage, 2)}%` }}
                className={`h-full ${block.color} transition-all duration-200 cursor-pointer rounded-sm hover:brightness-125 relative group`}
                title={`${block.name}: ${block.sizeMb} MB (${block.percentage}%)`}
              />
            ))}
          </div>

          {/* Interactive Legend Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {memoryBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  selectedBlock === block.id
                    ? 'bg-slate-800 border-slate-600 text-white shadow'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-sm ${block.color}`} />
                <span>{block.name}</span>
                <span className="text-slate-500">({block.sizeMb} MB)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Block Deep Details Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-bold font-mono ${currentBlock.textColor}`}>
              {currentBlock.name}
            </span>
            <span className="font-mono text-slate-400 font-bold">
              {currentBlock.sizeMb} MB • Host RAM Copy: {currentBlock.hostCopy}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            {currentBlock.description}
          </p>
        </div>
      </div>
    </div>
  );
};
