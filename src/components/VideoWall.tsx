import React, { useState } from 'react';
import { 
  Grid3X3, 
  LayoutGrid, 
  Square, 
  Eye, 
  Navigation, 
  Info, 
  Filter, 
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { CameraStream } from '../types';
import { CameraFeedCanvas } from './CameraFeedCanvas';
import { StreamDetailModal } from './StreamDetailModal';

interface VideoWallProps {
  streams: CameraStream[];
  isZeroCopy: boolean;
  onTriggerAlert: (streamId: string) => void;
}

export const VideoWall: React.FC<VideoWallProps> = ({
  streams,
  isZeroCopy,
  onTriggerAlert,
}) => {
  const [layout, setLayout] = useState<'grid10' | 'quad' | 'single'>('grid10');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [inspectedStream, setInspectedStream] = useState<CameraStream | null>(null);

  const zones = ['ALL', 'Zone Alpha', 'Zone Beta', 'Zone Gamma', 'Zone Delta', 'Zone Epsilon'];

  const filteredStreams = selectedZone === 'ALL'
    ? streams
    : streams.filter((s) => s.zone === selectedZone);

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Zone Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Zone:
          </span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setSelectedZone(z)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                  selectedZone === z
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Overlays Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              showBoxes
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>YOLOv10 Boxes</span>
          </button>

          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              showVectors
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Velocity Vectors</span>
          </button>

          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
              showTelemetry
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>NVDEC Stamp</span>
          </button>
        </div>

        {/* Right: Layout Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setLayout('grid10')}
            className={`p-1.5 rounded transition ${
              layout === 'grid10' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="10-Stream Mosaic View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('quad')}
            className={`p-1.5 rounded transition ${
              layout === 'quad' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="2x2 Quad View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('single')}
            className={`p-1.5 rounded transition ${
              layout === 'single' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Single Focus View"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notice Banner if in Legacy Mode */}
      {!isZeroCopy && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center justify-between text-xs text-rose-200 gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Legacy Pipeline Active:</strong> OpenCV CPU decoding (`cv2.VideoCapture`) is thrashing host RAM and saturating the PCIe 4.0 bus at 14.8 GB/s. Frames are stuttering at ~6.8 FPS with 300ms+ latency. Switch to <strong>VisionEdge Zero-Copy</strong> to unlock 60 FPS across all 10 cameras!
            </span>
          </div>
        </div>
      )}

      {/* Video Streams Container */}
      <div
        className={`grid gap-3 transition-all ${
          layout === 'grid10'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
            : layout === 'quad'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}
      >
        {filteredStreams.map((stream) => (
          <div
            key={stream.id}
            className={`transition-transform duration-200 ${
              layout === 'grid10' ? 'aspect-video' : layout === 'quad' ? 'aspect-video' : 'aspect-video'
            }`}
          >
            <CameraFeedCanvas
              stream={stream}
              isZeroCopy={isZeroCopy}
              showBoxes={showBoxes}
              showVectors={showVectors}
              showTelemetryOverlay={showTelemetry}
              onSelect={() => setInspectedStream(stream)}
              isCompact={layout === 'grid10'}
            />
          </div>
        ))}
      </div>

      {/* Stream Inspection Modal */}
      <StreamDetailModal
        stream={inspectedStream}
        isZeroCopy={isZeroCopy}
        onClose={() => setInspectedStream(null)}
        onTriggerAlert={onTriggerAlert}
      />
    </div>
  );
};
