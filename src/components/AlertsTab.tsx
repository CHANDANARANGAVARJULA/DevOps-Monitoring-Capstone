import { useEffect, useState } from 'react';
import { Alert, Incident, RemediationAction } from '../lib/types';
import { mockDataService } from '../services/mockDataService';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [remediations, setRemediations] = useState<RemediationAction[]>([]);

  useEffect(() => {
    loadData();

    const unsubscribe = mockDataService.subscribe(() => {
      loadData();
    });

    const interval = setInterval(loadData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    loadAlerts();
    loadIncidents();
    loadRemediations();
  };

  const loadAlerts = () => {
    const data = mockDataService.getAlerts(50);
    setAlerts(data);
  };

  const loadIncidents = () => {
    const data = mockDataService.getIncidents(20);
    setIncidents(data);
  };

  const loadRemediations = () => {
    const data = mockDataService.getRemediations(20);
    setRemediations(data);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-950 border-blue-700 text-blue-300',
      warning: 'bg-yellow-950 border-yellow-700 text-yellow-300',
      critical: 'bg-red-950 border-red-700 text-red-300'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-950 text-red-300',
      investigating: 'bg-yellow-950 text-yellow-300',
      resolved: 'bg-green-950 text-green-300',
      pending: 'bg-slate-700 text-slate-300',
      running: 'bg-blue-950 text-blue-300',
      completed: 'bg-green-950 text-green-300',
      failed: 'bg-red-950 text-red-300'
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const openIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span>Active Incidents</span>
            </h3>
            <span className="px-3 py-1 bg-red-950 text-red-300 rounded-full text-sm font-semibold">
              {openIncidents.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {openIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                <p>No active incidents</p>
              </div>
            ) : (
              openIncidents.map(incident => (
                <div
                  key={incident.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(incident.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{incident.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="text-sm opacity-80">
                    <div>Service: {incident.service}</div>
                    <div>Detected: {new Date(incident.detected_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span>Recent Alerts</span>
            </h3>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {alerts.slice(0, 15).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{alert.message}</div>
                    <div className="text-xs opacity-80">
                      {alert.service} • {alert.metric_value.toFixed(1)} / {alert.threshold} • {new Date(alert.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase opacity-70">
                    {alert.alert_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Zap className="w-6 h-6 text-emerald-400" />
              <span>Automated Remediation</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-300 font-semibold">Action</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-semibold">Playbook</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-2 text-slate-300 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {remediations.map(action => (
                  <tr key={action.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-2 text-white">
                      <div className="font-medium">{action.action_type}</div>
                      {action.result && (
                        <div className="text-xs text-slate-400 mt-1">{action.result}</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-300 font-mono text-xs">{action.playbook}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(action.status)}`}>
                        {action.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">
                      {new Date(action.executed_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span>Resolved Incidents</span>
            </h3>
            <span className="px-3 py-1 bg-green-950 text-green-300 rounded-full text-sm font-semibold">
              {resolvedIncidents.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {resolvedIncidents.map(incident => (
              <div
                key={incident.id}
                className="p-3 rounded bg-slate-900 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-slate-300">{incident.title}</h4>
                  <span className="text-xs text-slate-500">
                    {incident.resolved_at && new Date(incident.resolved_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{incident.service}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
