import React from "react";

import { AuditRecord } from "../../lib/types/run";
import styles from "../../styles/components.module.css";

interface AuditTrailProps {
  records?: AuditRecord[];
  isLoading?: boolean;
  isError?: boolean;
}

interface HumanReadableEvent {
  title: string;
  detail: string;
  icon: string;
  eventClass: string;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString();
}

function formatActor(actor: string): string {
  return actor
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function getActorClass(actor: string): string {
  switch (actor.toLowerCase()) {
    case "human":
      return styles.auditActorHuman;

    case "system":
      return styles.auditActorSystem;

    default:
      return styles.auditActorAgent;
  }
}

function getEventClass(eventType: string): string {
  switch (eventType) {
    case "PLAN_APPROVED":
    case "RESULT_APPROVED":
    case "RUNTIME_VERIFICATION_PASSED":
    case "TASK_FINISHED":
      return styles.auditEventSuccess;

    case "PLAN_REJECTED":
    case "RESULT_REJECTED":
    case "RUNTIME_VERIFICATION_FAILED":
    case "GUARDRAIL_BLOCKED":
      return styles.auditEventFailure;

    default:
      return styles.auditEventDefault;
  }
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case "PLAN_APPROVED":
    case "RESULT_APPROVED":
    case "RUNTIME_VERIFICATION_PASSED":
    case "TASK_FINISHED":
      return "✓";

    case "PLAN_REJECTED":
    case "RESULT_REJECTED":
    case "RUNTIME_VERIFICATION_FAILED":
    case "GUARDRAIL_BLOCKED":
      return "!";

    case "RUN_STATE":
      return "→";

    case "RUN_CREATED":
      return "+";

    case "TASK_STARTED":
      return "▶";

    case "TASK_RETRY":
      return "↻";

    case "TASK_SKIPPED":
      return "—";

    default:
      return "•";
  }
}

function extractCallKey(detail: string): string | undefined {
  return detail.match(/callKey=([^\s]+)/)?.[1];
}

function extractPromptTokens(
  detail: string
): string | undefined {
  return detail.match(
    /promptTokens=(\d+)/
  )?.[1];
}

function extractCompletionTokens(
  detail: string
): string | undefined {
  return detail.match(
    /completionTokens=(\d+)/
  )?.[1];
}

function extractModel(
  detail: string
): string | undefined {
  return detail.match(
    /model=([^\s]+)/
  )?.[1];
}

function parseJsonPayload(
  detail: string
): Record<string, unknown> | null {
  const firstBrace = detail.indexOf("{");

  if (firstBrace < 0) {
    return null;
  }

  const jsonText = detail.substring(firstBrace);

  try {
    return JSON.parse(jsonText) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

function createLlmRequestSummary(
  record: AuditRecord
): string {
  const callKey =
    extractCallKey(record.detail);

  if (callKey === "analyst") {
    return "Requirement analyst started requirement analysis.";
  }

  if (callKey === "planner") {
    return "Planner started dependency-aware engineering planning.";
  }

  if (callKey) {
    return `Agent ${callKey} started an LLM reasoning step.`;
  }

  return "Agent started an LLM reasoning step.";
}

function createLlmResponseSummary(
  record: AuditRecord
): string {
  const detail = record.detail;

  const callKey =
    extractCallKey(detail);

  const model =
    extractModel(detail);

  const payload =
    parseJsonPayload(detail);

  const modelText = model
    ? ` using ${model}`
    : "";

  if (
    callKey === "analyst" &&
    payload
  ) {
    const functionalRequirements =
      Array.isArray(
        payload.functionalRequirements
      )
        ? payload.functionalRequirements.length
        : 0;

    const nonFunctionalRequirements =
      Array.isArray(
        payload.nonFunctionalRequirements
      )
        ? payload.nonFunctionalRequirements.length
        : 0;

    const ambiguities =
      Array.isArray(
        payload.ambiguities
      )
        ? payload.ambiguities.length
        : 0;

    const workType =
      typeof payload.workType ===
      "string"
        ? payload.workType
        : undefined;

    return `Requirement normalized as ${
      workType ?? "engineering work"
    }. Identified ${functionalRequirements} functional requirements, ${nonFunctionalRequirements} non-functional requirements and ${ambiguities} ambiguities.`;
  }

  if (
    callKey === "planner" &&
    payload
  ) {
    const tasks =
      Array.isArray(payload.tasks)
        ? payload.tasks.length
        : 0;

    return `Dependency-aware engineering plan generated with ${tasks} tasks${modelText}.`;
  }

  const promptTokens =
    extractPromptTokens(detail);

  const completionTokens =
    extractCompletionTokens(detail);

  if (
    callKey &&
    promptTokens &&
    completionTokens
  ) {
    return `Agent ${callKey} completed its reasoning step${modelText}. ${promptTokens} prompt tokens and ${completionTokens} completion tokens.`;
  }

  if (callKey) {
    return `Agent ${callKey} completed its reasoning step${modelText}.`;
  }

  return `Agent completed its reasoning step${modelText}.`;
}

function createHumanReadableEvent(
  record: AuditRecord
): HumanReadableEvent {
  switch (record.eventType) {
    case "RUN_CREATED":
      return {
        title: "Run created",
        detail:
          record.detail ||
          "New engineering run created.",
        icon: "+",
        eventClass:
          styles.auditEventDefault,
      };

    case "RUN_STATE":
      return {
        title: "Run state changed",
        detail: record.detail,
        icon: "→",
        eventClass:
          styles.auditEventDefault,
      };

    case "TASK_STARTED":
      return {
        title: "Task started",
        detail: record.detail,
        icon: "▶",
        eventClass:
          styles.auditEventDefault,
      };

    case "TASK_FINISHED":
      return {
        title: "Task completed",
        detail: record.detail,
        icon: "✓",
        eventClass:
          styles.auditEventSuccess,
      };

    case "TASK_RETRY":
      return {
        title: "Task retry",
        detail: record.detail,
        icon: "↻",
        eventClass:
          styles.auditEventDefault,
      };

    case "TASK_SKIPPED":
      return {
        title: "Task skipped",
        detail: record.detail,
        icon: "—",
        eventClass:
          styles.auditEventDefault,
      };

    case "LLM_REQUEST":
      return {
        title: "Agent reasoning started",
        detail:
          createLlmRequestSummary(record),
        icon: "•",
        eventClass:
          styles.auditEventDefault,
      };

    case "LLM_RESPONSE":
      return {
        title: "Agent reasoning completed",
        detail:
          createLlmResponseSummary(record),
        icon: "•",
        eventClass:
          styles.auditEventDefault,
      };

    case "PLAN_APPROVED":
      return {
        title: "Plan approved",
        detail:
          record.detail ||
          "Human reviewer approved the engineering plan.",
        icon: "✓",
        eventClass:
          styles.auditEventSuccess,
      };

    case "PLAN_REJECTED":
      return {
        title: "Plan rejected",
        detail:
          record.detail ||
          "Human reviewer rejected the engineering plan.",
        icon: "!",
        eventClass:
          styles.auditEventFailure,
      };

    case "RESULT_APPROVED":
      return {
        title: "Result approved",
        detail:
          record.detail ||
          "Human reviewer approved the engineering result.",
        icon: "✓",
        eventClass:
          styles.auditEventSuccess,
      };

    case "RESULT_REJECTED":
      return {
        title: "Result rejected",
        detail:
          record.detail ||
          "Human reviewer rejected the engineering result.",
        icon: "!",
        eventClass:
          styles.auditEventFailure,
      };

    case "RUNTIME_VERIFICATION_PASSED":
      return {
        title: "Runtime verification passed",
        detail:
          record.detail ||
          "Generated application passed deterministic runtime verification.",
        icon: "✓",
        eventClass:
          styles.auditEventSuccess,
      };

    case "RUNTIME_VERIFICATION_FAILED":
      return {
        title: "Runtime verification failed",
        detail:
          record.detail ||
          "Generated application failed deterministic runtime verification.",
        icon: "!",
        eventClass:
          styles.auditEventFailure,
      };

    case "GUARDRAIL_BLOCKED":
      return {
        title: "Guardrail blocked execution",
        detail: record.detail,
        icon: "!",
        eventClass:
          styles.auditEventFailure,
      };

    default:
      return {
        title:
          record.eventType
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
              /\b\w/g,
              (character) =>
                character.toUpperCase()
            ),
        detail: record.detail,
        icon: getEventIcon(
          record.eventType
        ),
        eventClass:
          getEventClass(
            record.eventType
          ),
      };
  }
}

function TechnicalDetails({
  record,
}: {
  record: AuditRecord;
}) {
  const isLlmEvent =
    record.eventType ===
      "LLM_REQUEST" ||
    record.eventType ===
      "LLM_RESPONSE";

  if (!isLlmEvent) {
    return null;
  }

  const callKey =
    extractCallKey(record.detail);

  const model =
    extractModel(record.detail);

  const promptTokens =
    extractPromptTokens(
      record.detail
    );

  const completionTokens =
    extractCompletionTokens(
      record.detail
    );

  return (
    <details
      className={
        styles.auditTechnicalDetails
      }
    >
      <summary>
        Technical details
      </summary>

      <div
        className={
          styles.auditTechnicalContent
        }
      >
        <div
          className={
            styles.auditTechnicalRow
          }
        >
          <span>Event</span>

          <strong>
            {record.eventType}
          </strong>
        </div>

        {callKey && (
          <div
            className={
              styles.auditTechnicalRow
            }
          >
            <span>Call</span>

            <strong>
              {callKey}
            </strong>
          </div>
        )}

        {model && (
          <div
            className={
              styles.auditTechnicalRow
            }
          >
            <span>Model</span>

            <strong>
              {model}
            </strong>
          </div>
        )}

        {promptTokens && (
          <div
            className={
              styles.auditTechnicalRow
            }
          >
            <span>Prompt tokens</span>

            <strong>
              {promptTokens}
            </strong>
          </div>
        )}

        {completionTokens && (
          <div
            className={
              styles.auditTechnicalRow
            }
          >
            <span>Completion tokens</span>

            <strong>
              {completionTokens}
            </strong>
          </div>
        )}

        <pre
          className={
            styles.auditTechnicalPayload
          }
        >
          {record.detail}
        </pre>
      </div>
    </details>
  );
}

export default function AuditTrail({
  records,
  isLoading = false,
  isError = false,
}: AuditTrailProps) {
  return (
    <section
      className={styles.detailPanel}
    >
      <div
        className={styles.sectionHeader}
      >
        <div>
          <div
            className={styles.eyebrow}
          >
            GOVERNANCE &amp; AUDIT
          </div>

          <h2>
            Engineering audit trail
          </h2>

          <p
            className={styles.muted}
          >
            Immutable record of autonomous
            execution and human control actions.
          </p>
        </div>

        {records &&
          records.length > 0 && (
            <span
              className={
                styles.auditCount
              }
            >
              {records.length} events
            </span>
          )}
      </div>

      {isLoading && (
        <div
          className={
            styles.auditEmpty
          }
        >
          Loading audit trail...
        </div>
      )}

      {isError && (
        <div
          className={
            styles.auditError
          }
        >
          Unable to load the audit trail.
        </div>
      )}

      {!isLoading &&
        !isError &&
        (!records ||
          records.length === 0) && (
          <div
            className={
              styles.auditEmpty
            }
          >
            No audit events recorded yet.
          </div>
        )}

      {!isLoading &&
        !isError &&
        records &&
        records.length > 0 && (
          <div
            className={
              styles.auditTimeline
            }
          >
            {records.map((record) => {
              const event =
                createHumanReadableEvent(
                  record
                );

              return (
                <div
                  key={record.id}
                  className={
                    styles.auditItem
                  }
                >
                  <div
                    className={`${styles.auditMarker} ${event.eventClass}`}
                  >
                    {event.icon}
                  </div>

                  <div
                    className={
                      styles.auditContent
                    }
                  >
                    <div
                      className={
                        styles.auditTopRow
                      }
                    >
                      <span
                        className={
                          styles.auditTimestamp
                        }
                      >
                        {formatTimestamp(
                          record.timestamp
                        )}
                      </span>

                      <span
                        className={getActorClass(
                          record.actor
                        )}
                      >
                        {formatActor(
                          record.actor
                        )}
                      </span>
                    </div>

                    <div
                      className={
                        styles.auditEvent
                      }
                    >
                      {event.title}
                    </div>

                    {event.detail && (
                      <div
                        className={
                          styles.auditDetail
                        }
                      >
                        {event.detail}
                      </div>
                    )}

                    <TechnicalDetails
                      record={record}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </section>
  );
}

