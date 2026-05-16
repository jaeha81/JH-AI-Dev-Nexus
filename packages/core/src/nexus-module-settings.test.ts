import { describe, expect, it } from "vitest";
import {
  createDefaultNexusModuleSettings,
  isNexusModuleEnabled,
  parseNexusModuleSettingsJson,
  setNexusModuleEnabled,
  stringifyNexusModuleSettings
} from "./nexus-module-settings.js";

describe("Nexus module settings", () => {
  it("creates safe default settings with every module enabled by policy", () => {
    const settings = createDefaultNexusModuleSettings();

    expect(settings).toEqual({ disabledModuleIds: [] });
    expect(isNexusModuleEnabled(settings, "providers")).toBe(true);
  });

  it("toggles module enabled state without duplicating ids", () => {
    const disabled = setNexusModuleEnabled({ disabledModuleIds: [] }, "providers", false);
    const disabledAgain = setNexusModuleEnabled(disabled, "providers", false);
    const enabled = setNexusModuleEnabled(disabledAgain, "providers", true);

    expect(disabledAgain.disabledModuleIds).toEqual(["providers"]);
    expect(isNexusModuleEnabled(disabledAgain, "providers")).toBe(false);
    expect(enabled.disabledModuleIds).toEqual([]);
  });

  it("parses and serializes settings without accepting secret-like values", () => {
    const parsed = parseNexusModuleSettingsJson(
      JSON.stringify({ disabledModuleIds: ["providers", "providers", "sk-secret-value", "agent-room"] })
    );
    const serialized = stringifyNexusModuleSettings(parsed);

    expect(parsed.disabledModuleIds).toEqual(["providers", "agent-room"]);
    expect(serialized).toContain("providers");
    expect(serialized).not.toContain("sk-secret-value");
  });
});
