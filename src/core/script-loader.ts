import { readFile } from 'fs/promises';
import { parse as parseYAML } from 'yaml';
import { DemoScriptSchema, DemoScript } from '../types/demo-script.js';
import { ZodError } from 'zod';

export class ScriptLoader {
  async load(filePath: string): Promise<DemoScript> {
    const content = await readFile(filePath, 'utf-8');

    let parsed: unknown;

    if (filePath.endsWith('.json')) {
      parsed = JSON.parse(content);
    } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      parsed = parseYAML(content);
    } else {
      throw new Error(`Unsupported file format: ${filePath}. Use .json, .yaml, or .yml`);
    }

    parsed = this.interpolateEnvVars(parsed);

    try {
      const validated = DemoScriptSchema.parse(parsed);
      return validated;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = this.formatValidationErrors(error);
        throw new Error(`Script validation failed:\n${formattedErrors}`);
      }
      throw error;
    }
  }

  private formatValidationErrors(error: ZodError): string {
    return error.errors
      .map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      })
      .join('\n');
  }

  private interpolateEnvVars(value: unknown): unknown {
    if (typeof value === 'string') {
      // Supports patterns like "${MY_ENV_VAR}" anywhere inside the string.
      // Example: "hello ${NAME}" -> "hello Alex"
      return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_match, varName: string) => {
        const resolved = process.env[varName];
        if (resolved === undefined) {
          throw new Error(
            `Missing environment variable "${varName}". ` +
              `Set it in your shell (e.g. export ${varName}=...) before running the demo.`
          );
        }
        return resolved;
      });
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.interpolateEnvVars(v));
    }

    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = this.interpolateEnvVars(v);
      }
      return out;
    }

    return value;
  }

  validate(script: unknown): DemoScript {
    return DemoScriptSchema.parse(this.interpolateEnvVars(script));
  }
}
