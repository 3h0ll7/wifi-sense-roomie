import type { RoomProbability } from '@/types/wifi-motion';

interface RoomProbabilityPanelProps {
  probabilities: RoomProbability[];
  activeRoom: string | null;
}

const RoomProbabilityPanel = ({ probabilities, activeRoom }: RoomProbabilityPanelProps) => {
  const sorted = [...probabilities].sort((a, b) => b.probability - a.probability);

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
        Most Likely Location
      </h3>

      <div className="space-y-3">
        {sorted.map((room, i) => {
          const isTop = i === 0;
          const isActive = room.room === activeRoom;

          return (
            <div key={room.room} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className={`text-sm font-mono ${
                  isTop ? 'text-terminal-green font-semibold' : 'text-foreground'
                } ${isActive ? 'text-terminal-amber' : ''}`}>
                  {room.room}
                  {isActive && <span className="ml-2 text-[10px] text-terminal-amber">● ACTIVE</span>}
                </span>
                <span className={`text-xs font-mono ${
                  isTop ? 'text-terminal-green' : 'text-muted-foreground'
                }`}>
                  {room.probability.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-terminal-amber' : isTop ? 'bg-terminal-green' : 'bg-muted-foreground/50'
                  }`}
                  style={{ width: `${Math.min(room.probability, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomProbabilityPanel;
