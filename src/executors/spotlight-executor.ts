import { BaseExecutor } from './base-executor.js';
import { SpotlightStep } from '../types/demo-script.js';

export class SpotlightExecutor extends BaseExecutor<SpotlightStep> {
  async execute(step: SpotlightStep): Promise<void> {
    await this.waitForSelector(step.selector);

    await this.effects.spotlight(step.selector, {
      dimness: step.dimness,
      borderRadius: step.borderRadius,
      duration: step.duration,
    });
  }
}
