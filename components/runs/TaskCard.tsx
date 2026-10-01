import { TaskResponse } from "../../lib/types/run";
import styles from "../../styles/components.module.css";

interface TaskCardProps {
  task: TaskResponse;
}

function statusClass(
  status: TaskResponse["status"]
): string {
  switch (status) {
    case "SUCCEEDED":
      return styles.statusCompleted;

    case "FAILED":
    case "ESCALATED":
      return styles.statusFailed;

    case "RUNNING":
      return styles.statusRunning;

    case "SKIPPED":
      return styles.statusPending;

    case "PENDING":
    default:
      return styles.statusPending;
  }
}

function formatStatus(
  status: TaskResponse["status"]
): string {
  return status.replaceAll("_", " ");
}

export default function TaskCard({
  task,
}: TaskCardProps) {
  return (
    <article className={styles.taskCard}>
      <div className={styles.taskCardHeader}>
        <div>
          <div className={styles.taskKey}>
            {task.taskKey}
          </div>

          <h3 className={styles.taskTitle}>
            {task.title}
          </h3>
        </div>

        <span
          className={`${styles.statusBadge} ${statusClass(
            task.status
          )}`}
        >
          {formatStatus(task.status)}
        </span>
      </div>

      {task.description && (
        <p className={styles.taskDescription}>
          {task.description}
        </p>
      )}

      <div className={styles.taskMetadata}>
        <div className={styles.taskMetaItem}>
          <span>Agent</span>
          <strong>{task.agent}</strong>
        </div>

        <div className={styles.taskMetaItem}>
          <span>Attempts</span>
          <strong>{task.attempts}</strong>
        </div>

        {task.startedAt && (
          <div className={styles.taskMetaItem}>
            <span>Started</span>
            <strong>
              {new Date(
                task.startedAt
              ).toLocaleTimeString()}
            </strong>
          </div>
        )}

        {task.finishedAt && (
          <div className={styles.taskMetaItem}>
            <span>Finished</span>
            <strong>
              {new Date(
                task.finishedAt
              ).toLocaleTimeString()}
            </strong>
          </div>
        )}
      </div>

      {task.dependsOn?.length > 0 && (
        <div className={styles.taskDependencies}>
          <span>Depends on</span>

          <div>
            {task.dependsOn.map(
              (dependency) => (
                <span
                  key={dependency}
                  className={
                    styles.dependencyBadge
                  }
                >
                  {dependency}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {task.lastError && (
        <div className={styles.taskError}>
          <strong>Last error</strong>

          <p>{task.lastError}</p>
        </div>
      )}
    </article>
  );
}