import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { ScriptLoader } from './script-loader.js';
import { DemoScript, Step } from '../types/demo-script.js';
import { VisualEffects } from '../effects/visual-effects.js';
import { BaseExecutor } from '../executors/base-executor.js';
import { NavigateExecutor } from '../executors/navigate-executor.js';
import { ClickExecutor } from '../executors/click-executor.js';
import { TypeExecutor } from '../executors/type-executor.js';
import { WaitExecutor } from '../executors/wait-executor.js';
import { HighlightExecutor } from '../executors/highlight-executor.js';
import { ZoomExecutor } from '../executors/zoom-executor.js';
import { SpotlightExecutor } from '../executors/spotlight-executor.js';
import { ScrollExecutor } from '../executors/scroll-executor.js';
import { ScreenshotExecutor } from '../executors/screenshot-executor.js';
import { NarrationExecutor } from '../executors/narration-executor.js';
import { PauseExecutor } from '../executors/pause-executor.js';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

export interface DemoPlayerOptions {
  headless?: boolean;
  slowMo?: number;
  screenshotOnError?: boolean;
}

export class DemoPlayer {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private scriptLoader: ScriptLoader;
  private effects: VisualEffects | null = null;
  private executors: Map<string, BaseExecutor> = new Map();

  constructor() {
    this.scriptLoader = new ScriptLoader();
  }

  async play(scriptPath: string, options: DemoPlayerOptions = {}): Promise<void> {
    const script = await this.scriptLoader.load(scriptPath);
    const config = script.demo.config;

    console.log(`\n🎬 Starting demo: ${script.demo.name}`);
    if (script.demo.description) {
      console.log(`   ${script.demo.description}`);
    }
    console.log('');

    try {
      await this.initialize(script, options);

      if (script.demo.auth && script.demo.auth.type !== 'none') {
        await this.handleAuthentication(script);
      }

      await this.executeSteps(script.demo.steps);

      console.log('\n✅ Demo completed successfully!');
      console.log(`📹 Video saved to: ${config.videoPath}\n`);

    } catch (error) {
      console.error('\n❌ Demo failed:', error);

      if (options.screenshotOnError && this.page) {
        const errorScreenshot = './error-screenshot.png';
        await this.page.screenshot({ path: errorScreenshot, fullPage: true });
        console.log(`📸 Error screenshot saved to: ${errorScreenshot}\n`);
      }

      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async initialize(script: DemoScript, options: DemoPlayerOptions): Promise<void> {
    const config = script.demo.config;

    await mkdir(dirname(config.videoPath), { recursive: true });

    this.browser = await chromium.launch({
      headless: options.headless ?? config.headless,
      slowMo: options.slowMo ?? config.slowMo,
    });

    this.context = await this.browser.newContext({
      viewport: config.viewport || { width: 1920, height: 1080 },
      recordVideo: {
        dir: dirname(config.videoPath),
        size: config.viewport || { width: 1920, height: 1080 },
      },
    });

    this.page = await this.context.newPage();
    this.effects = new VisualEffects(this.page);

    this.initializeExecutors();
  }

  private initializeExecutors(): void {
    if (!this.page || !this.effects) {
      throw new Error('Page and effects must be initialized');
    }

    this.executors.set('navigate', new NavigateExecutor(this.page, this.effects));
    this.executors.set('click', new ClickExecutor(this.page, this.effects));
    this.executors.set('type', new TypeExecutor(this.page, this.effects));
    this.executors.set('wait', new WaitExecutor(this.page, this.effects));
    this.executors.set('highlight', new HighlightExecutor(this.page, this.effects));
    this.executors.set('zoom', new ZoomExecutor(this.page, this.effects));
    this.executors.set('spotlight', new SpotlightExecutor(this.page, this.effects));
    this.executors.set('scroll', new ScrollExecutor(this.page, this.effects));
    this.executors.set('screenshot', new ScreenshotExecutor(this.page, this.effects));
    this.executors.set('narration', new NarrationExecutor(this.page, this.effects));
    this.executors.set('pause', new PauseExecutor(this.page, this.effects));
  }

  private async handleAuthentication(script: DemoScript): Promise<void> {
    const auth = script.demo.auth;
    if (!auth || auth.type === 'none' || !this.page) return;

    console.log('🔐 Authenticating...');

    if (auth.type === 'form') {
      const loginUrl = auth.url.startsWith('http')
        ? auth.url
        : `${script.demo.config.baseUrl}${auth.url}`;

      await this.page.goto(loginUrl);

      await this.page.fill(auth.selectors.usernameField, auth.credentials.username);
      await this.page.fill(auth.selectors.passwordField, auth.credentials.password);
      await this.page.click(auth.selectors.submitButton);

      await this.page.waitForLoadState('networkidle');

    } else if (auth.type === 'basic') {
      await this.context?.setHTTPCredentials({
        username: auth.username,
        password: auth.password,
      });
    }

    console.log('✓ Authentication successful\n');
  }

  private async executeSteps(steps: Step[]): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const executor = this.executors.get(step.type);

      if (!executor) {
        throw new Error(`No executor found for step type: ${step.type}`);
      }

      console.log(`[${i + 1}/${steps.length}] ${executor.getStepDescription(step)}`);

      try {
        await executor.execute(step as any);
      } catch (error) {
        console.error(`   ⚠️  Step failed: ${error}`);
        throw error;
      }
    }
  }

  private async cleanup(): Promise<void> {
    if (this.effects) {
      await this.effects.clearAll();
    }

    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }
  }
}
