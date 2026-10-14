import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Navigation, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Maximize2,
  Video,
  Radio,
  Eye
} from 'lucide-react';
import { CameraStream } from '../types';

interface CityGisMapProps {
  streams: CameraStream[];
  isZeroCopy: boolean;
  onSelectStream: (stream: CameraStream) => void;
  activeCorridorRoute?: string[];
}

export const CityGisMap: React.FC<CityGisMapProps> = ({
  streams,
  isZeroCopy,
  onSelectStream,
  activeCorridorRoute = ['cam-07', 'cam-10', 'cam-01', 'cam-03'],
}) => {
  const [selectedCam, setSelectedCam] = useState<CameraStream | null>(streams[0] || null);
  const [filterZone, setFilterZone] = useState<string>('ALL');
  const [showTrafficDensity, setShowTrafficDensity] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);
  const [showEmergencyVehicles, setShowEmergencyVehicles] = useState(true);

  // Animated traffic dots along arterial roads
  const [trafficTicks, setTrafficTicks] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTrafficTicks((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const filteredStreams = filterZone === 'ALL'
    ? streams
    : streams.filter((s) => s.zone === filterZone);

  // Arterial road segments connecting key cameras
  const roadSegments = [
    { from: 'cam-06', to: 'cam-05', name: 'West Expressway Corridor' },
    { from: 'cam-05', to: 'cam-03', name: 'Innovation Way' },
    { from: 'cam-03', to: 'cam-01', name: 'Central Boulevard' },
    { from: 'cam-01', to: 'cam-04', name: 'Market Street Commercial' },
    { from: 'cam-04', to: 'cam-02', name: 'Harbor Tunnel Link' },
    { from: 'cam-07', to: 'cam-10', name: 'Airport Parkway' },
    { from: 'cam-10', to: 'cam-01', name: 'Civic Hill Overpass' },
    { from: 'cam-10', to: 'cam-08', name: 'University Drive' },
    { from: 'cam-08', to: 'cam-09', name: 'Freight Logistics Highway' },
    { from: 'cam-04', to: 'cam-09', name: 'Port Access Arterial' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Filter & GIS Controls */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>METRO GIS SPATIAL TWIN</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['ALL', 'Zone Alpha', 'Zone Beta', 'Zone Gamma', 'Zone Delta', 'Zone Epsilon'].map((z) => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className={`px-2 py-1 rounded text-xs transition ${
                  filterZone === z ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowTrafficDensity(!showTrafficDensity)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              showTrafficDensity ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Flow Heatmaps</span>
          </button>

          <button
            onClick={() => setShowCorridor(!showCorridor)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              showCorridor ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Green Wave Corridors</span>
          </button>

          <button
            onClick={() => setShowEmergencyVehicles(!showEmergencyVehicles)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              showEmergencyVehicles ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>First Responders</span>
          </button>
        </div>
      </div>

      {/* Main Map + Side Feed Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Tactical Map SVG Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden shadow-2xl min-h-135">
          {/* Map Grid Pattern Background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#06b6d4 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0, 16px 16px'
            }}
          />

          {/* SVG Roads and Overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              {/* Glowing Route Filter */}
              <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="corridor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Base Road Network Lines */}
            {roadSegments.map((road, idx) => {
              const fromCam = streams.find((s) => s.id === road.from);
              const toCam = streams.find((s) => s.id === road.to);
              if (!fromCam || !toCam) return null;

              const x1 = `${fromCam.mapX ?? 50}%`;
              const y1 = `${fromCam.mapY ?? 50}%`;
              const x2 = `${toCam.mapX ?? 50}%`;
              const y2 = `${toCam.mapY ?? 50}%`;

              const isCorridor = showCorridor && 
                activeCorridorRoute.includes(road.from) && 
                activeCorridorRoute.includes(road.to);

              return (
                <g key={idx}>
                  {/* Road Base Underlay */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#1e293b"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Road Arterial Line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isCorridor ? 'url(#corridor-grad)' : '#334155'}
                    strokeWidth={isCorridor ? '4' : '2'}
                    strokeDasharray={isCorridor ? '8,4' : undefined}
                    filter={isCorridor ? 'url(#glow-green)' : undefined}
                    className={isCorridor ? 'animate-pulse' : ''}
                  />
                </g>
              );
            })}
          </svg>

          {/* Camera Intersection Pins */}
          {filteredStreams.map((stream) => {
            const isSelected = selectedCam?.id === stream.id;
            const isCongested = stream.congestionLevel === 'HEAVY' || stream.congestionLevel === 'CRITICAL';
            const isCorridorNode = showCorridor && activeCorridorRoute.includes(stream.id);

            return (
              <div
                key={stream.id}
                style={{
                  left: `${stream.mapX ?? 50}%`,
                  top: `${stream.mapY ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => setSelectedCam(stream)}
                className="absolute cursor-pointer group z-20"
              >
                {/* Ping animation for active emergency / alert nodes */}
                {(isCongested || isCorridorNode) && (
                  <span
                    className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                      isCorridorNode ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                )}

                {/* Pin Circle Button */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg border ${
                    isSelected
                      ? 'bg-emerald-500 text-white scale-125 border-emerald-300 ring-4 ring-emerald-500/30'
                      : isCorridorNode
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70 hover:scale-110'
                      : isCongested
                      ? 'bg-rose-950 text-rose-300 border-rose-600 hover:scale-110'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500 hover:scale-110'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>

                {/* Label Overlay Badge */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-30 transition-all opacity-80 group-hover:opacity-100">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold shadow-md border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}>
                    {stream.id.toUpperCase()} • {stream.activeDetections} det
                  </span>
                </div>
              </div>
            );
          })}

          {/* Map Compass & Legend Overlay */}
          <div className="absolute bottom-4 left-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs backdrop-blur space-y-2 z-10 pointer-events-auto">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Map Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Green Wave Corridor Preemption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">Heavy Traffic / Incident Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span className="text-slate-400">Smooth 60FPS NVDEC Flow</span>
            </div>
          </div>

          {/* GPS Coordinates & Node Telemetry Watermark */}
          <div className="absolute top-4 right-4 text-right font-mono text-[11px] text-slate-500">
            <div>GIS GRID: SF DOWNTOWN QUADRANT</div>
            <div>LAT 37.7749° N, LNG 122.4194° W</div>
            <div className="text-emerald-400 mt-1">10 / 10 CAMERAS SYNCED</div>
          </div>
        </div>

        {/* Selected Camera Popover / Live Inspection Panel */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-4 shadow-xl">
          {selectedCam ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      LIVE INTERSECTION FEED
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    NVDEC #{selectedCam.nvdecInstance}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{selectedCam.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCam.location}</p>
                </div>

                {/* Simulated Mini Camera Feed with Live Overlays */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-70"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, ${selectedCam.color}22 0%, #020617 80%)`,
                    }}
                  />
                  {/* Bounding Box Mock Overlay */}
                  <div 
                    className="absolute border border-emerald-400/80 bg-emerald-400/10 rounded px-1 text-[9px] font-mono text-emerald-300"
                    style={{ left: '22%', top: '35%', width: '28%', height: '38%' }}
                  >
                    Sedan 98% (48 km/h)
                  </div>
                  <div 
                    className="absolute border border-cyan-400/80 bg-cyan-400/10 rounded px-1 text-[9px] font-mono text-cyan-300"
                    style={{ right: '20%', top: '42%', width: '22%', height: '30%' }}
                  >
                    City Bus 96%
                  </div>

                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono text-white">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>60.0 FPS • 4K UHD</span>
                  </div>

                  <div className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Zero-Copy VRAM
                  </div>
                </div>

                {/* Live Real-Time Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Vehicles Tracked:</span>
                    <span className="text-white text-sm font-bold">{selectedCam.vehicleCount} units</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Speed:</span>
                    <span className="text-cyan-300 text-sm font-bold">{selectedCam.avgSpeedKmh} km/h</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Pedestrians:</span>
                    <span className="text-violet-300 text-sm font-bold">{selectedCam.pedestrianCount} in zone</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Inference Latency:</span>
                    <span className="text-emerald-400 text-sm font-bold">{selectedCam.inferenceTimeMs} ms</span>
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Active City Alerts:
                  </div>
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    {selectedCam.alerts.map((a, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-emerald-400">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button: Open Full 4K Inspector */}
              <button
                id="btn-inspect-camera"
                onClick={() => onSelectStream(selectedCam)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md hover:scale-[1.01]"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Open 4K Deep Inspector & PTZ</span>
              </button>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select a camera pin on the tactical map to view live feed and analytics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
