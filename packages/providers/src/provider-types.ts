export type ProviderId = "openai" | "anthropic" | (string & {});

export type ProviderStatus = "configured-by-env";

export type ProviderCapability = "prompt:generate" | "prompt:classify" | "text:summarize";

export type BlockedProviderCapability = "secret:read" | "billing:modify" | "production:deploy";

export type ProviderMetadata = {
  id: ProviderId;
  label: string;
  envKey: string;
  defaultModel: string;
  status: ProviderStatus;
  allowedCapabilities: ProviderCapability[];
  blockedCapabilities: BlockedProviderCapability[];
};

export type ProviderDryRunInput = {
  providerId: ProviderId;
  capability: ProviderCapability | BlockedProviderCapability;
  env?: Record<string, string | undefined>;
};

export type ProviderDryRunResult = {
  ok: boolean;
  providerId: ProviderId;
  capability: ProviderCapability | BlockedProviderCapability;
  ready: boolean;
  missingEnv: string[];
  network: "not-called";
  errors: string[];
};

export type ProviderRuntimeRequestInput = {
  providerId: ProviderId;
  capability: ProviderCapability | BlockedProviderCapability;
  prompt: string;
  env?: Record<string, string | undefined>;
};

export type ProviderRuntimeRequest = {
  url: string;
  method: "POST";
  headers: {
    authorizationEnv: string;
    "content-type": "application/json";
  };
  body: {
    model: string;
    max_tokens?: number;
    input?: string;
    messages?: Array<{ role: "user"; content: string }>;
  };
};

export type ProviderRuntimeRequestResult = {
  ok: boolean;
  providerId: ProviderId;
  capability: ProviderCapability | BlockedProviderCapability;
  network: "ready-to-call" | "not-called";
  request?: ProviderRuntimeRequest;
  errors: string[];
};

export type ProviderRuntimeFetch = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
  }
) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

export type ProviderRuntimeSendInput = ProviderRuntimeRequestInput & {
  fetcher: ProviderRuntimeFetch;
};

export type ProviderRuntimeSendResult = {
  ok: boolean;
  providerId: ProviderId;
  capability: ProviderCapability | BlockedProviderCapability;
  network: "called" | "not-called";
  status?: number;
  responseText?: string;
  errors: string[];
};
