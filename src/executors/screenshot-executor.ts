import { BaseExecutor } from './base-executor.js';
import { ScreenshotStep } from '../types/demo-script.js';

export class ScreenshotExecutor extends BaseExecutor<ScreenshotStep> {
  async execute(step: ScreenshotStep): Promise<void> {
    if (step.selector) {
      await this.waitForSelector(step.selector);
      const element = await this.page.locator(step.selector);
      await element.screenshot({ path: step.path });
    } else {
      await this.page.screenshot({
        path: step.path,
        fullPage: step.fullPage,
      });
    }
  }
}
