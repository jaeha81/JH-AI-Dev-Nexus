import type {
  BlockedProviderCapability,
  ProviderCapability,
  ProviderDryRunInput,
  ProviderDryRunResult,
  ProviderId,
  ProviderMetadata
} from "./provider-types.js";

const providerRegistry: ProviderMetadata[] = [
  {
    id: "openai",
    label: "OpenAI / GPT",
    envKey: "OPENAI_API_KEY",
    defaultModel: "gpt-5.2",
    status: "configured-by-env",
    allowedCapabilities: ["prompt:generate", "prompt:classify", "text:summarize"],
    blockedCapabilities: ["secret:read", "billing:modify", "production:deploy"]
  },
  {
    id: "anthropic",
    label: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-4.5",
    status: "configured-by-env",
    allowedCapabilities: ["prompt:generate", "prompt:classify", "text:summarize"],
    blockedCapabilities: ["secret:read", "billing:modify", "production:deploy"]
  }
];

export function getProviderRegistry(): readonly ProviderMetadata[] {
  return providerRegistry;
}

export function getProviderEnvKeys(): string[] {
  return providerRegistry.map((provider) => provider.envKey);
}

export function isProviderCapabilityAllowed(
  providerId: ProviderId,
  capability: ProviderCapability | BlockedProviderCapability
): boolean {
  const provider = providerRegistry.find((item) => item.id === providerId);

  return provider?.allowedCapabilities.includes(capability as ProviderCapability) ?? false;
}

export function createProviderDryRun(input: ProviderDryRunInput): ProviderDryRunResult {
  const provider = providerRegistry.find((item) => item.id === input.providerId);
  const env = input.env ?? process.env;
  const missingEnv = provider && !env[provider.envKey]?.trim() ? [provider.envKey] : [];
  if (!provider) {
    return {
      ok: false,
      providerId: input.providerId,
      capability: input.capability,
      ready: false,
      missingEnv,
      network: "not-called",
      errors: [`Unknown provider: ${input.providerId}.`]
    };
  }

  const allowed = isProviderCapabilityAllowed(input.providerId, input.capability);
  const errors = allowed ? [] : [`Capability ${input.capability} is not allowed for provider ${input.providerId}.`];

  return {
    ok: allowed,
    providerId: input.providerId,
    capability: input.capability,
    ready: allowed && missingEnv.length === 0,
    missingEnv,
    network: "not-called",
    errors
  };
}
