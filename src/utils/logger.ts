export class Logger {
  private context: string;

  constructor(context: string = 'DemoPlayer') {
    this.context = context;
  }

  info(message: string, ...args: any[]): void {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(`✅ [${this.context}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`❌ [${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`⚠️  [${this.context}] ${message}`, ...args);
  }

  step(current: number, total: number, description: string): void {
    console.log(`[${current}/${total}] ${description}`);
  }
}
