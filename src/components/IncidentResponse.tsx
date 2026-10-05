import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Siren, 
  Clock, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import { CameraStream } from '../types';

interface IncidentResponseProps {
  streams: CameraStream[];
  onTriggerAlert: (streamId: string) => void;
}

export const IncidentResponse: React.FC<IncidentResponseProps> = ({ streams, onTriggerAlert }) => {
  const [activeCorridors, setActiveCorridors] = useState<string[]>(['cam-04']);

  const toggleCorridor = (id: string) => {
    if (activeCorridors.includes(id)) {
      setActiveCorridors(activeCorridors.filter((c) => c !== id));
    } else {
      setActiveCorridors([...activeCorridors, id]);
      onTriggerAlert(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Incident Header */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-slate-900 to-amber-950/40 rounded-2xl border border-amber-800/40 relative overflow-hidden">
        <div className="max-w-3xl">
          <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700/60 flex items-center gap-1.5 w-fit">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            LIVE SMART-CITY INCIDENT & EMERGENCY MANAGEMENT
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-3">
            Edge AI Automated Priority Corridors & Safety Alerts
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            VisionEdge performs in-VRAM inference on YOLOv10 to identify emergency vehicles, hazardous cargo, and lane blockages in under 4 milliseconds, triggering traffic light controller (NTCIP) signal preemptions without cloud roundtrips.
          </p>
        </div>
      </div>

      {/* Active Corridors Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Feed */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Active Real-Time Incident Feed ({streams.reduce((a, s) => a + s.alerts.length, 0)} Events)
          </h3>

          <div className="space-y-2.5">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{stream.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                      {stream.zone}
                    </span>
                    {activeCorridors.includes(stream.id) && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <Siren className="w-3 h-3 text-emerald-400 animate-spin" />
                        GREEN CORRIDOR ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {stream.alerts.map((alert, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {alert}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => toggleCorridor(stream.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition shrink-0 flex items-center gap-1.5 ${
                    activeCorridors.includes(stream.id)
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <Siren className="w-3.5 h-3.5" />
                  <span>{activeCorridors.includes(stream.id) ? 'Deactivate Priority' : 'Engage Emergency Priority'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Autonomous Priority Dispatch */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Automated Signal Preemption
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an emergency vehicle is detected by the TensorRT engine with confidence &gt; 92%, VisionEdge directly invokes local Edge NTCIP 1202 controller protocols to extend green clearance intervals by 15-30 seconds.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Detection to Preempt Latency:</span>
                <span className="text-emerald-400 font-bold">14.2 ms</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>False Positive Rate:</span>
                <span className="text-emerald-400 font-bold">&lt; 0.02%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Controller Protocol:</span>
                <span className="text-cyan-300 font-bold">NTCIP 1202 v03</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              City Vision SLA Compliance
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>WebRTC Stream Availability</span>
                <span className="font-mono text-emerald-400 font-bold">99.999%</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Glass-to-Glass Latency SLA</span>
                <span className="font-mono text-emerald-400 font-bold">&lt; 100 ms (Actual 38ms)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>PCIe Bus Saturation Limit</span>
                <span className="font-mono text-emerald-400 font-bold">0.08 GB/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
