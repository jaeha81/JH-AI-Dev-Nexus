import { describe, expect, it } from "vitest";
import { createProviderRuntimeRequest, sendProviderRuntimeRequest } from "./provider-runtime.js";

describe("provider runtime request builder", () => {
  it("builds a safe OpenAI runtime request without exposing the API key", () => {
    const result = createProviderRuntimeRequest({
      providerId: "openai",
      capability: "prompt:generate",
      prompt: "Summarize project status",
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      }
    });

    expect(result).toEqual({
      ok: true,
      providerId: "openai",
      capability: "prompt:generate",
      network: "ready-to-call",
      request: {
        url: "https://api.openai.com/v1/responses",
        method: "POST",
        headers: {
          authorizationEnv: "OPENAI_API_KEY",
          "content-type": "application/json"
        },
        body: {
          model: "gpt-5.2",
          input: "Summarize project status"
        }
      },
      errors: []
    });
    expect(JSON.stringify(result)).not.toContain("sk-secret-value");
  });

  it("blocks runtime request creation when provider is not ready", () => {
    const result = createProviderRuntimeRequest({
      providerId: "anthropic",
      capability: "prompt:generate",
      prompt: "Summarize project status",
      env: {}
    });

    expect(result).toEqual({
      ok: false,
      providerId: "anthropic",
      capability: "prompt:generate",
      network: "not-called",
      request: undefined,
      errors: ["Missing required env: ANTHROPIC_API_KEY."]
    });
  });

  it("blocks runtime request creation for unsafe capabilities", () => {
    const result = createProviderRuntimeRequest({
      providerId: "openai",
      capability: "production:deploy",
      prompt: "Deploy production",
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      }
    });

    expect(result.ok).toBe(false);
    expect(result.network).toBe("not-called");
    expect(result.errors).toEqual(["Capability production:deploy is not allowed for provider openai."]);
    expect(JSON.stringify(result)).not.toContain("sk-secret-value");
  });

  it("sends an OpenAI runtime request through an injected fetch without exposing the API key", async () => {
    const calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }> = [];
    const fetcher = async (url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ output_text: "Runtime response" })
      };
    };

    const result = await sendProviderRuntimeRequest({
      providerId: "openai",
      capability: "prompt:generate",
      prompt: "Summarize project status",
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      },
      fetcher
    });

    expect(result).toEqual({
      ok: true,
      providerId: "openai",
      capability: "prompt:generate",
      network: "called",
      status: 200,
      responseText: JSON.stringify({ output_text: "Runtime response" }),
      errors: []
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://api.openai.com/v1/responses");
    expect(calls[0]?.init.method).toBe("POST");
    expect(calls[0]?.init.headers?.authorization).toBe("Bearer sk-secret-value");
    expect(calls[0]?.init.body).toContain("Summarize project status");
    expect(JSON.stringify(result)).not.toContain("sk-secret-value");
  });

  it("does not call fetch when provider runtime request is blocked", async () => {
    let called = false;
    const result = await sendProviderRuntimeRequest({
      providerId: "anthropic",
      capability: "production:deploy",
      prompt: "Deploy production",
      env: {
        ANTHROPIC_API_KEY: "anthropic-secret"
      },
      fetcher: async () => {
        called = true;
        return {
          ok: true,
          status: 200,
          text: async () => "should not happen"
        };
      }
    });

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    expect(result.network).toBe("not-called");
    expect(result.errors).toEqual(["Capability production:deploy is not allowed for provider anthropic."]);
    expect(JSON.stringify(result)).not.toContain("anthropic-secret");
  });

  it("sends an Anthropic runtime request with Anthropic API headers", async () => {
    const calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }> = [];
    const result = await sendProviderRuntimeRequest({
      providerId: "anthropic",
      capability: "prompt:generate",
      prompt: "Summarize project status",
      env: {
        ANTHROPIC_API_KEY: "anthropic-secret"
      },
      fetcher: async (url, init) => {
        calls.push({ url, init });
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ content: [{ type: "text", text: "Runtime response" }] })
        };
      }
    });

    expect(result.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://api.anthropic.com/v1/messages");
    expect(calls[0]?.init.headers?.["x-api-key"]).toBe("anthropic-secret");
    expect(calls[0]?.init.headers?.["anthropic-version"]).toBe("2023-06-01");
    expect(calls[0]?.init.headers?.authorization).toBeUndefined();
    expect(calls[0]?.init.body).toContain("Summarize project status");
    expect(JSON.stringify(result)).not.toContain("anthropic-secret");
  });
});
