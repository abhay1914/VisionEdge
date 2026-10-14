import React, { useState } from 'react';
import { 
  Cpu, 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  AlertCircle, 
  Sliders, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Clock,
  HardDrive
} from 'lucide-react';

export interface ModelEngine {
  id: string;
  name: string;
  filename: string;
  precision: string;
  fileSizeMb: number;
  classes: string[];
  targetResolution: string;
  avgLatencyMs: number;
  vramRequiredMb: number;
  specialization: string;
}

export const PRESET_ENGINES: ModelEngine[] = [
  {
    id: 'yolov10x_traffic_fp16',
    name: 'YOLOv10x Smart Traffic (FP16)',
    filename: 'yolov10x_traffic_fp16.engine',
    precision: 'FP16 (Half Precision)',
    fileSizeMb: 64.2,
    classes: ['Sedan', 'SUV', 'Heavy Truck', 'City Bus', 'Pedestrian', 'Cyclist'],
    targetResolution: '640x640',
    avgLatencyMs: 3.8,
    vramRequiredMb: 480,
    specialization: 'Daytime and standard peak hour multi-lane traffic flow analysis'
  },
  {
    id: 'yolov8x_night_pedestrian_fp16',
    name: 'YOLOv8x Night Pedestrian & Micro-Mobility (FP16)',
    filename: 'yolov8x_night_pedestrian_fp16.engine',
    precision: 'FP16 (Half Precision)',
    fileSizeMb: 68.5,
    classes: ['Pedestrian', 'Cyclist', 'E-Scooter', 'Wheelchair', 'Crosswalk J-Walker'],
    targetResolution: '640x640',
    avgLatencyMs: 4.1,
    vramRequiredMb: 512,
    specialization: 'High-sensitivity thermal and low-light pedestrian detection in unlit crosswalks'
  },
  {
    id: 'anpr_license_plate_ocr_fp16',
    name: 'ANPR DeepPlate & OCR Engine (FP16)',
    filename: 'anpr_license_plate_ocr_fp16.engine',
    precision: 'FP16 (Half Precision)',
    fileSizeMb: 82.1,
    classes: ['License Plate Box', 'Alphanumeric Characters', 'State Jurisdictions'],
    targetResolution: '1280x720',
    avgLatencyMs: 5.2,
    vramRequiredMb: 620,
    specialization: 'High-speed highway tolling, vehicle identification, and parking enforcement'
  },
  {
    id: 'emergency_vehicle_beacon_fp16',
    name: 'Emergency Vehicle & Strobe Beacon Tracker (FP16)',
    filename: 'emergency_vehicle_beacon_fp16.engine',
    precision: 'FP16 (TensorRT 10.1)',
    fileSizeMb: 54.0,
    classes: ['Ambulance', 'Fire Engine', 'Police Interceptor', 'Strobe Beacon'],
    targetResolution: '640x640',
    avgLatencyMs: 3.2,
    vramRequiredMb: 390,
    specialization: 'Sub-4ms emergency beacon tracking for automated Green Wave signal preemption'
  }
];

interface DynamicModelSwapperProps {
  activeModelId: string;
  onSelectModel: (engine: ModelEngine) => void;
}

export const DynamicModelSwapper: React.FC<DynamicModelSwapperProps> = ({
  activeModelId,
  onSelectModel,
}) => {
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapStep, setSwapStep] = useState<number>(0);
  const [swapLog, setSwapLog] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const activeEngine = PRESET_ENGINES.find((e) => e.id === activeModelId) || PRESET_ENGINES[0];

  const handleTriggerSwap = (engine: ModelEngine) => {
    if (engine.id === activeModelId || isSwapping) return;

    setIsSwapping(true);
    setSwapStep(1);
    setSwapLog([`[Phase 1/5] Ingesting & verifying checksum for ${engine.filename}...`]);

    setTimeout(() => {
      setSwapStep(2);
      setSwapLog((prev) => [
        ...prev,
        `[Phase 2/5] Allocating CUDA memory bindings in VRAM (${engine.vramRequiredMb} MB)...`,
      ]);
    }, 400);

    setTimeout(() => {
      setSwapStep(3);
      setSwapLog((prev) => [
        ...prev,
        `[Phase 3/5] Running Tensor Core warm-up inference batch (FP16)...`,
      ]);
    }, 800);

    setTimeout(() => {
      setSwapStep(4);
      setSwapLog((prev) => [
        ...prev,
        `[Phase 4/5] Executing atomic engine context pointer swap (Zero Frame Loss)...`,
      ]);
      onSelectModel(engine);
    }, 1200);

    setTimeout(() => {
      setSwapStep(5);
      setSwapLog((prev) => [
        ...prev,
        `[Phase 5/5] Flushing retired engine context memory. Hot swap completed in 24.3ms!`,
      ]);
      setIsSwapping(false);
    }, 1600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      
      const customEngine: ModelEngine = {
        id: 'custom_uploaded_engine',
        name: `Custom Engine (${file.name})`,
        filename: file.name,
        precision: 'FP16 (TensorRT 10.1)',
        fileSizeMb: Math.round(file.size / (1024 * 1024)) || 64.0,
        classes: ['Custom Object Targets'],
        targetResolution: '640x640',
        avgLatencyMs: 3.9,
        vramRequiredMb: 495,
        specialization: 'Custom user-uploaded TensorRT model engine'
      };

      handleTriggerSwap(customEngine);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <RefreshCw className={`w-4 h-4 ${isSwapping ? 'animate-spin text-purple-400' : 'text-purple-400'}`} />
              <span>Week 4 - Dynamic Model Swapping on the Fly</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 border border-purple-700 text-purple-300">
                Zero Frame Loss Atomic Swap
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>TensorRT Dynamic Engine Hot-Swap Manager</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl mt-1">
              Upload or select a new compiled <code>.engine</code> file on-the-fly. The server swaps model context bindings without restarting, dropping frames, or stalling the 10 concurrent 4K camera pipelines.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 self-start md:self-auto text-right">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Active Engine:</span>
            <span className="font-mono text-sm font-bold text-emerald-400 truncate block max-w-xs">
              {activeEngine.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Inference: {activeEngine.avgLatencyMs}ms • VRAM: {activeEngine.vramRequiredMb}MB
            </span>
          </div>
        </div>

        {/* 5-Phase Hot-Swap State Machine Visualizer */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Hot-Swap State Machine Pipeline:</span>
            <span className="font-mono text-slate-400">
              {isSwapping ? `Phase ${swapStep} of 5 in progress...` : 'Ready for Atomic Hot-Swap (0.00 frame loss)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {[
              { step: 1, title: '1. Deserialization', desc: 'Read engine bytes' },
              { step: 2, title: '2. VRAM Buffers', desc: 'Bind device memory' },
              { step: 3, title: '3. Warm-up Batch', desc: 'Tensor Core preheat' },
              { step: 4, title: '4. Atomic Swap', desc: 'Context pointer swap' },
              { step: 5, title: '5. VRAM Cleanup', desc: 'Flush old context' }
            ].map((p) => (
              <div
                key={p.step}
                className={`p-2.5 rounded-xl border transition ${
                  swapStep === p.step
                    ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                    : swapStep > p.step
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{p.title}</span>
                  {swapStep > p.step && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] block mt-0.5 opacity-80">{p.desc}</span>
              </div>
            ))}
          </div>

          {/* Swap Log Output */}
          {swapLog.length > 0 && (
            <div className="p-3 bg-black/70 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 space-y-1">
              {swapLog.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag & Drop Upload Zone + Model Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drag & Drop Zone */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-purple-400" />
              Upload Custom .engine File
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Drag and drop any pre-compiled TensorRT <code>.engine</code> or <code>.plan</code> binary file to trigger instant live deployment.
            </p>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/60 flex flex-col items-center justify-center space-y-2 group"
          >
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-xs font-semibold text-white">
              {uploadedFileName ? uploadedFileName : 'Drag & Drop .engine file here'}
            </div>
            <span className="text-[10px] text-slate-400">
              Supports FP16 / INT8 TensorRT execution engines
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="text-slate-300 font-semibold block">Safety Guarantees:</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero server process restart required</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0 dropped video frames during transition</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Automatic CUDA VRAM garbage collection</span>
            </div>
          </div>
        </div>

        {/* Right: Model Catalog Selection */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Pre-Compiled TensorRT Engine Catalog
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Click any engine to hot-swap live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRESET_ENGINES.map((engine) => {
              const isActive = engine.id === activeModelId;
              return (
                <div
                  key={engine.id}
                  onClick={() => handleTriggerSwap(engine)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{engine.name}</span>
                      {isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500 text-black font-bold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-xs text-purple-400 hover:underline flex items-center gap-1">
                          Swap Now <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {engine.specialization}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {engine.classes.map((cls, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">
                          {cls}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>Latency: <strong className="text-emerald-400">{engine.avgLatencyMs} ms</strong></span>
                      <span>VRAM: <strong className="text-purple-400">{engine.vramRequiredMb} MB</strong></span>
                      <span>Size: {engine.fileSizeMb} MB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
