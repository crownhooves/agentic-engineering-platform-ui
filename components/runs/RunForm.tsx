import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { useCreateRun } from "../../hooks/useRunMutation";
import styles from "../../styles/components.module.css";

export default function RunForm() {
  const router = useRouter();

  const [requirement, setRequirement] = useState("");
  const [scenario, setScenario] = useState("");

  const createRunMutation = useCreateRun();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedRequirement = requirement.trim();
    const trimmedScenario = scenario.trim();

    if (!trimmedRequirement) {
      return;
    }

    try {
      const result = await createRunMutation.mutateAsync({
        requirement: trimmedRequirement,
        scenario: trimmedScenario || undefined,
      });

      setRequirement("");
      setScenario("");

      await router.push(`/runs/${result.id}`);
    } catch (error) {
      console.error("Failed to create run:", error);
    }
  }

  return (
    <form
      className={styles.runForm}
      onSubmit={handleSubmit}
    >
      <div className={styles.formHeader}>
        <div>
          <h2>Start a new run</h2>

          <p>
            Describe what you want the agentic system to
            accomplish.
          </p>
        </div>
      </div>

      <label className={styles.fieldLabel}>
        Requirement
      </label>

      <textarea
        value={requirement}
        onChange={(event) =>
          setRequirement(event.target.value)
        }
        placeholder="Example: Implement a REST endpoint for customer search with validation, tests, and documentation..."
        className={styles.goalInput}
        rows={5}
        maxLength={10000}
        disabled={createRunMutation.isPending}
      />

      <div className={styles.characterCount}>
        {requirement.length} / 10000
      </div>

      <label className={styles.fieldLabel}>
        Scenario
        <span>Optional</span>
      </label>

      <input
        value={scenario}
        onChange={(event) =>
          setScenario(event.target.value)
        }
        placeholder="Example: brownfield"
        className={styles.scenarioInput}
        maxLength={100}
        disabled={createRunMutation.isPending}
      />

      <div className={styles.formFooter}>
        <span className={styles.inputHint}>
          The system will plan, execute, validate, and repair
          when required.
        </span>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={
            createRunMutation.isPending ||
            !requirement.trim()
          }
        >
          {createRunMutation.isPending
            ? "Starting..."
            : "Start Run"}
        </button>
      </div>

      {createRunMutation.isError && (
        <div className={styles.errorMessage}>
          {createRunMutation.error instanceof Error
            ? createRunMutation.error.message
            : "Unable to start the run."}
        </div>
      )}
    </form>
  );
}