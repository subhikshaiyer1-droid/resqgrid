import { describe, expect, it } from 'vitest';
import {
  calculateAffectedScore,
  calculateSeverityScore,
  calculateVerificationScore,
  calculateWaitingScore,
  computeSmartPriorityScore,
} from '../utils/priorityEngine';

describe('Smart Prioritization Engine', () => {
  it('correctly maps severity levels to 0-100 normalization', () => {
    expect(calculateSeverityScore('CRITICAL')).toBe(100);
    expect(calculateSeverityScore('HIGH')).toBe(75);
    expect(calculateSeverityScore('MEDIUM')).toBe(45);
    expect(calculateSeverityScore('LOW')).toBe(20);
  });

  it('correctly caps and scales affected people score', () => {
    expect(calculateAffectedScore(0)).toBe(15);
    expect(calculateAffectedScore(1)).toBe(25);
    expect(calculateAffectedScore(4)).toBe(50);
    expect(calculateAffectedScore(12)).toBe(75);
    expect(calculateAffectedScore(25)).toBe(90);
    expect(calculateAffectedScore(100)).toBe(100);
  });

  it('calculates waiting score and caps at 120 minutes', () => {
    const fixedNow = new Date('2026-10-26T12:00:00Z');
    
    // 30 minutes waiting
    const thirtyMinAgo = new Date('2026-10-26T11:30:00Z').toISOString();
    expect(calculateWaitingScore(thirtyMinAgo, 'REPORTED', fixedNow)).toBe(25);

    // 120 minutes waiting
    const twoHoursAgo = new Date('2026-10-26T10:00:00Z').toISOString();
    expect(calculateWaitingScore(twoHoursAgo, 'REPORTED', fixedNow)).toBe(100);

    // 4 hours waiting (capped at 100)
    const fourHoursAgo = new Date('2026-10-26T08:00:00Z').toISOString();
    expect(calculateWaitingScore(fourHoursAgo, 'REPORTED', fixedNow)).toBe(100);

    // Resolved incidents have 0 waiting score
    expect(calculateWaitingScore(fourHoursAgo, 'RESOLVED', fixedNow)).toBe(0);
  });

  it('assigns baseline verification score to avoid ignoring unverified reports', () => {
    expect(calculateVerificationScore('REPORTED')).toBe(40);
    expect(calculateVerificationScore('UNDER_REVIEW')).toBe(65);
    expect(calculateVerificationScore('VERIFIED')).toBe(100);
  });

  it('computes total score and assigns correct P1 tier for critical incidents', () => {
    const fixedNow = new Date('2026-10-26T12:00:00Z');
    const result = computeSmartPriorityScore({
      severity: 'CRITICAL',
      affectedCount: 20,
      createdAt: new Date('2026-10-26T10:00:00Z').toISOString(), // 2 hrs waiting
      status: 'VERIFIED',
      currentTime: fixedNow,
    });

    // Severity: 100 * 0.45 = 45
    // Affected: 90 * 0.25 = 22.5
    // Waiting: 100 * 0.20 = 20
    // Verification: 100 * 0.10 = 10
    // Total = 45 + 22.5 + 20 + 10 = 97.5 => 98
    expect(result.totalScore).toBeGreaterThanOrEqual(95);
    expect(result.tier).toBe('P1');
    expect(result.rationale.length).toBeGreaterThan(0);
  });

  it('computes lower tier for low severity single-person reported incident', () => {
    const fixedNow = new Date('2026-10-26T12:00:00Z');
    const result = computeSmartPriorityScore({
      severity: 'LOW',
      affectedCount: 1,
      createdAt: new Date('2026-10-26T11:55:00Z').toISOString(), // 5 min waiting
      status: 'REPORTED',
      currentTime: fixedNow,
    });

    // Severity: 20 * 0.45 = 9
    // Affected: 25 * 0.25 = 6.25
    // Waiting: 4 * 0.20 = 0.8
    // Verification: 40 * 0.10 = 4
    // Total ~ 20
    expect(result.totalScore).toBeLessThan(40);
    expect(result.tier).toBe('P4');
  });
});
