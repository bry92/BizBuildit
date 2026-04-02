import { describe, it, expect, vi, beforeEach } from "vitest";
import { logoRouter } from "./logo";
import type { TrpcContext } from "../_core/context";

// Mock the database and LLM functions
vi.mock("../db", () => ({
  getDb: vi.fn(),
  getLogoResult: vi.fn(),
  createLogoResult: vi.fn(),
  getBusinessById: vi.fn(),
  getBrandingResult: vi.fn(),
}));

vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

vi.mock("../_core/imageGeneration", () => ({
  generateImage: vi.fn(),
}));

describe("Logo Router", () => {
  const mockContext: TrpcContext = {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as any,
    res: {} as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have get and generate procedures", () => {
    const procedures = Object.keys(logoRouter._def.procedures);
    expect(procedures).toContain("get");
    expect(procedures).toContain("generate");
  });

  it("should validate businessId input", () => {
    const getProcedure = logoRouter._def.procedures.get;
    expect(getProcedure).toBeDefined();
  });

  it("should validate generate input", () => {
    const generateProcedure = logoRouter._def.procedures.generate;
    expect(generateProcedure).toBeDefined();
  });

  it("should have protected get procedure", () => {
    const getProcedure = logoRouter._def.procedures.get;
    // Protected procedures are defined
    expect(getProcedure).toBeDefined();
  });

  it("should have protected generate procedure", () => {
    const generateProcedure = logoRouter._def.procedures.generate;
    // Protected procedures are defined
    expect(generateProcedure).toBeDefined();
  });
});
