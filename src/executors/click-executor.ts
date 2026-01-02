import { BaseExecutor } from './base-executor.js';
import { ClickStep } from '../types/demo-script.js';

export class ClickExecutor extends BaseExecutor<ClickStep> {
  async execute(step: ClickStep): Promise<void> {
    await this.waitForSelector(step.selector);

    await this.page.click(step.selector, {
      button: step.button || 'left',
      clickCount: step.clickCount || 1,
    });

    await this.page.waitForTimeout(300);
  }
}
