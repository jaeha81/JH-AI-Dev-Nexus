export type NexusModuleSettings = {
  disabledModuleIds: string[];
};

export function createDefaultNexusModuleSettings(): NexusModuleSettings {
  return { disabledModuleIds: [] };
}

function isSafeModuleId(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]+$/.test(value) && !value.startsWith("sk-") && !value.includes("token");
}

export function normalizeNexusModuleSettings(input: unknown): NexusModuleSettings {
  if (!input || typeof input !== "object") return createDefaultNexusModuleSettings();
  const disabledModuleIds = Array.isArray((input as NexusModuleSettings).disabledModuleIds)
    ? (input as NexusModuleSettings).disabledModuleIds
    : [];

  return {
    disabledModuleIds: Array.from(new Set(disabledModuleIds.filter(isSafeModuleId)))
  };
}

export function parseNexusModuleSettingsJson(json: string): NexusModuleSettings {
  try {
    return normalizeNexusModuleSettings(JSON.parse(json));
  } catch {
    return createDefaultNexusModuleSettings();
  }
}

export function stringifyNexusModuleSettings(settings: NexusModuleSettings): string {
  return `${JSON.stringify(normalizeNexusModuleSettings(settings), null, 2)}\n`;
}

export function isNexusModuleEnabled(settings: NexusModuleSettings, moduleId: string): boolean {
  return !normalizeNexusModuleSettings(settings).disabledModuleIds.includes(moduleId);
}

export function setNexusModuleEnabled(
  settings: NexusModuleSettings,
  moduleId: string,
  enabled: boolean
): NexusModuleSettings {
  const normalized = normalizeNexusModuleSettings(settings);
  const disabledModuleIds = enabled
    ? normalized.disabledModuleIds.filter((id) => id !== moduleId)
    : [...normalized.disabledModuleIds, moduleId];

  return normalizeNexusModuleSettings({ disabledModuleIds });
}
