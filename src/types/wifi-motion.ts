export interface SensorReading {
  timestamp: number;
  rssi: number;
  room: string;
}

export interface MotionEvent {
  id: string;
  timestamp: Date;
  room: string;
  rssiValue: number;
  variance: number;
  durationSeconds: number;
  confidence: number;
}

export interface RoomConfig {
  id: string;
  roomName: string;
  baseRssi: number;
  threshold: number;
  notificationsEnabled: boolean;
}

export interface RoomProbability {
  room: string;
  probability: number;
}

export interface SimulationState {
  isRunning: boolean;
  currentReadings: Map<string, number[]>;
  events: MotionEvent[];
  roomProbabilities: RoomProbability[];
  activeMotionRoom: string | null;
}

export interface ChartDataPoint {
  time: number;
  rssi: number;
  threshold: number;
  motionDetected: boolean;
}

export const DEFAULT_ROOMS: RoomConfig[] = [
  { id: '1', roomName: 'Kitchen', baseRssi: -55, threshold: -45, notificationsEnabled: true },
  { id: '2', roomName: 'Bedroom 1', baseRssi: -62, threshold: -52, notificationsEnabled: true },
  { id: '3', roomName: 'Bedroom 2', baseRssi: -68, threshold: -58, notificationsEnabled: true },
  { id: '4', roomName: 'Hallway', baseRssi: -50, threshold: -40, notificationsEnabled: true },
  { id: '5', roomName: 'Living Room', baseRssi: -45, threshold: -35, notificationsEnabled: true },
  { id: '6', roomName: 'Bathroom', baseRssi: -70, threshold: -60, notificationsEnabled: false },
];
