import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approvePlan,
  approveResult,
  cancelRun,
  createRun,
  rejectResult,
  resumeRun,
  submitClarifications,
} from "../lib/api/runs";
import { StartRunRequest } from "../lib/types/run";

export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartRunRequest) =>
      createRun(request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}

export function useSubmitClarifications(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: Record<string, string>) =>
      submitClarifications(runId, answers),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["run", runId],
      });

      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}

export function useApprovePlan(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (removedTaskKeys: string[] = []) =>
      approvePlan(runId, removedTaskKeys),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["run", runId],
      });

      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}

export function useApproveResult(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => approveResult(runId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["run", runId],
      });

      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}

export function useRejectResult(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) =>
      rejectResult(runId, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["run", runId],
      });

      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}

export function useCancelRun(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelRun(runId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["run", runId],
      });

      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}

export function useResumeRun(runId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resumeRun(runId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["run", runId],
      });

      queryClient.invalidateQueries({
        queryKey: ["runs"],
      });
    },
  });
}