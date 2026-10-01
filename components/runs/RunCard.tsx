import Link from "next/link";
import { RunResponse } from "../../lib/types/run";
import styles from "../../styles/components.module.css";

interface RunCardProps {
  run: RunResponse;
}

function statusClass(
  status: RunResponse["status"]
): string {
  switch (status) {
    case "COMPLETED":
      return styles.statusCompleted;

    case "FAILED":
    case "REJECTED":
    case "CANCELLED":
      return styles.statusFailed;

    case "EXECUTING":
      return styles.statusRunning;

    case "AWAITING_CLARIFICATION":
    case "AWAITING_PLAN_APPROVAL":
    case "AWAITING_REVIEW":
      return styles.statusApproval;

    case "ANALYZING":
    case "PLANNING":
    case "CREATED":
    default:
      return styles.statusPending;
  }
}

function formatStatus(
  status: RunResponse["status"]
): string {
  return status.replaceAll("_", " ");
}

export default function RunCard({
  run,
}: RunCardProps) {
  return (
    <Link
      href={`/runs/${run.id}`}
      className={styles.runCard}
    >
      <div className={styles.runCardHeader}>
        <div className={styles.runId}>
          RUN {run.id}
        </div>

        <span
          className={`${styles.statusBadge} ${statusClass(
            run.status
          )}`}
        >
          {formatStatus(run.status)}
        </span>
      </div>

      <div className={styles.runGoal}>
        {run.requirement}
      </div>

      {run.scenario && (
        <div className={styles.scenario}>
          Scenario: {run.scenario}
        </div>
      )}

      <div className={styles.runCardFooter}>
        <span>
          {formatStatus(run.status)}
        </span>

        {run.createdAt && (
          <span>
            {new Date(
              run.createdAt
            ).toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}