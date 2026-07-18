import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import QuestlingApp, { SCREEN_IDS } from "./QuestlingApp";

describe("Questling 24-screen interactive storyboard", () => {
  beforeEach(() => window.localStorage.clear());

  it("defines the exact 24 unique implementation screens", () => {
    expect(SCREEN_IDS).toHaveLength(24);
    expect(new Set(SCREEN_IDS).size).toBe(24);
    expect(SCREEN_IDS).toContain("avatar-create");
    expect(SCREEN_IDS).toContain("source-attention");
    expect(SCREEN_IDS).toContain("account");
  });

  it("starts at the title and supports the onboarding controls", () => {
    render(<QuestlingApp />);
    expect(screen.getByTestId("screen-title")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(screen.getByTestId("screen-avatar-create")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Hair" }));
    fireEvent.click(screen.getByRole("button", { name: /braided/i }));
    expect(screen.getByText(/selected hair:/i)).toHaveTextContent("Braided");

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByTestId("screen-world-builder")).toBeInTheDocument();
  });

  it("builds the demo realm and enters point-and-click exploration", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /build demo realm/i }));
    expect(screen.getByTestId("screen-processing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /enter the realm/i }));
    expect(screen.getByTestId("screen-first-steps")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive gate/i })).toBeInTheDocument();
  });

  it("uses real hotspots and journal buttons to start a grounded battle", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /continue as guest/i }));
    fireEvent.click(screen.getByRole("button", { name: /quest journal/i }));
    expect(screen.getByTestId("screen-quest-journal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /start encounter/i }));
    expect(screen.getByTestId("screen-battle")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /the dose lethal to 50%/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/focus aligned/i);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText(/question 2 of 6/i)).toBeInTheDocument();
  });

  it("makes companion collection, filtering, and team controls interactive", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /continue as guest/i }));
    fireEvent.click(screen.getByRole("button", { name: /sanctuary/i }));
    fireEvent.click(screen.getByRole("button", { name: /open codex/i }));
    expect(screen.getByTestId("screen-codex")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Water" }));
    fireEvent.click(screen.getByRole("button", { name: /shellback/i }));
    expect(screen.getByRole("heading", { name: "Shellback" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add to team/i }));
    expect(screen.getByRole("button", { name: /remove from team/i })).toBeInTheDocument();
  });

  it("supports settings toggles and a real confirmation flow", () => {
    render(<QuestlingApp />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByTestId("screen-source-library")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /open pause menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /^⚙ settings$/i }));
    expect(screen.getByTestId("screen-settings")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /larger text/i }));
    fireEvent.click(screen.getByRole("button", { name: /save settings/i }));
    expect(window.localStorage.getItem("questling-settings")).toContain("largeText");

    fireEvent.click(screen.getByRole("tab", { name: "Privacy" }));
    fireEvent.click(screen.getByRole("button", { name: /open account/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    expect(screen.getByRole("dialog", { name: /confirm action/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
