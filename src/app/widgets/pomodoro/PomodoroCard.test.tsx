import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { PomodoroCard } from "./PomodoroCard";

function getRingSvg(container: HTMLElement): SVGSVGElement {
  const svgs = container.querySelectorAll("svg");
  const ring = Array.from(svgs).find(
    (el) => el.getAttribute("viewBox") === "0 0 344.664 256",
  );
  if (!ring) {
    throw new Error("Ring SVG with viewBox '0 0 344.664 256' not found");
  }
  return ring as SVGSVGElement;
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

  it.todo("pause freezes the ring offset");

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
      screen.getByRole("heading", { name: /rest time/i }),
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
      screen.getByRole("heading", { name: /work time/i }),
    ).toBeInTheDocument();
    expect(getTimeDisplay()).toHaveTextContent("25:00");
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("renders the four-segment dashed ring matching Figma node 1:11", () => {
    const { container } = render(<PomodoroCard />);
    const svg = getRingSvg(container);
    expect(svg.getAttribute("viewBox")).toBe("0 0 344.664 256");

    const circles = svg.querySelectorAll("circle");
    expect(circles.length).toBe(2);

    const [track, foreground] = Array.from(circles);

    // Track circle
    expect(track.getAttribute("cx")).toBe("172.332");
    expect(track.getAttribute("cy")).toBe("128");
    expect(track.getAttribute("r")).toBe("115.2");
    expect(track.getAttribute("stroke")).toBe("#1F2937");
    expect(track.getAttribute("stroke-width")).toBe("10.24");
    expect(track.getAttribute("fill")).toBe("none");
    expect(track.getAttribute("stroke-dasharray")).toBeNull();

    // Foreground circle
    expect(foreground.getAttribute("cx")).toBe("172.332");
    expect(foreground.getAttribute("cy")).toBe("128");
    expect(foreground.getAttribute("r")).toBe("115.2");
    expect(foreground.getAttribute("stroke")).toBe("#3B82F6");
    expect(foreground.getAttribute("stroke-width")).toBe("10.24");
    expect(foreground.getAttribute("fill")).toBe("none");
    expect(foreground.getAttribute("stroke-linecap")).toBe("round");

    // Dasharray ratio is 2:1 (dash 60° / gap 30°), within two-decimal tolerance
    const dasharray = foreground.getAttribute("stroke-dasharray");
    expect(dasharray).not.toBeNull();
    const parts = dasharray!.split(/[\s,]+/).map(Number);
    expect(parts.length).toBe(2);
    const [dash, gap] = parts;
    expect(dash / gap).toBeCloseTo(2, 2);

    // Anchored at 12 o'clock via -90° rotation about (172.332, 128)
    // OR an equivalent stroke-dashoffset (spec permits either implementation).
    const transform = foreground.getAttribute("transform");
    const dashoffset = foreground.getAttribute("stroke-dashoffset");
    const rotated = transform === "rotate(-90 172.332 128)";
    const offsetAnchored = dashoffset !== null && dashoffset !== "0";
    expect(rotated || offsetAnchored).toBe(true);
  });

  it("ring pattern is invariant across timer states", () => {
    const { container } = render(<PomodoroCard />);
    const svg = getRingSvg(container);
    const foreground = svg.querySelectorAll("circle")[1];
    const idleDasharray = foreground.getAttribute("stroke-dasharray");
    const idleDashoffset = foreground.getAttribute("stroke-dashoffset");
    const idleTransform = foreground.getAttribute("transform");

    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(7);
    expect(getTimeDisplay()).toHaveTextContent("24:53");

    const runningSvg = getRingSvg(container);
    const runningForeground = runningSvg.querySelectorAll("circle")[1];
    expect(runningForeground.getAttribute("stroke-dasharray")).toBe(
      idleDasharray,
    );
    expect(runningForeground.getAttribute("stroke-dashoffset")).toBe(
      idleDashoffset,
    );
    expect(runningForeground.getAttribute("transform")).toBe(idleTransform);
  });
});
