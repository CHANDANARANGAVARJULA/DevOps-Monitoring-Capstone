import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { MonitoringTab } from './components/MonitoringTab';
import { LogsTab } from './components/LogsTab';
import { AlertsTab } from './components/AlertsTab';
import { ReportsTab } from './components/ReportsTab';
import { mockDataService } from './services/mockDataService';

function App() {
  const [activeTab, setActiveTab] = useState('monitoring');

  useEffect(() => {
    mockDataService.start();

    return () => {
      mockDataService.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'monitoring' && <MonitoringTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>
    </div>
  );
}

export default App;
