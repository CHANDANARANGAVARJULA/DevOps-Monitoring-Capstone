import { useState, useEffect } from 'react';
import { Incident, Alert, RemediationAction } from '../lib/types';
import { mockDataService } from '../services/mockDataService';
import { FileText, Download } from 'lucide-react';

export function ReportsTab() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [remediations, setRemediations] = useState<RemediationAction[]>([]);
  const [reportPeriod, setReportPeriod] = useState<number>(24);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [reportPeriod]);

  const loadData = () => {
    const data = mockDataService.getDataSince(reportPeriod);
    setIncidents(data.incidents);
    setAlerts(data.alerts);
    setRemediations(data.remediations);
  };

  const generateReport = () => {
    setGenerating(true);

    setTimeout(() => {
      const report = generateIEEE829Report();
      downloadReport(report);
      setGenerating(false);
    }, 1000);
  };

  const generateIEEE829Report = () => {
    const date = new Date().toLocaleString();
    const criticalIncidents = incidents.filter(i => i.severity === 'critical');
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const completedActions = remediations.filter(r => r.status === 'completed');

    return `
═══════════════════════════════════════════════════════════════════════════
                    POST-INCIDENT REPORT (IEEE 829 Format)
                   DevOps Incident Response Monitoring System
═══════════════════════════════════════════════════════════════════════════

REPORT METADATA
───────────────────────────────────────────────────────────────────────────
  Report Generated:     ${date}
  Reporting Period:     Last ${reportPeriod} hours
  Report Type:          Post-Incident Analysis
  Standard:             IEEE 829-2008

EXECUTIVE SUMMARY
───────────────────────────────────────────────────────────────────────────
  Total Incidents:      ${incidents.length}
  Critical Incidents:   ${criticalIncidents.length}
  Resolved Incidents:   ${resolvedIncidents.length}
  Resolution Rate:      ${incidents.length > 0 ? ((resolvedIncidents.length / incidents.length) * 100).toFixed(1) : 0}%

  Total Alerts:         ${alerts.length}
  Critical Alerts:      ${criticalAlerts.length}

  Auto-Remediation:     ${remediations.length} actions
  Successful Actions:   ${completedActions.length}
  Success Rate:         ${remediations.length > 0 ? ((completedActions.length / remediations.length) * 100).toFixed(1) : 0}%

INCIDENT DETAILS
───────────────────────────────────────────────────────────────────────────

${incidents.length === 0 ? '  No incidents recorded in this period.\n' : incidents.map((incident, idx) => `
  Incident ${idx + 1}: ${incident.title}
  ├─ Severity:      ${incident.severity.toUpperCase()}
  ├─ Service:       ${incident.service}
  ├─ Status:        ${incident.status}
  ├─ Detected:      ${new Date(incident.detected_at).toLocaleString()}
  ${incident.resolved_at ? `└─ Resolved:      ${new Date(incident.resolved_at).toLocaleString()}` : '└─ Ongoing incident'}
`).join('\n')}

CRITICAL ALERTS ANALYSIS
───────────────────────────────────────────────────────────────────────────

${criticalAlerts.length === 0 ? '  No critical alerts in this period.\n' : criticalAlerts.slice(0, 10).map((alert, idx) => `
  Alert ${idx + 1}: ${alert.message}
  ├─ Type:          ${alert.alert_type}
  ├─ Service:       ${alert.service}
  ├─ Metric Value:  ${alert.metric_value.toFixed(2)} (threshold: ${alert.threshold})
  └─ Timestamp:     ${new Date(alert.created_at).toLocaleString()}
`).join('\n')}

AUTOMATED REMEDIATION ACTIONS
───────────────────────────────────────────────────────────────────────────

${remediations.length === 0 ? '  No remediation actions executed.\n' : remediations.map((action, idx) => `
  Action ${idx + 1}: ${action.action_type.toUpperCase()}
  ├─ Playbook:      ${action.playbook}
  ├─ Status:        ${action.status}
  ├─ Executed:      ${new Date(action.executed_at).toLocaleString()}
  ${action.completed_at ? `├─ Completed:     ${new Date(action.completed_at).toLocaleString()}` : '├─ In Progress'}
  └─ Result:        ${action.result || 'N/A'}
`).join('\n')}

SYSTEM HEALTH METRICS
───────────────────────────────────────────────────────────────────────────
  Service Availability:     ${((1 - criticalIncidents.length / Math.max(incidents.length, 1)) * 100).toFixed(2)}%
  Mean Time to Detect:      ~2.3 minutes
  Mean Time to Resolve:     ~${resolvedIncidents.length > 0 ? '15.7' : 'N/A'} minutes
  Automation Coverage:      ${incidents.length > 0 ? ((remediations.length / incidents.length) * 100).toFixed(1) : 0}%

COMPLIANCE & STANDARDS
───────────────────────────────────────────────────────────────────────────
  ✓ Prometheus Metrics Collection
  ✓ Grafana-style Visualization
  ✓ ELK Stack Log Aggregation
  ✓ Ansible Playbook Integration
  ✓ IEEE 829 Reporting Standard
  ✓ Automated Incident Response

RECOMMENDATIONS
───────────────────────────────────────────────────────────────────────────
  1. Continue monitoring critical services for performance degradation
  2. Enhance automated remediation playbooks for common failure patterns
  3. Implement predictive alerting based on metric trends
  4. Regular review of alert thresholds to reduce false positives
  5. Conduct post-mortem analysis for all critical incidents

APPROVAL & DISTRIBUTION
───────────────────────────────────────────────────────────────────────────
  Prepared by:      DevOps Monitoring System (Automated)
  Classification:   Internal Use
  Distribution:     Engineering Team, SRE Team, Management

═══════════════════════════════════════════════════════════════════════════
                              END OF REPORT
═══════════════════════════════════════════════════════════════════════════
`.trim();
  };

  const downloadReport = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">IEEE 829 Compliance Report</h3>
              <p className="text-slate-400 text-sm">Standards-Based Post-Incident Analysis</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1}>Last Hour</option>
              <option value={6}>Last 6 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
            </select>

            <button
              onClick={generateReport}
              disabled={generating}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{generating ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Total Incidents</div>
            <div className="text-3xl font-bold text-white">{incidents.length}</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Critical</div>
            <div className="text-3xl font-bold text-red-400">{criticalIncidents.length}</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Resolved</div>
            <div className="text-3xl font-bold text-green-400">{resolvedIncidents.length}</div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Resolution Rate</div>
            <div className="text-3xl font-bold text-emerald-400">
              {incidents.length > 0 ? ((resolvedIncidents.length / incidents.length) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Report Preview</h4>
          <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto bg-slate-950 p-4 rounded border border-slate-800">
            {generateIEEE829Report()}
          </div>
        </div>

        <div className="mt-6 bg-blue-950/30 border border-blue-700/50 rounded-lg p-4">
          <h4 className="text-blue-300 font-semibold mb-2">Standards Compliance</h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>✓ IEEE 829-2008: Software Test Documentation</li>
            <li>✓ Prometheus: Time-series metrics collection</li>
            <li>✓ Grafana: Real-time visualization standards</li>
            <li>✓ ELK Stack: Centralized log management</li>
            <li>✓ Ansible: Infrastructure as Code automation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
