import { existsSync } from "node:fs";
import { join } from "node:path";

export const requiredWikiDocuments = [
  "project-overview.md",
  "agent-registry.md",
  "current-state.md",
  "session-brief.md",
  "decision-log.md",
  "validation-log.md",
  "handoff-prompt.md"
] as const;

export type WikiDocumentName = (typeof requiredWikiDocuments)[number];

export function getRequiredWikiDocuments(): readonly WikiDocumentName[] {
  return requiredWikiDocuments;
}

export function checkWikiDocuments(rootDir = process.cwd()): {
  ok: boolean;
  missing: string[];
  found: string[];
} {
  const found: string[] = [];
  const missing: string[] = [];

  for (const doc of requiredWikiDocuments) {
    const path = join(rootDir, "llm-wiki", doc);
    if (existsSync(path)) {
      found.push(doc);
    } else {
      missing.push(doc);
    }
  }

  return {
    ok: missing.length === 0,
    missing,
    found
  };
}
