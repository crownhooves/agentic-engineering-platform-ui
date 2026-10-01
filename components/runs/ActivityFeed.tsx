
import { useEffect, useRef, useState } from "react";
import {
  RunEvent,
  TaskResponse,
} from "../../lib/types/run";
import styles from "../../styles/components.module.css";

interface ActivityItem {
  id: string;
  timestamp: string;
  message: string;
  type:
    | "run"
    | "task"
    | "success"
    | "failure";
}

interface ActivityFeedProps {
  event: RunEvent | null;
}

function createTaskMap(
  tasks: TaskResponse[]
): Map<string, TaskResponse> {
  return new Map(
    tasks.map((task) => [
      task.taskKey,
      task,
    ])
  );
}

function describeTaskChange(
  previous: TaskResponse | undefined,
  current: TaskResponse
): ActivityItem | null {
  if (!previous) {
    return {
      id: `${current.taskKey}-created-${current.status}`,
      timestamp:
        current.startedAt ??
        current.finishedAt ??
        new Date().toISOString(),
      message: `${current.title} entered ${current.status}`,
      type:
        current.status === "FAILED"
          ? "failure"
          : current.status === "SUCCEEDED"
            ? "success"
            : "task",
    };
  }

  if (
    previous.status !== current.status
  ) {
    const type =
      current.status === "FAILED" ||
      current.status === "ESCALATED"
        ? "failure"
        : current.status === "SUCCEEDED"
          ? "success"
          : "task";

    return {
      id: `${current.taskKey}-${previous.status}-${current.status}`,
      timestamp:
        current.finishedAt ??
        current.startedAt ??
        new Date().toISOString(),
      message: `${current.title}: ${previous.status} → ${current.status}`,
      type,
    };
  }

  if (
    previous.attempts !== current.attempts
  ) {
    return {
      id: `${current.taskKey}-attempt-${current.attempts}`,
      timestamp: new Date().toISOString(),
      message: `${current.title} retry attempt ${current.attempts}`,
      type: "task",
    };
  }

  if (
    previous.lastError !== current.lastError &&
    current.lastError
  ) {
    return {
      id: `${current.taskKey}-error-${current.attempts}`,
      timestamp: new Date().toISOString(),
      message: `${current.title} reported an error`,
      type: "failure",
    };
  }

  return null;
}

function getRunIndicator(status?: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case "COMPLETED":
      return {
        label: "✓ RUN COMPLETED",
        className: styles.runStatusCompleted,
      };

    case "FAILED":
      return {
        label: "✕ RUN FAILED",
        className: styles.runStatusFailed,
      };

    case "CANCELLED":
      return {
        label: "■ RUN CANCELLED",
        className: styles.runStatusCancelled,
      };

    default:
      return {
        label: "● LIVE",
        className: styles.liveIndicator,
      };
  }
}

export default function ActivityFeed({
  event,
}: ActivityFeedProps) {
  const previousEvent = useRef<RunEvent | null>(
    null
  );

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const runIndicator = getRunIndicator(
    event?.run.status
  );

  useEffect(() => {
    if (!event) {
      return;
    }

    const previous =
      previousEvent.current;

    const newActivities: ActivityItem[] =
      [];

    if (!previous) {
      newActivities.push({
        id: `run-${event.type}-${event.timestamp}`,
        timestamp: event.timestamp,
        message: `Run entered ${event.run.status}`,
        type: "run",
      });
    } else if (
      previous.run.status !==
      event.run.status
    ) {
      newActivities.push({
        id: `run-${previous.run.status}-${event.run.status}`,
        timestamp: event.timestamp,
        message: `Run status changed: ${previous.run.status} → ${event.run.status}`,
        type:
          event.run.status === "FAILED"
            ? "failure"
            : event.run.status ===
                "COMPLETED"
              ? "success"
              : "run",
      });
    }

    const previousTasks = createTaskMap(
      previous?.tasks ?? []
    );

    for (const task of event.tasks) {
      const activity =
        describeTaskChange(
          previousTasks.get(task.taskKey),
          task
        );

      if (activity) {
        newActivities.push(activity);
      }
    }

    if (newActivities.length > 0) {
      setActivities((current) =>
        [
          ...newActivities,
          ...current,
        ].slice(0, 20)
      );
    }

    previousEvent.current = event;
  }, [event]);

  return (
    <section className={styles.detailPanel}>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.eyebrow}>
            LIVE EXECUTION
          </div>

          <h2>Activity</h2>

          <p className={styles.muted}>
            State changes received from the
            orchestration engine.
          </p>
        </div>

        <span className={runIndicator.className}>
          {runIndicator.label}
        </span>
      </div>

      {!activities.length && (
        <p className={styles.muted}>
          Waiting for execution activity...
        </p>
      )}

      {activities.length > 0 && (
        <div className={styles.activityList}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={
                styles.activityItem
              }
            >
              <div
                className={`${styles.activityMarker} ${
                  styles[
                    `activity${activity.type.charAt(0).toUpperCase()}${activity.type.slice(1)}`
                  ]
                }`}
              />

              <div
                className={
                  styles.activityContent
                }
              >
                <strong>
                  {activity.message}
                </strong>

                <span>
                  {new Date(
                    activity.timestamp
                  ).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
