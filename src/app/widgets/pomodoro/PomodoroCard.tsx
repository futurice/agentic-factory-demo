"use client";

import { useEffect, useState } from "react";
import { formatMmSs } from "./format-time";

const INITIAL_SECONDS = 1500;
const RING_RADIUS = 110;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type TimerState = "idle" | "running" | "paused" | "completed";

export function PomodoroCard() {
  const [state, setState] = useState<TimerState>("idle");
  const [secondsRemaining, setSecondsRemaining] =
    useState<number>(INITIAL_SECONDS);

  useEffect(() => {
    if (state !== "running") {
      return;
    }
    const id = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setState("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  const isRunning = state === "running";
  const playLabel = isRunning ? "Pause" : "Start";
  const elapsed = INITIAL_SECONDS - secondsRemaining;
  const progress = Math.min(1, Math.max(0, elapsed / INITIAL_SECONDS));
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  function handlePlayPause() {
    if (state === "running") {
      setState("paused");
      return;
    }
    if (state === "completed") {
      return;
    }
    setState("running");
  }

  function handleReset() {
    setState("idle");
    setSecondsRemaining(INITIAL_SECONDS);
  }

  return (
    <article
      className="flex w-[410.66px] flex-col gap-[32px] rounded-[10px] border border-[#1E2939] bg-[#101828] p-[33px] pb-[32px] font-[var(--font-inter)]"
      aria-label="Pomodoro timer"
    >
      <header className="flex items-start justify-between">
        <h2 className="text-[24px] leading-[32px] font-[var(--font-space-grotesk)] font-bold text-white">
          Work Time
        </h2>
        <span
          aria-hidden="true"
          className="flex h-[36px] w-[36px] items-center justify-center text-[#99A1AF]"
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
        </span>
      </header>

      <div
        className="relative mx-auto flex h-[256px] w-[344.66px] items-center justify-center"
        aria-hidden="true"
      >
        <svg
          width="256"
          height="256"
          viewBox="0 0 256 256"
          className="absolute inset-0 m-auto -rotate-90"
        >
          <circle
            cx="128"
            cy="128"
            r={RING_RADIUS}
            stroke="#1E2939"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="128"
            cy="128"
            r={RING_RADIUS}
            stroke="#155DFC"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="text-[60px] leading-[60px] font-[var(--font-space-grotesk)] font-bold text-white">
          {formatMmSs(secondsRemaining)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-[16px]">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={state === "completed"}
          aria-label={playLabel}
          className="flex h-[56px] w-[56px] items-center justify-center rounded-[10px] bg-[#155DFC] text-white disabled:opacity-50"
        >
          {isRunning ? (
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
