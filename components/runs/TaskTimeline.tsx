import { TaskResponse } from "../../lib/types/run";
import TaskCard from "./TaskCard";
import styles from "../../styles/components.module.css";

interface TaskTimelineProps {
  tasks: TaskResponse[];
}

function timelineDotClass(
  status: TaskResponse["status"]
): string {
  switch (status) {
    case "RUNNING":
      return styles.timelineDotRunning;

    case "SUCCEEDED":
      return styles.timelineDotSucceeded;

    case "FAILED":
    case "ESCALATED":
      return styles.timelineDotFailed;

    case "SKIPPED":
      return styles.timelineDotSkipped;

    case "PENDING":
    default:
      return styles.timelineDotPending;
  }
}

export default function TaskTimeline({
  tasks,
}: TaskTimelineProps) {
  if (!tasks.length) {
    return (
      <section className={styles.detailPanel}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.eyebrow}>
              ORCHESTRATION
            </div>

            <h2>Task Timeline</h2>
          </div>
        </div>

        <p className={styles.muted}>
          No orchestration tasks have been
          created yet.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.detailPanel}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.eyebrow}>
            ORCHESTRATION
          </div>

          <h2>Task Timeline</h2>

          <p className={styles.muted}>
            Agent execution, dependencies,
            retries and failures.
          </p>
        </div>

        <div className={styles.taskCount}>
          {tasks.length}{" "}
          {tasks.length === 1
            ? "task"
            : "tasks"}
        </div>
      </div>

      <div className={styles.timeline}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={styles.timelineItem}
          >
            <div
              className={
                styles.timelineMarker
              }
            >
              <span
                className={`${styles.timelineDot} ${timelineDotClass(
                  task.status
                )}`}
              />
            </div>

            <div
              className={
                styles.timelineContent
              }
            >
              <TaskCard task={task} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}