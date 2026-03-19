import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassPanel } from "@/components/GlassPanel";
import { useTrafficSim } from "@/context/TrafficSimContext";
import type { VehicleType } from "@/types/traffic-sim";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Database, Download, Camera, Tag, CarFront, Bus, Bike, Ambulance } from "lucide-react";

const VEHICLE_CLASSES: Array<{
  type: VehicleType;
  label: string;
  color: string;
  sizeHint: string;
  detectorClassId: number;
  icon: typeof CarFront;
}> = [
  { type: "car", label: "Car", color: "#4b5563", sizeHint: "medium", detectorClassId: 0, icon: CarFront },
  { type: "bus", label: "Bus", color: "#d97706", sizeHint: "large", detectorClassId: 1, icon: Bus },
  { type: "bike", label: "Bike", color: "#374151", sizeHint: "small", detectorClassId: 2, icon: Bike },
  { type: "ambulance", label: "Ambulance", color: "#f3f4f6", sizeHint: "medium", detectorClassId: 3, icon: Ambulance },
];

const PREVIEW_STYLE: Record<
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
    wheelRadius: 0.17,
    wheelWidth: 0.09,
    wheelX: 0.5,
    wheelFrontZ: 0.45,
    wheelRearZ: -0.42,
  },
};

function VehiclePreviewMesh({ type }: { type: VehicleType }) {
  const style = PREVIEW_STYLE[type];

  useFrame((state) => {
    state.scene.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.35) * 0.5;
  });

  return (
    <group scale={[1.9, 1.9, 1.9]}>
      <mesh position={[0, -0.02, 0]} scale={style.bodyScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={style.bodyColor} roughness={0.45} metalness={0.2} />
      </mesh>

      <mesh position={style.roofOffset} scale={style.roofScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={style.roofColor} roughness={0.36} metalness={0.18} />
      </mesh>

      <mesh position={style.accentOffset} scale={style.accentScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={style.accentColor} emissive={style.accentColor} emissiveIntensity={type === "ambulance" ? 0.62 : 0.1} />
      </mesh>

      <mesh position={[style.wheelX, 0.14, style.wheelFrontZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#171717" roughness={0.84} metalness={0.06} />
      </mesh>
      <mesh position={[-style.wheelX, 0.14, style.wheelFrontZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#171717" roughness={0.84} metalness={0.06} />
      </mesh>
      <mesh position={[style.wheelX, 0.14, style.wheelRearZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#171717" roughness={0.84} metalness={0.06} />
      </mesh>
      <mesh position={[-style.wheelX, 0.14, style.wheelRearZ]} rotation={[Math.PI / 2, 0, 0]} scale={[style.wheelRadius, style.wheelWidth, style.wheelRadius]}>
        <cylinderGeometry args={[1, 1, 1, 14]} />
        <meshStandardMaterial color="#171717" roughness={0.84} metalness={0.06} />
      </mesh>
    </group>
  );
}

function Vehicle3DPhoto({ type }: { type: VehicleType }) {
  return (
    <div className="h-[170px] w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950/80">
      <Canvas dpr={[0.8, 1.2]} camera={{ position: [2.8, 1.7, 3], fov: 35 }}>
        <color attach="background" args={["#0b1220"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3.4, 4.5, 2.5]} intensity={1.25} />
        <directionalLight position={[-2.6, 2.2, -2.6]} intensity={0.42} color="#9ad2ff" />

        <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#132136" roughness={0.95} />
        </mesh>

        <VehiclePreviewMesh type={type} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}

export default function Dataset() {
  const { state } = useTrafficSim();

  const liveVehicles = useMemo(() => {
    return state.roads.flatMap((road, roadIndex) =>
      road.vehicles.map((vehicle) => ({
        id: vehicle.id,
        laneLabel: road.label,
        laneIndex: roadIndex,
        signal: road.signal,
        type: vehicle.type,
        progress: Number(vehicle.progress.toFixed(3)),
        direction: vehicle.isOutgoing ? "outgoing" : "incoming",
        speed: Number(vehicle.speed.toFixed(3)),
        length: Number(vehicle.length.toFixed(2)),
        width: Number(vehicle.width.toFixed(2)),
      })),
    );
  }, [state.roads]);

  const classStats = useMemo(() => {
    return VEHICLE_CLASSES.map((cls) => {
      const count = liveVehicles.filter((vehicle) => vehicle.type === cls.type).length;
      return { ...cls, count };
    });
  }, [liveVehicles]);

  const datasetPayload = useMemo(() => {
    return {
      exportedAt: new Date().toISOString(),
      source: "smartflow-simulation",
      classes: VEHICLE_CLASSES.map((cls) => ({
        classId: cls.detectorClassId,
        type: cls.type,
        label: cls.label,
        displayColor: cls.color,
        sizeHint: cls.sizeHint,
      })),
      samples: liveVehicles,
    };
  }, [liveVehicles]);

  function exportDatasetJson() {
    const blob = new Blob([JSON.stringify(datasetPayload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartflow-vehicle-dataset-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  return (
    <AppLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">MODEL DATASET HUB</h1>
          <p className="text-muted-foreground font-mono text-sm">SIMULATION VEHICLE CLASSES + LIVE SAMPLES FOR DETECTION TRAINING</p>
        </div>
        <button
          onClick={exportDatasetJson}
          className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Dataset JSON
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {classStats.map((cls) => {
          const Icon = cls.icon;
          return (
            <GlassPanel key={cls.type} className="p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: cls.color }} />
                  <h2 className="text-base font-display font-semibold">{cls.label}</h2>
                </div>
                <span className="text-xs font-mono rounded border border-white/15 bg-white/5 px-2 py-1">
                  ID {cls.detectorClassId}
                </span>
              </div>
              <div className="space-y-1.5 text-sm font-mono text-muted-foreground">
                <div>Type: {cls.type}</div>
                <div>Size: {cls.sizeHint}</div>
                <div className="text-foreground">Live Samples: {cls.count}</div>
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <GlassPanel className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-display font-semibold">3D Vehicle Photo Samples</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {VEHICLE_CLASSES.map((cls) => (
            <div key={`preview-${cls.type}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <Vehicle3DPhoto type={cls.type} />
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-semibold">{cls.label}</div>
                <span className="text-xs font-mono text-muted-foreground">class {cls.detectorClassId}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-display font-semibold">Class Taxonomy</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-mono text-muted-foreground border-b border-border">
              <tr>
                <th className="pb-3 font-medium">CLASS ID</th>
                <th className="pb-3 font-medium">TYPE</th>
                <th className="pb-3 font-medium">LABEL</th>
                <th className="pb-3 font-medium">VISUAL COLOR</th>
                <th className="pb-3 font-medium">SIZE HINT</th>
              </tr>
            </thead>
            <tbody>
              {classStats.map((cls) => (
                <tr key={`class-${cls.type}`} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono">{cls.detectorClassId}</td>
                  <td className="py-3 font-mono">{cls.type}</td>
                  <td className="py-3 font-medium">{cls.label}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2 font-mono">
                      <span className="h-2.5 w-2.5 rounded-full border border-white/20" style={{ backgroundColor: cls.color }} />
                      {cls.color}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{cls.sizeHint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </AppLayout>
  );
}
