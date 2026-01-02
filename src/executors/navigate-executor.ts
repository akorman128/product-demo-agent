import { BaseExecutor } from './base-executor.js';
import { NavigateStep } from '../types/demo-script.js';

export class NavigateExecutor extends BaseExecutor<NavigateStep> {
  async execute(step: NavigateStep): Promise<void> {
    const waitUntil = step.wait || 'load';
    await this.page.goto(step.url, { waitUntil });
  }
}
