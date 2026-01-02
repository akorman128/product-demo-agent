import { DemoPlayer } from '../src/index.js';

async function runDemo() {
  const player = new DemoPlayer();

  await player.play('./scripts/simple-demo.yaml', {
    headless: false,
    slowMo: 300,
    screenshotOnError: true,
  });
}

runDemo().catch(console.error);
