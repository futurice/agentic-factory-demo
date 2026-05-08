"use client";

import { useEffect, useState } from "react";
import { formatMmSs } from "./format-time";

type TimerState = "idle" | "running" | "paused" | "resting" | "completed";
type Phase = "work" | "rest";

export function PomodoroCard() {
  const [state, setState] = useState<TimerState>("idle");
  const [phase, setPhase] = useState<Phase>("work");
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [restMinutes, setRestMinutes] = useState<number>(5);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (state !== "running" && state !== "resting") {
      return;
    }
    const id = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }
        // Phase advance: running (work) -> resting; resting -> running (work)
        if (state === "running") {
          setState("resting");
          setPhase("rest");
          return restMinutes * 60;
        }
        // state === "resting"
        setState("running");
        setPhase("work");
        return workMinutes * 60;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state, workMinutes, restMinutes]);

  const isActive = state === "running" || state === "resting";
  const playLabel = isActive ? "Pause" : "Start";
  const titleText = state === "resting" ? "Rest Time" : "Work Time";

  function handlePlayPause() {
    if (isActive) {
      setState("paused");
      return;
    }
    if (state === "completed") {
      return;
    }
    setState("running");
    if (state === "idle") {
      setPhase("work");
    }
  }

  function handleReset() {
    setState("idle");
    setPhase("work");
    setSecondsRemaining(workMinutes * 60);
  }

  function handleWorkMinutesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    setWorkMinutes(next);
    // While idle, the time display tracks workMinutes * 60 immediately.
    // While running/paused/resting, leave secondsRemaining untouched — the
    // new value applies on the next entry to a work phase or on reset.
    if (state === "idle") {
      setSecondsRemaining(next * 60);
    }
  }

  function handleRestMinutesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    setRestMinutes(next);
    // Rest length never changes the idle display (idle shows work time).
  }

  // Ring contract (spec Decisions 4 + 7): in idle the foreground keeps the
  // four-segment 2:1 dashed pattern (no pathLength). In running/paused/resting
  // it switches to a single-arc encoding via pathLength=1 and a numeric
  // stroke-dashoffset proportional to elapsed/duration. While paused the
  // values freeze naturally because secondsRemaining stops changing.
  const isSingleArc =
    state === "running" || state === "paused" || state === "resting";
  const ringDuration = (phase === "work" ? workMinutes : restMinutes) * 60;
  const elapsed = ringDuration - secondsRemaining;
  const dashOffsetRaw = ringDuration > 0 ? elapsed / ringDuration : 0;
  // Round to 4 decimals (spec tolerance ±0.005).
  const dashOffset = Math.round(dashOffsetRaw * 10000) / 10000;

  return (
    <article
      className="flex w-[410.66px] flex-col gap-[32px] rounded-[10px] border border-[#1E2939] bg-[#101828] p-[33px] pb-[32px] font-[var(--font-inter)]"
      aria-label="Pomodoro timer"
    >
      <header className="flex items-start justify-between">
        <h2 className="text-[24px] leading-[32px] font-[var(--font-space-grotesk)] font-bold text-white">
          {titleText}
        </h2>
        <button
          type="button"
          aria-label="Settings"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((open) => !open)}
          className="flex h-[36px] w-[36px] items-center justify-center rounded-[10px] text-[#99A1AF]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div
        className="relative mx-auto flex h-[256px] w-[344.66px] items-center justify-center"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 344.664 256"
          className="absolute inset-0 h-full w-full"
        >
          <circle
            cx="172.332"
            cy="128"
            r="115.2"
            stroke="#1F2937"
            strokeWidth="10.24"
            fill="none"
          />
          {isSingleArc ? (
            <circle
              cx="172.332"
              cy="128"
              r="115.2"
              stroke="#3B82F6"
              strokeWidth="10.24"
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={dashOffset}
              transform="rotate(-90 172.332 128)"
            />
          ) : (
            <circle
              cx="172.332"
              cy="128"
              r="115.2"
              stroke="#3B82F6"
              strokeWidth="10.24"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="120.637 60.319"
              transform="rotate(-90 172.332 128)"
            />
          )}
        </svg>
        <span className="text-[60px] leading-[60px] font-[var(--font-space-grotesk)] font-bold text-white">
          {formatMmSs(secondsRemaining)}
        </span>
      </div>

      {settingsOpen ? (
        <section
          aria-label="Timer settings"
          className="flex flex-col gap-[12px] rounded-[10px] border border-[#1E2939] bg-[#0B1220] p-[16px]"
        >
          <label className="flex flex-col gap-[8px] text-[14px] leading-[20px] font-[var(--font-inter)] text-[#99A1AF]">
            <span>{`Work length — ${workMinutes} min`}</span>
            <input
              type="range"
              min="5"
              max="60"
              step="1"
              value={workMinutes}
              onChange={handleWorkMinutesChange}
              aria-label="Work length"
              className="accent-[#3B82F6]"
            />
          </label>
          <label className="flex flex-col gap-[8px] text-[14px] leading-[20px] font-[var(--font-inter)] text-[#99A1AF]">
            <span>{`Rest length — ${restMinutes} min`}</span>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={restMinutes}
              onChange={handleRestMinutesChange}
              aria-label="Rest length"
              className="accent-[#3B82F6]"
            />
          </label>
        </section>
      ) : null}

      <div className="flex items-center justify-center gap-[16px]">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={state === "completed"}
          aria-label={playLabel}
          className="flex h-[56px] w-[56px] items-center justify-center rounded-[10px] bg-[#155DFC] text-white disabled:opacity-50"
        >
          {isActive ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset"
          className="flex h-[56px] w-[56px] items-center justify-center rounded-[10px] bg-[#1E2939] text-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <polyline points="3 4 3 10 9 10" />
          </svg>
        </button>
      </div>
    </article>
  );
}
