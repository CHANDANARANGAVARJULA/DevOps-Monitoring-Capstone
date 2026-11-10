import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Metric } from '../lib/types';
import { mockDataService } from '../services/mockDataService';
import { Cpu, HardDrive, Clock, AlertTriangle } from 'lucide-react';

interface AggregatedMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
  error_rate: number;
}

export function MonitoringTab() {
  const [metrics, setMetrics] = useState<AggregatedMetric[]>([]);
  const [latestMetrics, setLatestMetrics] = useState({
    cpu: 0,
    memory: 0,
    latency: 0,
    error_rate: 0
  });

  useEffect(() => {
    loadMetrics();

    const unsubscribe = mockDataService.subscribe(() => {
      loadMetrics();
    });

    const interval = setInterval(loadMetrics, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadMetrics = () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();
    const data = mockDataService.getMetricsSince(fifteenMinutesAgo);

    const aggregated = aggregateMetrics(data);
    setMetrics(aggregated);

    if (aggregated.length > 0) {
      const latest = aggregated[aggregated.length - 1];
      setLatestMetrics({
        cpu: latest.cpu,
        memory: latest.memory,
        latency: latest.latency,
        error_rate: latest.error_rate
      });
    }
  };

  const aggregateMetrics = (data: Metric[]): AggregatedMetric[] => {
    const grouped: { [key: string]: { cpu: number[], memory: number[], latency: number[], error_rate: number[] } } = {};

    data.forEach(metric => {
      const timeKey = new Date(metric.timestamp).toISOString().slice(0, 16);

      if (!grouped[timeKey]) {
        grouped[timeKey] = { cpu: [], memory: [], latency: [], error_rate: [] };
      }

      if (metric.metric_type === 'cpu') grouped[timeKey].cpu.push(metric.value);
      if (metric.metric_type === 'memory') grouped[timeKey].memory.push(metric.value);
      if (metric.metric_type === 'latency') grouped[timeKey].latency.push(metric.value);
      if (metric.metric_type === 'error_rate') grouped[timeKey].error_rate.push(metric.value);
    });

    return Object.entries(grouped).map(([timestamp, values]) => ({
      timestamp: new Date(timestamp).toLocaleTimeString(),
      cpu: values.cpu.length > 0 ? values.cpu.reduce((a, b) => a + b, 0) / values.cpu.length : 0,
      memory: values.memory.length > 0 ? values.memory.reduce((a, b) => a + b, 0) / values.memory.length : 0,
      latency: values.latency.length > 0 ? values.latency.reduce((a, b) => a + b, 0) / values.latency.length : 0,
      error_rate: values.error_rate.length > 0 ? values.error_rate.reduce((a, b) => a + b, 0) / values.error_rate.length : 0
    }));
  };

  const MetricCard = ({ title, value, unit, icon: Icon, color }: { title: string; value: number; unit: string; icon: any; color: string }) => (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-300 font-medium">{title}</h3>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-white">{value.toFixed(1)}</span>
        <span className="text-slate-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="CPU Usage" value={latestMetrics.cpu} unit="%" icon={Cpu} color="text-blue-400" />
        <MetricCard title="Memory Usage" value={latestMetrics.memory} unit="%" icon={HardDrive} color="text-green-400" />
        <MetricCard title="Response Time" value={latestMetrics.latency} unit="ms" icon={Clock} color="text-yellow-400" />
        <MetricCard title="Error Rate" value={latestMetrics.error_rate} unit="%" icon={AlertTriangle} color="text-red-400" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">CPU & Memory Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" dot={false} />
              <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memory %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Response Time & Error Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="#eab308" strokeWidth={2} name="Latency (ms)" dot={false} />
              <Line type="monotone" dataKey="error_rate" stroke="#ef4444" strokeWidth={2} name="Error Rate %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
