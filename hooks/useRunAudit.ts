import { useQuery } from "@tanstack/react-query";

import { getRunAudit } from "../lib/api/runs";

export function useRunAudit(runId?: string) {
  return useQuery({
    queryKey: ["run-audit", runId],
    queryFn: () => {
      if (!runId) {
        throw new Error("Run id is required");
      }

      return getRunAudit(runId);
    },
    enabled: Boolean(runId),
    staleTime: 5_000,
  });
}
