import { useState } from "react";

import { useSubmitClarifications } from "../../hooks/useRunMutation";

import styles from "../../styles/components.module.css";

interface ClarificationPanelProps {
  runId: string;
}

export default function ClarificationPanel({
  runId,
}: ClarificationPanelProps) {
  const [answer, setAnswer] = useState("");

  const mutation =
    useSubmitClarifications(runId);

  function handleSubmit() {
    const value = answer.trim();

    if (!value) {
      return;
    }

    mutation.mutate({
      requirementClarification: value,
    });
  }

  return (
    <section
      className={styles.approvalPanel}
    >
      <div
        className={styles.approvalHeader}
      >
        <div>
          <span
            className={styles.approvalBadge}
          >
            HUMAN INPUT REQUIRED
          </span>

          <h2>
            Clarification required
          </h2>
        </div>
      </div>

      <p>
        The engineering workflow needs
        additional information before
        it can safely continue.
      </p>

      <textarea
        className={
          styles.approvalTextarea
        }
        value={answer}
        onChange={(event) =>
          setAnswer(event.target.value)
        }
        placeholder="Provide the clarification or constraint..."
        rows={5}
        disabled={mutation.isPending}
      />

      {mutation.isError && (
        <div
          className={
            styles.errorMessage
          }
        >
          Unable to submit clarification.
          Please try again.
        </div>
      )}

      <button
        type="button"
        className={
          styles.primaryButton
        }
        onClick={handleSubmit}
        disabled={
          !answer.trim() ||
          mutation.isPending
        }
      >
        {mutation.isPending
          ? "Submitting..."
          : "Submit clarification"}
      </button>
    </section>
  );
}