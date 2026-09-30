import React from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  BarChart3, 
  Gauge, 
  Zap, 
  ShieldAlert,
  Server,
  MonitorPlay,
  Siren,
  MapPin,
  Compass,
  Sliders,
  Video
} from 'lucide-react';
import { PipelineTelemetry } from '../types';

export type OperatorTab = 
  | 'wall' 
  | 'map' 
  | 'preemption' 
  | 'silicon' 
  | 'tester' 
  | 'analytics' 
  | 'incidents' 
  | 'architecture' 
  | 'benchmark';

interface NavbarProps {
  activeTab: OperatorTab;
  setActiveTab: (tab: OperatorTab) => void;
  pipelineMode: 'zero-copy' | 'legacy';
  setPipelineMode: (mode: 'zero-copy' | 'legacy') => void;
  telemetry: PipelineTelemetry;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pipelineMode,
  setPipelineMode,
  telemetry,
}) => {
  const isZeroCopy = pipelineMode === 'zero-copy';

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-40 text-slate-100">
      {/* Top System Status Bar */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isZeroCopy ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isZeroCopy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-semibold tracking-wider text-slate-300">EDGE NODE:</span>
            <span className="font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
              edge-cluster-01 [NVIDIA RTX 4090 • 24GB VRAM]
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <span>NVDEC Gen5</span>
            <span className="text-slate-600">•</span>
            <span>TensorRT 10.1</span>
            <span className="text-slate-600">•</span>
            <span>CuPy Zero-Copy VRAM</span>
            <span className="text-slate-600">•</span>
            <span>aiortc WebRTC</span>
          </div>
        </div>

        {/* Real-time Hardware Telemetry Badges */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5" title="Aggregate FPS across all 10 cameras">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Total FPS:</span>
            <span className={`font-mono font-bold ${isZeroCopy ? 'text-cyan-300' : 'text-amber-400'}`}>
              {telemetry.aggregateFps.toFixed(1)} FPS
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="PCIe Bus Bandwidth Saturation">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">PCIe Bus:</span>
            <span className={`font-mono font-bold ${isZeroCopy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {telemetry.pcieBandwidthGbps.toFixed(2)} GB/s
              {!isZeroCopy && ' (Saturated!)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="WebRTC Glass-to-Glass Latency">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Latency:</span>
            <span className={`font-mono font-bold ${isZeroCopy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {telemetry.webrtcLatencyMs.toFixed(0)} ms
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5" title="GPU Temperature">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-slate-400">VRAM:</span>
            <span className="font-mono text-slate-200">
              {telemetry.gpuMemoryUsedGb.toFixed(1)} / {telemetry.gpuMemoryTotalGb} GB
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                VisionEdge
                <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Operations Center
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Smart-City Edge Video Operations Center • 10-Camera 4K 60FPS
            </p>
          </div>
        </div>

        {/* Center Tab Switcher: Pure Operator Tools */}
        <nav className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto max-w-[62vw] 2xl:max-w-none">
          <button
            id="tab-video-wall"
            onClick={() => setActiveTab('wall')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'wall'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>10-Cam Wall</span>
          </button>

          <button
            id="tab-city-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>City GIS Twin</span>
          </button>

          <button
            id="tab-preemption"
            onClick={() => setActiveTab('preemption')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'preemption'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Green Wave Corridor</span>
          </button>

          <button
            id="tab-silicon"
            onClick={() => setActiveTab('silicon')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'silicon'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>GPU Silicon & VRAM</span>
          </button>

          <button
            id="tab-tester"
            onClick={() => setActiveTab('tester')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'tester'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stream Tester</span>
          </button>

          <button
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Traffic Flow</span>
          </button>

          <button
            id="tab-incidents"
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'incidents'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Incidents</span>
          </button>

          <button
            id="tab-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture</span>
          </button>

          <button
            id="tab-benchmark"
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Benchmark</span>
          </button>
        </nav>

        {/* Mode Switcher: Zero-Copy vs Legacy */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            id="btn-mode-zero-copy"
            onClick={() => setPipelineMode('zero-copy')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isZeroCopy
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Copy Pipeline</span>
          </button>

          <button
            id="btn-mode-legacy"
            onClick={() => setPipelineMode('legacy')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              !isZeroCopy
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Legacy OpenCV CPU</span>
          </button>
        </div>
      </div>
    </header>
  );
};
