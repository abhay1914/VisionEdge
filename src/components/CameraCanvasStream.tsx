import React, { useRef, useEffect } from "react";
import { CameraStatus } from "../types";

interface CameraCanvasStreamProps {
  camera: CameraStatus;
  isFocused?: boolean;
}

interface LocalVehicle {
  id: number;
  type: string;
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  w: number;
  h: number;
  speed: number;
  direction: "NORTH" | "SOUTH";
  is_emergency?: boolean;
  is_violating?: boolean;
  conf: number;
  color: string;
}

const TYPE_COLORS: Record<string, string> = {
  sedan: "#3b82f6",     // Blue
  suv: "#10b981",       // Emerald
  bus: "#f59e0b",       // Amber
  truck: "#8b5cf6",     // Purple
  motorcycle: "#ec4899",// Pink
  pedestrian: "#f43f5e",// Rose
  emergency: "#ef4444", // Bright Red
};

export const CameraCanvasStream: React.FC<CameraCanvasStreamProps> = ({ camera, isFocused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehiclesRef = useRef<LocalVehicle[]>([]);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const nextIdRef = useRef<number>(200);

  // Initialize or reconcile vehicles with server state
  useEffect(() => {
    if (camera.vehicles && camera.vehicles.length > 0) {
      // Map server vehicles into local vehicles
      const currentIds = new Set(vehiclesRef.current.map((v) => v.id));
      const updatedList = camera.vehicles.map((sv) => {
        const existing = vehiclesRef.current.find((v) => v.id === sv.id);
        const w = sv.bbox[2] - sv.bbox[0];
        const h = sv.bbox[3] - sv.bbox[1];
        if (existing) {
          // Smooth blend toward server y position
          existing.y = existing.y * 0.6 + sv.bbox[1] * 0.4;
          existing.speed = sv.speed;
          existing.is_violating = sv.is_violating;
          existing.is_emergency = sv.is_emergency;
          return existing;
        }
        return {
          id: sv.id,
          type: sv.type,
          x: sv.bbox[0],
          y: sv.bbox[1],
          w,
          h,
          speed: sv.speed,
          direction: sv.direction,
          is_emergency: sv.is_emergency,
          is_violating: sv.is_violating,
          conf: sv.conf,
          color: sv.is_emergency ? "#ef4444" : TYPE_COLORS[sv.type] || "#3b82f6",
        };
      });
      vehiclesRef.current = updatedList;
    } else if (vehiclesRef.current.length === 0) {
      // Seed initial local vehicles if none exist yet
      const types = ["sedan", "suv", "bus", "truck", "motorcycle", "pedestrian"];
      const seeded: LocalVehicle[] = [];
      for (let i = 0; i < 7; i++) {
        nextIdRef.current++;
        const type = types[Math.floor(Math.random() * types.length)];
        const dir = Math.random() > 0.5 ? "SOUTH" : "NORTH";
        const isPed = type === "pedestrian";
        const laneX = dir === "SOUTH" ? (Math.random() > 0.5 ? 0.38 : 0.44) : (Math.random() > 0.5 ? 0.54 : 0.60);
        const x = isPed ? 0.25 + Math.random() * 0.5 : laneX;
        const y = 0.15 + Math.random() * 0.7;
        const w = isPed ? 0.03 : type === "bus" || type === "truck" ? 0.065 : 0.048;
        const h = isPed ? 0.04 : type === "bus" || type === "truck" ? 0.12 : 0.075;

        seeded.push({
          id: nextIdRef.current,
          type,
          x,
          y,
          w,
          h,
          speed: isPed ? 18.0 : 35.0 + Math.random() * 25.0,
          direction: dir,
          conf: 0.93,
          color: TYPE_COLORS[type] || "#3b82f6",
        });
      }
      vehiclesRef.current = seeded;
    }
  }, [camera.vehicles]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      frameCountRef.current++;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Background Asphalt Roadway
      ctx.fillStyle = "#0f172a"; // dark environment
      ctx.fillRect(0, 0, width, height);

      // Main roadway
      const roadLeft = 70;
      const roadWidth = width - 140;
      ctx.fillStyle = "#1e2430"; // dark asphalt
      ctx.fillRect(roadLeft, 44, roadWidth, height - 70);

      // Cross street / Intersection box
      ctx.fillStyle = "#252c3b";
      ctx.fillRect(roadLeft, 115, roadWidth, 130);

      // Sidewalk curbs
      ctx.fillStyle = "#475569";
      ctx.fillRect(roadLeft - 6, 44, 6, height - 70);
      ctx.fillRect(roadLeft + roadWidth, 44, 6, height - 70);

      // Crosswalk zebra stripes
      ctx.fillStyle = "#cbd5e1";
      for (let x = roadLeft + 20; x < roadLeft + roadWidth - 20; x += 18) {
        ctx.fillRect(x, 108, 10, 8); // Top crosswalk
        ctx.fillRect(x, 244, 10, 8); // Bottom crosswalk
      }

      // Yellow Center Double Line
      const centerX = width / 2;
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 2;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.moveTo(centerX - 2, 44);
      ctx.lineTo(centerX - 2, height - 26);
      ctx.moveTo(centerX + 2, 44);
      ctx.lineTo(centerX + 2, height - 26);
      ctx.stroke();

      // White Lane Dividers
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 14]);
      ctx.beginPath();
      ctx.moveTo(centerX - 70, 44);
      ctx.lineTo(centerX - 70, height - 26);
      ctx.moveTo(centerX + 70, 44);
      ctx.lineTo(centerX + 70, height - 26);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Traffic Signal Light on Intersection Curb
      const signalX = roadLeft + roadWidth + 8;
      const signalY = 140;
      ctx.fillStyle = "#020617";
      ctx.fillRect(signalX, signalY, 18, 50);
      ctx.strokeStyle = "#334155";
      ctx.strokeRect(signalX, signalY, 18, 50);

      // Bulbs: Red, Yellow, Green
      const isRed = camera.signal_state === "RED";
      const isYellow = camera.signal_state === "YELLOW";
      const isGreen = camera.signal_state === "GREEN";

      // Red bulb
      ctx.fillStyle = isRed ? "#ef4444" : "#450a0a";
      ctx.beginPath();
      ctx.arc(signalX + 9, signalY + 10, 5, 0, Math.PI * 2);
      ctx.fill();
      if (isRed) {
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Yellow bulb
      ctx.fillStyle = isYellow ? "#facc15" : "#422006";
      ctx.beginPath();
      ctx.arc(signalX + 9, signalY + 25, 5, 0, Math.PI * 2);
      ctx.fill();
      if (isYellow) {
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Green bulb
      ctx.fillStyle = isGreen ? "#22c55e" : "#052e16";
      ctx.beginPath();
      ctx.arc(signalX + 9, signalY + 40, 5, 0, Math.PI * 2);
      ctx.fill();
      if (isGreen) {
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Physics Update & Render Vehicles
      const vehicles = vehiclesRef.current;
      const surviving: LocalVehicle[] = [];

      for (const veh of vehicles) {
        const isEmergency = veh.is_emergency;
        // Traffic light braking behavior
        const atStopLine = isRed && !isEmergency && veh.direction === "SOUTH" && veh.y > 0.22 && veh.y < 0.28;
        const atStopLineNorth = isRed && !isEmergency && veh.direction === "NORTH" && veh.y > 0.68 && veh.y < 0.74;

        if (!atStopLine && !atStopLineNorth) {
          const moveSpeed = (veh.speed / 100) * dt * (camera.fps < 20 ? 0.3 : 0.85);
          veh.y += veh.direction === "SOUTH" ? moveSpeed : -moveSpeed;
        }

        // Screen bounds check
        if (veh.y >= -0.15 && veh.y <= 1.15) {
          surviving.push(veh);
        }

        // Coordinates in pixels
        const px = veh.x * width;
        const py = veh.y * height;
        const pw = veh.w * width;
        const ph = veh.h * height;

        // Vehicle Chassis Shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(px + 2, py + 4, pw, ph);

        // Vehicle Body
        ctx.fillStyle = veh.color;
        ctx.fillRect(px, py, pw, ph);

        // Windshield & Details
        ctx.fillStyle = "#0f172a";
        if (veh.type === "pedestrian") {
          // Draw head circle
          ctx.beginPath();
          ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
          ctx.fillStyle = "#fed7aa";
          ctx.fill();
        } else {
          // Car roof / windshield
          const winY = veh.direction === "SOUTH" ? py + ph * 0.25 : py + ph * 0.55;
          ctx.fillRect(px + 3, winY, pw - 6, ph * 0.2);

          // Headlights
          const lightY = veh.direction === "SOUTH" ? py + ph - 2 : py;
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(px + 2, lightY, 4, 2);
          ctx.fillRect(px + pw - 6, lightY, 4, 2);

          // Taillights
          const tailY = veh.direction === "SOUTH" ? py : py + ph - 2;
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(px + 2, tailY, 4, 2);
          ctx.fillRect(px + pw - 6, tailY, 4, 2);

          // Emergency flashing lightbar
          if (veh.is_emergency) {
            const strobe = Math.floor(now / 120) % 2 === 0;
            ctx.fillStyle = strobe ? "#ef4444" : "#3b82f6";
            ctx.fillRect(px + pw * 0.3, py + ph * 0.45, pw * 0.4, 4);
            ctx.shadowColor = strobe ? "#ef4444" : "#3b82f6";
            ctx.shadowBlur = 10;
            ctx.fillRect(px + pw * 0.3, py + ph * 0.45, pw * 0.4, 4);
            ctx.shadowBlur = 0;
          }
        }

        // TensorRT AI Bounding Box Overlay
        const boxColor = veh.is_emergency ? "#ef4444" : veh.is_violating ? "#f59e0b" : veh.color;
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = veh.is_violating ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.12)";
        ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);
        ctx.strokeRect(px - 3, py - 3, pw + 6, ph + 6);

        // Corner brackets
        const cl = Math.min(8, pw * 0.3);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(px - 3, py + cl);
        ctx.lineTo(px - 3, py - 3);
        ctx.lineTo(px + cl, py - 3);
        // Top-right
        ctx.moveTo(px + pw + 3 - cl, py - 3);
        ctx.lineTo(px + pw + 3, py - 3);
        ctx.lineTo(px + pw + 3, py + cl);
        // Bottom-left
        ctx.moveTo(px - 3, py + ph + 3 - cl);
        ctx.lineTo(px - 3, py + ph + 3);
        ctx.lineTo(px + cl, py + ph + 3);
        // Bottom-right
        ctx.moveTo(px + pw + 3 - cl, py + ph + 3);
        ctx.lineTo(px + pw + 3, py + ph + 3);
        ctx.lineTo(px + pw + 3, py + ph + 3 - cl);
        ctx.stroke();

        // Label banner
        const tagText = veh.is_emergency
          ? `🚨 VIP AMBULANCE`
          : veh.is_violating
          ? `⚠️ VIOLATION #${veh.id}`
          : `#${veh.id} ${veh.type.toUpperCase()} ${Math.round(veh.conf * 100)}% | ${Math.round(veh.speed)} km/h`;

        ctx.font = "bold 9px monospace";
        const tagW = ctx.measureText(tagText).width + 6;
        const tagY = Math.max(12, py - 6);

        ctx.fillStyle = veh.is_emergency ? "#dc2626" : veh.is_violating ? "#d97706" : "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(px - 3, tagY - 10, tagW, 12);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(tagText, px, tagY - 1);
      }

      // Replenish traffic smoothly
      if (surviving.length < 8 && Math.random() < 0.05) {
        nextIdRef.current++;
        const types = ["sedan", "suv", "bus", "truck", "motorcycle"];
        const t = types[Math.floor(Math.random() * types.length)];
        const dir = Math.random() > 0.5 ? "SOUTH" : "NORTH";
        const lx = dir === "SOUTH" ? (Math.random() > 0.5 ? 0.38 : 0.44) : (Math.random() > 0.5 ? 0.54 : 0.60);
        surviving.push({
          id: nextIdRef.current,
          type: t,
          x: lx,
          y: dir === "SOUTH" ? -0.1 : 1.05,
          w: t === "bus" || t === "truck" ? 0.065 : 0.048,
          h: t === "bus" || t === "truck" ? 0.12 : 0.075,
          speed: 35.0 + Math.random() * 25.0,
          direction: dir,
          conf: 0.94,
          color: TYPE_COLORS[t] || "#3b82f6",
        });
      }
      vehiclesRef.current = surviving;

      // 3. Top HUD Banner
      ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
      ctx.fillRect(0, 0, width, 32);

      // Camera title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`VISIONEDGE 4K // ${camera.name.toUpperCase()}`, 12, 20);

      // Telemetry PTS & FPS
      const pts = Math.floor(now * 10);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px monospace";
      ctx.fillText(`PTS:${pts} | ${camera.fps} FPS`, width - 240, 20);

      // Pipeline mode tag
      const isZeroCopy = camera.fps > 30;
      ctx.fillStyle = isZeroCopy ? "#10b981" : "#ef4444";
      ctx.fillRect(width - 118, 6, 106, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText(isZeroCopy ? "ZERO-COPY VRAM" : "LEGACY CPU", width - 110, 20);

      // Bottom Alert Banner if incident is active
      if (camera.incident_active && camera.incident_msg) {
        ctx.fillStyle = "rgba(225, 29, 72, 0.92)";
        ctx.fillRect(10, height - 28, width - 20, 22);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`⚠️ ${camera.incident_msg}`, 20, height - 13);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [camera.name, camera.signal_state, camera.fps, camera.incident_active, camera.incident_msg]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full object-cover"
    />
  );
};
