import { BaseExecutor } from './base-executor.js';
import { NarrationStep } from '../types/demo-script.js';

export class NarrationExecutor extends BaseExecutor<NarrationStep> {
  async execute(step: NarrationStep): Promise<void> {
    let text = step.text;

    if (step.autoGenerate) {
      // TODO: Implement AI-generated narration using Anthropic API
      // For now, use the provided text as fallback
      console.log('AI narration generation not yet implemented, using provided text');
    }

    await this.effects.showNarration(text, step.position, step.fontSize, step.duration);
  }
}
