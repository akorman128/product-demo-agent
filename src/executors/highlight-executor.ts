import { BaseExecutor } from './base-executor.js';
import { HighlightStep } from '../types/demo-script.js';

export class HighlightExecutor extends BaseExecutor<HighlightStep> {
  async execute(step: HighlightStep): Promise<void> {
    await this.waitForSelector(step.selector);

    await this.effects.highlight(step.selector, {
      color: step.color,
      borderWidth: step.borderWidth,
      style: step.style,
      duration: step.duration,
    });
  }
}
