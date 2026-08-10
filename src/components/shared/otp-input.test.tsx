import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OtpInput } from "./otp-input";

function ControlledOtpInput({ length = 6 }: { length?: number }) {
  const [value, setValue] = useState("");
  return <OtpInput value={value} onChange={setValue} length={length} />;
}

function getBoxes() {
  return screen.getAllByLabelText(/^Digit \d+ of \d+$/) as HTMLInputElement[];
}

describe("<OtpInput />", () => {
  it("renders `length` boxes", () => {
    render(<ControlledOtpInput length={6} />);
    expect(getBoxes()).toHaveLength(6);
  });

  it("typing a digit fills the box and advances focus to the next one", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();

    fireEvent.change(boxes[0], { target: { value: "4" } });
    expect(boxes[0]).toHaveValue("4");
    expect(document.activeElement).toBe(boxes[1]);
  });

  it("filling every box in order produces the full code", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();
    const digits = ["0", "4", "3", "0", "6", "9"];

    digits.forEach((digit, i) => {
      fireEvent.change(boxes[i], { target: { value: digit } });
    });

    boxes.forEach((box, i) => expect(box).toHaveValue(digits[i]));
  });

  it("ignores non-digit input", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();
    fireEvent.change(boxes[0], { target: { value: "a" } });
    expect(boxes[0]).toHaveValue("");
  });

  it("backspace on an empty box moves focus to the previous box", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();

    fireEvent.change(boxes[0], { target: { value: "1" } });
    boxes[1].focus();
    fireEvent.keyDown(boxes[1], { key: "Backspace" });

    expect(document.activeElement).toBe(boxes[0]);
  });

  it("arrow keys move focus left and right", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();

    boxes[2].focus();
    fireEvent.keyDown(boxes[2], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(boxes[1]);

    fireEvent.keyDown(boxes[1], { key: "ArrowRight" });
    expect(document.activeElement).toBe(boxes[2]);
  });

  it("pasting a full code fills every box and focuses the last one", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();

    fireEvent.paste(boxes[0], {
      clipboardData: { getData: () => "038291" },
    });

    boxes.forEach((box, i) => expect(box).toHaveValue("038291"[i]));
    expect(document.activeElement).toBe(boxes[5]);
  });

  it("pasting non-digit text is ignored", () => {
    render(<ControlledOtpInput />);
    const boxes = getBoxes();

    fireEvent.paste(boxes[0], {
      clipboardData: { getData: () => "abcdef" },
    });

    boxes.forEach((box) => expect(box).toHaveValue(""));
  });

  it("disables every box when disabled prop is set", () => {
    function Disabled() {
      const [value, setValue] = useState("");
      return <OtpInput value={value} onChange={setValue} disabled />;
    }
    render(<Disabled />);
    getBoxes().forEach((box) => expect(box).toBeDisabled());
  });
});
