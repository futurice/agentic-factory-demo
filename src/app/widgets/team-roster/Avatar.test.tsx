import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("renders initials for a two-word name (first + last)", () => {
    const { container } = render(<Avatar name="Ada Lovelace" size="sm" />);
    expect(container.firstChild).toHaveTextContent("AL");
  });

  it("renders initials using first and last word for a three-word name", () => {
    const { container } = render(<Avatar name="Mary Jo Foley" size="sm" />);
    expect(container.firstChild).toHaveTextContent("MF");
  });

  it("does not render an img element", () => {
    const { container } = render(<Avatar name="Ada Lovelace" size="sm" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("applies sm size classes for size='sm'", () => {
    const { container } = render(<Avatar name="Ada Lovelace" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/w-8/);
    expect(el.className).toMatch(/h-8/);
    expect(el.className).toMatch(/rounded-full/);
  });

  it("applies lg size classes for size='lg'", () => {
    const { container } = render(<Avatar name="Ada Lovelace" size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/w-12/);
    expect(el.className).toMatch(/h-12/);
    expect(el.className).toMatch(/rounded-full/);
  });

  it("applies palette index 0 classes when charCodeAt(0) % 5 === 0", () => {
    // 'A'.charCodeAt(0) === 65; 65 % 5 === 0
    const { container } = render(<Avatar name="Ada Lovelace" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[#1E3A5F\]/);
    expect(el.className).toMatch(/text-\[#93C5FD\]/);
  });

  it("applies palette index 1 classes when charCodeAt(0) % 5 === 1", () => {
    // 'F'.charCodeAt(0) === 70; 70 % 5 === 0... try 'G' === 71; 71 % 5 === 1
    const { container } = render(<Avatar name="Grace Hopper" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[#1B4332\]/);
    expect(el.className).toMatch(/text-\[#6EE7B7\]/);
  });

  it("applies palette index 2 classes when charCodeAt(0) % 5 === 2", () => {
    // 'L'.charCodeAt(0) === 76; 76 % 5 === 1... try 'B' === 66; 66 % 5 === 1
    // Need charCode % 5 === 2: e.g. 'M' === 77; 77 % 5 === 2
    const { container } = render(<Avatar name="Margaret Hamilton" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[#3B1F5E\]/);
    expect(el.className).toMatch(/text-\[#C4B5FD\]/);
  });

  it("applies palette index 3 classes when charCodeAt(0) % 5 === 3", () => {
    // 'N'.charCodeAt(0) === 78; 78 % 5 === 3
    const { container } = render(<Avatar name="Nikola Tesla" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[#4C1D24\]/);
    expect(el.className).toMatch(/text-\[#FCA5A5\]/);
  });

  it("applies palette index 4 classes when charCodeAt(0) % 5 === 4", () => {
    // 'L'.charCodeAt(0) === 76; 76 % 5 === 1... 'O' === 79; 79 % 5 === 4
    const { container } = render(<Avatar name="Oscar Wilde" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/bg-\[#451A03\]/);
    expect(el.className).toMatch(/text-\[#FCD34D\]/);
  });

  it("uses className, not inline style, for colors", () => {
    const { container } = render(<Avatar name="Ada Lovelace" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("style")).toBeNull();
  });
});
