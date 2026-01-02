import { BaseExecutor } from './base-executor.js';
import { PauseStep } from '../types/demo-script.js';

export class PauseExecutor extends BaseExecutor<PauseStep> {
  async execute(step: PauseStep): Promise<void> {
    console.log(`\n⏸️  Demo paused${step.message ? `: ${step.message}` : ''}`);
    console.log('Press Enter to continue...');

    await new Promise<void>((resolve) => {
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const onData = (key: string) => {
        if (key === '\r' || key === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          resolve();
        } else if (key === '\u0003') {
          process.exit();
        }
      };

      stdin.on('data', onData);
    });

    console.log('▶️  Resuming demo...\n');
  }
}
