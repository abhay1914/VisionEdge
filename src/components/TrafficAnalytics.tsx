import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Car, 
  Users, 
  Bike, 
  Truck, 
  Gauge, 
  ArrowUpRight, 
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CameraStream } from '../types';

interface TrafficAnalyticsProps {
  streams: CameraStream[];
  isZeroCopy: boolean;
}

export const TrafficAnalytics: React.FC<TrafficAnalyticsProps> = ({ streams, isZeroCopy }) => {
  const totalVehicles = streams.reduce((acc, s) => acc + s.vehicleCount, 0);
  const totalPedestrians = streams.reduce((acc, s) => acc + s.pedestrianCount, 0);
  const avgSpeed = Math.round(streams.reduce((acc, s) => acc + s.avgSpeedKmh, 0) / streams.length);
  const totalDetections = streams.reduce((acc, s) => acc + s.activeDetections, 0);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Active Targets</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{totalDetections} Objects</div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Real-time YOLOv10 TensorRT tracking</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Vehicles in Grid</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{totalVehicles} Vehicles</div>
            <p className="text-[11px] text-slate-400 mt-1">Across 10 intersections</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Car className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Pedestrians & Cyclists</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{totalPedestrians} Vulnerable Users</div>
            <p className="text-[11px] text-slate-400 mt-1">Crosswalk safety priority zones</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
        </div>

        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Network Mean Velocity</span>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">{avgSpeed} km/h</div>
            <p className="text-[11px] text-emerald-400 mt-1">Free-flowing arterial traffic</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* 10 Intersection Flow Matrix */}
      <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            10-Intersection Live Flow & Telemetry Matrix
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Sampling: 60 FPS • Sub-100ms aiortc WebRTC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-3">Intersection</th>
                <th className="py-3 px-3">Zone</th>
                <th className="py-3 px-3">Resolution & Codec</th>
                <th className="py-3 px-3">NVDEC Core</th>
                <th className="py-3 px-3">Vehicles</th>
                <th className="py-3 px-3">Pedestrians</th>
                <th className="py-3 px-3">Avg Speed</th>
                <th className="py-3 px-3">Congestion</th>
                <th className="py-3 px-3 text-right">WebRTC Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              {streams.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
                    <span className="truncate max-w-55">{s.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{s.zone}</td>
                  <td className="py-3 px-3 text-slate-300">{s.resolution} • {s.codec}</td>
                  <td className="py-3 px-3 text-emerald-400">NVDEC #{s.nvdecInstance}</td>
                  <td className="py-3 px-3 font-bold text-cyan-300">{s.vehicleCount}</td>
                  <td className="py-3 px-3 font-bold text-violet-300">{s.pedestrianCount}</td>
                  <td className="py-3 px-3">{s.avgSpeedKmh} km/h</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.congestionLevel === 'HEAVY'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : s.congestionLevel === 'MODERATE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {s.congestionLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    {isZeroCopy ? `${s.webrtcLatencyMs} ms` : '320 ms'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
