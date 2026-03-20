import { SUMOIntersectionView } from "@/components/traffic-sim/SUMOIntersectionView";
import { TrafficCameraScene } from "@/components/traffic-sim/TrafficCameraScene";
import type { SimIntersection, SimRoadState } from "@/types/traffic-sim";
import { ArrowLeft, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface IntersectionDetailViewProps {
  intersection: SimIntersection;
  roads: SimRoadState[];
  onBack: () => void;
  mlDetectionApiUrl?: string;
}

export function IntersectionDetailView({ intersection, roads, onBack, mlDetectionApiUrl = "http://localhost:8000" }: IntersectionDetailViewProps) {
  const emergencyActive = roads.some((road) => road.ambulanceDetected);
  const [enableMLDetection, setEnableMLDetection] = useState(false);
  const [detectionCounts, setDetectionCounts] = useState<Map<number, number>>(new Map());
  const [boxedFrames, setBoxedFrames] = useState<Map<number, string>>(new Map());
  const [apiStatus, setApiStatus] = useState<"idle" | "checking" | "connected" | "error">("idle");
  const [requestCount, setRequestCount] = useState(0);
  const [lastPollTime, setLastPollTime] = useState<string>("-");
  const canvasRefsMap = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const processingRef = useRef<boolean>(false);

  // Fetch detections from all cameras
  useEffect(() => {
    if (!enableMLDetection) {
      canvasRefsMap.current.clear();
      setDetectionCounts(new Map());
      setBoxedFrames(new Map());
      setApiStatus("idle");
      setRequestCount(0);
      setLastPollTime("-");
      return;
    }

    const checkApiHealth = async () => {
      setApiStatus("checking");
      try {
        const response = await fetch(`${mlDetectionApiUrl}/health`);
        if (!response.ok) {
          setApiStatus("error");
          return;
        }
        setApiStatus("connected");
      } catch {
        setApiStatus("error");
      }
    };

    void checkApiHealth();

    const interval = setInterval(async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        const promises: Promise<void>[] = [];

        canvasRefsMap.current.forEach((canvas, cameraIndex) => {
          if (!canvas) return;

          const promise = (async () => {
            try {
              const imageData = canvas.toDataURL("image/jpeg", 0.7);
              const base64String = imageData.split(",")[1];

              const response = await fetch(`${mlDetectionApiUrl}/detect-annotated`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64String }),
              });

              if (!response.ok) return;

              const result = await response.json();
              if (result.success && Array.isArray(result.detections)) {
                setApiStatus("connected");
                setRequestCount((prev) => prev + 1);
                setLastPollTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));

                setDetectionCounts((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(cameraIndex, result.detection_count ?? 0);
                  return newMap;
                });

                if (typeof result.annotated_image === "string" && result.annotated_image.length > 0) {
                  setBoxedFrames((prev) => {
                    const newMap = new Map(prev);
                    newMap.set(cameraIndex, `data:image/jpeg;base64,${result.annotated_image}`);
                    return newMap;
                  });
                }
              }
            } catch (e) {
              setApiStatus("error");
            }
          })();

          promises.push(promise);
        });

        await Promise.allSettled(promises);
      } finally {
        processingRef.current = false;
      }
    }, 350);

    return () => {
      clearInterval(interval);
      processingRef.current = false;
    };
  }, [enableMLDetection, mlDetectionApiUrl]);
  // const totalQueueVehicles = roads.reduce((sum, road) => sum + road.vehicles.length, 0);
  // const totalEnteredVehicles = roads.reduce((sum, road) => sum + road.vehicleCount, 0);

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

        <div className="text-right flex items-center gap-4">
          <div>
            <div className="text-xl font-display font-bold">{intersection.name}</div>
            <div className="text-xs font-mono text-muted-foreground">Intersection ID: {intersection.id}</div>
          </div>
          <button
            onClick={() => setEnableMLDetection(!enableMLDetection)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border font-medium text-sm transition-all ${
              enableMLDetection
                ? "border-purple-500/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                : "border-white/20 bg-black/35 text-slate-400 hover:bg-black/50"
            }`}
          >
            <Zap className="w-4 h-4" />
            {enableMLDetection ? "AI Detection ON" : "Enable AI Detection"}
          </button>
          {enableMLDetection && (
            <div
              className={`rounded px-2 py-1 text-[11px] font-mono border ${
                apiStatus === "connected"
                  ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/10"
                  : apiStatus === "checking"
                    ? "text-amber-200 border-amber-500/40 bg-amber-500/10"
                    : "text-rose-200 border-rose-500/40 bg-rose-500/10"
              }`}
            >
              {apiStatus === "connected" ? "AI API: CONNECTED" : apiStatus === "checking" ? "AI API: CHECKING" : "AI API: ERROR"}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roads.map((road, index) => (
                <div key={`camera-${road.id}`} className="h-[300px] relative">
                  <div className="absolute inset-0 z-0">
                    <TrafficCameraScene
                      roads={roads}
                      cameraIndex={index}
                      cameraLabel={`Lane ${index + 1}`}
                      showDetectionOverlay={enableMLDetection}
                      boxedFrameSrc={boxedFrames.get(index)}
                      onCanvasReady={(canvas) => {
                        canvasRefsMap.current.set(index, canvas);
                      }}
                    />
                  </div>

                  {enableMLDetection && (
                    <div className="absolute top-2 right-2 z-20 rounded border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-mono text-cyan-100 pointer-events-none">
                      AI LIVE
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* SUMO-style 2D intersection overview */}
          <div className="h-[340px] md:h-[430px] lg:h-[540px] xl:h-[620px] 2xl:h-[700px]">
            <SUMOIntersectionView roads={roads} />
          </div>

          {/* 3D intersection environment mirroring SUMO + camera feed vehicle logic (no pedestrians). */}
          {/* <div className="h-[360px] md:h-[430px] lg:h-[520px] xl:h-[600px] 2xl:h-[680px]">
            <Intersection3DEnvironment roads={roads} />
          </div> */}
        </div>

        <div className="rounded-lg border border-white/15 bg-black/35 p-4 space-y-4 xl:sticky xl:top-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-mono">Intersection Summary</div>
            {/* <div className="mt-2 text-sm font-mono text-white/90">Live Queue Vehicles: {totalQueueVehicles}</div>
            <div className="text-sm font-mono text-white/90">Vehicles Entered: {totalEnteredVehicles}</div> */}
            <div className="text-sm font-mono text-white/90">Emergency Lanes: {roads.filter((r) => r.ambulanceDetected).length}</div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-mono mb-2">Lane Metrics</div>
            {enableMLDetection && (
              <div className="mb-3 rounded-md border border-purple-500/30 bg-purple-500/5 px-3 py-2 text-[11px] font-mono text-purple-200">
                <div className="flex justify-between">
                  <span>AI Polls</span>
                  <span>{requestCount}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Last Poll</span>
                  <span>{lastPollTime}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {roads.map((road, index) => (
                <div key={`metrics-${road.id}`} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono">
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

                    {enableMLDetection && detectionCounts.has(index) && (
                      <div className="mt-2 pt-2 border-t border-purple-500/30">
                        <div className="text-purple-300 flex justify-between">
                          <span>AI Detections:</span>
                          <span className="font-bold">{detectionCounts.get(index) || 0}</span>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}