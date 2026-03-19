import { SUMOIntersectionView } from "@/components/traffic-sim/SUMOIntersectionView";
import { TrafficCameraScene } from "@/components/traffic-sim/TrafficCameraScene";
import { IntersectionMapView } from "@/components/traffic-sim/IntersectionMapView";
import { LaneDetailView } from "@/components/traffic-sim/LaneDetailView";
import type { SimIntersection, SimRoadState } from "@/types/traffic-sim";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

interface IntersectionDetailViewProps {
  intersection: SimIntersection;
  roads: SimRoadState[];
  onBack: () => void;
}

export function IntersectionDetailView({ intersection, roads, onBack }: IntersectionDetailViewProps) {
  const [selectedLane, setSelectedLane] = useState<number | null>(null);
  const emergencyActive = roads.some((road) => road.ambulanceDetected);
  const totalQueueVehicles = roads.reduce((sum, road) => sum + road.vehicles.length, 0);
  const totalEnteredVehicles = roads.reduce((sum, road) => sum + road.vehicleCount, 0);

  const handleLaneClick = (laneIndex: number) => {
    setSelectedLane(laneIndex);
  };

  const handleBackToMap = () => {
    setSelectedLane(null);
  };

  // If a lane is selected, show lane detail view
  if (selectedLane !== null) {
    return <LaneDetailView roads={roads} laneIndex={selectedLane} onBack={handleBackToMap} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-white/20 bg-black/35 hover:bg-black/50 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back To City Map
        </button>

        <div className="text-right">
          <div className="text-xl font-display font-bold">{intersection.name}</div>
          <div className="text-xs font-mono text-muted-foreground">Intersection ID: {intersection.id}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 items-start">
        <div className="space-y-4">
          {/* Intersection Map View with clickable lanes */}
          <div className="h-[500px] md:h-[600px] lg:h-[700px]">
            <IntersectionMapView roads={roads} onLaneClick={handleLaneClick} />
          </div>

          {/* SUMO-style 2D intersection overview */}
          <div className="h-[340px] md:h-[430px] lg:h-[540px] xl:h-[620px] 2xl:h-[700px]">
            <SUMOIntersectionView roads={roads} />
          </div>
        </div>

        <div className="rounded-lg border border-white/15 bg-black/35 p-4 space-y-4 xl:sticky xl:top-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-mono">Intersection Summary</div>
            <div className="mt-2 text-sm font-mono text-white/90">Live Queue Vehicles: {totalQueueVehicles}</div>
            <div className="text-sm font-mono text-white/90">Vehicles Entered: {totalEnteredVehicles}</div>
            <div className="text-sm font-mono text-white/90">Emergency Lanes: {roads.filter((r) => r.ambulanceDetected).length}</div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-mono mb-2">Lane Metrics</div>
            <div className="space-y-2">
              {roads.map((road, index) => (
                <button
                  key={`metrics-${road.id}`}
                  onClick={() => handleLaneClick(index)}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono hover:bg-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
                >
                  <div className="flex justify-between text-white/90">
                    <span>Lane {index + 1}</span>
                    <span className={road.signal === "green" ? "text-green-400" : road.signal === "yellow" ? "text-yellow-300" : "text-red-400"}>
                      {road.signal.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 text-white/80">Queue: {road.vehicles.length} | Entered: {road.vehicleCount}</div>
                  <div className={road.ambulanceDetected ? "mt-1 text-red-400" : "mt-1 text-white/70"}>
                    Ambulance: {road.ambulanceDetected ? "YES" : "NO"}
                  </div>
                  <div className="mt-1 text-cyan-400/60 text-[10px]">Click to view details →</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
