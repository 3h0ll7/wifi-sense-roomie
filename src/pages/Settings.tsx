import { useState } from 'react';
import Header from '@/components/Header';
import { DEFAULT_ROOMS, type RoomConfig } from '@/types/wifi-motion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const Settings = () => {
  const [rooms, setRooms] = useState<RoomConfig[]>(DEFAULT_ROOMS);
  const [rssiThreshold, setRssiThreshold] = useState(-45);
  const [varianceThreshold, setVarianceThreshold] = useState(1.0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [minEventGap, setMinEventGap] = useState(5);

  const toggleRoomNotification = (id: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, notificationsEnabled: !r.notificationsEnabled } : r));
  };

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const addRoom = () => {
    const newRoom: RoomConfig = {
      id: crypto.randomUUID(),
      roomName: `Room ${rooms.length + 1}`,
      baseRssi: -55,
      threshold: -45,
      notificationsEnabled: true,
    };
    setRooms(prev => [...prev, newRoom]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isSimulation={true} onToggleSimulation={() => {}} isConnected={true} />

      <main className="container py-6 space-y-6 max-w-3xl">
        <h1 className="text-lg font-mono font-semibold text-foreground">Settings</h1>

        {/* Sensor Configuration */}
        <section className="bg-card border border-border rounded-lg p-5 space-y-5">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Sensor Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">
                RSSI Threshold: {rssiThreshold} dBm
              </label>
              <Slider
                value={[rssiThreshold]}
                onValueChange={([v]) => setRssiThreshold(v)}
                min={-80}
                max={-30}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-2">
                Variance Threshold: {varianceThreshold.toFixed(1)}
              </label>
              <Slider
                value={[varianceThreshold]}
                onValueChange={([v]) => setVarianceThreshold(v)}
                min={0.1}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono text-muted-foreground uppercase">Rooms</h3>
              <Button size="sm" variant="outline" onClick={addRoom} className="h-7 text-xs font-mono gap-1">
                <Plus className="h-3 w-3" /> Add Room
              </Button>
            </div>

            {rooms.map(room => (
              <div key={room.id} className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-foreground">{room.roomName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{room.baseRssi} dBm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={room.notificationsEnabled}
                    onCheckedChange={() => toggleRoomNotification(room.id)}
                    className="data-[state=checked]:bg-primary scale-75"
                  />
                  <button onClick={() => removeRoom(room.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Notification Settings
          </h2>

          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-foreground">Browser Notifications</span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Quiet Hours Start</label>
              <Input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="font-mono text-sm bg-secondary border-border" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground block mb-1">Quiet Hours End</label>
              <Input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="font-mono text-sm bg-secondary border-border" />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-2">
              Min Event Gap: {minEventGap}s
            </label>
            <Slider
              value={[minEventGap]}
              onValueChange={([v]) => setMinEventGap(v)}
              min={1}
              max={60}
              step={1}
              className="w-full"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
