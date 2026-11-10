export interface Incident {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  service: string;
  detected_at: string;
  resolved_at?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  incident_id?: string;
  alert_type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  metric_value: number;
  threshold: number;
  service: string;
  created_at: string;
}

export interface Log {
  id: string;
  service: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RemediationAction {
  id: string;
  incident_id?: string;
  action_type: string;
  playbook: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: string;
  executed_at: string;
  completed_at?: string;
}

export interface Metric {
  id: string;
  metric_type: string;
  service: string;
  value: number;
  timestamp: string;
}
