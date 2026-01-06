import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export interface DotenvLoadOptions {
  /** Defaults to `${process.cwd()}/.env` */
  path?: string;
  /** If true, existing process.env values are overwritten. Default: false */
  override?: boolean;
}

/**
 * Minimal .env loader (KEY=VALUE) to avoid adding deps.
 * - Supports comments (# ...)
 * - Supports optional quotes: KEY="value" / KEY='value'
 * - Does not support multi-line values.
 */
export function loadDotenv(options: DotenvLoadOptions = {}): void {
  const configuredPath = options.path;
  const dotenvPath = resolve(configuredPath ?? ".env");

  // Many editors/users create "env" (no dot) by accident; support it as a fallback.
  const fallbackPath = resolve("env");
  const pathToLoad =
    existsSync(dotenvPath) ? dotenvPath : !configuredPath && existsSync(fallbackPath) ? fallbackPath : null;
  if (!pathToLoad) return;

  const override = options.override ?? false;
  const raw = readFileSync(pathToLoad, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!override && process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
}
