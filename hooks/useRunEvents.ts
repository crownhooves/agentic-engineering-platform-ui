
import { useEffect, useState } from "react";

import { getApiBaseUrl } from "../lib/api/client";
import { RunEvent } from "../lib/types/run";

interface UseRunEventsResult {
  event: RunEvent | null;
  connected: boolean;
  error: boolean;
}

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export function useRunEvents(
  runId?: string
): UseRunEventsResult {
  const [event, setEvent] =
    useState<RunEvent | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    if (!runId) {
      return;
    }

    const url =
      `${getApiBaseUrl()}/api/runs/${runId}/events`;

    const source = new EventSource(url);

    const handleEvent = (
      event: MessageEvent
    ) => {
      try {
        const data =
          JSON.parse(event.data) as RunEvent;

        setEvent(data);
        setError(false);

        /*
         * The backend intentionally closes the SSE
         * stream after a terminal run state.
         *
         * Explicitly close EventSource here so the
         * browser does not attempt to reconnect to a
         * stream that is already finished.
         */
        if (
          TERMINAL_STATUSES.has(
            data.run.status
          )
        ) {
          setConnected(false);
          source.close();
        }
      } catch (err) {
        console.error(
          "Failed to parse SSE event",
          err
        );
      }
    };

    const handleOpen = () => {
      setConnected(true);
      setError(false);
    };

    const handleError = () => {
      setConnected(false);

      /*
       * A terminal run is expected to close its
       * SSE connection. Do not report that as an
       * error.
       */
      setEvent((current) => {
        if (
          current &&
          TERMINAL_STATUSES.has(
            current.run.status
          )
        ) {
          setError(false);
          return current;
        }

        setError(true);
        return current;
      });
    };

    source.addEventListener(
      "run.state_changed",
      handleEvent
    );

    source.addEventListener(
      "task.state_changed",
      handleEvent
    );

    source.addEventListener(
      "run.completed",
      handleEvent
    );

    source.onopen = handleOpen;
    source.onerror = handleError;

    return () => {
      source.close();
      setConnected(false);
    };
  }, [runId]);

  return {
    event,
    connected,
    error,
  };
}

