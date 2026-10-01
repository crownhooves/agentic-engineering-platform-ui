import {
  apiFetch,
  getApiBaseUrl,
} from "./client";

import {
  ArtifactResponse,
  AuditRecord,
  RunResponse,
  RunStatusResponse,
  StartRunRequest,
} from "../types/run";

export async function getRuns(): Promise<RunStatusResponse[]> {
  return apiFetch<RunStatusResponse[]>("/api/runs");
}

export async function getRun(
  runId: string
): Promise<RunStatusResponse> {
  return apiFetch<RunStatusResponse>(
    `/api/runs/${runId}`
  );
}

export async function getRunAudit(
  runId: string
): Promise<AuditRecord[]> {
  return apiFetch<AuditRecord[]>(
    `/api/runs/${runId}/audit`
  );
}

export async function createRun(
  request: StartRunRequest
): Promise<RunResponse> {
  return apiFetch<RunResponse>("/api/runs", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function submitClarifications(
  runId: string,
  answers: Record<string, string>
): Promise<void> {
  await apiFetch<void>(
    `/api/runs/${runId}/clarifications`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    }
  );
}

export async function approvePlan(
  runId: string,
  removedTaskKeys: string[] = []
): Promise<void> {
  await apiFetch<void>(
    `/api/runs/${runId}/plan/approve`,
    {
      method: "POST",
      body: JSON.stringify({ removedTaskKeys }),
    }
  );
}

export async function approveResult(
  runId: string
): Promise<void> {
  await apiFetch<void>(
    `/api/runs/${runId}/result/approve`,
    {
      method: "POST",
    }
  );
}

export async function rejectResult(
  runId: string,
  reason?: string
): Promise<void> {
  await apiFetch<void>(
    `/api/runs/${runId}/result/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
}

export async function cancelRun(
  runId: string
): Promise<void> {
  await apiFetch<void>(
    `/api/runs/${runId}/cancel`,
    {
      method: "POST",
    }
  );
}

export async function resumeRun(
  runId: string
): Promise<void> {
  await apiFetch<void>(
    `/api/runs/${runId}/resume`,
    {
      method: "POST",
    }
  );
}

export async function getArtifacts(
  runId: string
): Promise<ArtifactResponse[]> {
  return apiFetch<ArtifactResponse[]>(
    `/api/runs/${runId}/artifacts`
  );
}

export async function getArtifact(
  runId: string,
  artifactId: number
): Promise<ArtifactResponse> {
  return apiFetch<ArtifactResponse>(
    `/api/runs/${runId}/artifacts/${artifactId}`
  );
}

/**
 * Returns the direct download URL for the executable
 * generated for a run.
 *
 * This intentionally does not use apiFetch because
 * apiFetch expects a JSON response, while this endpoint
 * streams a binary JAR file.
 */
export function getExecutableDownloadUrl(
  runId: string
): string {
  return `${getApiBaseUrl()}/api/runs/${runId}/executable`;
}