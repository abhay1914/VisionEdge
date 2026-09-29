import React, { useState, useEffect } from 'react';
import { 
  Siren, 
  Zap, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  AlertOctagon, 
  Play, 
  RotateCcw,
  Navigation,
  Car
} from 'lucide-react';
import { CameraStream } from '../types';

interface EmergencyPreemptionProps {
  streams: CameraStream[];
  onTriggerAlert: (streamId: string) => void;
}

export const EmergencyPreemption: React.FC<EmergencyPreemptionProps> = ({
  streams,
  onTriggerAlert,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<'ambulance' | 'fire' | 'police'>('ambulance');
  const [selectedRouteKey, setSelectedRouteKey] = useState<'corridorA' | 'corridorB' | 'corridorC'>('corridorA');
  const [isPreemptionActive, setIsPreemptionActive] = useState(false);
  const [vehicleProgress, setVehicleProgress] = useState(0); // 0 to 100%
  const [timeSavedSec, setTimeSavedSec] = useState(0);

  const routes = {
    corridorA: {
      name: 'Airport Trauma Link (Expressway -> Hospital)',
      cameraIds: ['cam-07', 'cam-10', 'cam-01', 'cam-03'],
      distanceKm: 8.4,
      normalTimeMin: 14.5,
      preemptTimeMin: 4.8,
    },
    corridorB: {
      name: 'Interstate 12 Ingress -> Downtown Core',
      cameraIds: ['cam-06', 'cam-05', 'cam-03'],
      distanceKm: 6.2,
      normalTimeMin: 11.0,
      preemptTimeMin: 3.9,
    },
    corridorC: {
      name: 'Harbor Logistics -> Metro Central Hub',
      cameraIds: ['cam-09', 'cam-08', 'cam-04', 'cam-02'],
      distanceKm: 7.8,
      normalTimeMin: 13.2,
      preemptTimeMin: 4.1,
    },
  };

  const activeRoute = routes[selectedRouteKey];
  const routeCameras = activeRoute.cameraIds.map((id) => streams.find((s) => s.id === id)!).filter(Boolean);

  // Animation loop when preemption is engaged
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPreemptionActive) {
      interval = setInterval(() => {
        setVehicleProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 2.5;
        });
        setTimeSavedSec((prev) => prev + 5);
      }, 300);
    } else {
      setVehicleProgress(0);
      setTimeSavedSec(0);
    }
    return () => clearInterval(interval);
  }, [isPreemptionActive]);

  const handleTogglePreemption = () => {
    if (!isPreemptionActive) {
      setIsPreemptionActive(true);
      setVehicleProgress(0);
      setTimeSavedSec(0);
      // Trigger alert on all route cameras
      activeRoute.cameraIds.forEach((id) => onTriggerAlert(id));
    } else {
      setIsPreemptionActive(false);
      setVehicleProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Siren className="w-4 h-4 animate-bounce" />
            <span>NVIDIA Metropolis • Automated Green Wave Signal Preemption</span>
          </div>
          <h2 className="text-xl font-bold text-white">Emergency Vehicle Priority Corridor</h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            When first responders are detected at 60 FPS by edge camera nodes, TensorRT triggers smart signal controllers to clear cross-traffic and illuminate a continuous green wave corridor, reducing transit delays by up to 68%.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-preemption"
            onClick={handleTogglePreemption}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:scale-105 active:scale-95 ${
              isPreemptionActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
            }`}
          >
            {isPreemptionActive ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin-slow" />
                <span>DISENGAGE PREEMPTION</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>ACTIVATE GREEN WAVE PREEMPTION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Corridor Configuration & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Settings */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Select First Responder Unit
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedVehicle('ambulance')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                selectedVehicle === 'ambulance'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Siren className="w-5 h-5 text-rose-400" />
              <span>Ambulance</span>
              <span className="text-[10px] text-slate-500">Med-01</span>
            </button>

            <button
              onClick={() => setSelectedVehicle('fire')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                selectedVehicle === 'fire'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Fire Engine</span>
              <span className="text-[10px] text-slate-500">Rescue 12</span>
            </button>

            <button
              onClick={() => setSelectedVehicle('police')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                selectedVehicle === 'police'
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Car className="w-5 h-5 text-cyan-400" />
              <span>Police Unit</span>
              <span className="text-[10px] text-slate-500">Intercept 07</span>
            </button>
          </div>

          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pt-2">
            2. Active Emergency Route
          </h3>

          <div className="space-y-2">
            {(Object.keys(routes) as Array<keyof typeof routes>).map((key) => {
              const r = routes[key];
              const isSelected = selectedRouteKey === key;
              return (
                <div
                  key={key}
                  onClick={() => {
                    if (!isPreemptionActive) setSelectedRouteKey(key);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{r.name}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">-{Math.round(((r.normalTimeMin - r.preemptTimeMin) / r.normalTimeMin) * 100)}% Time</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                    <span>{r.distanceKm} km</span>
                    <span>•</span>
                    <span>{r.cameraIds.length} Intersections</span>
                    <span>•</span>
                    <span>ETA: {r.preemptTimeMin} min</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Savings Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="text-slate-400 font-medium">Predicted Response Impact:</div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Standard Traffic Time:</span>
              <span className="text-rose-400 line-through">{activeRoute.normalTimeMin} min</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-emerald-400 font-bold">Green Wave Time:</span>
              <span className="text-emerald-400 font-bold text-sm">{activeRoute.preemptTimeMin} min</span>
            </div>
            <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800 text-[11px]">
              <span className="text-slate-500">Calculated Time Saved:</span>
              <span className="text-cyan-300">{(activeRoute.normalTimeMin - activeRoute.preemptTimeMin).toFixed(1)} minutes</span>
            </div>
          </div>
        </div>

        {/* Center & Right: Live Corridor Intersections Progression */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Live Signal Corridor Progression</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {activeRoute.name} ({activeRoute.distanceKm} km)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">CORRIDOR STATUS:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                isPreemptionActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}>
                {isPreemptionActive ? 'ALL-GREEN PREEMPTION ACTIVE' : 'STANDARD CYCLES'}
              </span>
            </div>
          </div>

          {/* Vehicle Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Siren className={`w-3.5 h-3.5 ${isPreemptionActive ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
                <span>Responder En Route ({vehicleProgress.toFixed(0)}% Completed)</span>
              </div>
              <span>Time Saved: +{timeSavedSec}s</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
              <div
                className="h-full bg-linear-to-r from-emerald-500 via-cyan-400 to-rose-500 transition-all duration-300 rounded-full"
                style={{ width: `${vehicleProgress}%` }}
              />
            </div>
          </div>

          {/* Node Cards along the Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {routeCameras.map((cam, idx) => {
              const nodePercent = (idx / (routeCameras.length - 1)) * 100;
              const isCleared = isPreemptionActive && vehicleProgress >= nodePercent;
              const isApproaching = isPreemptionActive && !isCleared && vehicleProgress >= nodePercent - 25;

              return (
                <div
                  key={cam.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isApproaching
                      ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : isCleared
                      ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                      : isPreemptionActive
                      ? 'bg-slate-950/80 border-emerald-900/50 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-white">{cam.id.toUpperCase()}</span>
                    </div>

                    {/* Signal Light Indicator */}
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isPreemptionActive ? 'bg-emerald-400 animate-pulse shadow-md shadow-emerald-500/50' : 'bg-slate-700'
                      }`} />
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {isPreemptionActive ? 'GREEN (HELD)' : 'CYCLING'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-medium text-slate-200 truncate">{cam.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{cam.location}</div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Crosswalk Clear:</span>
                    <span className="text-emerald-400 font-bold">LOCKED RED</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                    <span className="text-slate-500">Cross-Traffic:</span>
                    <span className="text-rose-400 font-bold">STOPPED (Phase 4)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connected SCATS/NTCIP Controller Protocol Logs */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>NTCIP 1202 Traffic Signal Controller Protocol Telemetry</span>
            </div>
            <div className="text-slate-500 text-[10px]">
              [00:23:41] Edge Node #01 sent PREEMPT_REQUEST to NTCIP Signal Controllers on Corridor A.
            </div>
            <div className="text-slate-500 text-[10px]">
              [00:23:42] Intersection Cam-07 confirmed GREEN EXTENSION (+45s) • Pedestrian hold active.
            </div>
            <div className="text-emerald-400 text-[10px]">
              [00:23:43] Corridor A cleared of queue vehicles • Average approach velocity: 68 km/h.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
