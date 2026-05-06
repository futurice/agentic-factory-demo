import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { PomodoroCard } from "./PomodoroCard";

function advanceSeconds(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000);
  });
}

function getTimeDisplay() {
  return screen.getByText(/^\d{2}:\d{2}$/);
}

describe("PomodoroCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders idle card with Work Time heading and 25:00 display", () => {
    render(<PomodoroCard />);
    expect(
      screen.getByRole("heading", { name: /work time/i }),
    ).toBeInTheDocument();
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    expect(screen.getByRole("button", { name: /start|play/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /reset/i })).toBeEnabled();
  });

  it("settings gear is decorative (aria-hidden, not a button)", () => {
    render(<PomodoroCard />);
    expect(screen.queryByRole("button", { name: /settings/i })).toBeNull();
  });

  it("start transitions idle to running and decrements once per second", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(1);
    expect(getTimeDisplay()).toHaveTextContent("24:59");
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("pause freezes the displayed time", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(5);
    expect(getTimeDisplay()).toHaveTextContent("24:55");
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    advanceSeconds(5);
    expect(getTimeDisplay()).toHaveTextContent("24:55");
    expect(
      screen.getByRole("button", { name: /start|play|resume/i }),
    ).toBeInTheDocument();
  });

  it("reset returns running timer to 25:00 with start label", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(3);
    expect(getTimeDisplay()).toHaveTextContent("24:57");
    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    expect(
      screen.getByRole("button", { name: /start|play/i }),
    ).toBeInTheDocument();
  });

  it("reset while paused returns to idle and stays put", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(2);
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    advanceSeconds(5);
    expect(getTimeDisplay()).toHaveTextContent("25:00");
  });

  it("timer reaches zero, stops, and start button is no longer pause", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(1500);
    expect(getTimeDisplay()).toHaveTextContent("00:00");
    advanceSeconds(5);
    expect(getTimeDisplay()).toHaveTextContent("00:00");
    expect(screen.queryByRole("button", { name: /pause/i })).toBeNull();
  });
});
