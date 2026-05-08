import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
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
      screen.getByRole("heading", { name: /work time/i }),
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
      screen.getByRole("heading", { name: /work time/i }),
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
      screen.getByRole("heading", { name: /rest time/i }),
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
      screen.getByRole("heading", { name: /rest time/i }),
    ).toBeInTheDocument();

    act(() => {
      screen.getByRole("button", { name: /settings/i }).click();
    });
    expect(
      screen.getByRole("region", { name: /timer settings/i }),
    ).toBeInTheDocument();
    // Title still Rest Time and timer still ticks.
    expect(
      screen.getByRole("heading", { name: /rest time/i }),
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

  it("pause freezes the ring offset", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(5);
    expect(getTimeDisplay()).toHaveTextContent("24:55");
    act(() => {
      screen.getByRole("button", { name: /pause/i }).click();
    });
    const foreground = getRingSvg(container).querySelectorAll("circle")[1];
    const offsetWhilePaused = foreground.getAttribute("stroke-dashoffset");
    advanceSeconds(5);
    const foregroundAfter = getRingSvg(container).querySelectorAll("circle")[1];
    expect(foregroundAfter.getAttribute("stroke-dashoffset")).toBe(
      offsetWhilePaused,
    );
    expect(foregroundAfter.getAttribute("stroke-dasharray")).toBe("1 1");
    expect(foregroundAfter.getAttribute("pathLength")).toBe("1");
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

  it("ring switches to single-arc dasharray on start (pathLength=1, offset 0)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    const foreground = getRingSvg(container).querySelectorAll("circle")[1];
    expect(foreground.getAttribute("pathLength")).toBe("1");
    expect(foreground.getAttribute("stroke-dasharray")).toBe("1 1");
    const offset = Number(foreground.getAttribute("stroke-dashoffset"));
    expect(offset).toBeCloseTo(0, 2);
  });

  it("ring drains as time elapses (offset ≈ 0.5 at half, ≈ 1 at end)", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    // Half-way through work: 750s elapsed of 1500s.
    advanceSeconds(750);
    expect(getTimeDisplay()).toHaveTextContent("12:30");
    let foreground = getRingSvg(container).querySelectorAll("circle")[1];
    expect(foreground.getAttribute("pathLength")).toBe("1");
    expect(foreground.getAttribute("stroke-dasharray")).toBe("1 1");
    const halfOffset = Number(foreground.getAttribute("stroke-dashoffset"));
    expect(halfOffset).toBeCloseTo(0.5, 2);

    // Approach end: 1499s elapsed -> offset ≈ 0.9993, just before transition.
    advanceSeconds(749);
    expect(getTimeDisplay()).toHaveTextContent("00:01");
    foreground = getRingSvg(container).querySelectorAll("circle")[1];
    const nearEndOffset = Number(foreground.getAttribute("stroke-dashoffset"));
    expect(nearEndOffset).toBeGreaterThan(0.99);
    expect(nearEndOffset).toBeLessThanOrEqual(1);
  });

  it("ring during resting uses restMinutes as denominator", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    // Work (1500s) -> resting; advance halfway through 300s rest (150s).
    advanceSeconds(1500);
    expect(getTimeDisplay()).toHaveTextContent("05:00");
    let foreground = getRingSvg(container).querySelectorAll("circle")[1];
    // At the moment of phase advance the offset resets to ≈ 0.
    expect(Number(foreground.getAttribute("stroke-dashoffset"))).toBeCloseTo(
      0,
      2,
    );

    advanceSeconds(150);
    expect(getTimeDisplay()).toHaveTextContent("02:30");
    foreground = getRingSvg(container).querySelectorAll("circle")[1];
    expect(foreground.getAttribute("pathLength")).toBe("1");
    expect(foreground.getAttribute("stroke-dasharray")).toBe("1 1");
    const offset = Number(foreground.getAttribute("stroke-dashoffset"));
    // 150 / 300 = 0.5 — denominator is restMinutes * 60, not workMinutes * 60.
    expect(offset).toBeCloseTo(0.5, 2);
  });

  it("ring returns to four-segment idle pattern on reset", () => {
    const { container } = render(<PomodoroCard />);
    act(() => {
      screen.getByRole("button", { name: /start|play/i }).click();
    });
    advanceSeconds(10);
    let foreground = getRingSvg(container).querySelectorAll("circle")[1];
    expect(foreground.getAttribute("pathLength")).toBe("1");

    act(() => {
      screen.getByRole("button", { name: /reset/i }).click();
    });
    foreground = getRingSvg(container).querySelectorAll("circle")[1];
    expect(foreground.getAttribute("pathLength")).toBeNull();
    const dasharray = foreground.getAttribute("stroke-dasharray");
    expect(dasharray).not.toBeNull();
    const parts = dasharray!.split(/[\s,]+/).map(Number);
    expect(parts.length).toBe(2);
    expect(parts[0] / parts[1]).toBeCloseTo(2, 2);
    const dashoffset = foreground.getAttribute("stroke-dashoffset");
    expect(dashoffset === null || dashoffset === "0").toBe(true);
  });
});
