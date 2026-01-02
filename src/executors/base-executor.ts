import { Page } from 'playwright';
import { Step } from '../types/demo-script.js';
import { VisualEffects } from '../effects/visual-effects.js';

export abstract class BaseExecutor<T extends Step = Step> {
  protected page: Page;
  protected effects: VisualEffects;

  constructor(page: Page, effects: VisualEffects) {
    this.page = page;
    this.effects = effects;
  }

  abstract execute(step: T): Promise<void>;

  protected async waitForSelector(selector: string, timeout: number = 30000): Promise<void> {
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' });
    } catch (error) {
      throw new Error(`Timeout waiting for selector: ${selector}`);
    }
  }

  protected async safeClick(selector: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForSelector(selector);
        await this.page.click(selector);
        return;
      } catch (error) {
        if (i === retries - 1) {
          throw new Error(`Failed to click selector after ${retries} retries: ${selector}`);
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  protected async safeType(selector: string, text: string, speed: number = 100): Promise<void> {
    await this.waitForSelector(selector);
    await this.page.type(selector, text, { delay: speed });
  }

  getStepDescription(step: Step): string {
    switch (step.type) {
      case 'navigate':
        return `Navigate to ${step.url}`;
      case 'click':
        return `Click ${step.selector}`;
      case 'type':
        return `Type "${step.text}" into ${step.selector}`;
      case 'wait':
        return step.selector ? `Wait for ${step.selector}` : `Wait ${step.duration}ms`;
      case 'highlight':
        return `Highlight ${step.selector}`;
      case 'zoom':
        return `Zoom to ${step.selector}`;
      case 'spotlight':
        return `Spotlight ${step.selector}`;
      case 'scroll':
        return `Scroll to ${step.target}`;
      case 'screenshot':
        return `Capture screenshot: ${step.path}`;
      case 'narration':
        return `Show narration: "${step.text}"`;
      case 'pause':
        return `Pause${step.message ? `: ${step.message}` : ''}`;
      default:
        return 'Unknown step';
    }
  }
}
