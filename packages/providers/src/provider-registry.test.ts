import { describe, expect, it } from "vitest";
import {
  createProviderDryRun,
  getProviderEnvKeys,
  getProviderRegistry,
  isProviderCapabilityAllowed
} from "./provider-registry.js";

describe("provider registry", () => {
  it("registers OpenAI and Anthropic providers with safe metadata only", () => {
    const providers = getProviderRegistry();

    expect(providers.map((provider) => provider.id)).toEqual(["openai", "anthropic"]);
    expect(providers.map((provider) => provider.envKey)).toEqual(["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]);
    expect(providers.map((provider) => provider.defaultModel)).toEqual(["gpt-5.2", "claude-sonnet-4.5"]);
    expect(providers.every((provider) => provider.status === "configured-by-env")).toBe(true);
  });

  it("allows only prompt and summary capabilities", () => {
    expect(isProviderCapabilityAllowed("openai", "prompt:generate")).toBe(true);
    expect(isProviderCapabilityAllowed("openai", "prompt:classify")).toBe(true);
    expect(isProviderCapabilityAllowed("anthropic", "text:summarize")).toBe(true);
    expect(isProviderCapabilityAllowed("openai", "secret:read")).toBe(false);
    expect(isProviderCapabilityAllowed("anthropic", "billing:modify")).toBe(false);
    expect(isProviderCapabilityAllowed("anthropic", "production:deploy")).toBe(false);
  });

  it("returns env variable names without secret values", () => {
    expect(getProviderEnvKeys()).toEqual(["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]);
  });

  it("creates dry-run provider call status without exposing secret values", () => {
    const result = createProviderDryRun({
      providerId: "openai",
      capability: "prompt:generate",
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      }
    });

    expect(result).toEqual({
      ok: true,
      providerId: "openai",
      capability: "prompt:generate",
      ready: true,
      missingEnv: [],
      network: "not-called",
      errors: []
    });
    expect(JSON.stringify(result)).not.toContain("sk-secret-value");
  });

  it("blocks provider dry-run for disallowed capabilities", () => {
    const result = createProviderDryRun({
      providerId: "anthropic",
      capability: "production:deploy",
      env: {
        ANTHROPIC_API_KEY: "anthropic-secret"
      }
    });

    expect(result).toEqual({
      ok: false,
      providerId: "anthropic",
      capability: "production:deploy",
      ready: false,
      missingEnv: [],
      network: "not-called",
      errors: ["Capability production:deploy is not allowed for provider anthropic."]
    });
    expect(JSON.stringify(result)).not.toContain("anthropic-secret");
  });

  it("returns a clear dry-run error for unknown providers", () => {
    const result = createProviderDryRun({
      providerId: "unknown",
      capability: "prompt:generate",
      env: {
        OPENAI_API_KEY: "sk-secret-value"
      }
    });

    expect(result).toEqual({
      ok: false,
      providerId: "unknown",
      capability: "prompt:generate",
      ready: false,
      missingEnv: [],
      network: "not-called",
      errors: ["Unknown provider: unknown."]
    });
    expect(JSON.stringify(result)).not.toContain("sk-secret-value");
  });
});
