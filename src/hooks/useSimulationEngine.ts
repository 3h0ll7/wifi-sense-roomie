import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChartDataPoint, MotionEvent, RoomProbability, RoomConfig } from '@/types/wifi-motion';
import { useMotionNotifications } from './useMotionNotifications';

const WINDOW_SIZE = 10;
const UPDATE_INTERVAL = 500;

function gaussianRandom(mean: number, stddev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stddev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

export function useSimulationEngine(rooms: RoomConfig[]) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentRssi, setCurrentRssi] = useState(-55);
  const [currentVariance, setCurrentVariance] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState<MotionEvent[]>([]);
  const [roomProbabilities, setRoomProbabilities] = useState<RoomProbability[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [activeMotionRoom, setActiveMotionRoom] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const { requestPermission, notify } = useMotionNotifications(notificationsEnabled);

  const tickRef = useRef(0);
  const readingsRef = useRef<Map<string, number[]>>(new Map());
  const motionTimerRef = useRef<number | null>(null);
  const motionEndRef = useRef<number | null>(null);
  const motionRoomRef = useRef<string | null>(null);
  const varianceThreshold = 1.0;

  const initReadings = useCallback(() => {
    const map = new Map<string, number[]>();
    rooms.forEach(r => map.set(r.roomName, []));
    readingsRef.current = map;
  }, [rooms]);

  useEffect(() => {
    initReadings();
  }, [initReadings]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const tick = tickRef.current++;
      const now = tick * 0.5;

      // Decide if we should start a motion event
      if (!motionTimerRef.current && !motionEndRef.current) {
        const nextMotion = 15 + Math.random() * 30; // 15-45 seconds
        motionTimerRef.current = tick + nextMotion * 2; // convert to ticks
      }

      // Start motion
      if (motionTimerRef.current && tick >= motionTimerRef.current && !motionEndRef.current) {
        const duration = 3 + Math.random() * 5; // 3-8 seconds
        motionEndRef.current = tick + duration * 2;
        const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
        motionRoomRef.current = randomRoom.roomName;
        setActiveMotionRoom(randomRoom.roomName);
        motionTimerRef.current = null;
      }

      // End motion
      if (motionEndRef.current && tick >= motionEndRef.current) {
        // Log event
        const room = motionRoomRef.current || 'Unknown';
        const roomConfig = rooms.find(r => r.roomName === room);
        const readings = readingsRef.current.get(room) || [];
        const mean = readings.length > 0 ? readings.reduce((a, b) => a + b, 0) / readings.length : (roomConfig?.baseRssi || -55);
        const variance = readings.length > 1
          ? readings.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / readings.length
          : 0;

        const newEvent: MotionEvent = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          room,
          rssiValue: Math.round(mean * 10) / 10,
          variance: Math.round(variance * 100) / 100,
          durationSeconds: Math.round((tick - (motionEndRef.current! - (3 + Math.random() * 5) * 2)) * 0.5 * 10) / 10,
          confidence: Math.min(95, Math.round(50 + variance * 5)),
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 500));
        setEventCount(prev => prev + 1);
        notify(room, newEvent.variance, newEvent.confidence);
        motionEndRef.current = null;
        motionRoomRef.current = null;
        setActiveMotionRoom(null);
      }

      const isMotionActive = motionEndRef.current !== null && tick < motionEndRef.current;

      // Generate readings for each room
      rooms.forEach(room => {
        const isMotionRoom = isMotionActive && motionRoomRef.current === room.roomName;
        const stddev = isMotionRoom ? 5 + Math.random() * 10 : 2;
        const rssi = gaussianRandom(room.baseRssi, stddev);

        const readings = readingsRef.current.get(room.roomName) || [];
        readings.push(rssi);
        if (readings.length > WINDOW_SIZE) readings.shift();
        readingsRef.current.set(room.roomName, readings);
      });

      // Calculate primary room stats (use first room or motion room)
      const primaryRoom = motionRoomRef.current || rooms[0]?.roomName || 'Kitchen';
      const primaryReadings = readingsRef.current.get(primaryRoom) || [];
      const latestRssi = primaryReadings[primaryReadings.length - 1] || -55;
      const mean = primaryReadings.reduce((a, b) => a + b, 0) / (primaryReadings.length || 1);
      const variance = primaryReadings.length > 1
        ? primaryReadings.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / primaryReadings.length
        : 0;

      setCurrentRssi(Math.round(latestRssi * 10) / 10);
      setCurrentVariance(Math.round(variance * 100) / 100);

      // Update chart
      const motionDetected = variance > varianceThreshold;
      setChartData(prev => {
        const next = [...prev, { time: Math.round(now * 10) / 10, rssi: Math.round(latestRssi * 10) / 10, threshold: -45, motionDetected }];
        return next.length > 200 ? next.slice(-200) : next;
      });

      // Update room probabilities using softmax over variance
      const variances: number[] = rooms.map(room => {
        const readings = readingsRef.current.get(room.roomName) || [];
        if (readings.length < 2) return 0;
        const m = readings.reduce((a, b) => a + b, 0) / readings.length;
        return readings.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / readings.length;
      });

      const probs = softmax(variances);
      setRoomProbabilities(rooms.map((room, i) => ({
        room: room.roomName,
        probability: Math.round(probs[i] * 1000) / 10,
      })));
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning, rooms]);

  return {
    chartData,
    currentRssi,
    currentVariance,
    eventCount,
    events,
    roomProbabilities,
    isRunning,
    setIsRunning,
    activeMotionRoom,
    varianceThreshold,
  };
}
