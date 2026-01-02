import { BaseExecutor } from './base-executor.js';
import { ScrollStep } from '../types/demo-script.js';

export class ScrollExecutor extends BaseExecutor<ScrollStep> {
  async execute(step: ScrollStep): Promise<void> {
    await this.waitForSelector(step.target);

    await this.page.evaluate(
      ({ target, behavior, block }) => {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior, block });
        }
      },
      { target: step.target, behavior: step.behavior, block: step.block }
    );

    await this.page.waitForTimeout(500);
  }
}
