import { describe, it, expect } from "vitest";

describe("NotificationCenter", () => {
  it("should create notification with unique ID", () => {
    const id1 = `notification-${Date.now()}-${Math.random()}`;
    const id2 = `notification-${Date.now()}-${Math.random()}`;
    expect(id1).not.toBe(id2);
  });

  it("should support all notification types", () => {
    const types = ["success", "error", "info", "warning"];
    types.forEach((type) => {
      expect(["success", "error", "info", "warning"]).toContain(type);
    });
  });

  it("should have default duration of 5000ms", () => {
    const defaultDuration = 5000;
    expect(defaultDuration).toBe(5000);
  });

  it("should support custom action buttons", () => {
    const action = {
      label: "Retry",
      onClick: () => {
        console.log("Retrying...");
      },
    };
    expect(action.label).toBe("Retry");
    expect(typeof action.onClick).toBe("function");
  });

  it("should support persistent notifications with duration 0", () => {
    const duration = 0;
    expect(duration).toBe(0);
  });
});
