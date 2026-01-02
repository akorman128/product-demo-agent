import { BaseExecutor } from './base-executor.js';
import { WaitStep } from '../types/demo-script.js';

export class WaitExecutor extends BaseExecutor<WaitStep> {
  async execute(step: WaitStep): Promise<void> {
    if (step.selector) {
      await this.waitForSelector(step.selector, step.timeout || 30000);
    } else if (step.duration) {
      await this.page.waitForTimeout(step.duration);
    }
  }
}
