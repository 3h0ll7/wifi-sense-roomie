import { Link, useLocation } from 'react-router-dom';
import { Wifi, Activity, Bell, BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface HeaderProps {
  isSimulation: boolean;
  onToggleSimulation: (val: boolean) => void;
  isConnected: boolean;
  notificationsEnabled?: boolean;
  onToggleNotifications?: (val: boolean) => void;
}

const Header = ({ isSimulation, onToggleSimulation, isConnected, notificationsEnabled, onToggleNotifications }: HeaderProps) => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'History', path: '/history' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <Wifi className="h-5 w-5 text-terminal-green" />
              <Activity className="h-3 w-3 text-terminal-amber absolute -bottom-1 -right-1" />
            </div>
            <span className="font-mono text-sm font-semibold text-foreground">
              WiFi Motion Sense
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-terminal-green'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {onToggleNotifications && (
            <button
              onClick={() => onToggleNotifications(!notificationsEnabled)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary transition-colors"
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? (
                <Bell className="h-3.5 w-3.5 text-terminal-green" />
              ) : (
                <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-[10px] font-mono text-muted-foreground">
                {notificationsEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">SIM</span>
            <Switch
              checked={isSimulation}
              onCheckedChange={onToggleSimulation}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-terminal-green animate-pulse-dot' : 'bg-terminal-red'}`} />
            <span className="text-xs font-mono text-muted-foreground">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
