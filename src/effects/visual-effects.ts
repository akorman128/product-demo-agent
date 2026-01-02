import { Page } from 'playwright';

export interface HighlightOptions {
  color?: string;
  borderWidth?: number;
  style?: 'pulse' | 'solid' | 'glow';
  duration?: number;
}

export interface ZoomOptions {
  scale?: number;
  duration?: number;
  padding?: number;
}

export interface SpotlightOptions {
  dimness?: number;
  borderRadius?: number;
  duration?: number;
}

export class VisualEffects {
  private page: Page;
  private injectedStyles: boolean = false;

  constructor(page: Page) {
    this.page = page;
  }

  async injectStyles(): Promise<void> {
    if (this.injectedStyles) return;

    await this.page.addStyleTag({
      content: `
        /* Base styles for demo effects */
        .demo-highlight {
          position: absolute;
          pointer-events: none;
          z-index: 999999;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .demo-highlight.pulse {
          animation: demo-pulse 1.5s ease-in-out infinite;
        }

        .demo-highlight.glow {
          animation: demo-glow 2s ease-in-out infinite;
        }

        @keyframes demo-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }

        @keyframes demo-glow {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50% { box-shadow: 0 0 40px currentColor; }
        }

        .demo-spotlight-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 999998;
          transition: opacity 0.5s ease-in-out;
        }

        .demo-zoom-container {
          transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .demo-narration-overlay {
          position: fixed;
          left: 0;
          right: 0;
          padding: 24px 48px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
          text-align: center;
          z-index: 1000000;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease-in-out;
          line-height: 1.5;
        }

        .demo-narration-overlay.top {
          top: 0;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .demo-narration-overlay.bottom {
          bottom: 0;
          border-top: 2px solid rgba(255, 255, 255, 0.1);
        }

        .demo-narration-overlay.center {
          top: 50%;
          transform: translateY(-50%);
        }

        .demo-narration-overlay.visible {
          opacity: 1;
        }
      `,
    });

    this.injectedStyles = true;
  }

  async highlight(selector: string, options: HighlightOptions = {}): Promise<void> {
    await this.injectStyles();

    const {
      color = '#4A90E2',
      borderWidth = 3,
      style = 'pulse',
      duration = 2000,
    } = options;

    await this.page.evaluate(
      ({ selector, color, borderWidth, style }) => {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }

        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = `demo-highlight ${style}`;
        highlight.style.cssText = `
          top: ${rect.top + window.scrollY}px;
          left: ${rect.left + window.scrollX}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border: ${borderWidth}px solid ${color};
          color: ${color};
        `;
        highlight.setAttribute('data-demo-effect', 'highlight');

        document.body.appendChild(highlight);
      },
      { selector, color, borderWidth, style }
    );

    if (duration > 0) {
      await this.page.waitForTimeout(duration);
      await this.clearHighlights();
    }
  }

  async zoom(selector: string, options: ZoomOptions = {}): Promise<void> {
    await this.injectStyles();

    const {
      scale = 1.5,
      duration = 3000,
      padding = 20,
    } = options;

    await this.page.evaluate(
      ({ selector, scale, padding }) => {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const offsetX = (viewportWidth / 2 - centerX) * (scale - 1) / scale;
        const offsetY = (viewportHeight / 2 - centerY) * (scale - 1) / scale;

        const transformOrigin = `${centerX}px ${centerY}px`;

        document.body.style.transformOrigin = transformOrigin;
        document.body.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
        document.body.style.transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        document.body.setAttribute('data-demo-zoomed', 'true');
      },
      { selector, scale, padding }
    );

    if (duration > 0) {
      await this.page.waitForTimeout(duration);
      await this.clearZoom();
    }
  }

  async spotlight(selector: string, options: SpotlightOptions = {}): Promise<void> {
    await this.injectStyles();

    const {
      dimness = 0.7,
      borderRadius = 8,
      duration = 2500,
    } = options;

    await this.page.evaluate(
      ({ selector, dimness, borderRadius }) => {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }

        const rect = element.getBoundingClientRect();

        const overlay = document.createElement('div');
        overlay.className = 'demo-spotlight-overlay';
        overlay.setAttribute('data-demo-effect', 'spotlight');

        const cutoutX = rect.left + window.scrollX;
        const cutoutY = rect.top + window.scrollY;
        const cutoutWidth = rect.width;
        const cutoutHeight = rect.height;

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.display = 'block';

        const defs = document.createElementNS(svgNS, 'defs');
        const mask = document.createElementNS(svgNS, 'mask');
        mask.setAttribute('id', 'demo-spotlight-mask');

        const whiteRect = document.createElementNS(svgNS, 'rect');
        whiteRect.setAttribute('width', '100%');
        whiteRect.setAttribute('height', '100%');
        whiteRect.setAttribute('fill', 'white');

        const cutout = document.createElementNS(svgNS, 'rect');
        cutout.setAttribute('x', cutoutX.toString());
        cutout.setAttribute('y', cutoutY.toString());
        cutout.setAttribute('width', cutoutWidth.toString());
        cutout.setAttribute('height', cutoutHeight.toString());
        cutout.setAttribute('rx', borderRadius.toString());
        cutout.setAttribute('fill', 'black');

        mask.appendChild(whiteRect);
        mask.appendChild(cutout);
        defs.appendChild(mask);
        svg.appendChild(defs);

        const dimRect = document.createElementNS(svgNS, 'rect');
        dimRect.setAttribute('width', '100%');
        dimRect.setAttribute('height', '100%');
        dimRect.setAttribute('fill', `rgba(0, 0, 0, ${dimness})`);
        dimRect.setAttribute('mask', 'url(#demo-spotlight-mask)');

        svg.appendChild(dimRect);
        overlay.appendChild(svg);
        document.body.appendChild(overlay);
      },
      { selector, dimness, borderRadius }
    );

    if (duration > 0) {
      await this.page.waitForTimeout(duration);
      await this.clearSpotlight();
    }
  }

  async showNarration(text: string, position: 'top' | 'bottom' | 'center' = 'bottom', fontSize: number = 24, duration: number = 3000): Promise<void> {
    await this.injectStyles();

    await this.page.evaluate(
      ({ text, position, fontSize }) => {
        let overlay = document.querySelector('.demo-narration-overlay') as HTMLElement;

        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = `demo-narration-overlay ${position}`;
          overlay.setAttribute('data-demo-effect', 'narration');
          document.body.appendChild(overlay);
        }

        overlay.textContent = text;
        overlay.style.fontSize = `${fontSize}px`;
        overlay.className = `demo-narration-overlay ${position}`;

        setTimeout(() => {
          overlay.classList.add('visible');
        }, 50);
      },
      { text, position, fontSize }
    );

    if (duration > 0) {
      await this.page.waitForTimeout(duration);
      await this.clearNarration();
    }
  }

  async clearHighlights(): Promise<void> {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-demo-effect="highlight"]').forEach(el => el.remove());
    });
  }

  async clearZoom(): Promise<void> {
    await this.page.evaluate(() => {
      if (document.body.hasAttribute('data-demo-zoomed')) {
        document.body.style.transform = '';
        document.body.style.transformOrigin = '';
        document.body.style.transition = 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        document.body.removeAttribute('data-demo-zoomed');
      }
    });
    await this.page.waitForTimeout(500);
  }

  async clearSpotlight(): Promise<void> {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-demo-effect="spotlight"]').forEach(el => el.remove());
    });
  }

  async clearNarration(): Promise<void> {
    await this.page.evaluate(() => {
      const overlay = document.querySelector('.demo-narration-overlay');
      if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 400);
      }
    });
    await this.page.waitForTimeout(400);
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearHighlights(),
      this.clearZoom(),
      this.clearSpotlight(),
      this.clearNarration(),
    ]);
  }
}
