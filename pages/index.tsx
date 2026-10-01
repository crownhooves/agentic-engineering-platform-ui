import AppShell from "../components/layout/AppShell";
import RunForm from "../components/runs/RunForm";
import RunList from "../components/runs/RunList";
import { useRuns } from "../hooks/useRun";
import styles from "../styles/dashboard.module.css";

export default function Dashboard() {
  const {
    data: runs = [],
    isLoading,
    isError,
    error,
  } = useRuns();

  return (
    <AppShell>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}>
              AGENTIC ENGINEERING PLATFORM
            </div>

            <h1>Execution Dashboard</h1>

            <p>
              Plan, execute, validate and repair software tasks
              through an autonomous workflow.
            </p>
          </div>

          <div className={styles.headerStatus}>
            <span />
            API Connected
          </div>
        </header>

        <section className={styles.createSection}>
          <RunForm />
        </section>

        <section id="runs" className={styles.runsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Recent Runs</h2>
              <p>Monitor your agentic executions.</p>
            </div>

            <div className={styles.runCount}>
              {runs.length} runs
            </div>
          </div>

          {isLoading && (
            <div className={styles.loading}>
              Loading runs...
            </div>
          )}

          {isError && (
            <div className={styles.error}>
              <strong>Unable to load runs</strong>

              <span>
                {error instanceof Error
                  ? error.message
                  : "Unknown API error"}
              </span>
            </div>
          )}

          {!isLoading && !isError && (
            <RunList
              runs={runs.map((item) => item.run)}
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}