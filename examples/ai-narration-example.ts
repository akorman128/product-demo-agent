import { NarrationEngine } from '../src/effects/narration.js';

async function generateNarrations() {
  const engine = new NarrationEngine();

  if (!engine.isConfigured()) {
    console.log('Set ANTHROPIC_API_KEY to use AI narration generation');
    return;
  }

  const steps = [
    { type: 'navigate', url: '/dashboard' },
    { type: 'highlight', selector: '.stats-card' },
    { type: 'click', selector: '.view-report-btn' },
    { type: 'zoom', selector: '.chart' },
  ];

  console.log('Generating AI narrations...\n');

  const narrations = await engine.generateForSteps('Product Demo', steps);

  narrations.forEach((narration, i) => {
    console.log(`Step ${i + 1}: ${narration}`);
  });
}

generateNarrations().catch(console.error);
