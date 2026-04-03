interface LiveStatsProps {
  rssi: number;
  variance: number;
  eventCount: number;
  isMotionDetected: boolean;
  varianceThreshold: number;
}

const LiveStats = ({ rssi, variance, eventCount, isMotionDetected, varianceThreshold }: LiveStatsProps) => {
  return (
    <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 z-10 min-w-[180px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live Stats</span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-terminal-green animate-pulse-dot" />
          <span className="text-[10px] font-mono text-terminal-green">LIVE</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-mono text-muted-foreground">RSSI</span>
          <span className="text-sm font-mono font-semibold text-foreground">{rssi.toFixed(1)} dBm</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-xs font-mono text-muted-foreground">Var</span>
          <span className={`text-sm font-mono font-semibold ${
            variance > varianceThreshold ? 'text-terminal-red' : 'text-terminal-green'
          }`}>
            {variance.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-xs font-mono text-muted-foreground">Events</span>
          <span className="text-sm font-mono font-semibold text-terminal-amber">{eventCount}</span>
        </div>

        {isMotionDetected && (
          <div className="mt-2 px-2 py-1 rounded bg-destructive/20 border border-destructive/30 text-center">
            <span className="text-xs font-mono text-terminal-red font-semibold animate-pulse">⚠ MOTION DETECTED</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStats;
