import { IncidentStatus, PriorityBreakdown, SeverityLevel } from '../types/incident';

export interface PriorityFactors {
  severity: SeverityLevel;
  affectedCount: number;
  createdAt: string; // ISO string
  status: IncidentStatus;
  currentTime?: Date;
}

/**
 * Normalizes Severity level to 0 - 100 scale
 * Critical: 100
 * High: 75
 * Medium: 45
 * Low: 20
 */
export function calculateSeverityScore(severity: SeverityLevel): number {
  switch (severity) {
    case 'CRITICAL':
      return 100;
    case 'HIGH':
      return 75;
    case 'MEDIUM':
      return 45;
    case 'LOW':
      return 20;
    default:
      return 30;
  }
}

/**
 * Normalizes affected people count to 0 - 100 scale.
 * Logarithmic-style stepped scale with documented cap:
 * 0 or 1 person: 20
 * 2 - 5 people: 50
 * 6 - 15 people: 75
 * 16 - 30 people: 90
 * > 30 people: 100 (capped at 100)
 */
export function calculateAffectedScore(count: number): number {
  if (count <= 0) return 15;
  if (count === 1) return 25;
  if (count <= 5) return 50;
  if (count <= 15) return 75;
  if (count <= 30) return 90;
  return 100;
}

/**
 * Calculates waiting time score (0 - 100).
 * Measures time elapsed without assignment.
 * Capped at 120 minutes (2 hours) = 100 score.
 * Formula: Math.min(100, Math.round((minutesWaiting / 120) * 100))
 */
export function calculateWaitingScore(createdAt: string, status: IncidentStatus, now: Date = new Date()): number {
  // If incident is already resolved, rejected, or duplicate, waiting urgency is 0
  if (status === 'RESOLVED' || status === 'REJECTED' || status === 'DUPLICATE') {
    return 0;
  }

  const createdTime = new Date(createdAt).getTime();
  const currentMs = now.getTime();
  const diffMinutes = Math.max(0, (currentMs - createdTime) / (1000 * 60));

  // Cap at 120 minutes = 100 score
  const score = Math.min(100, Math.round((diffMinutes / 120) * 100));
  return score;
}

/**
 * Normalizes verification status to 0 - 100 scale.
 * Note: Unverified does NOT mean safe to ignore; unverified incidents still receive 40 base score,
 * while under-review gets 65 and verified gets 100.
 */
export function calculateVerificationScore(status: IncidentStatus): number {
  switch (status) {
    case 'VERIFIED':
    case 'ASSIGNED':
    case 'IN_PROGRESS':
      return 100;
    case 'UNDER_REVIEW':
      return 65;
    case 'REPORTED':
      return 40;
    case 'RESOLVED':
      return 50;
    case 'REJECTED':
    case 'DUPLICATE':
      return 0;
    default:
      return 40;
  }
}

/**
 * Computes the overall rule-based priority score and transparent factor breakdown.
 * Weights:
 * - Severity: 45% (0.45)
 * - People affected: 25% (0.25)
 * - Waiting time: 20% (0.20)
 * - Verification status: 10% (0.10)
 */
export function computeSmartPriorityScore(factors: PriorityFactors): PriorityBreakdown {
  const now = factors.currentTime || new Date();

  const severityNorm = calculateSeverityScore(factors.severity);
  const affectedNorm = calculateAffectedScore(factors.affectedCount);
  const waitingNorm = calculateWaitingScore(factors.createdAt, factors.status, now);
  const verificationNorm = calculateVerificationScore(factors.status);

  // Weighted calculation
  const weightedSeverity = severityNorm * 0.45;
  const weightedAffected = affectedNorm * 0.25;
  const weightedWaiting = waitingNorm * 0.20;
  const weightedVerification = verificationNorm * 0.10;

  const rawTotal = weightedSeverity + weightedAffected + weightedWaiting + weightedVerification;
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  // Tier classification
  let tier: 'P1' | 'P2' | 'P3' | 'P4';
  let tierLabel: string;

  if (totalScore >= 80) {
    tier = 'P1';
    tierLabel = 'P1 — Critical Immediate Action';
  } else if (totalScore >= 60) {
    tier = 'P2';
    tierLabel = 'P2 — High Urgency';
  } else if (totalScore >= 40) {
    tier = 'P3';
    tierLabel = 'P3 — Elevated Priority';
  } else {
    tier = 'P4';
    tierLabel = 'P4 — Standard Queue';
  }

  // Rationale generator
  const rationale: string[] = [];

  if (factors.severity === 'CRITICAL') {
    rationale.push('Life-safety risk rated CRITICAL (+45.0 max contribution)');
  } else if (factors.severity === 'HIGH') {
    rationale.push('High-risk hazards present (+33.8 contribution)');
  }

  if (factors.affectedCount >= 10) {
    rationale.push(`Substantial group impacted (${factors.affectedCount} individuals, +${(weightedAffected).toFixed(1)} contribution)`);
  } else if (factors.affectedCount > 1) {
    rationale.push(`Multiple individuals affected (${factors.affectedCount} persons)`);
  }

  if (waitingNorm >= 60) {
    rationale.push(`Incident has been queued over 1 hour awaiting dispatch (+${(weightedWaiting).toFixed(1)} contribution)`);
  }

  if (factors.status === 'VERIFIED') {
    rationale.push('Eyewitness/Coordinator confirmation verified report authenticity');
  } else if (factors.status === 'REPORTED') {
    rationale.push('Awaiting field verification (baseline weight applied)');
  }

  return {
    totalScore,
    tier,
    tierLabel,
    severityScore: Math.round(severityNorm),
    affectedScore: Math.round(affectedNorm),
    waitingScore: Math.round(waitingNorm),
    verificationScore: Math.round(verificationNorm),
    rationale,
  };
}
