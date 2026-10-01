import { useQuery } from "@tanstack/react-query";
import { getRun, getRuns } from "../lib/api/runs";

export function useRuns() {
  return useQuery({
    queryKey: ["runs"],
    queryFn: getRuns,
  });
}

export function useRun(runId?: string) {
  return useQuery({
    queryKey: ["runs", runId],
    queryFn: () => getRun(runId as string),
    enabled: Boolean(runId),
  });
}