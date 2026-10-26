import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentStatus } from '../../types/incident';
import { CategoryBadge, SeverityBadge, StatusBadge } from './StatusBadge';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import {
  formatDate,
  formatTimeAgo,
  maskContactInfo,
  getResourceTypeLabel,
} from '../../utils/formatters';
import {
  X,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  Send,
  AlertOctagon,
  CheckCircle,
  Truck,
  MessageSquare,
  Lock,
  History,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const IncidentDetailsModal: React.FC = () => {
  const {
    selectedIncident,
    setSelectedIncident,
    updateIncidentStatus,
    addInternalNote,
    overridePriority,
    assignResourceToIncident,
    releaseResource,
    resources,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMELINE' | 'NOTES'>('OVERVIEW');
  const [newNote, setNewNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [showOverrideBox, setShowOverrideBox] = useState(false);
  const [overrideTier, setOverrideTier] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');
  const [overrideRationale, setOverrideRationale] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  if (!selectedIncident) return null;

  const incident = selectedIncident;
  const isAuthorized = currentUser.role === 'COORDINATOR' || currentUser.role === 'ADMINISTRATOR';

  const availableResources = resources.filter(
    (r) => r.status === 'AVAILABLE' || r.id === incident.assignedResourceId
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addInternalNote(incident.id, newNote.trim());
    setNewNote('');
  };

  const handleOverridePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideRationale.trim()) return;
    overridePriority(incident.id, overrideTier, overrideRationale.trim());
    setShowOverrideBox(false);
    setOverrideRationale('');
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;
    assignResourceToIncident(incident.id, selectedResourceId, dispatchNotes.trim());
    setSelectedResourceId('');
    setDispatchNotes('');
  };

  const handleRejectOrDuplicate = (status: 'REJECTED' | 'DUPLICATE') => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejecting or flagging duplicate.');
      return;
    }
    updateIncidentStatus(incident.id, status, rejectReason.trim());
    setShowRejectBox(false);
    setRejectReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={() => setSelectedIncident(null)}
        aria-hidden="true"
      />

      {/* Modal / Slide-in Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {incident.id}
              </span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              <CategoryBadge category={incident.category} />
              <PriorityScoreBadge priority={incident.priority} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {incident.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{incident.locationName}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{incident.affectedCount} individuals affected</span>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Reported {formatTimeAgo(incident.createdAt)}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedIncident(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close incident details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Action Bar for Coordinators */}
        {isAuthorized && incident.status !== 'RESOLVED' && incident.status !== 'REJECTED' && (
          <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Workflow Progression:</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {incident.status === 'REPORTED' && (
                <button
                  onClick={() => updateIncidentStatus(incident.id, 'UNDER_REVIEW')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors"
                >
                  Mark Under Review
                </button>
              )}

              {(incident.status === 'REPORTED' || incident.status === 'UNDER_REVIEW') && (
                <button
                  onClick={() => updateIncidentStatus(incident.id, 'VERIFIED')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify Incident</span>
                </button>
              )}

              {incident.status === 'ASSIGNED' && (
                <button
                  onClick={() => updateIncidentStatus(incident.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
                >
                  Confirm In Progress
                </button>
              )}

              <button
                onClick={() => {
                  const reason = prompt('Resolution summary / closing report notes:');
                  if (reason !== null) {
                    updateIncidentStatus(incident.id, 'RESOLVED', reason);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>

              <button
                onClick={() => setShowOverrideBox(!showOverrideBox)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold border border-amber-500/30 transition-colors"
              >
                Override Priority
              </button>

              <button
                onClick={() => setShowRejectBox(!showRejectBox)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold border border-rose-500/30 transition-colors"
              >
                Reject / Duplicate
              </button>
            </div>
          </div>
        )}

        {/* Priority Override Box */}
        {showOverrideBox && (
          <form
            onSubmit={handleOverridePriority}
            className="p-4 bg-amber-950/30 border-b border-amber-500/30 text-xs flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
          >
            <div className="font-bold text-amber-300 shrink-0">Priority Override:</div>
            <select
              value={overrideTier}
              onChange={(e) => setOverrideTier(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="P1">P1 — Critical Immediate</option>
              <option value="P2">P2 — High Urgency</option>
              <option value="P3">P3 — Elevated Priority</option>
              <option value="P4">P4 — Standard Queue</option>
            </select>
            <input
              type="text"
              value={overrideRationale}
              onChange={(e) => setOverrideRationale(e.target.value)}
              placeholder="Mandatory coordinator reason for override..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-500"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-white"
              >
                Save Override
              </button>
              <button
                type="button"
                onClick={() => setShowOverrideBox(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reject / Duplicate Box */}
        {showRejectBox && (
          <div className="p-4 bg-rose-950/30 border-b border-rose-500/30 text-xs flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
            <div className="font-bold text-rose-300 shrink-0">Close as Invalid:</div>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (e.g. false alarm, duplicate of RESQ-1001)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRejectOrDuplicate('REJECTED')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-white"
              >
                Confirm Reject
              </button>
              <button
                type="button"
                onClick={() => handleRejectOrDuplicate('DUPLICATE')}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white"
              >
                Mark Duplicate
              </button>
              <button
                type="button"
                onClick={() => setShowRejectBox(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/30 flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'TIMELINE'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Timeline ({incident.timeline.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('NOTES')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'NOTES'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Coordination Notes ({incident.internalNotes.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Detailed Situation Report
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                    {incident.description}
                  </p>
                </div>

                {/* Resource Assignment Section */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-indigo-400" />
                      <span>Response Unit Assignment</span>
                    </h3>
                    {incident.assignedResourceId && isAuthorized && incident.status !== 'RESOLVED' && (
                      <button
                        onClick={() => releaseResource(incident.assignedResourceId!, incident.id)}
                        className="text-[11px] text-red-400 hover:text-red-300 font-semibold underline"
                      >
                        Release Unit
                      </button>
                    )}
                  </div>

                  {incident.assignedResourceId ? (
                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-indigo-200">
                          {incident.assignedResourceName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Unit ID: {incident.assignedResourceId} • Assigned {formatTimeAgo(incident.assignedAt || incident.updatedAt)}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                        Dispatched
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-400 mb-3">
                        No team is currently assigned to this incident.
                      </p>
                      {isAuthorized && incident.status !== 'RESOLVED' ? (
                        <form onSubmit={handleDispatch} className="space-y-2.5">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={selectedResourceId}
                              onChange={(e) => setSelectedResourceId(e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                              required
                            >
                              <option value="">-- Select Available Response Team --</option>
                              {availableResources.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} ({getResourceTypeLabel(r.type)}) - {r.serviceArea}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              disabled={!selectedResourceId}
                              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shrink-0"
                            >
                              Dispatch Unit
                            </button>
                          </div>
                          <input
                            type="text"
                            value={dispatchNotes}
                            onChange={(e) => setDispatchNotes(e.target.value)}
                            placeholder="Optional dispatch mission instructions or radio channel..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500"
                          />
                        </form>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          Switch to Coordinator or Administrator role to dispatch resources.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Location and Coordinates Details */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Location & GIS Coordinates
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500">Address / Description:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{incident.locationName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">GPS Coordinates:</span>
                      <p className="font-mono text-slate-200 mt-0.5">
                        {incident.coordinates.lat.toFixed(5)}, {incident.coordinates.lng.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Metadata, Reporter Info & Score Breakdown */}
              <div className="space-y-6">
                {/* Reporter Contact Information (Privacy Restricted) */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold uppercase tracking-wider text-slate-400">
                      Reporter Identity
                    </h3>
                    {!isAuthorized && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>Masked</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500">Reporter Name:</span>
                    <p className="font-semibold text-slate-200">
                      {incident.reporterName || 'Anonymous Citizen'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">Contact Number:</span>
                    <p className="font-mono text-slate-200">
                      {maskContactInfo(incident.reporterContact, currentUser.role)}
                    </p>
                  </div>

                  {!isAuthorized && (
                    <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-slate-800">
                      Contact details are private and visible only to authorized emergency coordinators.
                    </p>
                  )}
                </div>

                {/* Priority Score Summary */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-400">
                    Smart Triage Score
                  </h3>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-red-400 text-sm">
                      {incident.priority.tierLabel}
                    </span>
                    <span className="font-mono text-2xl font-black">
                      {incident.priority.totalScore}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex justify-between py-0.5 border-b border-slate-800">
                      <span className="text-slate-400">Severity Weight (45%)</span>
                      <span className="font-mono">{incident.priority.severityScore}/100</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-800">
                      <span className="text-slate-400">Affected Weight (25%)</span>
                      <span className="font-mono">{incident.priority.affectedScore}/100</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-800">
                      <span className="text-slate-400">Wait Time Weight (20%)</span>
                      <span className="font-mono">{incident.priority.waitingScore}/100</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Verification Weight (10%)</span>
                      <span className="font-mono">{incident.priority.verificationScore}/100</span>
                    </div>
                  </div>

                  {incident.priority.isOverridden && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                      <p className="font-bold">Manual Priority Override Active</p>
                      <p className="text-[10px] opacity-80 mt-0.5">{incident.priority.overrideReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Official audit trail recording every state change, verification, and dispatch event.
              </p>
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                {incident.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{event.actorName}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                          {event.actorRole}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono ml-auto">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'NOTES' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              {isAuthorized ? (
                <form onSubmit={handleAddNote} className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Add Coordinator Note (Internal Dispatchers Only)
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    placeholder="Document tactical observations, staging zones, hospital contact notes..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Internal Note</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  Internal notes are reserved for Coordinators and Administrators.
                </div>
              )}

              {/* Note List */}
              <div className="space-y-3">
                {incident.internalNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">
                    No internal coordination notes recorded yet.
                  </p>
                ) : (
                  incident.internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{note.authorName}</span>
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {note.authorRole}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
