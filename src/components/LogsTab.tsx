import { useEffect, useState } from 'react';
import { Log } from '../lib/types';
import { mockDataService } from '../services/mockDataService';
import { Filter, Search } from 'lucide-react';

export function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    loadLogs();

    const unsubscribe = mockDataService.subscribe(() => {
      loadLogs();
    });

    const interval = setInterval(loadLogs, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, severityFilter, serviceFilter, searchTerm]);

  const loadLogs = () => {
    const data = mockDataService.getLogs(200);
    setLogs(data);

    const uniqueServices = [...new Set(data.map(log => log.service))];
    setServices(uniqueServices);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      debug: 'text-slate-400 bg-slate-900',
      info: 'text-blue-400 bg-blue-950',
      warning: 'text-yellow-400 bg-yellow-950',
      error: 'text-orange-400 bg-orange-950',
      critical: 'text-red-400 bg-red-950'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Severities</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Services</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Log Stream</h3>
            <span className="text-sm text-slate-400">{filteredLogs.length} entries</span>
          </div>
        </div>

        <div className="h-[600px] overflow-y-auto font-mono text-sm">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="px-4 py-3 border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <span className="text-slate-500 min-w-[140px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase min-w-[80px] text-center ${getSeverityColor(log.severity)}`}>
                  {log.severity}
                </span>
                <span className="text-emerald-400 min-w-[140px]">{log.service}</span>
                <span className="text-slate-300 flex-1">{log.message}</span>
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="ml-[380px] mt-1 text-xs text-slate-500">
                  {JSON.stringify(log.metadata)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
