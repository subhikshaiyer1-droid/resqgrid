import { Incident } from '../types/incident';
import { Resource } from '../types/resource';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(cell: string | number | undefined | null): string {
  if (cell === undefined || cell === null) return '""';
  const str = String(cell);
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportIncidentsToCSV(incidents: Incident[]): void {
  const headers = [
    'Incident ID',
    'Title',
    'Category',
    'Severity',
    'Priority Tier',
    'Priority Score',
    'Status',
    'People Affected',
    'Location Name',
    'Latitude',
    'Longitude',
    'Assigned Unit',
    'Created At',
    'Verified At',
    'Resolved At',
  ];

  const rows = incidents.map((inc) => [
    escapeCsvCell(inc.id),
    escapeCsvCell(inc.title),
    escapeCsvCell(inc.category),
    escapeCsvCell(inc.severity),
    escapeCsvCell(inc.priority.tier),
    escapeCsvCell(inc.priority.totalScore),
    escapeCsvCell(inc.status),
    escapeCsvCell(inc.affectedCount),
    escapeCsvCell(inc.locationName),
    escapeCsvCell(inc.coordinates.lat),
    escapeCsvCell(inc.coordinates.lng),
    escapeCsvCell(inc.assignedResourceName || 'Unassigned'),
    escapeCsvCell(inc.createdAt),
    escapeCsvCell(inc.verifiedAt || ''),
    escapeCsvCell(inc.resolvedAt || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `resqgrid-incidents-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportResourcesToCSV(resources: Resource[]): void {
  const headers = [
    'Resource ID',
    'Name',
    'Type',
    'Status',
    'Service Area',
    'Capacity',
    'Contact Lead',
    'Skills',
    'Current Incident ID',
    'Current Incident Title',
    'Last Active',
  ];

  const rows = resources.map((res) => [
    escapeCsvCell(res.id),
    escapeCsvCell(res.name),
    escapeCsvCell(res.type),
    escapeCsvCell(res.status),
    escapeCsvCell(res.serviceArea),
    escapeCsvCell(res.capacity),
    escapeCsvCell(res.contactPerson),
    escapeCsvCell(res.skills.join('; ')),
    escapeCsvCell(res.currentIncidentId || ''),
    escapeCsvCell(res.currentIncidentTitle || ''),
    escapeCsvCell(res.lastActive),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `resqgrid-resources-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}
