/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LsoZone = 'core' | 'storefront-renderer' | 'checkout-web';

export interface OnDutyMember {
  name: string;
  role: 'Primary' | 'Secondary' | 'Manager';
  activeSince: string;
}

export interface PagerDutySchedule {
  currentOnCall: OnDutyMember[];
  escalationPolicy: string;
  nextShiftChange: string;
}

export interface DeploymentStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
}

export interface ZoneDeployment {
  id: string;
  zone: LsoZone;
  version: string;
  status: 'queued' | 'running' | 'manual_confirmation' | 'success' | 'failed' | 'rolling_back';
  progress: number;
  deployedBy: string;
  startedAt: string;
  updatedAt: string;
  stages: DeploymentStage[];
  logs: string[];
  sourceUrl?: string;
}

export interface IncidentTimelineEvent {
  time: string;
  text: string;
  author: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'triggered' | 'acknowledged' | 'resolved';
  impactedZones: LsoZone[];
  openedAt: string;
  closedAt?: string;
  assignedTo: string;
  summary?: string;
  timeline: IncidentTimelineEvent[];
  sourceUrl?: string;
}

export interface PipelineRun {
  id: string;
  zone: LsoZone;
  branch: string;
  commitHash: string;
  author: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  startedAt: string;
  duration?: string; // e.g. "2m 14s"
  failedStep?: string;
  logSnippet?: string;
  sourceUrl?: string;
}

export interface AIAnalysisResult {
  rootCause: string;
  impactScore: string;
  recommendedActions: string[];
  remediationSnippet?: string;
}
