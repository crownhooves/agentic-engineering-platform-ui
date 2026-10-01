import { useMemo, useState } from "react";

import {
  ArtifactResponse,
} from "../../lib/types/run";

import {
  getExecutableDownloadUrl,
} from "../../lib/api/runs";

import {
  useArtifact,
  useArtifacts,
} from "../../hooks/useArtifacts";

import RuntimeVerificationPanel from "../evidence/RuntimeVerificationPanel";

import styles from "../../styles/components.module.css";

interface EvidencePanelProps {
  runId: string;
}

function formatArtifactType(
  type: string
): string {
  return type
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function groupLabel(
  type: string
): string {
  switch (type) {
    case "SOURCE_CODE":
      return "Source";

    case "TEST_CODE":
      return "Tests";

    case "VALIDATION_REPORT":
      return "Validation";

    case "RUNTIME_VERIFICATION":
      return "Runtime Verification";

    case "DOCUMENTATION":
      return "Documentation";

    case "RISK_REGISTER":
      return "Risks";

    case "SUMMARY":
      return "Summary";

    case "PLAN":
      return "Plan";

    case "ARCHITECTURE":
      return "Architecture";

    case "OPENAPI":
      return "API";

    case "REQUIREMENT_ANALYSIS":
      return "Analysis";

    case "CLARIFICATION_ANSWERS":
      return "Clarifications";

    case "IMPACT_ANALYSIS":
      return "Impact Analysis";

    case "EXECUTABLE":
      return "Executable";

    default:
      return "Other";
  }
}

export default function EvidencePanel({
  runId,
}: EvidencePanelProps) {
  const {
    data: artifacts,
    isLoading,
    isError,
  } = useArtifacts(runId);

  const [
    selectedId,
    setSelectedId,
  ] = useState<number | null>(null);

  const selectedArtifact =
    artifacts?.find(
      (artifact) =>
        artifact.id === selectedId
    );

  const groupedArtifacts = useMemo(() => {
    if (!artifacts) {
      return [];
    }

    const groups = new Map<
      string,
      ArtifactResponse[]
    >();

    for (const artifact of artifacts) {
      const group = groupLabel(
        artifact.type
      );

      if (!groups.has(group)) {
        groups.set(
          group,
          []
        );
      }

      groups
        .get(group)!
        .push(artifact);
    }

    return Array.from(
      groups.entries()
    );
  }, [artifacts]);

  return (
    <section
      className={
        styles.evidencePanel
      }
    >
      <div
        className={
          styles.evidenceHeader
        }
      >
        <div>
          <span
            className={
              styles.evidenceBadge
            }
          >
            ENGINEERING EVIDENCE
          </span>

          <h2>
            Artifacts and evidence
          </h2>

          <p>
            Inspect the outputs produced
            by the engineering workflow,
            including validation, runtime
            verification, and repair
            history.
          </p>
        </div>

        {artifacts && (
          <strong
            className={
              styles.evidenceCount
            }
          >
            {artifacts.length} artifacts
          </strong>
        )}
      </div>

      {isLoading && (
        <div
          className={
            styles.evidenceEmpty
          }
        >
          Loading engineering
          evidence...
        </div>
      )}

      {isError && (
        <div
          className={
            styles.errorMessage
          }
        >
          Unable to load engineering
          evidence.
        </div>
      )}

      {artifacts &&
        artifacts.length === 0 && (
          <div
            className={
              styles.evidenceEmpty
            }
          >
            No artifacts have been
            produced yet.
          </div>
        )}

      {artifacts &&
        artifacts.length > 0 && (
          <div
            className={
              styles.evidenceLayout
            }
          >
            <div
              className={
                styles.evidenceList
              }
            >
              {groupedArtifacts.map(
                ([
                  group,
                  groupArtifacts,
                ]) => (
                  <div
                    key={group}
                    className={
                      styles.evidenceGroup
                    }
                  >
                    <div
                      className={
                        styles.evidenceGroupTitle
                      }
                    >
                      {group}
                    </div>

                    {groupArtifacts.map(
                      (artifact) => (
                        <button
                          type="button"
                          key={
                            artifact.id
                          }
                          className={`${styles.evidenceItem} ${
                            selectedId ===
                            artifact.id
                              ? styles.evidenceItemSelected
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedId(
                              artifact.id
                            )
                          }
                        >
                          <div
                            className={
                              styles.evidenceItemMain
                            }
                          >
                            <strong>
                              {
                                artifact.path
                              }
                            </strong>

                            <span>
                              {formatArtifactType(
                                artifact.type
                              )}
                              {" · "}
                              revision{" "}
                              {
                                artifact.revision
                              }
                            </span>
                          </div>

                          <span
                            className={
                              styles.evidenceArrow
                            }
                          >
                            →
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )
              )}
            </div>

            <ArtifactViewer
              runId={runId}
              artifact={
                selectedArtifact
              }
            />
          </div>
        )}
    </section>
  );
}

interface ArtifactViewerProps {
  runId: string;
  artifact?: ArtifactResponse;
}

function ArtifactViewer({
  runId,
  artifact,
}: ArtifactViewerProps) {
  const {
    data,
    isLoading,
    isError,
  } = useArtifact(
    runId,
    artifact?.id
  );

  if (!artifact) {
    return (
      <div
        className={
          styles.artifactViewerEmpty
        }
      >
        <strong>
          Select an artifact
        </strong>

        <span>
          Choose an artifact from the
          evidence list to inspect its
          contents.
        </span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={
          styles.artifactViewer
        }
      >
        <ArtifactHeader
          artifact={artifact}
          runId={runId}
        />

        <div
          className={
            styles.evidenceEmpty
          }
        >
          Loading artifact...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={
          styles.artifactViewer
        }
      >
        <ArtifactHeader
          artifact={artifact}
          runId={runId}
        />

        <div
          className={
            styles.errorMessage
          }
        >
          Unable to load artifact
          content.
        </div>
      </div>
    );
  }

  /*
   * Runtime verification is structured
   * engineering evidence rather than
   * ordinary artifact text.
   *
   * Render the dedicated verification
   * component instead of showing the
   * JSON directly.
   */
  if (
    artifact.type ===
    "RUNTIME_VERIFICATION"
  ) {
    return (
      <div
        className={
          styles.artifactViewer
        }
      >
        <ArtifactHeader
          artifact={artifact}
          runId={runId}
        />

        <RuntimeVerificationPanel
          content={
            data?.content
          }
        />
      </div>
    );
  }

  return (
    <div
      className={
        styles.artifactViewer
      }
    >
      <ArtifactHeader
        artifact={artifact}
        runId={runId}
      />

      {data && (
        <pre
          className={
            styles.artifactContent
          }
        >
          {data.content ??
            "No content available."}
        </pre>
      )}
    </div>
  );
}

interface ArtifactHeaderProps {
  artifact: ArtifactResponse;
  runId?: string;
}

function ArtifactHeader({
  artifact,
  runId,
}: ArtifactHeaderProps) {
  return (
    <div
      className={
        styles.artifactViewerHeader
      }
    >
      <div>
        <div
          className={
            styles.artifactPath
          }
        >
          {artifact.path}
        </div>

        <div
          className={
            styles.artifactMeta
          }
        >
          {formatArtifactType(
            artifact.type
          )}
          {" · "}
          revision{" "}
          {artifact.revision}
          {" · "}
          {formatDate(
            artifact.createdAt
          )}
        </div>

        {artifact.type ===
          "EXECUTABLE" &&
          runId && (
            <a
              href={getExecutableDownloadUrl(
                runId
              )}
              className={
                styles.downloadButton
              }
            >
              ↓ Download JAR
            </a>
          )}
      </div>
    </div>
  );
}