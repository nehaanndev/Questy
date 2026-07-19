import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import QuestlingApp from "./QuestlingApp";

describe("Questling release journeys", () => {
  beforeEach(() => window.localStorage.clear());

  it("connects home, source grounding, discovery, journal, and battle feedback", () => {
    render(<QuestlingApp />);

    fireEvent.click(screen.getByRole("button", { name: /source library/i }));
    fireEvent.click(screen.getByRole("button", { name: /biology notes\.pdf/i }));
    expect(screen.getByTestId("screen-source-details")).toBeInTheDocument();
    expect(screen.getByText(/all questions will be grounded/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /enter realm/i }));
    fireEvent.click(screen.getByRole("button", { name: /archive gate/i }));
    expect(screen.getByTestId("screen-discover")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save clue/i }));
    expect(screen.getByRole("button", { name: /clue saved/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /start encounter/i }));
    fireEvent.click(screen.getByRole("button", { name: /safe daily dose/i }));
    expect(screen.getByText(/guardian interrupts/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view source/i })).toBeInTheDocument();
  });

  it("supports keyboard tabs, companion selection, and a three-member team", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /sanctuary/i }));
    fireEvent.click(screen.getByRole("button", { name: /open codex/i }));

    const allTab = screen.getByRole("tab", { name: "All" });
    allTab.focus();
    fireEvent.keyDown(allTab, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Forest" })).toHaveAttribute("aria-selected", "true");

    fireEvent.click(screen.getByRole("tab", { name: "Water" }));
    fireEvent.click(screen.getByRole("button", { name: /shellback/i }));
    fireEvent.click(screen.getByRole("button", { name: /add to team/i }));
    expect(screen.getByRole("button", { name: /remove from team/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /go to first steps home/i }));
    fireEvent.click(screen.getByRole("button", { name: /sanctuary.*visit companions/i }));
    fireEvent.click(screen.getByRole("button", { name: /team setup/i }));
    expect(screen.getByText(/active team \(3 \/ 3\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save team/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/team saved with 3 companions/i);
  });

  it("applies accessibility settings and restores focus after Escape closes confirmation", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /open pause menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /^⚙ settings$/i }));

    fireEvent.click(screen.getByRole("checkbox", { name: /reduce motion/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /larger text/i }));
    expect(screen.getByTestId("screen-settings").closest("main")).toHaveClass("reduce-motion", "large-text");

    const accessibilityTab = screen.getByRole("tab", { name: "Accessibility" });
    accessibilityTab.focus();
    fireEvent.keyDown(accessibilityTab, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Privacy" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", { name: /open account/i }));

    const deleteButton = screen.getByRole("button", { name: /delete account/i });
    deleteButton.focus();
    fireEvent.click(deleteButton);
    const dialog = screen.getByRole("dialog", { name: /confirm action/i });
    expect(within(dialog).getByRole("button", { name: /cancel/i })).toHaveFocus();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
  });

  it("deletes the source that was opened instead of the first source", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /source library/i }));
    fireEvent.click(screen.getByRole("button", { name: /world history\.docx/i }));
    fireEvent.click(screen.getByRole("button", { name: /^♲ delete$/i }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /confirm/i }));

    fireEvent.click(screen.getByRole("button", { name: /go to first steps home/i }));
    fireEvent.click(screen.getByRole("button", { name: /source library/i }));
    expect(screen.queryByRole("button", { name: /world history\.docx/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /biology notes\.pdf/i })).toBeInTheDocument();
  });

  it("makes account upload deletion change the source library", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /open pause menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /^⚙ settings$/i }));
    fireEvent.click(screen.getByRole("tab", { name: "Privacy" }));
    fireEvent.click(screen.getByRole("button", { name: /open account & privacy/i }));
    fireEvent.click(screen.getByRole("button", { name: /uploads$/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete uploaded materials/i }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /confirm/i }));
    fireEvent.click(screen.getByRole("button", { name: /manage uploaded materials/i }));

    expect(screen.queryByRole("button", { name: /biology notes\.pdf/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/add source pdf/i)).toBeInTheDocument();
  });
});
