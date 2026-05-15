import { createProviderDryRun, getProviderRegistry } from "./provider-registry.js";
import type {
  ProviderRuntimeRequest,
  ProviderRuntimeRequestInput,
  ProviderRuntimeRequestResult,
  ProviderRuntimeSendInput,
  ProviderRuntimeSendResult
} from "./provider-types.js";

function buildRuntimeRequest(input: ProviderRuntimeRequestInput): ProviderRuntimeRequest {
  const provider = getProviderRegistry().find((item) => item.id === input.providerId);
  if (!provider) throw new Error(`Unknown provider: ${input.providerId}.`);

  if (provider.id === "anthropic") {
    return {
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: {
        authorizationEnv: provider.envKey,
        "content-type": "application/json"
      },
      body: {
        model: provider.defaultModel,
        max_tokens: 1024,
        messages: [{ role: "user", content: input.prompt }]
      }
    };
  }

  return {
    url: "https://api.openai.com/v1/responses",
    method: "POST",
    headers: {
      authorizationEnv: provider.envKey,
      "content-type": "application/json"
    },
    body: {
      model: provider.defaultModel,
      input: input.prompt
    }
  };
}

export function createProviderRuntimeRequest(input: ProviderRuntimeRequestInput): ProviderRuntimeRequestResult {
  const dryRun = createProviderDryRun(input);

  if (!dryRun.ready) {
    const missingErrors = dryRun.missingEnv.map((envName) => `Missing required env: ${envName}.`);
    return {
      ok: false,
      providerId: input.providerId,
      capability: input.capability,
      network: "not-called",
      request: undefined,
      errors: [...dryRun.errors, ...missingErrors]
    };
  }

  return {
    ok: true,
    providerId: input.providerId,
    capability: input.capability,
    network: "ready-to-call",
    request: buildRuntimeRequest(input),
    errors: []
  };
}

export async function sendProviderRuntimeRequest(input: ProviderRuntimeSendInput): Promise<ProviderRuntimeSendResult> {
  const plan = createProviderRuntimeRequest(input);

  if (!plan.ok || !plan.request) {
    return {
      ok: false,
      providerId: plan.providerId,
      capability: plan.capability,
      network: "not-called",
      errors: plan.errors
    };
  }

  const secret = input.env?.[plan.request.headers.authorizationEnv]?.trim();
  if (!secret) {
    return {
      ok: false,
      providerId: plan.providerId,
      capability: plan.capability,
      network: "not-called",
      errors: [`Missing required env: ${plan.request.headers.authorizationEnv}.`]
    };
  }

  const response = await input.fetcher(plan.request.url, {
    method: plan.request.method,
    headers:
      input.providerId === "anthropic"
        ? {
            "x-api-key": secret,
            "anthropic-version": "2023-06-01",
            "content-type": plan.request.headers["content-type"]
          }
        : {
            authorization: `Bearer ${secret}`,
            "content-type": plan.request.headers["content-type"]
          },
    body: JSON.stringify(plan.request.body)
  });
  const responseText = await response.text();

  return {
    ok: response.ok,
    providerId: plan.providerId,
    capability: plan.capability,
    network: "called",
    status: response.status,
    responseText,
    errors: response.ok ? [] : [`Provider request failed with HTTP ${response.status}.`]
  };
}
