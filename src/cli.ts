#!/usr/bin/env node

import { Command } from 'commander';
import { DemoPlayer } from './core/demo-player.js';
import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { loadDotenv } from './utils/dotenv.js';

const program = new Command();

async function getPackageVersion(): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

program
  .name('demo-player')
  .description('AI-powered scripted product demo system with browser automation')
  .version(await getPackageVersion());

// Load local .env (if present) so scripts can use ${ENV_VAR} safely.
loadDotenv();

program
  .command('play')
  .description('Play a demo script')
  .argument('<script>', 'Path to demo script (.yaml or .json)')
  .option('--headless', 'Run browser in headless mode', false)
  .option('--slow-mo <ms>', 'Slow down operations by specified milliseconds', parseInt)
  .option('--screenshot-on-error', 'Capture screenshot on error', true)
  .action(async (scriptPath: string, options: any) => {
    try {
      console.log(chalk.blue('\n🎬 Product Demo Player\n'));

      const player = new DemoPlayer();
      await player.play(scriptPath, {
        headless: options.headless,
        slowMo: options.slowMo,
        screenshotOnError: options.screenshotOnError,
      });

    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate a demo script without running it')
  .argument('<script>', 'Path to demo script (.yaml or .json)')
  .action(async (scriptPath: string) => {
    try {
      console.log(chalk.blue('\n📋 Validating demo script...\n'));

      const { ScriptLoader } = await import('./core/script-loader.js');
      const loader = new ScriptLoader();
      const script = await loader.load(scriptPath);

      console.log(chalk.green('✅ Script is valid!\n'));
      console.log(chalk.cyan('Demo:'), script.demo.name);
      console.log(chalk.cyan('Steps:'), script.demo.steps.length);
      console.log(chalk.cyan('Base URL:'), script.demo.config.baseUrl);
      console.log('');

    } catch (error) {
      console.error(chalk.red('\n❌ Validation failed:'), error);
      process.exit(1);
    }
  });

program.parse();
