import { BaseExecutor } from './base-executor.js';
import { ZoomStep } from '../types/demo-script.js';

export class ZoomExecutor extends BaseExecutor<ZoomStep> {
  async execute(step: ZoomStep): Promise<void> {
    await this.waitForSelector(step.selector);

    await this.effects.zoom(step.selector, {
      scale: step.scale,
      duration: step.duration,
      padding: step.padding,
    });
  }
}
