import React from "react";

export interface RuntimeCheckResult {
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  detail: string;
}

export interface RuntimeVerificationResult {
  passed: boolean;
  port: number;
  duration: string;
  checks: RuntimeCheckResult[];
  failureReason?: string | null;
}

interface RuntimeVerificationPanelProps {
  content?: string | null;
}

function parseResult(
  content?: string | null
): RuntimeVerificationResult | null {
  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      passed: Boolean(parsed.passed),

      port: Number(parsed.port ?? 0),

      duration: String(parsed.duration ?? "PT0S"),

      checks: Array.isArray(parsed.checks)
        ? parsed.checks.map(
            (check: RuntimeCheckResult) => ({
              name: String(
                check.name ?? "Unknown check"
              ),

              passed: Boolean(check.passed),

              expectedStatus: Number(
                check.expectedStatus ?? 0
              ),

              actualStatus: Number(
                check.actualStatus ?? 0
              ),

              detail: String(
                check.detail ?? ""
              ),
            })
          )
        : [],

      failureReason:
        parsed.failureReason == null
          ? null
          : String(parsed.failureReason),
    };
  } catch {
    return null;
  }
}

function formatDuration(
  duration: string
): string {
  if (!duration) {
    return "—";
  }

  const match = duration.match(
    /^PT(?:(\d+(?:\.\d+)?)S)?$/
  );

  if (!match) {
    return duration;
  }

  const seconds = Number(
    match[1] ?? 0
  );

  if (seconds < 1) {
    return `${Math.round(
      seconds * 1000
    )} ms`;
  }

  return `${seconds.toFixed(
    seconds >= 10 ? 0 : 2
  )} s`;
}

export default function RuntimeVerificationPanel({
  content,
}: RuntimeVerificationPanelProps) {
  const result = parseResult(content);

  if (!result) {
    return (
      <section className="runtimeVerification">
        <div className="runtimeVerification__header">
          <div>
            <div className="runtimeVerification__eyebrow">
              Runtime Verification
            </div>

            <h3>
              Verification evidence
            </h3>
          </div>
        </div>

        <div className="runtimeVerification__empty">
          Runtime verification evidence
          could not be parsed.
        </div>
      </section>
    );
  }

  const passedChecks =
    result.checks.filter(
      (check) => check.passed
    ).length;

  const totalChecks =
    result.checks.length;

  return (
    <section className="runtimeVerification">
      <div className="runtimeVerification__header">
        <div>
          <div className="runtimeVerification__eyebrow">
            Runtime Verification
          </div>

          <h3>
            Executable behavior verified
          </h3>
        </div>

        <div
          className={
            result.passed
              ? "runtimeVerification__status runtimeVerification__status--passed"
              : "runtimeVerification__status runtimeVerification__status--failed"
          }
        >
          <span className="runtimeVerification__statusIcon">
            {result.passed
              ? "✓"
              : "!"}
          </span>

          {result.passed
            ? "PASSED"
            : "FAILED"}
        </div>
      </div>

      <div className="runtimeVerification__summary">
        <div>
          <span className="runtimeVerification__label">
            Checks
          </span>

          <strong>
            {passedChecks}/{totalChecks}
          </strong>
        </div>

        <div>
          <span className="runtimeVerification__label">
            Runtime
          </span>

          <strong>
            {formatDuration(
              result.duration
            )}
          </strong>
        </div>

        {result.port > 0 && (
          <div>
            <span className="runtimeVerification__label">
              Ephemeral port
            </span>

            <strong>
              {result.port}
            </strong>
          </div>
        )}
      </div>

      <div className="runtimeVerification__checks">
        {result.checks.map(
          (check, index) => (
            <div
              key={`${check.name}-${index}`}
              className="runtimeVerification__check"
            >
              <div
                className={
                  check.passed
                    ? "runtimeVerification__checkIcon runtimeVerification__checkIcon--passed"
                    : "runtimeVerification__checkIcon runtimeVerification__checkIcon--failed"
                }
              >
                {check.passed
                  ? "✓"
                  : "×"}
              </div>

              <div className="runtimeVerification__checkBody">
                <div className="runtimeVerification__checkTop">
                  <strong>
                    {check.name}
                  </strong>

                  <span
                    className={
                      check.passed
                        ? "runtimeVerification__http runtimeVerification__http--passed"
                        : "runtimeVerification__http runtimeVerification__http--failed"
                    }
                  >
                    {check.actualStatus >
                    0
                      ? check.actualStatus
                      : "—"}
                  </span>
                </div>

                {check.detail && (
                  <div className="runtimeVerification__checkDetail">
                    {check.detail}
                  </div>
                )}

                {check.expectedStatus >
                  0 && (
                  <div className="runtimeVerification__expected">
                    Expected HTTP{" "}
                    {check.expectedStatus}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {!result.passed &&
        result.failureReason && (
          <div className="runtimeVerification__failure">
            <strong>
              Failure reason
            </strong>

            <span>
              {result.failureReason}
            </span>
          </div>
        )}
    </section>
  );
}