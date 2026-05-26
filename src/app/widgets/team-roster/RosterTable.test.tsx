import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RosterTable from "./RosterTable";
import { EMPLOYEES } from "./employees";

// Spy on console.error before each test and assert it was never called.
// This is the hydration guardrail per AGENTS.md Pomodoro Amendment 2026-05-08 #6.
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  expect(consoleErrorSpy).not.toHaveBeenCalled();
  consoleErrorSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Scenario: No hydration mismatch on mount
// ---------------------------------------------------------------------------
describe("No hydration mismatch on mount", () => {
  it("does not call console.error when RosterTable is mounted", () => {
    render(<RosterTable />);
    // The afterEach hook asserts consoleErrorSpy was not called.
  });
});

// ---------------------------------------------------------------------------
// Scenario: Table renders all mock employees
// ---------------------------------------------------------------------------
describe("Table renders all mock employees", () => {
  it("renders exactly 6 body rows", () => {
    const { container } = render(<RosterTable />);
    const tbody = container.querySelector("tbody");
    // Each employee has exactly one main <tr>. Detail rows only appear when expanded.
    const rows = Array.from(tbody!.querySelectorAll("tr"));
    expect(rows).toHaveLength(6);
  });

  it("each row displays the employee's name, role, department, and manager name or '—'", () => {
    render(<RosterTable />);
    for (const emp of EMPLOYEES) {
      // Name
      expect(screen.getAllByText(emp.name).length).toBeGreaterThanOrEqual(1);
      // Role
      expect(screen.getAllByText(emp.role).length).toBeGreaterThanOrEqual(1);
      // Department
      expect(screen.getAllByText(emp.department).length).toBeGreaterThanOrEqual(
        1,
      );
    }
    // Top-level employees (managerId null) show "—"
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Scenario: Expanding a row shows the inline detail panel
// ---------------------------------------------------------------------------
describe("Expanding a row shows the inline detail panel", () => {
  it("clicking the expand button makes the detail panel visible", async () => {
    const user = userEvent.setup();
    const { container } = render(<RosterTable />);

    // Ada Lovelace is emp-1; her detail panel (identified by id) should not exist initially.
    expect(container.querySelector("#detail-emp-1")).toBeNull();

    const btn = screen.getByRole("button", { name: "Expand Ada Lovelace" });
    await user.click(btn);

    // After expanding, the detail panel should appear in the DOM.
    expect(container.querySelector("#detail-emp-1")).not.toBeNull();
  });

  it("chevron button has aria-expanded='true' after clicking", async () => {
    const user = userEvent.setup();
    render(<RosterTable />);

    const btn = screen.getByRole("button", { name: "Expand Ada Lovelace" });
    expect(btn).toHaveAttribute("aria-expanded", "false");

    await user.click(btn);

    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("the visible detail panel contains the employee's name, role, and department", async () => {
    const user = userEvent.setup();
    const { container } = render(<RosterTable />);

    const btn = screen.getByRole("button", { name: "Expand Ada Lovelace" });
    await user.click(btn);

    // The detail panel is a <td> with id="detail-emp-1"
    const detailTd = container.querySelector("#detail-emp-1");
    expect(detailTd).not.toBeNull();
    expect(
      within(detailTd as HTMLElement).getByText("Ada Lovelace"),
    ).toBeInTheDocument();
    expect(
      within(detailTd as HTMLElement).getByText("Engineering Lead"),
    ).toBeInTheDocument();
    expect(
      within(detailTd as HTMLElement).getByText("Engineering"),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Scenario: Detail panel shows Reports-to card for employee with a manager
// ---------------------------------------------------------------------------
describe("Detail panel shows Reports-to card for employee with a manager", () => {
  it("Grace Hopper's detail panel contains a 'Reports to' section with the manager's name", async () => {
    const user = userEvent.setup();
    const { container } = render(<RosterTable />);

    // Grace Hopper (emp-2) has managerId=emp-1 (Ada Lovelace)
    const btn = screen.getByRole("button", { name: "Expand Grace Hopper" });
    await user.click(btn);

    const detailTd = container.querySelector("#detail-emp-2");
    expect(detailTd).not.toBeNull();
    expect(
      within(detailTd as HTMLElement).getByText("Reports to"),
    ).toBeInTheDocument();
    // Manager is Ada Lovelace
    const managerNameEls = within(detailTd as HTMLElement).getAllByText(
      "Ada Lovelace",
    );
    expect(managerNameEls.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Scenario: Detail panel omits Reports-to card for top-level employee
// ---------------------------------------------------------------------------
describe("Detail panel omits Reports-to card for top-level employee", () => {
  it("Ada Lovelace's detail panel has no 'Reports to' heading or card", async () => {
    const user = userEvent.setup();
    const { container } = render(<RosterTable />);

    // Ada Lovelace (emp-1) has managerId=null
    const btn = screen.getByRole("button", { name: "Expand Ada Lovelace" });
    await user.click(btn);

    const detailTd = container.querySelector("#detail-emp-1");
    expect(detailTd).not.toBeNull();
    expect(
      within(detailTd as HTMLElement).queryByText("Reports to"),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Scenario: Accordion collapses previously open row when a new row is opened
// ---------------------------------------------------------------------------
describe("Accordion collapses previously open row when a new row is opened", () => {
  it("expanding Grace Hopper collapses Ada Lovelace's panel", async () => {
    const user = userEvent.setup();
    const { container } = render(<RosterTable />);

    // Expand Ada Lovelace
    await user.click(
      screen.getByRole("button", { name: "Expand Ada Lovelace" }),
    );
    expect(container.querySelector("#detail-emp-1")).not.toBeNull();

    // Expand Grace Hopper — Ada Lovelace should collapse
    await user.click(
      screen.getByRole("button", { name: "Expand Grace Hopper" }),
    );

    expect(container.querySelector("#detail-emp-1")).toBeNull();
    expect(container.querySelector("#detail-emp-2")).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Scenario: Clicking the expand button on an open row collapses it
// ---------------------------------------------------------------------------
describe("Clicking the expand button on an open row collapses it", () => {
  it("re-clicking the expand button removes the detail panel from the DOM", async () => {
    const user = userEvent.setup();
    const { container } = render(<RosterTable />);

    const btn = screen.getByRole("button", { name: "Expand Ada Lovelace" });
    await user.click(btn);
    expect(container.querySelector("#detail-emp-1")).not.toBeNull();
    expect(btn).toHaveAttribute("aria-expanded", "true");

    // Click again to collapse
    await user.click(btn);
    expect(container.querySelector("#detail-emp-1")).toBeNull();
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });
});

// ---------------------------------------------------------------------------
// Scenario: Avatar renders initials, not an image
// ---------------------------------------------------------------------------
describe("Avatar renders initials, not an image", () => {
  it("no <img> element exists inside any Avatar rendered in the table", () => {
    const { container } = render(<RosterTable />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(0);
  });

  it("each Avatar contains exactly two uppercase characters matching the employee's initials", () => {
    const { container } = render(<RosterTable />);
    // Avatars are aria-hidden divs; we read them via container query.
    // Each employee row has one sm Avatar. We find them by checking aria-hidden divs in tbody rows.
    // Avatars are found by locating the name span within each row's first <td>.
    // Only the 6 data rows have sm Avatars; detail rows do not have name spans in <td>s.
    for (const emp of EMPLOYEES) {
      const words = emp.name.trim().split(/\s+/);
      const expectedInitials =
        (words[0]?.[0]?.toUpperCase() ?? "") +
        (words.length > 1
          ? (words[words.length - 1]?.[0]?.toUpperCase() ?? "")
          : "");

      // Find the avatar div for this employee by locating the row that contains the name
      // The name cell is the first <td> in the row; within it the avatar div comes before the name span.
      const nameSpans = Array.from(
        container.querySelectorAll("td span"),
      ).filter((el) => el.textContent === emp.name);
      expect(nameSpans.length).toBeGreaterThanOrEqual(1);

      const nameTd = nameSpans[0].closest("td");
      expect(nameTd).not.toBeNull();
      const avatarDiv = nameTd!.querySelector("div[aria-hidden='true']");
      expect(avatarDiv).not.toBeNull();
      expect(avatarDiv!.textContent).toBe(expectedInitials);
    }
  });

  it("Avatar for palette index 0 employee has correct bg and text classes", () => {
    // Ada Lovelace: 'A'=65, 65%5=0 → bg-[#1E3A5F], text-[#93C5FD]
    const { container } = render(<RosterTable />);
    const adaNameSpan = Array.from(container.querySelectorAll("td span")).find(
      (el) => el.textContent === "Ada Lovelace",
    );
    expect(adaNameSpan).not.toBeUndefined();
    const avatarDiv = adaNameSpan!
      .closest("td")!
      .querySelector("div[aria-hidden='true']") as HTMLElement;
    expect(avatarDiv.className).toMatch(/bg-\[#1E3A5F\]/);
    expect(avatarDiv.className).toMatch(/text-\[#93C5FD\]/);
  });

  it("Avatar for palette index 1 employee has correct bg and text classes", () => {
    // Grace Hopper: 'G'=71, 71%5=1 → bg-[#1B4332], text-[#6EE7B7]
    const { container } = render(<RosterTable />);
    const nameSpan = Array.from(container.querySelectorAll("td span")).find(
      (el) => el.textContent === "Grace Hopper",
    );
    expect(nameSpan).not.toBeUndefined();
    const avatarDiv = nameSpan!
      .closest("td")!
      .querySelector("div[aria-hidden='true']") as HTMLElement;
    expect(avatarDiv.className).toMatch(/bg-\[#1B4332\]/);
    expect(avatarDiv.className).toMatch(/text-\[#6EE7B7\]/);
  });

  it("Avatar for palette index 2 employee has correct bg and text classes", () => {
    // Margaret Hamilton: 'M'=77, 77%5=2 → bg-[#3B1F5E], text-[#C4B5FD]
    const { container } = render(<RosterTable />);
    const nameSpan = Array.from(container.querySelectorAll("td span")).find(
      (el) => el.textContent === "Margaret Hamilton",
    );
    expect(nameSpan).not.toBeUndefined();
    const avatarDiv = nameSpan!
      .closest("td")!
      .querySelector("div[aria-hidden='true']") as HTMLElement;
    expect(avatarDiv.className).toMatch(/bg-\[#3B1F5E\]/);
    expect(avatarDiv.className).toMatch(/text-\[#C4B5FD\]/);
  });
});
