import { useState } from 'react';
import SignalChart from '@/components/SignalChart';
import LiveStats from '@/components/LiveStats';
import RoomProbabilityPanel from '@/components/RoomProbabilityPanel';
import Header from '@/components/Header';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';
import { DEFAULT_ROOMS } from '@/types/wifi-motion';

const Index = () => {
  const [isSimulation, setIsSimulation] = useState(true);
  const {
    chartData,
    currentRssi,
    currentVariance,
    eventCount,
    roomProbabilities,
    isRunning,
    setIsRunning,
    activeMotionRoom,
    varianceThreshold,
    notificationsEnabled,
    setNotificationsEnabled,
    requestPermission,
  } = useSimulationEngine(DEFAULT_ROOMS);

  const isMotionDetected = currentVariance > varianceThreshold;

  const handleToggleNotifications = async (val: boolean) => {
    if (val) {
      const granted = await requestPermission();
      if (granted) setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative scanline-effect">
      <Header
        isSimulation={isSimulation}
        onToggleSimulation={setIsSimulation}
        isConnected={isRunning}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      <main className="container py-6 space-y-6">
        {/* Signal Chart Section */}
        <div className="bg-card border border-border rounded-lg p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Real-Time Signal Monitor
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 bg-terminal-red" />
                <span className="text-[10px] font-mono text-muted-foreground">RSSI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 border-t border-dashed border-yellow-400" />
                <span className="text-[10px] font-mono text-muted-foreground">Threshold</span>
              </div>
            </div>
          </div>

          <LiveStats
            rssi={currentRssi}
            variance={currentVariance}
            eventCount={eventCount}
            isMotionDetected={isMotionDetected}
            varianceThreshold={varianceThreshold}
          />

          <SignalChart data={chartData} threshold={-45} />
        </div>

        {/* Room Probabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoomProbabilityPanel
            probabilities={roomProbabilities}
            activeRoom={activeMotionRoom}
          />

          {/* Recent Events */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
              Recent Events
            </h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {eventCount === 0 ? (
                <p className="text-xs font-mono text-muted-foreground text-center py-8">
                  Waiting for motion events...
                </p>
              ) : (
                <RecentEvents eventCount={eventCount} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Separate component so we can use the simulation engine events
const RecentEvents = ({ eventCount }: { eventCount: number }) => {
  // We'll display a simple counter-based placeholder since events
  // are managed in the simulation hook
  return (
    <div className="text-xs font-mono text-muted-foreground text-center py-4">
      <span className="text-terminal-amber font-semibold text-lg">{eventCount}</span>
      <br />
      <span>motion events detected this session</span>
    </div>
  );
};

export default Index;
