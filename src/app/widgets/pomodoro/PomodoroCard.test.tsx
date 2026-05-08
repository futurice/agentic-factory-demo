import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PomodoroCard } from "./PomodoroCard";

function getRingContainer(container: HTMLElement): HTMLElement {
  const ring = container.querySelector<HTMLElement>('[data-testid="ring"]');
  if (!ring) {
    throw new Error("Ring container (data-testid='ring') not found");
  }
  return ring;
}

function getRingProgress(container: HTMLElement): number {
  const ring = getRingContainer(container);
  const value = ring.style.getPropertyValue("--progress").trim();
  return Number(value);
}

function getRingStyle(container: HTMLElement): string {
  return getRingContainer(container).getAttribute("style") ?? "";
}

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

  it("renders idle card with work phase label and 25:00 display", () => {
    render(<PomodoroCard />);
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    expect(screen.getByRole("button", { name: /start|play/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /reset/i })).toBeEnabled();
  });

  it("renders a real Settings button (replaces former decorative gear)", () => {
    render(<PomodoroCard />);
    expect(
      screen.getByRole("button", { name: /settings/i }),
    ).toBeInTheDocument();
    // Panel is collapsed on initial mount.
    expect(
      screen.queryByRole("region", { name: /timer settings/i }),
    ).toBeNull();
  });

  it("settings panel toggles open and closed", () => {
    render(<PomodoroCard />);
    const settingsButton = screen.getByRole("button", { name: /settings/i });
    act(() => {
      settingsButton.click();
    });
    expect(
      screen.getByRole("region", { name: /timer settings/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /work length/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: /rest length/i }),
    ).toBeInTheDocument();
    act(() => {
      settingsButton.click();
    });
    expect(
      screen.queryByRole("region", { name: /timer settings/i }),
    ).toBeNull();
  });

  it("sliders have correct min/max/step/default attributes", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const workSlider = screen.getByRole("slider", { name: /work length/i });
    expect(workSlider).toHaveAttribute("type", "range");
    expect(workSlider).toHaveAttribute("min", "5");
    expect(workSlider).toHaveAttribute("max", "60");
    expect(workSlider).toHaveAttribute("step", "1");
    expect(workSlider).toHaveValue("25");

    const restSlider = screen.getByRole("slider", { name: /rest length/i });
    expect(restSlider).toHaveAttribute("type", "range");
    expect(restSlider).toHaveAttribute("min", "1");
    expect(restSlider).toHaveAttribute("max", "30");
    expect(restSlider).toHaveAttribute("step", "1");
    expect(restSlider).toHaveValue("5");
  });

  it("changing Work length while idle updates the time display", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const workSlider = screen.getByRole("slider", { name: /work length/i });
    act(() => {
      fireEvent.change(workSlider, { target: { value: "30" } });
    });
    expect(getTimeDisplay()).toHaveTextContent("30:00");
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
  });

  it("changing Rest length while idle does not change the time display", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const restSlider = screen.getByRole("slider", { name: /rest length/i });
    act(() => {
      fireEvent.change(restSlider, { target: { value: "10" } });
    });
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
  });

  it("slider changes mid-running do not retroactively rescale the current interval", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(10);
    expect(getTimeDisplay()).toHaveTextContent("24:50");
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const workSlider = screen.getByRole("slider", { name: /work length/i });
    act(() => {
      fireEvent.change(workSlider, { target: { value: "45" } });
    });
    expect(getTimeDisplay()).toHaveTextContent("24:50");
    // After reset, the new workMinutes is applied.
    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(getTimeDisplay()).toHaveTextContent("45:00");
  });

  it("sliders return to defaults after a re-mount (no persistence)", () => {
    const first = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const workSlider = screen.getByRole("slider", { name: /work length/i });
    act(() => {
      fireEvent.change(workSlider, { target: { value: "50" } });
    });
    expect(workSlider).toHaveValue("50");
    first.unmount();

    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    expect(screen.getByRole("slider", { name: /work length/i })).toHaveValue(
      "25",
    );
    expect(screen.getByRole("slider", { name: /rest length/i })).toHaveValue(
      "5",
    );
  });

  it("rest-length slider end-to-end: 10 min rest applied at phase advance", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const restSlider = screen.getByRole("slider", { name: /rest length/i });
    act(() => {
      fireEvent.change(restSlider, { target: { value: "10" } });
    });
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(1500);
    expect(
      screen.getByRole("heading", { name: /^rest$/i }),
    ).toBeInTheDocument();
    expect(getTimeDisplay()).toHaveTextContent("10:00");
  });

  it("opening settings panel during resting does not stop the timer", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(1500); // work -> resting (5:00)
    advanceSeconds(30); // resting -> 4:30
    expect(getTimeDisplay()).toHaveTextContent("04:30");
    expect(
      screen.getByRole("heading", { name: /^rest$/i }),
    ).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    expect(
      screen.getByRole("region", { name: /timer settings/i }),
    ).toBeInTheDocument();
    // Phase label still "rest" and timer still ticks.
    expect(
      screen.getByRole("heading", { name: /^rest$/i }),
    ).toBeInTheDocument();
    advanceSeconds(1);
    expect(getTimeDisplay()).toHaveTextContent("04:29");
  });

  it("slider boundaries: work [5,60], rest [1,30]", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const workSlider = screen.getByRole("slider", { name: /work length/i });
    expect(workSlider).toHaveAttribute("min", "5");
    expect(workSlider).toHaveAttribute("max", "60");
    expect(workSlider).toHaveAttribute("step", "1");
    const restSlider = screen.getByRole("slider", { name: /rest length/i });
    expect(restSlider).toHaveAttribute("min", "1");
    expect(restSlider).toHaveAttribute("max", "30");
    expect(restSlider).toHaveAttribute("step", "1");
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

  it("pause freezes the ring --progress (CSS encoding)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(5);
    expect(getTimeDisplay()).toHaveTextContent("24:55");
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    const progressWhilePaused = getRingProgress(container);
    advanceSeconds(5);
    expect(getRingProgress(container)).toBe(progressWhilePaused);
    // Foreground color is #F87171 (paused-from-work; Decision 10).
    expect(getRingStyle(container)).toContain("#F87171");
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

  it("work interval reaching zero advances to resting (strict alternation)", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(1500);
    expect(
      screen.getByRole("heading", { name: /^rest$/i }),
    ).toBeInTheDocument();
    expect(getTimeDisplay()).toHaveTextContent("05:00");
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("rest interval reaching zero advances to a fresh work interval", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    // Work (1500s) -> resting; then rest (300s) -> running (work)
    advanceSeconds(1500);
    expect(getTimeDisplay()).toHaveTextContent("05:00");
    advanceSeconds(300);
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("renders the idle ring as a flat foreground (Decision 9: no SVG, no segmentation)", () => {
    const { container } = render(<PomodoroCard />);
    const ring = getRingContainer(container);

    // Decision 9 / Regression Guardrail: no <svg> or <circle> descendant inside
    // the ring container in any state.
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);

    // Idle foreground color is #3B82F6 (Decision 10).
    const style = ring.getAttribute("style") ?? "";
    expect(style).toContain("#3B82F6");

    // Track color is #111827 (Decision 8).
    expect(style).toContain("#111827");

    // Idle --progress is 0 (the visible arc covers the full ring; flat idle).
    expect(getRingProgress(container)).toBe(0);
  });

  it("ring container has no <svg> or <circle> descendant in any state (Decision 9)", () => {
    const { container } = render(<PomodoroCard />);
    const ring = getRingContainer(container);

    // idle
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);

    // running (work)
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);

    // paused-from-work
    advanceSeconds(5);
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);

    // running again then resting
    act(() => {
      screen.getByRole("button", { name: /start|play|resume/i }).click();
    });
    advanceSeconds(1495);
    expect(getTimeDisplay()).toHaveTextContent("05:00");
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);

    // paused-from-rest
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);

    // post-reset (idle)
    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(ring.querySelectorAll("svg, circle").length).toBe(0);
  });

  it("ring switches to active drain on start (--progress ≈ 0)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    expect(getRingProgress(container)).toBeCloseTo(0, 2);
    // Foreground color is #F87171 in running (work).
    expect(getRingStyle(container)).toContain("#F87171");
  });

  it("ring drains clockwise as time elapses (--progress ≈ 0.5 at half, ≈ 1 at end)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    // Half-way through work: 750s elapsed of 1500s.
    advanceSeconds(750);
    expect(getTimeDisplay()).toHaveTextContent("12:30");
    expect(getRingProgress(container)).toBeCloseTo(0.5, 2);
    expect(getRingStyle(container)).toContain("#F87171");

    // Approach end: 1499s elapsed -> --progress ≈ 0.9993.
    advanceSeconds(749);
    expect(getTimeDisplay()).toHaveTextContent("00:01");
    const nearEnd = getRingProgress(container);
    expect(nearEnd).toBeGreaterThan(0.99);
    expect(nearEnd).toBeLessThanOrEqual(1);
  });

  it("ring during resting uses restMinutes as denominator", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    // Work (1500s) -> resting; at phase advance --progress resets to 0 and
    // the foreground color flips to #34D399 (Decision 10) in the same render.
    advanceSeconds(1500);
    expect(getTimeDisplay()).toHaveTextContent("05:00");
    expect(getRingProgress(container)).toBeCloseTo(0, 2);
    expect(getRingStyle(container)).toContain("#34D399");

    advanceSeconds(150);
    expect(getTimeDisplay()).toHaveTextContent("02:30");
    // 150 / 300 = 0.5 — denominator is restMinutes * 60, not workMinutes * 60.
    expect(getRingProgress(container)).toBeCloseTo(0.5, 2);
    expect(getRingStyle(container)).toContain("#34D399");
  });

  it("play/pause, reset, and Settings buttons have hover and focus-visible utilities (polish)", () => {
    render(<PomodoroCard />);
    const playButton = screen.getByRole("button", { name: /start|play/i });
    const resetButton = screen.getByRole("button", { name: /reset/i });
    const settingsButton = screen.getByRole("button", { name: /settings/i });

    expect(playButton.className).toMatch(/hover:(bg-|opacity-)/);
    expect(playButton.className).toMatch(/focus-visible:/);
    expect(resetButton.className).toMatch(/hover:(bg-|opacity-)/);
    expect(resetButton.className).toMatch(/focus-visible:/);
    expect(settingsButton.className).toMatch(/hover:(bg-|opacity-)/);
    expect(settingsButton.className).toMatch(/focus-visible:/);
  });

  it("ring container carries a --progress transition while running (polish)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    const ring = getRingContainer(container);
    const className = ring.getAttribute("class") ?? "";
    const style = ring.getAttribute("style") ?? "";
    const hasTransitionClass = /transition-/.test(className);
    const hasTransitionStyle =
      /transition[^;]*(progress|background|mask|stroke-dashoffset)/.test(style);
    expect(hasTransitionClass || hasTransitionStyle).toBe(true);
  });

  it("range inputs use accent-[#3B82F6] (polish)", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const sliders = screen.getAllByRole("slider");
    expect(sliders.length).toBe(2);
    for (const slider of sliders) {
      expect(slider.className).toContain("accent-[#3B82F6]");
    }
  });

  it("settings panel root uses palette background and #1E2939 border (polish)", () => {
    render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    const panel = screen.getByRole("region", { name: /timer settings/i });
    expect(panel.className).toMatch(/bg-\[#(101828|0B1220)\]/);
    expect(panel.className).toMatch(/border-\[#1E2939\]/);
  });

  it("ring track is significantly dimmer than the remaining-time arc (Decision 8)", () => {
    const { container } = render(<PomodoroCard />);
    const style = getRingStyle(container);
    // Track is the dimmer #111827 backdrop (Decision 8).
    expect(style).toContain("#111827");
    // Idle foreground is #3B82F6 (Decision 10).
    expect(style).toContain("#3B82F6");
    // The ring no longer renders #1F2937 — the track moved off that token.
    expect(style).not.toContain("#1F2937");
  });

  it("ring foreground color matches the active phase (Decision 10)", () => {
    const { container } = render(<PomodoroCard />);

    // idle -> #3B82F6
    expect(getRingStyle(container)).toContain("#3B82F6");

    // running (work) -> #F87171
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    expect(getRingStyle(container)).toContain("#F87171");
    expect(getRingStyle(container)).not.toContain("#3B82F6");

    // resting -> #34D399
    advanceSeconds(1500);
    expect(getTimeDisplay()).toHaveTextContent("05:00");
    expect(getRingStyle(container)).toContain("#34D399");
    expect(getRingStyle(container)).not.toContain("#F87171");

    // paused-from-rest -> still #34D399
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    expect(getRingStyle(container)).toContain("#34D399");

    // reset -> idle -> #3B82F6
    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(getRingStyle(container)).toContain("#3B82F6");
    expect(getRingStyle(container)).not.toContain("#F87171");
    expect(getRingStyle(container)).not.toContain("#34D399");
  });

  it("ring returns to flat idle ring on reset (--progress = 0, foreground = #3B82F6)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(10);
    expect(getRingProgress(container)).toBeGreaterThan(0);
    expect(getRingStyle(container)).toContain("#F87171");

    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(getRingProgress(container)).toBe(0);
    const style = getRingStyle(container);
    expect(style).toContain("#3B82F6");
    expect(style).toContain("#111827");
    // Decision 9 / Regression Guardrail: no SVG/circle anywhere in ring.
    expect(
      getRingContainer(container).querySelectorAll("svg, circle").length,
    ).toBe(0);
  });

  // Decision 11 (Amendment 2026-05-08 #3) — phase label inside the ring
  // container above the MM:SS time display.

  it("phase label heading reads 'work' in idle and uses Decision 11 typography", () => {
    const { container } = render(<PomodoroCard />);
    const heading = screen.getByRole("heading", { name: /^work$/i });
    expect(heading.tagName).toBe("H2");
    expect(heading.className).toMatch(/text-\[12px\]/);
    expect(heading.className).toMatch(/text-\[#99A1AF\]/);
    expect(heading.className).toMatch(/font-\[var\(--font-inter\)\]/);
    // Negative DoD bullet: no top-of-card "Work Time"/"Rest Time" heading
    // anywhere in the card in any state.
    expect(
      screen.queryByRole("heading", { name: /^(work|rest) time$/i }),
    ).toBeNull();
    // Exactly one <h2> rendered in the card.
    const card = container.querySelector('[aria-label="Pomodoro timer"]');
    expect(card).not.toBeNull();
    expect(card!.querySelectorAll("h2").length).toBe(1);
  });

  it("phase label heading flips to 'rest' on phase advance and back to 'work' on the next advance", () => {
    render(<PomodoroCard />);
    // idle -> "work"
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^(work|rest) time$/i }),
    ).toBeNull();

    // running (work) -> "work"
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();

    // pause (paused-from-work) -> "work"
    advanceSeconds(5);
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^(work|rest) time$/i }),
    ).toBeNull();

    // resume + run to phase advance -> resting -> "rest"
    act(() => {
      screen.getByRole("button", { name: /start|play|resume/i }).click();
    });
    advanceSeconds(1495);
    expect(
      screen.getByRole("heading", { name: /^rest$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^(work|rest) time$/i }),
    ).toBeNull();

    // pause during rest (paused-from-rest) -> "rest"
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    expect(
      screen.getByRole("heading", { name: /^rest$/i }),
    ).toBeInTheDocument();

    // reset -> idle -> "work"
    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    expect(
      screen.getByRole("heading", { name: /^work$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /^(work|rest) time$/i }),
    ).toBeNull();
  });

  it("phase label heading precedes the MM:SS time display in DOM order (above the time)", () => {
    render(<PomodoroCard />);
    const heading = screen.getByRole("heading", { name: /^work$/i });
    const timeDisplay = getTimeDisplay();
    // Heading and time display share the ring container; heading appears
    // first in DOM order (visually centered above the MM:SS span).
    const position = heading.compareDocumentPosition(timeDisplay);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
