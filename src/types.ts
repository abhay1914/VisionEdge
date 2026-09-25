export interface CameraStream {
  id: string;
  name: string;
  location: string;
  zone: string;
  resolution: string;
  fps: number;
  codec: 'H.265 (HEVC)' | 'H.264 (AVC)';
  bitrateMbps: number;
  nvdecInstance: number;
  rtspUrl: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  activeDetections: number;
  vehicleCount: number;
  pedestrianCount: number;
  avgSpeedKmh: number;
  congestionLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'CRITICAL';
  alerts: string[];
  vramUsageMb: number;
  inferenceTimeMs: number;
  webrtcLatencyMs: number;
  color: string;
  mapX?: number;
  mapY?: number;
  lat?: number;
  lng?: number;
}

export interface DetectionObject {
  id: string;
  label: 'Sedan' | 'SUV' | 'Heavy Truck' | 'City Bus' | 'Pedestrian' | 'Cyclist' | 'Emergency Vehicle';
  confidence: number;
  x: number; // 0 to 1 normalized
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  speedKmh: number;
  lane: number;
  highlight?: boolean;
  color: string;
}

export interface PipelineTelemetry {
  timestamp: number;
  mode: 'zero-copy' | 'legacy';
  activeStreams: number;
  aggregateFps: number;
  gpuModel: string;
  gpuUtilization: number; // %
  gpuMemoryUsedGb: number;
  gpuMemoryTotalGb: number;
  gpuTemperatureC: number;
  nvdecLoad: number; // %
  nvencLoad: number; // %
  pcieBandwidthGbps: number;
  pcieBandwidthLimitGbps: number;
  cpuUtilization: number; // %
  pipelineLatencyMs: number;
  webrtcLatencyMs: number;
  frameDrops: number;
}
