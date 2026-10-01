import { useQuery } from "@tanstack/react-query";
import {
  getArtifact,
  getArtifacts,
} from "../lib/api/runs";

export function useArtifacts(runId?: string) {
  return useQuery({
    queryKey: ["artifacts", runId],
    queryFn: () => getArtifacts(runId as string),
    enabled: Boolean(runId),
  });
}

export function useArtifact(
  runId?: string,
  artifactId?: number
) {
  return useQuery({
    queryKey: ["artifact", runId, artifactId],
    queryFn: () =>
      getArtifact(
        runId as string,
        artifactId as number
      ),
    enabled:
      Boolean(runId) &&
      typeof artifactId === "number",
  });
}