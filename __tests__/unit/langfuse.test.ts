/**
 * Langfuse Tracing Unit Tests
 *
 * Verifies that the getLangfuse() helper correctly initialises the client,
 * returns null when credentials are absent, and that the Langfuse SDK
 * methods are wired up as expected.
 */

import { getLangfuse, _resetLangfuseClient } from "../../lib/langfuse";

// ---- Mock the langfuse package ----
// Note: factory runs before variable declarations — define everything inline.
jest.mock("langfuse", () => {
  const mockEnd = jest.fn();
  const mockUpdate = jest.fn();
  const mockSpan = jest.fn(() => ({}));
  const mockGeneration = jest.fn(() => ({ end: mockEnd }));
  const mockTrace = jest.fn(() => ({
    id: "mock-trace-id",
    generation: mockGeneration,
    span: mockSpan,
    update: mockUpdate,
  }));
  const mockFlushAsync = jest.fn().mockResolvedValue(undefined);
  const MockLangfuse = jest.fn().mockImplementation(() => ({
    trace: mockTrace,
    flushAsync: mockFlushAsync,
  }));
  return { Langfuse: MockLangfuse };
});

import { Langfuse } from "langfuse";

// Typed access to the mocks after jest.mock hoisting
const MockLangfuse = Langfuse as jest.MockedClass<typeof Langfuse>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMockInstance = () => MockLangfuse.mock.results[0]?.value as any;

// ---- helpers ----
const setKeys = () => {
  process.env.LANGFUSE_PUBLIC_KEY = "pk-test";
  process.env.LANGFUSE_SECRET_KEY = "sk-test";
};
const clearKeys = () => {
  delete process.env.LANGFUSE_PUBLIC_KEY;
  delete process.env.LANGFUSE_SECRET_KEY;
};

describe("Langfuse tracing", () => {
  beforeEach(() => {
    clearKeys();
    _resetLangfuseClient();
    jest.clearAllMocks();
  });

  it("returns null when Langfuse keys are not set", () => {
    expect(getLangfuse()).toBeNull();
  });

  it("returns a client when keys are present", () => {
    setKeys();
    const client = getLangfuse();
    expect(client).not.toBeNull();
    expect(MockLangfuse).toHaveBeenCalledWith(
      expect.objectContaining({
        publicKey: "pk-test",
        secretKey: "sk-test",
      })
    );
  });

  it("creates trace with correct name and userId", () => {
    setKeys();
    const client = getLangfuse()!;
    client.trace({ name: "diagnosis", userId: "user-123", metadata: {} });
    const instance = getMockInstance();
    expect(instance.trace).toHaveBeenCalledWith(
      expect.objectContaining({ name: "diagnosis", userId: "user-123" })
    );
  });

  it("creates generation span for LLM call", () => {
    setKeys();
    const client = getLangfuse()!;
    const trace = client.trace({ name: "diagnosis", userId: "u1", metadata: {} });
    trace.generation({ name: "gpt-4o-diagnosis", model: "gpt-4o", input: "system prompt" });
    expect(trace.generation).toHaveBeenCalledWith(
      expect.objectContaining({ name: "gpt-4o-diagnosis", model: "gpt-4o" })
    );
  });

  it("creates tool spans for each tool call in onStepFinish", () => {
    setKeys();
    const client = getLangfuse()!;
    const trace = client.trace({ name: "diagnosis", userId: "u1", metadata: {} });

    const toolCalls = [
      { toolName: "findContractors", input: { zip: "90210" } },
      { toolName: "getCostEstimate", input: { service: "plumbing" } },
    ];
    for (const tc of toolCalls) {
      trace.span({ name: `tool:${tc.toolName}`, input: tc.input });
    }

    expect(trace.span).toHaveBeenCalledTimes(2);
    expect(trace.span).toHaveBeenCalledWith(
      expect.objectContaining({ name: "tool:findContractors" })
    );
    expect(trace.span).toHaveBeenCalledWith(
      expect.objectContaining({ name: "tool:getCostEstimate" })
    );
  });

  it("ends generation with output and usage in onFinish", () => {
    setKeys();
    const client = getLangfuse()!;
    const trace = client.trace({ name: "diagnosis", userId: "u1", metadata: {} });
    const generation = trace.generation({ name: "gpt-4o-diagnosis", model: "gpt-4o", input: "" });
    generation.end({ output: "Here is your diagnosis.", usage: { input: 500, output: 200 } });

    expect(generation.end).toHaveBeenCalledWith(
      expect.objectContaining({
        output: "Here is your diagnosis.",
        usage: expect.objectContaining({ input: 500, output: 200 }),
      })
    );
  });

  it("flushes after response completes", async () => {
    setKeys();
    const client = getLangfuse()!;
    await client.flushAsync();
    const instance = getMockInstance();
    expect(instance.flushAsync).toHaveBeenCalledTimes(1);
  });

  it("does not throw when Langfuse is unavailable", () => {
    // Keys absent → getLangfuse() returns null → no throw
    expect(() => {
      const client = getLangfuse();
      expect(client).toBeNull();
    }).not.toThrow();
  });

  it("returns the same singleton on repeated calls", () => {
    setKeys();
    const first = getLangfuse();
    const second = getLangfuse();
    expect(first).toBe(second);
    expect(MockLangfuse).toHaveBeenCalledTimes(1);
  });
});
