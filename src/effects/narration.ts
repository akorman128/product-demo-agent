import Anthropic from '@anthropic-ai/sdk';

export interface NarrationContext {
  demoName: string;
  currentStep: string;
  pageTitle?: string;
  previousSteps?: string[];
}

export class NarrationEngine {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (this.apiKey) {
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
  }

  async generate(context: NarrationContext): Promise<string> {
    if (!this.client) {
      throw new Error(
        'Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.'
      );
    }

    const prompt = this.buildPrompt(context);

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      if (textContent && textContent.type === 'text') {
        return textContent.text.trim();
      }

      throw new Error('No text content in API response');

    } catch (error) {
      console.error('AI narration generation failed:', error);
      return this.getFallbackNarration(context);
    }
  }

  private buildPrompt(context: NarrationContext): string {
    return `You are generating concise, professional narration for a product demo video.

Demo: ${context.demoName}
Current Step: ${context.currentStep}
${context.pageTitle ? `Page Title: ${context.pageTitle}` : ''}

Generate a single, engaging sentence (max 15 words) that narrates what's happening in this step of the demo.
The narration should be:
- Professional and conversational
- Clear and concise
- Focused on user value
- Present tense

Return only the narration text, no quotes or additional formatting.`;
  }

  private getFallbackNarration(context: NarrationContext): string {
    const fallbacks: Record<string, string> = {
      navigate: 'Navigating to the next section',
      click: 'Clicking to explore this feature',
      type: 'Entering information',
      highlight: 'Notice this key feature',
      zoom: 'Taking a closer look',
      spotlight: 'Focusing on this important element',
      scroll: 'Scrolling to see more',
    };

    for (const [key, value] of Object.entries(fallbacks)) {
      if (context.currentStep.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'Exploring the next feature';
  }

  async generateForSteps(
    demoName: string,
    steps: Array<{ type: string; selector?: string; url?: string }>
  ): Promise<string[]> {
    const narrations: string[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const context: NarrationContext = {
        demoName,
        currentStep: `Step ${i + 1}: ${step.type}`,
        previousSteps: steps.slice(Math.max(0, i - 2), i).map((s) => s.type),
      };

      const narration = await this.generate(context);
      narrations.push(narration);

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return narrations;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
