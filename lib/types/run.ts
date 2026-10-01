export type RunStatus =
  | "CREATED"
  | "ANALYZING"
  | "AWAITING_CLARIFICATION"
  | "PLANNING"
  | "AWAITING_PLAN_APPROVAL"
  | "EXECUTING"
  | "AWAITING_REVIEW"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED"
  | "CANCELLED";

export type TaskStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "SKIPPED"
  | "ESCALATED";

export type ArtifactType =
  | "REQUIREMENT_ANALYSIS"
  | "CLARIFICATION_ANSWERS"
  | "PLAN"
  | "IMPACT_ANALYSIS"
  | "ARCHITECTURE"
  | "OPENAPI"
  | "SOURCE_CODE"
  | "TEST_CODE"
  | "VALIDATION_REPORT"
  | "RUNTIME_VERIFICATION"
  | "RISK_REGISTER"
  | "DOCUMENTATION"
  | "SUMMARY"
  | "EXECUTABLE";

export interface AuditRecord {
  id: number;
  runId: string;
  timestamp: string;
  actor: string;
  eventType: string;
  detail: string;
}

export interface ArtifactResponse {
  id: number;
  taskKey?: string;
  type: ArtifactType;
  path: string;
  revision: number;
  createdAt?: string;
  content?: string | null;
}

export interface StartRunRequest {
  requirement: string;
  scenario?: string;
}

export interface RunResponse {
  id: string;
  requirement: string;
  scenario?: string;
  status: RunStatus;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskResponse {
  id: number;
  taskKey: string;
  title: string;
  description: string;
  agent: string;
  dependsOn: string[];
  status: TaskStatus;
  attempts: number;
  lastError?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface RunStatusResponse {
  run: RunResponse;
  tasks: TaskResponse[];
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  pendingTasks: number;
}

export interface RunEvent {
  type: string;
  runId: string;
  timestamp: string;
  run: RunResponse;
  tasks: TaskResponse[];
}