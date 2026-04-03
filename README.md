<p align="center">
  <img src="https://img.shields.io/badge/WiFi-Motion%20Sense-00ff88?style=for-the-badge&logo=wifi&logoColor=white" alt="WiFi Motion Sense" />
</p>

<h1 align="center">📡 WiFi Motion Sense</h1>

<p align="center">
  <strong>Open-source WiFi-based motion detection & room-level localization dashboard</strong><br/>
  Detect human presence by analyzing RSSI signal variance — no cameras, no sensors, just WiFi.
</p>

<p align="center">
  <a href="https://wifi-sense-roomie.lovable.app"><img src="https://img.shields.io/badge/Live%20Demo-00ff88?style=flat-square&logo=vercel&logoColor=black" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/TypeScript-97.4%25-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/stars/3h0ll7/wifi-sense-roomie?style=flat-square&color=ffaa00" alt="Stars" />
</p>

---

## 🧠 How It Works

WiFi signals fluctuate when a human body moves through the signal path between a router and a device. **WiFi Motion Sense** monitors these RSSI (Received Signal Strength Indicator) fluctuations in real-time, calculates rolling variance over a sliding window, and triggers motion events when the variance exceeds a configurable threshold.

The system uses a **softmax probability function** across multiple rooms to estimate the most likely location of detected movement.

```
WiFi Router ──── Signal Path ──── Device
                    │
              Person walks through
                    │
            RSSI variance spikes
                    │
           Motion event triggered
                    │
        Room probability updated
```

## ✨ Features

- **Real-Time Signal Chart** — Live RSSI line chart with threshold overlay and motion-region highlighting (Recharts)
- **Live Stats Panel** — Current RSSI, variance, event count with color-coded indicators
- **Room-Level Localization** — Softmax-based probability estimation across 6 configurable rooms
- **Event History** — Searchable, filterable log table with CSV export
- **Activity Heatmap** — Hour × Room grid showing daily motion patterns
- **Browser Notifications** — Push alerts on motion detection with quiet hours support
- **Simulation Engine** — Realistic RSSI data generator with Gaussian noise — works without any hardware
- **Dark Terminal Aesthetic** — Hacker/terminal UI with JetBrains Mono, green/amber/red accents
- **Fully Responsive** — Works on desktop & mobile

## 🖥️ Screenshots

| Dashboard | Event History |
|-----------|---------------|
| Real-time signal chart with live stats overlay | Searchable table + daily activity heatmap |

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/3h0ll7/wifi-sense-roomie.git
cd wifi-sense-roomie

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) — the dashboard runs in **simulation mode** by default, generating realistic WiFi signal data.

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Architecture

```
src/
├── components/
│   ├── Header.tsx              # Navigation + simulation toggle + live status
│   ├── SignalChart.tsx          # Real-time RSSI line chart (Recharts)
│   ├── LiveStats.tsx            # RSSI/Variance/Events overlay panel
│   └── RoomProbabilityPanel.tsx # Room location probability bars
├── hooks/
│   ├── useSimulationEngine.ts   # Core simulation: RSSI generation, motion events, softmax
│   └── useMotionNotifications.ts # Browser push notification handler
├── pages/
│   ├── Index.tsx                # Main dashboard
│   ├── History.tsx              # Event log + heatmap
│   └── Settings.tsx             # Sensor & notification configuration
├── types/
│   └── wifi-motion.ts           # TypeScript interfaces & default room configs
└── index.css                    # Terminal-themed CSS variables & utilities
```

### Key Technical Details

| Component | Implementation |
|-----------|---------------|
| Signal Simulation | Gaussian random noise (σ=2 dBm idle, σ=5-15 dBm motion) |
| Motion Detection | Rolling variance over 10-sample window vs configurable threshold |
| Room Localization | Softmax function over per-room variance values |
| Motion Events | Random intervals (15-45s), random duration (3-8s), random room |
| Chart | Recharts `LineChart` with `ReferenceArea` for motion regions |
| State | React hooks (`useState`, `useRef`, `useEffect`) — no external state lib |

## ⚙️ Configuration

### Default Rooms

| Room | Base RSSI | Threshold |
|------|-----------|-----------|
| Kitchen | -55 dBm | -45 dBm |
| Bedroom 1 | -62 dBm | -52 dBm |
| Bedroom 2 | -68 dBm | -58 dBm |
| Hallway | -50 dBm | -40 dBm |
| Living Room | -45 dBm | -35 dBm |
| Bathroom | -70 dBm | -60 dBm |

All rooms are configurable from the **Settings** page — add, remove, toggle notifications per room.

## 🔌 Hardware Integration (Future)

The dashboard is designed to be hardware-ready. The simulation engine is modular and can be swapped with a real data source.

### Expected Hardware API Interface

```typescript
interface SensorReading {
  timestamp: number;    // Unix ms
  rssi: number;         // dBm value
  room: string;         // Room identifier
}
```

**Planned setup:** A Raspberry Pi or ESP32 running a Python script that reads actual WiFi RSSI values and pushes them to a Supabase Realtime channel. The dashboard already subscribes to these patterns — swap the simulation hook with a Supabase subscription and it works with real data.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| Charts | Recharts |
| Routing | React Router DOM 6 |
| Fonts | JetBrains Mono (data) + Inter (UI) |
| Linting | ESLint 9 + TypeScript ESLint |
| Testing | Vitest + Testing Library |

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Ideas for Contributions

- Real hardware integration (ESP32 / Raspberry Pi)
- Supabase backend for event persistence
- Multi-floor support with floor plan visualization
- Machine learning model for improved room detection
- MQTT protocol support for IoT integration
- Docker deployment configuration

## 👤 Author

**Hassan Salman** — [@3h0ll7](https://github.com/3h0ll7) · [𝕏 @3h0ll7](https://x.com/3h0ll7)

---

<p align="center">
  <sub>Built with ❤️ using React, TypeScript, and WiFi signals</sub><br/>
  <sub>⭐ Star this repo if you find it useful!</sub>
</p># Welcome to your Lovable project

TODO: Document your project here
