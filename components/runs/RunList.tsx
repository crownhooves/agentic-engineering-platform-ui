import { RunResponse } from "../../lib/types/run";
import RunCard from "./RunCard";
import styles from "../../styles/components.module.css";

interface RunListProps {
  runs: RunResponse[];
}

export default function RunList({
  runs,
}: RunListProps) {
  if (runs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>◈</div>

        <h3>No runs yet</h3>

        <p>
          Start your first agentic run using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.runList}>
      {runs.map((run) => (
        <RunCard
          key={run.id}
          run={run}
        />
      ))}
    </div>
  );
}