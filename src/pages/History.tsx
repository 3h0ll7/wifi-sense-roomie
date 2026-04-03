import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { useSimulationEngine } from '@/hooks/useSimulationEngine';
import { DEFAULT_ROOMS } from '@/types/wifi-motion';
import type { MotionEvent } from '@/types/wifi-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search } from 'lucide-react';

const History = () => {
  const { events } = useSimulationEngine(DEFAULT_ROOMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesRoom = roomFilter === 'all' || e.room === roomFilter;
      const matchesSearch = !searchQuery || e.room.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRoom && matchesSearch;
    });
  }, [events, roomFilter, searchQuery]);

  const exportCSV = () => {
    const headers = 'Timestamp,Room,RSSI Value,Variance,Duration (s),Confidence (%)\n';
    const rows = filteredEvents.map(e =>
      `${e.timestamp.toISOString()},${e.room},${e.rssiValue},${e.variance},${e.durationSeconds},${e.confidence}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'motion_events.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Heatmap data: hours (0-23) x rooms
  const heatmapData = useMemo(() => {
    const grid: Record<string, number[]> = {};
    DEFAULT_ROOMS.forEach(r => {
      grid[r.roomName] = new Array(24).fill(0);
    });
    events.forEach(e => {
      const hour = e.timestamp.getHours();
      if (grid[e.room]) {
        grid[e.room][hour]++;
      }
    });
    return grid;
  }, [events]);

  const maxHeatmapValue = useMemo(() => {
    let max = 1;
    Object.values(heatmapData).forEach(hours => {
      hours.forEach(v => { if (v > max) max = v; });
    });
    return max;
  }, [heatmapData]);

  return (
    <div className="min-h-screen bg-background">
      <Header isSimulation={true} onToggleSimulation={() => {}} isConnected={true} />

      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-mono font-semibold text-foreground">Event History</h1>
          <Button size="sm" variant="outline" onClick={exportCSV} className="h-7 text-xs font-mono gap-1">
            <Download className="h-3 w-3" /> Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 font-mono text-sm bg-secondary border-border h-8"
            />
          </div>
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="w-[160px] font-mono text-xs bg-secondary border-border h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {DEFAULT_ROOMS.map(r => (
                <SelectItem key={r.id} value={r.roomName}>{r.roomName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border">
                  {['Timestamp', 'Room', 'RSSI', 'Variance', 'Duration', 'Confidence'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No events yet. Motion events will appear here as they are detected.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.slice(0, 50).map(event => (
                    <tr key={event.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-2 text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2 text-xs text-terminal-green">{event.room}</td>
                      <td className="px-4 py-2 text-xs">{event.rssiValue} dBm</td>
                      <td className={`px-4 py-2 text-xs ${event.variance > 1 ? 'text-terminal-red' : 'text-foreground'}`}>
                        {event.variance.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-xs">{event.durationSeconds}s</td>
                      <td className="px-4 py-2 text-xs text-terminal-amber">{event.confidence}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
            Daily Activity Heatmap
          </h3>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex ml-24 mb-1">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] font-mono text-muted-foreground">
                    {i}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {DEFAULT_ROOMS.map(room => (
                <div key={room.id} className="flex items-center mb-1">
                  <span className="w-24 text-xs font-mono text-muted-foreground truncate pr-2">
                    {room.roomName}
                  </span>
                  <div className="flex flex-1 gap-0.5">
                    {(heatmapData[room.roomName] || []).map((count, hour) => {
                      const intensity = count / maxHeatmapValue;
                      return (
                        <div
                          key={hour}
                          className="flex-1 h-6 rounded-sm transition-colors"
                          style={{
                            backgroundColor: count === 0
                              ? 'hsl(0 0% 10%)'
                              : `hsl(153 100% 50% / ${0.15 + intensity * 0.85})`,
                          }}
                          title={`${room.roomName} at ${hour}:00 — ${count} events`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-end mt-3 gap-2">
                <span className="text-[9px] font-mono text-muted-foreground">Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: v === 0
                        ? 'hsl(0 0% 10%)'
                        : `hsl(153 100% 50% / ${0.15 + v * 0.85})`,
                    }}
                  />
                ))}
                <span className="text-[9px] font-mono text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
