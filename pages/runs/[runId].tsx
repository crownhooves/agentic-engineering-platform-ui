
import Link from "next/link";
import { useRouter } from "next/router";

import AppShell from "../../components/layout/AppShell";

import ActivityFeed from "../../components/runs/ActivityFeed";
import TaskTimeline from "../../components/runs/TaskTimeline";
import EvidencePanel from "../../components/runs/EvidencePanel";

import AuditTrail from "../../components/evidence/AuditTrail";

import ClarificationPanel from "../../components/approvals/ClarificationPanel";
import PlanApprovalPanel from "../../components/approvals/PlanApprovalPanel";
import ResultReviewPanel from "../../components/approvals/ResultReviewPanel";

import { useRun } from "../../hooks/useRun";
import { useRunAudit } from "../../hooks/useRunAudit";
import { useRunEvents } from "../../hooks/useRunEvents";

import styles from "../../styles/dashboard.module.css";

function getConnectionStatus(
  status: string | undefined,
  connected: boolean,
  eventError: boolean
): {
  label: string;
  className: string;
} {
  switch (status) {
    case "COMPLETED":
      return {
        label: "✓ Completed",
        className: styles.success,
      };

    case "FAILED":
      return {
        label: "✕ Failed",
        className: styles.error,
      };

    case "CANCELLED":
      return {
        label: "■ Cancelled",
        className: styles.muted,
      };

    default:
      if (connected) {
        return {
          label: "● Live",
          className: styles.success,
        };
      }

      if (eventError) {
        return {
          label: "● Live connection unavailable",
          className: styles.error,
        };
      }

      return {
        label: "● Connecting...",
        className: styles.muted,
      };
  }
}

export default function RunDetailsPage() {
  const router = useRouter();

  const runId =
    typeof router.query.runId === "string"
      ? router.query.runId
      : undefined;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useRun(runId);

  const {
    data: auditRecords,
    isLoading: auditLoading,
    isError: auditError,
  } = useRunAudit(runId);

  const {
    event,
    connected,
    error: eventError,
  } = useRunEvents(runId);

  /*
   * REST provides the initial snapshot.
   *
   * SSE subsequently provides complete snapshots
   * whenever the run or task state changes.
   */
  const run =
    event?.run ??
    data?.run;

  const tasks =
    event?.tasks ??
    data?.tasks ??
    [];

  /*
   * Derive task metrics directly from the current
   * snapshot.
   *
   * This keeps the UI accurate regardless of whether
   * the latest snapshot came from REST or SSE.
   */
  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === "SUCCEEDED"
    ).length;

  const runningTasks =
    tasks.filter(
      (task) =>
        task.status === "RUNNING"
    ).length;

  const failedTasks =
    tasks.filter(
      (task) =>
        task.status === "FAILED" ||
        task.status === "ESCALATED"
    ).length;

  const connectionStatus =
    getConnectionStatus(
      run?.status,
      connected,
      eventError
    );

  return (
    <AppShell>
      <div className={styles.dashboard}>
        <Link
          href="/"
          className={styles.backLink}
        >
          ← Back to dashboard
        </Link>

        {isLoading && (
          <div className={styles.loading}>
            Loading run...
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            <strong>
              Unable to load run
            </strong>

            <span>
              {error instanceof Error
                ? error.message
                : "Unknown API error"}
            </span>
          </div>
        )}

        {run && (
          <>
            <header
              className={styles.header}
            >
              <div>
                <div
                  className={
                    styles.eyebrow
                  }
                >
                  RUN {run.id}
                </div>

                <h1>
                  {run.requirement}
                </h1>

                <p>
                  Current status:{" "}
                  <strong>
                    {run.status}
                  </strong>
                </p>
              </div>

              <div>
                <span
                  className={
                    connectionStatus.className
                  }
                >
                  {connectionStatus.label}
                </span>
              </div>
            </header>

            <section
              className={styles.overview}
            >
              <div
                className={
                  styles.overviewCard
                }
              >
                <span
                  className={
                    styles.overviewLabel
                  }
                >
                  Tasks
                </span>

                <strong>
                  {completedTasks}/
                  {tasks.length}
                </strong>

                <span
                  className={
                    styles.muted
                  }
                >
                  completed
                </span>
              </div>

              <div
                className={
                  styles.overviewCard
                }
              >
                <span
                  className={
                    styles.overviewLabel
                  }
                >
                  Running
                </span>

                <strong>
                  {runningTasks}
                </strong>

                <span
                  className={
                    styles.muted
                  }
                >
                  active
                </span>
              </div>

              <div
                className={
                  styles.overviewCard
                }
              >
                <span
                  className={
                    styles.overviewLabel
                  }
                >
                  Failed
                </span>

                <strong>
                  {failedTasks}
                </strong>

                <span
                  className={
                    styles.muted
                  }
                >
                  failed / escalated
                </span>
              </div>

              <div
                className={
                  styles.overviewCard
                }
              >
                <span
                  className={
                    styles.overviewLabel
                  }
                >
                  Status
                </span>

                <strong>
                  {run.status}
                </strong>

                <span
                  className={
                    styles.muted
                  }
                >
                  workflow state
                </span>
              </div>
            </section>

            {run.status ===
              "AWAITING_CLARIFICATION" && (
              <ClarificationPanel
                runId={run.id}
              />
            )}

            {run.status ===
              "AWAITING_PLAN_APPROVAL" && (
              <PlanApprovalPanel
                runId={run.id}
                tasks={tasks}
              />
            )}

            {run.status ===
              "AWAITING_REVIEW" && (
              <ResultReviewPanel
                runId={run.id}
              />
            )}

            <TaskTimeline
              tasks={tasks}
            />

            <EvidencePanel
              runId={run.id}
            />

            <AuditTrail
              records={auditRecords}
              isLoading={auditLoading}
              isError={auditError}
            />

            <ActivityFeed
              event={event}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}

