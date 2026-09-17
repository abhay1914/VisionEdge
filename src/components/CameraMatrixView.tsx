import React, { useState } from "react";
import { 
  Grid3X3, 
  LayoutGrid, 
  Maximize2, 
  Filter, 
  AlertOctagon, 
  ShieldAlert, 
  Activity,
  Sliders,
  ChevronLeft
} from "lucide-react";
import { CameraStatus, CameraLayout } from "../types";
import { CameraStreamCard } from "./CameraStreamCard";

interface CameraMatrixViewProps {
  cameras: CameraStatus[];
  onTriggerViolation: (camId: string) => void;
  onTriggerEmergency: (camId: string) => void;
}

export const CameraMatrixView: React.FC<CameraMatrixViewProps> = ({
  cameras,
  onTriggerViolation,
  onTriggerEmergency,
}) => {
  const [layout, setLayout] = useState<CameraLayout>("10-grid");
  const [focusedCamId, setFocusedCamId] = useState<string>("cam-01");
  const [filterMode, setFilterMode] = useState<"all" | "incidents" | "dense">("all");

  const filteredCameras = cameras.filter((cam) => {
    if (filterMode === "incidents") return cam.incident_active;
    if (filterMode === "dense") return cam.tracked_vehicles >= 8;
    return true;
  });

  const focusedCamera = cameras.find((c) => c.id === focusedCamId) || cameras[0];

  return (
    <div id="camera-matrix-view" className="space-y-4">
      {/* Control Bar: Layout Buttons & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Layout Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400 mr-1">LAYOUT:</span>
          <button
            id="btn-layout-10grid"
            onClick={() => setLayout("10-grid")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              layout === "10-grid"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>10-CAM GRID</span>
          </button>

          <button
            id="btn-layout-quad"
            onClick={() => setLayout("quad")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              layout === "quad"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>QUAD VIEW (4)</span>
          </button>

          <button
            id="btn-layout-focus"
            onClick={() => setLayout("focus")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              layout === "focus"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>4K INSPECTION</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono text-slate-400">FILTER:</span>
          {(["all", "incidents", "dense"] as const).map((mode) => (
            <button
              key={mode}
              id={`btn-filter-${mode}`}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                filterMode === mode
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === "all" ? "All (10)" : mode === "incidents" ? "Incidents" : "High Density"}
            </button>
          ))}
        </div>
      </div>

      {/* Focus 4K Detailed Inspection View */}
      {layout === "focus" && focusedCamera ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              id="btn-back-to-matrix"
              onClick={() => setLayout("10-grid")}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to 10-Camera Grid</span>
            </button>

            {/* Quick Camera Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {cameras.map((c) => (
                <button
                  key={c.id}
                  id={`btn-switch-cam-${c.id}`}
                  onClick={() => setFocusedCamId(c.id)}
                  className={`px-2 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                    focusedCamId === c.id
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Main 4K Stream View */}
            <div className="lg:col-span-2">
              <CameraStreamCard
                camera={focusedCamera}
                isFocused={true}
                onTriggerViolation={onTriggerViolation}
                onTriggerEmergency={onTriggerEmergency}
              />
            </div>

            {/* Right Col: Deep Inspection HUD */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-semibold text-white text-sm">INTERSECTION TELEMETRY</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    {focusedCamera.id.toUpperCase()}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Intersection Name:</span>
                    <span className="font-semibold text-white">{focusedCamera.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Municipal Zone:</span>
                    <span>{focusedCamera.zone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Lanes Monitored:</span>
                    <span>{focusedCamera.lanes} Active Lanes</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Signal Controller:</span>
                    <span className={`font-bold ${
                      focusedCamera.signal_state === "GREEN" ? "text-emerald-400" :
                      focusedCamera.signal_state === "YELLOW" ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {focusedCamera.signal_state} SIGNAL
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">VRAM Surface Pointer:</span>
                    <span className="text-emerald-400 font-mono">0x7F8E4000{focusedCamera.id.slice(-2)}00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">CUDA Stream ID:</span>
                    <span className="text-indigo-400">cudaStream_t: 0x0{focusedCamera.cuda_stream}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Live Bitrate:</span>
                    <span>{focusedCamera.bitrate_mbps} Mbps (NVENC H.264)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Glass-to-Glass Latency:</span>
                    <span className="text-cyan-400 font-bold">{focusedCamera.latency_ms} ms</span>
                  </div>
                </div>
              </div>

              {/* Operator Actions for this camera */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block font-semibold">EDGE OPERATOR ACTIONS:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-inspect-violation"
                    onClick={() => onTriggerViolation(focusedCamera.id)}
                    className="p-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Simulate Violation</span>
                  </button>

                  <button
                    id="btn-inspect-emergency"
                    onClick={() => onTriggerEmergency(focusedCamera.id)}
                    className="p-2 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>VIP Green-Wave</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Camera Grid (10-Grid or Quad View) */
        <div
          className={`grid gap-4 ${
            layout === "quad"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          }`}
        >
          {(layout === "quad" ? filteredCameras.slice(0, 4) : filteredCameras).map((cam) => (
            <CameraStreamCard
              key={cam.id}
              camera={cam}
              isFocused={focusedCamId === cam.id}
              onFocus={() => {
                setFocusedCamId(cam.id);
                setLayout("focus");
              }}
              onTriggerViolation={onTriggerViolation}
              onTriggerEmergency={onTriggerEmergency}
            />
          ))}
        </div>
      )}
    </div>
  );
};
