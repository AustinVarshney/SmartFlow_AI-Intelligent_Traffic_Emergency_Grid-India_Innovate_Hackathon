import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { SignalState, SimRoadState, SimVehicle, VehicleType } from "@/types/traffic-sim";

interface TrafficCameraSceneProps {
  roads: SimRoadState[];
  cameraIndex: number;
  cameraLabel: string;
}

const CAMERA_POSES: Array<{ position: [number, number, number]; lookAt: [number, number, number] }> = [
  { position: [0, 18, -30], lookAt: [0, 0.8, 6] },
  { position: [30, 18, 0], lookAt: [-6, 0.8, 0] },
  { position: [0, 18, 30], lookAt: [0, 0.8, -6] },
  { position: [-30, 18, 0], lookAt: [6, 0.8, 0] },
];

const LANE_ROTATION_Y = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];
const STOP_PROGRESS = 0.85;
const TURN_DELAY = 0.52;
const APPROACH_END_Z = -12.6;
const TURN_START_Z = -9.6;
const STOP_LINE_Z = -12.6;

const VEHICLE_STYLE: Record<
  VehicleType,
  {
    bodyColor: string;
    roofColor: string;
    accentColor: string;
    bodyScale: [number, number, number];
    roofScale: [number, number, number];
    roofOffset: [number, number, number];
    accentScale: [number, number, number];
    accentOffset: [number, number, number];
    windowScale: [number, number, number];
    windowOffset: [number, number, number];
    wheelRadius: number;
    wheelWidth: number;
    wheelX: number;
    wheelFrontZ: number;
    wheelRearZ: number;
  }
> = {
  car: {
    bodyColor: "#4b5563",
    roofColor: "#6b7280",
    accentColor: "#d1d5db",
    bodyScale: [1.04, 0.46, 1.02],
    roofScale: [0.66, 0.24, 0.56],
    roofOffset: [0, 0.34, -0.05],
    accentScale: [0.76, 0.03, 0.13],
    accentOffset: [0, 0.21, 0.46],
    windowScale: [0.5, 0.14, 0.35],
    windowOffset: [0, 0.39, -0.04],
    wheelRadius: 0.16,
    wheelWidth: 0.08,
    wheelX: 0.48,
    wheelFrontZ: 0.43,
    wheelRearZ: -0.38,
  },
  bus: {
    bodyColor: "#d97706",
    roofColor: "#92400e",
    accentColor: "#111827",
    bodyScale: [1.18, 0.62, 1.26],
    roofScale: [0.9, 0.2, 1.02],
    roofOffset: [0, 0.4, 0],
    accentScale: [0.9, 0.04, 0.24],
    accentOffset: [0, 0.22, 0.5],
    windowScale: [0.74, 0.14, 0.75],
    windowOffset: [0, 0.46, 0],
    wheelRadius: 0.2,
    wheelWidth: 0.1,
    wheelX: 0.56,
    wheelFrontZ: 0.56,
    wheelRearZ: -0.52,
  },
  bike: {
    bodyColor: "#374151",
    roofColor: "#1f2937",
    accentColor: "#a3e635",
    bodyScale: [0.48, 0.2, 0.72],
    roofScale: [0.2, 0.18, 0.15],
    roofOffset: [0, 0.25, -0.05],
    accentScale: [0.22, 0.04, 0.3],
    accentOffset: [0, 0.12, 0.18],
    windowScale: [0.01, 0.01, 0.01],
    windowOffset: [0, 0, 0],
    wheelRadius: 0.17,
    wheelWidth: 0.06,
    wheelX: 0.28,
    wheelFrontZ: 0.45,
    wheelRearZ: -0.45,
  },
  ambulance: {
    bodyColor: "#f3f4f6",
    roofColor: "#ffffff",
    accentColor: "#dc2626",
    bodyScale: [1.02, 0.56, 1.05],
    roofScale: [0.72, 0.24, 0.6],
    roofOffset: [0, 0.37, -0.02],
    accentScale: [0.96, 0.07, 0.14],
    accentOffset: [0, 0.52, 0.08],
    windowScale: [0.52, 0.14, 0.4],
    windowOffset: [0, 0.4, -0.04],
    wheelRadius: 0.17,
    wheelWidth: 0.09,
    wheelX: 0.5,
    wheelFrontZ: 0.45,
    wheelRearZ: -0.42,
  },
};

function signalColor(current: SignalState, lamp: SignalState) {
  if (current === lamp) {
    if (lamp === "red") return "#ef4444";
    if (lamp === "yellow") return "#fbbf24";
    return "#22c55e";
  }
  return "#2f2f2f";
}

function lampClass(lamp: SignalState, current: SignalState) {
  if (lamp === "red") {
    return current === lamp
      ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]"
      : "bg-red-950/70 border border-red-900/60";
  }
  if (lamp === "yellow") {
    return current === lamp
      ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]"
      : "bg-amber-900/65 border border-amber-800/60";
  }
  return current === lamp
    ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.9)]"
    : "bg-green-950/70 border border-green-900/60";
}

function signalBadgeClass(signal: SignalState) {
  if (signal === "green") {
    return "text-emerald-300 border-emerald-400/40 bg-emerald-500/15";
  }
  if (signal === "yellow") {
    return "text-amber-200 border-amber-300/40 bg-amber-500/15";
  }
  return "text-rose-200 border-rose-300/40 bg-rose-500/15";
}

function CameraFocus({ lookAt }: { lookAt: [number, number, number] }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
  }, [camera, lookAt]);

  return null;
}

function VehicleMesh({ vehicle }: { vehicle: SimVehicle }) {
  const style = VEHICLE_STYLE[vehicle.type];

  return (
    <group scale={[vehicle.width, 1, vehicle.length]}>
      <mesh scale={style.bodyScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={style.bodyColor} roughness={0.45} metalness={0.22} />
      </mesh>

      <mesh position={style.roofOffset} scale={style.roofScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={style.roofColor} roughness={0.36} metalness={0.18} />
      </mesh>

      <mesh position={style.accentOffset} scale={style.accentScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={style.accentColor}
          emissive={style.accentColor}
          emissiveIntensity={vehicle.type === "ambulance" ? 0.72 : 0.08}
        />
      </mesh>

      {vehicle.type !== "bike" && (
        <mesh position={style.windowOffset} scale={style.windowScale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#9ca3af" emissive="#1f2937" emissiveIntensity={0.22} roughness={0.2} metalness={0.45} />
        </mesh>
      )}

      <mesh position={[style.wheelX, 0.18, style.wheelFrontZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#1b1f27" roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[-style.wheelX, 0.18, style.wheelFrontZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#1b1f27" roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[style.wheelX, 0.18, style.wheelRearZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#1b1f27" roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[-style.wheelX, 0.18, style.wheelRearZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#1b1f27" roughness={0.8} metalness={0.05} />
      </mesh>
    </group>
  );
}

interface VehicleWorldTransform {
  x: number;
  z: number;
  yaw: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothStep(t: number) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

function vehicleTurnBucket(vehicleId: string) {
  let hash = 0;
  for (let i = 0; i < vehicleId.length; i += 1) {
    hash = (hash * 31 + vehicleId.charCodeAt(i)) >>> 0;
  }
  return hash % 10;
}

function vehicleTurnType(vehicleId: string): "left" | "straight" | "right" {
  const bucket = vehicleTurnBucket(vehicleId);
  if (bucket <= 1) return "left";
  if (bucket <= 7) return "straight";
  return "right";
}

function quadBezierPoint(
  p0: { x: number; z: number },
  p1: { x: number; z: number },
  p2: { x: number; z: number },
  t: number,
) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    z: u * u * p0.z + 2 * u * t * p1.z + t * t * p2.z,
  };
}

function quadBezierTangent(
  p0: { x: number; z: number },
  p1: { x: number; z: number },
  p2: { x: number; z: number },
  t: number,
) {
  return {
    dx: 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
    dz: 2 * (1 - t) * (p1.z - p0.z) + 2 * t * (p2.z - p1.z),
  };
}

function headingFromXZ(dx: number, dz: number) {
  return Math.atan2(dx, dz);
}

function getVehicleWorldTransform(
  vehicle: SimVehicle
): VehicleWorldTransform {
  const laneMagnitude = Math.abs(vehicle.laneOffset) > 2 ? 3 : 1;

  if (vehicle.isOutgoing) {
    const z = 8 - vehicle.progress * 88;
    const x = -laneMagnitude;
    const yaw = 0;
    return { x, z, yaw };
  }

  const x = laneMagnitude;
  const approachStartZ = -80;
  const approachEndZ = APPROACH_END_Z;
  const t = clamp(vehicle.progress, 0, 1);

  if (t <= STOP_PROGRESS) {
    const approachT = smoothStep(t / STOP_PROGRESS);
    const z = lerp(approachStartZ, approachEndZ, approachT);
    return { x, z, yaw: Math.PI };
  }

  const insideRaw = clamp((t - STOP_PROGRESS) / (1 - STOP_PROGRESS), 0, 1);
  const insideT = smoothStep(insideRaw);
  const turnType = vehicleTurnType(vehicle.id);

  if (turnType === "straight") {
    const z = lerp(approachEndZ, 48, insideT);
    return { x, z, yaw: Math.PI };
  }

  const turnStartZ = lerp(approachEndZ, TURN_START_Z, TURN_DELAY);
  if (insideRaw < TURN_DELAY) {
    const preTurnT = smoothStep(insideRaw / TURN_DELAY);
    const z = lerp(approachEndZ, turnStartZ, preTurnT);
    return { x, z, yaw: Math.PI };
  }

  const turnT = smoothStep(clamp((insideRaw - TURN_DELAY) / (1 - TURN_DELAY), 0, 1));

  if (turnType === "left") {
    const p0 = { x, z: turnStartZ };
    const p1 = { x: -6, z: 8 };
    const p2 = { x: -40, z: 22 };
    const pt = quadBezierPoint(p0, p1, p2, turnT);
    const tg = quadBezierTangent(p0, p1, p2, turnT);
    return { x: pt.x, z: pt.z, yaw: headingFromXZ(tg.dx, tg.dz) };
  }

  const p0 = { x, z: turnStartZ };
  const p1 = { x: 6, z: 8 };
  const p2 = { x: 40, z: 22 };
  const pt = quadBezierPoint(p0, p1, p2, turnT);
  const tg = quadBezierTangent(p0, p1, p2, turnT);
  const yaw = headingFromXZ(tg.dx, tg.dz);

  return { x: pt.x, z: pt.z, yaw };
}

function VehiclesLayer({ vehicles }: { vehicles: SimVehicle[] }) {
  return (
    <>
      {vehicles.map((vehicle) => {
        const world = getVehicleWorldTransform(vehicle);
        return (
          <group key={vehicle.id} position={[world.x, 0.38, world.z]} rotation={[0, world.yaw, 0]}>
            <VehicleMesh vehicle={vehicle} />
          </group>
        );
      })}
    </>
  );
}

function SignalPost({
  signal,
  position,
  rotationY = 0,
}: {
  signal: SignalState;
  position: [number, number, number];
  rotationY?: number;
}) {
  const redColor = signalColor(signal, "red");
  const yellowColor = signalColor(signal, "yellow");
  const greenColor = signalColor(signal, "green");

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main pole - very prominent */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[0.8, 6, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Traffic signal housing */}
      <mesh position={[0, 6.2, 0.5]}>
        <boxGeometry args={[2.4, 4, 1.4]} />
        <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Red signal lamp */}
      <mesh position={[0, 7.2, 0.5]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={redColor}
          emissive={redColor}
          emissiveIntensity={signal === "red" ? 1.5 : 0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Yellow signal lamp */}
      <mesh position={[0, 5.9, 0.5]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={yellowColor}
          emissive={yellowColor}
          emissiveIntensity={signal === "yellow" ? 1.5 : 0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Green signal lamp */}
      <mesh position={[0, 4.6, 0.5]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={greenColor}
          emissive={greenColor}
          emissiveIntensity={signal === "green" ? 1.5 : 0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Glow light */}
      <pointLight
        position={[0, 6, 0.5]}
        intensity={signal === "red" ? 3 : signal === "yellow" ? 2 : 3}
        color={signal === "red" ? "#ff0000" : signal === "yellow" ? "#ffff00" : "#00ff00"}
        distance={15}
        decay={2}
      />
    </group>
  );
}

function StopLineMarking({ z = STOP_LINE_Z }: { z?: number }) {
  return (
    <>
      {/* White stop line (always visible) */}
      <mesh position={[0, 0.11, z]}>
        <boxGeometry args={[14, 0.02, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

function Scene({ road, lookAt, laneIndex }: { road: SimRoadState; lookAt: [number, number, number]; laneIndex: number }) {
  const laneRotationY = LANE_ROTATION_Y[laneIndex] ?? 0;
  const sidePoleX = 10.8;
  const sidePoleZ = -10.8;
  const incomingViewX = 3;
  const incomingViewZ = -30;
  const signalYaw = headingFromXZ(incomingViewX - sidePoleX, incomingViewZ - sidePoleZ);

  // Create lane markers for visual reference.
  // Left side (x < 0): outgoing lanes, Right side (x > 0): incoming lanes.
  const laneMarkers = useMemo(() => {
    const markers: Array<{ x: number; z: number; y: number; sx: number; sz: number; color: string }> = [];

    // Left outgoing lanes (orange-tinted)
    for (let i = -4; i <= 100; i += 1) {
      markers.push({ x: -4, z: i * 1.5, y: 0.08, sx: 0.1, sz: 0.8, color: "#ff9800" });
    }

    // Right incoming lanes (blue-tinted)
    for (let i = -4; i <= 100; i += 1) {
      markers.push({ x: 4, z: i * 1.5, y: 0.08, sx: 0.1, sz: 0.8, color: "#6db3ff" });
    }

    return markers;
  }, []);

  return (
    <>
      <color attach="background" args={["#a8b5c0"]} />
      <fog attach="fog" args={["#a8b5c0", 150, 350]} />

      <ambientLight intensity={1} />
      <directionalLight position={[15, 28, 20]} intensity={1.6} />
      <pointLight position={[0, 12, 30]} intensity={0.5} color="#d6e8ff" />
      <CameraFocus lookAt={lookAt} />

      <group rotation={[0, laneRotationY, 0]}>
        {/* Ground - grass area */}
        <mesh position={[0, -0.3, 40]} receiveShadow>
          <boxGeometry args={[280, 0.15, 400]} />
          <meshStandardMaterial color="#7f9560" />
        </mesh>

        {/* Road surface */}
        <mesh position={[0, 0, 40]} receiveShadow>
          <boxGeometry args={[14, 0.12, 250]} />
          <meshStandardMaterial color="#3a3f48" roughness={0.95} />
        </mesh>

        {/* Outgoing section (left side) */}
        <mesh position={[-4, 0.01, 40]}>
          <boxGeometry args={[4, 0.11, 250]} />
          <meshStandardMaterial color="#46423c" roughness={0.95} />
        </mesh>

        {/* Incoming section (right side) */}
        <mesh position={[4, 0.01, 40]}>
          <boxGeometry args={[4, 0.11, 250]} />
          <meshStandardMaterial color="#3f4957" roughness={0.95} />
        </mesh>

        {/* Outer edges */}
        <mesh position={[-7.2, 0.02, 40]}>
          <boxGeometry args={[0.6, 0.08, 250]} />
          <meshStandardMaterial color="#5f6672" />
        </mesh>
        <mesh position={[7.2, 0.02, 40]}>
          <boxGeometry args={[0.6, 0.08, 250]} />
          <meshStandardMaterial color="#5f6672" />
        </mesh>

        {/* Center divider - yellow line */}
        <mesh position={[-0.2, 0.09, 40]}>
          <boxGeometry args={[0.2, 0.03, 250]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.2, 0.09, 40]}>
          <boxGeometry args={[0.2, 0.03, 250]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.4} />
        </mesh>

        {/* Section boundary markers */}
        <mesh position={[-7.2, 0.1, 40]}>
          <boxGeometry args={[0.2, 0.03, 250]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[7.2, 0.1, 40]}>
          <boxGeometry args={[0.2, 0.03, 250]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
        </mesh>

        {/* Lane divider markers */}
        {laneMarkers.map((marker, idx) => (
          <mesh key={`lane-${idx}`} position={[marker.x, marker.y, marker.z]}>
            <boxGeometry args={[marker.sx, 0.02, marker.sz]} />
            <meshStandardMaterial color={marker.color} emissive={marker.color} emissiveIntensity={0.15} />
          </mesh>
        ))}

        {/* Intersection area marking */}
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[14, 0.01, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>

        {/* Background plane */}
        <mesh position={[0, 0.06, 120]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 150]} />
          <meshStandardMaterial color="#a8b5c0" roughness={1} metalness={0} />
        </mesh>

        {/* One roadside signal per approach, aligned to incoming traffic direction. */}
        <SignalPost signal={road.signal} position={[sidePoleX, 0, sidePoleZ]} rotationY={signalYaw} />

        {/* Stop line marking at boundary edge */}
        <StopLineMarking z={STOP_LINE_Z} />

        {/* All vehicles moving towards intersection */}
        <VehiclesLayer vehicles={road.vehicles} />
      </group>

      <Environment preset="city" />
    </>
  );
}

export function TrafficCameraScene({ roads, cameraIndex, cameraLabel }: TrafficCameraSceneProps) {
  const focusRoad = roads[cameraIndex] ?? roads[0];
  const cameraPose = CAMERA_POSES[cameraIndex] ?? CAMERA_POSES[0];
  const timestamp = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-cyan-300/25 bg-slate-950 p-2 shadow-[0_0_0_1px_rgba(12,74,110,0.4),0_18px_38px_rgba(2,6,23,0.62)]">
      <div className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full border border-zinc-500/60 bg-zinc-800" />
      <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-zinc-500/60 bg-zinc-800" />
      <div className="absolute bottom-2 left-2 h-2.5 w-2.5 rounded-full border border-zinc-500/60 bg-zinc-800" />
      <div className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full border border-zinc-500/60 bg-zinc-800" />

      <div className="absolute left-3 right-3 top-3 z-30 flex items-center justify-between rounded-md border border-cyan-300/20 bg-slate-900/75 px-3 py-1.5 font-mono text-[11px] tracking-wide text-slate-200 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
          <span className="text-red-200">REC</span>
          <span className="text-slate-400">|</span>
          <span className="text-cyan-200">CTRL-CAM-{cameraIndex + 1}</span>
        </div>
        <span className="text-slate-300">{timestamp}</span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between rounded-md border border-cyan-300/20 bg-slate-950/75 px-3 py-2 font-mono text-[11px] text-slate-200 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">FEED</span>
          <span className="font-semibold tracking-wide text-white">{cameraLabel}</span>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${signalBadgeClass(focusRoad.signal)}`}>
            {focusRoad.signal.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <span>Queue {focusRoad.vehicles.length}</span>
          <span>Entered {focusRoad.vehicleCount}</span>
        </div>
      </div>

      <div className="absolute left-4 top-14 z-30 w-14.5 rounded-md border border-zinc-500/45 bg-zinc-900/80 p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm">
        <div className="flex flex-col items-center gap-1.5">
          <div className={`h-8 w-8 rounded-full ${lampClass("red", focusRoad.signal)}`} />
          <div className={`h-8 w-8 rounded-full ${lampClass("yellow", focusRoad.signal)}`} />
          <div className={`h-8 w-8 rounded-full ${lampClass("green", focusRoad.signal)}`} />
        </div>
      </div>

      <div className="relative h-full w-full overflow-hidden rounded-lg border border-cyan-200/20 bg-black">
        <Canvas
          shadows={false}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={[0.75, 1]}
          camera={{ position: cameraPose.position, fov: 35 }}
        >
          <Scene road={focusRoad} lookAt={cameraPose.lookAt} laneIndex={cameraIndex} />
        </Canvas>

        {/* Subtle scan and lens overlays make the scene feel like a monitor feed. */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(148,163,184,0.07)_0px,rgba(148,163,184,0.07)_1px,transparent_1px,transparent_3px)]" />
        <div className="animate-scanline pointer-events-none absolute inset-0 bg-linear-to-b from-cyan-200/0 via-cyan-100/10 to-cyan-200/0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(2,6,23,0.52)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.25)_0%,transparent_35%,transparent_65%,rgba(15,23,42,0.35)_100%)]" />
      </div>
    </div>
  );
}
