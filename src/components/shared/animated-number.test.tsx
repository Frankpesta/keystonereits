import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedNumber } from "./animated-number";

describe("<AnimatedNumber />", () => {
  it("renders starting at 0 with the default formatter", () => {
    render(<AnimatedNumber value={1500} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("applies a custom formatter to the initial value", () => {
    render(<AnimatedNumber value={1500} formatter={(n) => `$${n.toFixed(2)}`} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("applies the className to the rendered span", () => {
    render(<AnimatedNumber value={10} className="text-2xl" />);
    expect(screen.getByText("0")).toHaveClass("text-2xl");
  });
});
