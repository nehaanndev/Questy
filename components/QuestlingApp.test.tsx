import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import QuestlingApp from "./QuestlingApp";

describe("Questling vertical slice", () => {
  beforeEach(() => window.localStorage.clear());

  it("starts in the source library with PDF and demo choices", () => {
    render(<QuestlingApp />);
    expect(screen.getByRole("heading", { name: /begin with a trusted source/i })).toBeInTheDocument();
    expect(screen.getAllByText(/upload a pdf/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /enter demo realm/i })).toBeInTheDocument();
  });

  it("enters a movable realm from the demo scenario", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /enter demo realm/i }));
    expect(screen.getByLabelText(/exploration realm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your movable avatar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lumi following/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approach the archive gate/i })).toBeDisabled();
  });

  it("moves the world camera and reveals a new area as the avatar travels", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /enter demo realm/i }));
    const camera = screen.getByTestId("exploration-camera");
    const initialTransform = camera.style.transform;
    expect(screen.getAllByText("Forgotten Cloister").length).toBeGreaterThan(0);

    const moveRight = screen.getByRole("button", { name: /move right/i });
    for (let step = 0; step < 5; step += 1) fireEvent.pointerDown(moveRight);

    expect(camera.style.transform).not.toBe(initialTransform);
    expect(screen.getAllByText("Mosswater Crossing").length).toBeGreaterThan(0);
    expect(screen.getByText("Moonwell")).toBeInTheDocument();
  });

  it("starts a battle and locks answers after one selection", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /enter demo realm/i }));
    const moveRight = screen.getByRole("button", { name: /move right/i });
    const moveUp = screen.getByRole("button", { name: /move up/i });
    for (let step = 0; step < 14; step += 1) fireEvent.pointerDown(moveRight);
    for (let step = 0; step < 8; step += 1) fireEvent.pointerDown(moveUp);
    const encounter = screen.getByRole("button", { name: /enter encounter/i });
    expect(encounter).toBeEnabled();
    fireEvent.click(encounter);
    expect(screen.getByLabelText(/tactical study encounter/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "STRIKE" })).toBeDisabled();

    const answer = screen.getByRole("button", { name: /the dose lethal to 50%/i });
    fireEvent.click(answer);
    expect(screen.getByText(/focus aligned/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /safe daily dose|exactly 50 organs|removed after 50 minutes/i })[0]).toBeDisabled();
  });
});
