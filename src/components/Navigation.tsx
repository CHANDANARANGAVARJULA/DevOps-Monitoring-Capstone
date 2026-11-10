import { Activity } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'logs', label: 'Logs' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold text-white">DevOps Incident Response Monitor</h1>
              <p className="text-xs text-slate-400">Standards-Driven Monitoring & Automated Response</p>
            </div>
          </div>

          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
