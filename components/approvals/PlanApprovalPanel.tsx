import { useState } from "react";
import { approvePlan } from "../../lib/api/runs";
import { TaskResponse } from "../../lib/types/run";
import styles from "../../styles/dashboard.module.css";

interface PlanApprovalPanelProps {
  runId: string;
  tasks: TaskResponse[];
  onApproved?: () => void;
}

export default function PlanApprovalPanel({
  runId,
  tasks,
  onApproved,
}: PlanApprovalPanelProps) {
  const [removedTaskKeys, setRemovedTaskKeys] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTasks = tasks.filter(
    (task) => !removedTaskKeys.includes(task.taskKey)
  );

  function toggleTask(taskKey: string) {
    setRemovedTaskKeys((current) =>
      current.includes(taskKey)
        ? current.filter((key) => key !== taskKey)
        : [...current, taskKey]
    );
  }

  async function handleApprove() {
    setError(null);
    setSubmitting(true);

    try {
      await approvePlan(runId, removedTaskKeys);
      onApproved?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve the execution plan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.approvalPanel}>
      <div className={styles.approvalHeader}>
        <div>
          <div className={styles.eyebrow}>HUMAN CONTROL</div>
          <h2>Plan Approval Required</h2>
          <p className={styles.muted}>
            Review the proposed execution plan before agents begin implementation.
          </p>
        </div>

        <div className={styles.approvalBadge}>
          {activeTasks.length} / {tasks.length} tasks selected
        </div>
      </div>

      <div className={styles.approvalNotice}>
        <strong>Controlled autonomy</strong>
        <span>
          Agents will execute only after this plan is explicitly approved.
          You can remove tasks before execution begins.
        </span>
      </div>

      <div className={styles.planTaskList}>
        {tasks.map((task) => {
          const removed = removedTaskKeys.includes(task.taskKey);

          return (
            <article
              key={task.id}
              className={`${styles.planTask} ${
                removed ? styles.planTaskRemoved : ""
              }`}
            >
              <div className={styles.planTaskMain}>
                <div className={styles.planTaskKey}>{task.taskKey}</div>

                <h3>{task.title}</h3>

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

                  {task.dependsOn?.length > 0 && (
                    <div className={styles.taskMetaItem}>
                      <span>Dependencies</span>
                      <strong>{task.dependsOn.join(", ")}</strong>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={
                  removed
                    ? styles.secondaryButton
                    : styles.removeTaskButton
                }
                onClick={() => toggleTask(task.taskKey)}
                disabled={submitting}
              >
                {removed ? "Keep task" : "Remove task"}
              </button>
            </article>
          );
        })}
      </div>

      {removedTaskKeys.length > 0 && (
        <div className={styles.removalSummary}>
          <strong>{removedTaskKeys.length} task(s) marked for removal</strong>
          <span>
            Dependencies on removed tasks will be cleared by the backend before
            execution.
          </span>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <strong>Approval failed</strong>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.approvalActions}>
        <div>
          <strong>Ready to execute?</strong>
          <p className={styles.muted}>
            Approving this plan allows the orchestration engine to continue.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleApprove}
          disabled={submitting || activeTasks.length === 0}
        >
          {submitting ? "Approving..." : "Approve Plan"}
        </button>
      </div>
    </section>
  );
}

