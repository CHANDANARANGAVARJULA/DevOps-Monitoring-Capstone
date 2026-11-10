import { Incident, Alert, Log, RemediationAction, Metric } from '../lib/types';

const SERVICES = ['api-gateway', 'auth-service', 'payment-service', 'database-cluster', 'cache-redis'];

const LOG_MESSAGES = {
  debug: ['Query executed successfully', 'Cache hit for key', 'Connection pool status checked'],
  info: ['Request processed', 'User authenticated', 'Service health check passed', 'Backup completed'],
  warning: ['High memory usage detected', 'Slow query detected', 'Connection timeout', 'Rate limit approaching'],
  error: ['Database connection failed', 'API request failed', 'Authentication error', 'Payment processing failed'],
  critical: ['Service unavailable', 'Data corruption detected', 'Security breach attempt', 'System crash']
};

const ALERT_MESSAGES = {
  cpu: 'High CPU usage detected',
  memory: 'Memory threshold exceeded',
  latency: 'High response latency detected',
  error_rate: 'Error rate threshold exceeded',
  disk: 'Disk usage critical'
};

const PLAYBOOKS = {
  restart: 'restart-pod.yml',
  scale: 'scale-up-service.yml',
  rollback: 'rollback-deployment.yml',
  cleanup: 'cleanup-resources.yml'
};

type DataChangeCallback = () => void;

class MockDataService {
  private isRunning = false;
  private intervalId: number | null = null;
  private listeners: DataChangeCallback[] = [];

  private incidents: Incident[] = [];
  private alerts: Alert[] = [];
  private logs: Log[] = [];
  private remediations: RemediationAction[] = [];
  private metrics: Metric[] = [];

  subscribe(callback: DataChangeCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.seedInitialData();
    this.notifyListeners();

    this.intervalId = window.setInterval(() => {
      this.generateMetrics();
      this.generateLogs();

      if (Math.random() > 0.9) {
        this.generateAlert();
      }

      if (Math.random() > 0.95) {
        this.generateIncident();
      }

      this.notifyListeners();
    }, 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private seedInitialData() {
    const oneHourAgo = Date.now() - 3600000;

    for (let i = 60; i > 0; i--) {
      const timestamp = new Date(Date.now() - i * 60000).toISOString();
      SERVICES.forEach(service => {
        this.metrics.push(
          { id: this.generateId(), metric_type: 'cpu', service, value: 20 + Math.random() * 60, timestamp },
          { id: this.generateId(), metric_type: 'memory', service, value: 30 + Math.random() * 50, timestamp },
          { id: this.generateId(), metric_type: 'latency', service, value: 100 + Math.random() * 400, timestamp },
          { id: this.generateId(), metric_type: 'error_rate', service, value: Math.random() * 5, timestamp }
        );
      });
    }

    const sampleIncident: Incident = {
      id: this.generateId(),
      title: 'Database connection pool exhausted',
      severity: 'critical',
      status: 'resolved',
      service: 'database-cluster',
      detected_at: new Date(oneHourAgo).toISOString(),
      resolved_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(oneHourAgo).toISOString()
    };

    this.incidents.push(sampleIncident);

    this.remediations.push({
      id: this.generateId(),
      incident_id: sampleIncident.id,
      action_type: 'restart',
      playbook: PLAYBOOKS.restart,
      status: 'completed',
      result: 'Database pod restarted successfully',
      executed_at: new Date(Date.now() - 1700000).toISOString(),
      completed_at: new Date(Date.now() - 1600000).toISOString()
    });

    for (let i = 0; i < 50; i++) {
      const severities: Array<'debug' | 'info' | 'warning' | 'error' | 'critical'> = ['debug', 'info', 'warning', 'error', 'critical'];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
      const messages = LOG_MESSAGES[severity];

      this.logs.push({
        id: this.generateId(),
        service,
        severity,
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        metadata: { source: 'seed', request_id: `req-${Math.random().toString(36).substr(2, 9)}` }
      });
    }
  }

  private generateMetrics() {
    const timestamp = new Date().toISOString();

    SERVICES.forEach(service => {
      this.metrics.push(
        { id: this.generateId(), metric_type: 'cpu', service, value: 20 + Math.random() * 60, timestamp },
        { id: this.generateId(), metric_type: 'memory', service, value: 30 + Math.random() * 50, timestamp },
        { id: this.generateId(), metric_type: 'latency', service, value: 100 + Math.random() * 400, timestamp },
        { id: this.generateId(), metric_type: 'error_rate', service, value: Math.random() * 5, timestamp }
      );
    });

    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => new Date(m.timestamp).getTime() > oneHourAgo);
  }

  private generateLogs() {
    const severities: Array<'debug' | 'info' | 'warning' | 'error' | 'critical'> = ['debug', 'info', 'warning', 'error', 'critical'];
    const weights = [0.3, 0.5, 0.15, 0.04, 0.01];

    const rand = Math.random();
    let cumulative = 0;
    let severity: 'debug' | 'info' | 'warning' | 'error' | 'critical' = 'info';

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        severity = severities[i];
        break;
      }
    }

    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const messages = LOG_MESSAGES[severity];
    const message = messages[Math.floor(Math.random() * messages.length)];

    this.logs.unshift({
      id: this.generateId(),
      service,
      severity,
      message,
      timestamp: new Date().toISOString(),
      metadata: {
        request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
        user_id: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : null
      }
    });

    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200);
    }
  }

  private generateAlert() {
    const alertTypes = ['cpu', 'memory', 'latency', 'error_rate', 'disk'];
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];

    const thresholds = { cpu: 80, memory: 85, latency: 500, error_rate: 5, disk: 90 };
    const threshold = thresholds[alertType as keyof typeof thresholds];
    const metricValue = threshold + Math.random() * 20;

    const severities: Array<'info' | 'warning' | 'critical'> = metricValue > threshold + 15 ? ['critical'] : metricValue > threshold + 5 ? ['warning'] : ['info'];
    const severity = severities[0];

    this.alerts.unshift({
      id: this.generateId(),
      alert_type: alertType,
      message: ALERT_MESSAGES[alertType as keyof typeof ALERT_MESSAGES],
      severity,
      metric_value: metricValue,
      threshold,
      service,
      created_at: new Date().toISOString()
    });

    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
  }

  private generateIncident() {
    const incidents = [
      { title: 'High CPU usage detected on payment-service', severity: 'warning' as const, service: 'payment-service' },
      { title: 'Container crash detected in auth-service', severity: 'critical' as const, service: 'auth-service' },
      { title: 'Memory leak detected in api-gateway', severity: 'warning' as const, service: 'api-gateway' },
      { title: 'Database query timeout', severity: 'critical' as const, service: 'database-cluster' },
      { title: 'Redis cache eviction rate high', severity: 'warning' as const, service: 'cache-redis' }
    ];

    const incident = incidents[Math.floor(Math.random() * incidents.length)];

    const newIncident: Incident = {
      id: this.generateId(),
      ...incident,
      status: 'open',
      detected_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    this.incidents.unshift(newIncident);

    if (incident.severity === 'critical') {
      const actions = ['restart', 'scale', 'rollback'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      const remediation: RemediationAction = {
        id: this.generateId(),
        incident_id: newIncident.id,
        action_type: action,
        playbook: PLAYBOOKS[action as keyof typeof PLAYBOOKS],
        status: 'running',
        result: '',
        executed_at: new Date().toISOString()
      };

      this.remediations.unshift(remediation);

      setTimeout(() => {
        remediation.status = 'completed';
        remediation.result = `Successfully executed ${action} action`;
        remediation.completed_at = new Date().toISOString();

        const incidentToUpdate = this.incidents.find(i => i.id === newIncident.id);
        if (incidentToUpdate) {
          incidentToUpdate.status = 'resolved';
          incidentToUpdate.resolved_at = new Date().toISOString();
        }

        this.notifyListeners();
      }, 8000);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(limit?: number): Metric[] {
    return limit ? this.metrics.slice(0, limit) : [...this.metrics];
  }

  getMetricsSince(timestamp: string): Metric[] {
    return this.metrics.filter(m => m.timestamp >= timestamp);
  }

  getLogs(limit?: number): Log[] {
    return limit ? this.logs.slice(0, limit) : [...this.logs];
  }

  getAlerts(limit?: number): Alert[] {
    return limit ? this.alerts.slice(0, limit) : [...this.alerts];
  }

  getIncidents(limit?: number): Incident[] {
    return limit ? this.incidents.slice(0, limit) : [...this.incidents];
  }

  getRemediations(limit?: number): RemediationAction[] {
    return limit ? this.remediations.slice(0, limit) : [...this.remediations];
  }

  getDataSince(hours: number) {
    const cutoffDate = new Date(Date.now() - hours * 3600000).toISOString();

    return {
      incidents: this.incidents.filter(i => i.detected_at >= cutoffDate),
      alerts: this.alerts.filter(a => a.created_at >= cutoffDate),
      remediations: this.remediations.filter(r => r.executed_at >= cutoffDate)
    };
  }
}

export const mockDataService = new MockDataService();
