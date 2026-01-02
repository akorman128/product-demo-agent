import { BaseExecutor } from './base-executor.js';
import { TypeStep } from '../types/demo-script.js';

export class TypeExecutor extends BaseExecutor<TypeStep> {
  async execute(step: TypeStep): Promise<void> {
    await this.waitForSelector(step.selector);

    if (step.clear) {
      await this.page.fill(step.selector, '');
    }

    await this.page.type(step.selector, step.text, { delay: step.speed });
  }
}
