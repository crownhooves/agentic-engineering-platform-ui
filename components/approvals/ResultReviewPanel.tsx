import { useState } from "react";

import {
  useApproveResult,
  useRejectResult,
} from "../../hooks/useRunMutation";

import styles from "../../styles/components.module.css";

interface ResultReviewPanelProps {
  runId: string;
}

export default function ResultReviewPanel({
  runId,
}: ResultReviewPanelProps) {
  const [showReject, setShowReject] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const approveMutation =
    useApproveResult(runId);

  const rejectMutation =
    useRejectResult(runId);

  const busy =
    approveMutation.isPending ||
    rejectMutation.isPending;

  function handleApprove() {
    approveMutation.mutate();
  }

  function handleReject() {
    const value = reason.trim();

    if (!value) {
      return;
    }

    rejectMutation.mutate(value);
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
            FINAL HUMAN GATE
          </span>

          <h2>
            Review engineering result
          </h2>
        </div>
      </div>

      <p>
        The autonomous engineering workflow
        has completed its tasks and validation.
        Review the result before accepting it.
      </p>

      {!showReject ? (
        <div
          className={styles.approvalActions}
        >
          <button
            type="button"
            className={
              styles.primaryButton
            }
            onClick={handleApprove}
            disabled={busy}
          >
            {approveMutation.isPending
              ? "Approving..."
              : "Approve result"}
          </button>

          <button
            type="button"
            className={
              styles.dangerButton
            }
            onClick={() =>
              setShowReject(true)
            }
            disabled={busy}
          >
            Reject result
          </button>
        </div>
      ) : (
        <div
          className={styles.rejectSection}
        >
          <label htmlFor="rejection-reason">
            Rejection reason
          </label>

          <textarea
            id="rejection-reason"
            className={
              styles.approvalTextarea
            }
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Explain what needs to change..."
            rows={5}
            disabled={busy}
          />

          <div
            className={
              styles.approvalActions
            }
          >
            <button
              type="button"
              className={
                styles.dangerButton
              }
              onClick={handleReject}
              disabled={
                !reason.trim() ||
                busy
              }
            >
              {rejectMutation.isPending
                ? "Rejecting..."
                : "Confirm rejection"}
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() =>
                setShowReject(false)
              }
              disabled={busy}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {approveMutation.isError && (
        <div
          className={
            styles.errorMessage
          }
        >
          Unable to approve the result.
          Please try again.
        </div>
      )}

      {rejectMutation.isError && (
        <div
          className={
            styles.errorMessage
          }
        >
          Unable to reject the result.
          Please try again.
        </div>
      )}
    </section>
  );
}