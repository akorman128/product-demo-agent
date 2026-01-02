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

  validate(script: unknown): DemoScript {
    return DemoScriptSchema.parse(script);
  }
}
