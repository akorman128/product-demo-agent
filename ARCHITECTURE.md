# Architecture Overview

## System Design

The product demo agent follows a modular, extensible architecture built on Playwright for reliable browser automation.

## Core Components

### 1. DemoPlayer (`src/core/demo-player.ts`)

**Responsibility**: Main orchestrator that manages the entire demo lifecycle

**Key Methods**:
- `play(scriptPath, options)` - Entry point for executing a demo
- `initialize()` - Sets up browser, context, and video recording
- `handleAuthentication()` - Processes auth config (form, basic, none)
- `executeSteps()` - Sequentially executes demo steps
- `cleanup()` - Closes browser and saves video

**Dependencies**: ScriptLoader, VisualEffects, all Executors

### 2. ScriptLoader (`src/core/script-loader.ts`)

**Responsibility**: Loads and validates demo scripts

**Key Methods**:
- `load(filePath)` - Reads YAML/JSON and validates against schema
- `validate(script)` - Validates script structure using Zod

**Features**:
- Support for both YAML and JSON formats
- Comprehensive error messages for validation failures
- Type-safe script objects

### 3. VisualEffects (`src/effects/visual-effects.ts`)

**Responsibility**: Injects CSS and DOM overlays for visual polish

**Key Methods**:
- `highlight(selector, options)` - Animated highlight boxes
- `zoom(selector, options)` - Smooth zoom/scale effect
- `spotlight(selector, options)` - Dim overlay with cutout
- `showNarration(text, position)` - Text overlay
- `clearAll()` - Remove all effects

**Implementation**:
- Injects global CSS on first use
- Uses `page.evaluate()` to manipulate DOM
- Smooth CSS transitions for professional appearance
- High z-index to overlay existing content

### 4. Step Executors (`src/executors/`)

**Responsibility**: Execute individual step types

**Architecture**:
```
BaseExecutor (abstract)
  ├── NavigateExecutor
  ├── ClickExecutor
  ├── TypeExecutor
  ├── WaitExecutor
  ├── HighlightExecutor
  ├── ZoomExecutor
  ├── SpotlightExecutor
  ├── ScrollExecutor
  ├── ScreenshotExecutor
  ├── NarrationExecutor
  └── PauseExecutor
```

**BaseExecutor provides**:
- Common helper methods (`waitForSelector`, `safeClick`, etc.)
- Error handling patterns
- Step description generation

**Each executor**:
- Extends BaseExecutor
- Implements `execute(step)` method
- Type-safe step handling

### 5. NarrationEngine (`src/effects/narration.ts`)

**Responsibility**: AI-powered narration generation (optional)

**Key Methods**:
- `generate(context)` - Generate single narration
- `generateForSteps(demoName, steps)` - Batch generation
- `isConfigured()` - Check if API key is set

**Features**:
- Uses Anthropic Claude API
- Fallback narrations if API fails
- Context-aware generation

## Data Flow

```
1. User runs CLI command
   ↓
2. CLI loads demo script via ScriptLoader
   ↓
3. ScriptLoader validates YAML/JSON against Zod schema
   ↓
4. DemoPlayer initializes browser + video recording
   ↓
5. DemoPlayer handles authentication if needed
   ↓
6. For each step:
   a. Get appropriate executor from registry
   b. Executor uses VisualEffects if needed
   c. Executor performs action on page
   d. Wait for completion
   ↓
7. DemoPlayer cleanup (saves video)
   ↓
8. CLI outputs success message + video path
```

## Type System

All types are defined using Zod schemas in `src/types/demo-script.ts`:

```typescript
// Runtime validation
const script = DemoScriptSchema.parse(rawData);

// Compile-time types
type DemoScript = z.infer<typeof DemoScriptSchema>;
```

Benefits:
- Single source of truth for types
- Runtime validation with helpful errors
- Full TypeScript intellisense

## Extension Points

### Adding a New Step Type

1. Define Zod schema in `src/types/demo-script.ts`:
```typescript
export const CustomStepSchema = z.object({
  type: z.literal('custom'),
  param1: z.string(),
  param2: z.number().optional(),
});
```

2. Add to StepSchema union:
```typescript
export const StepSchema = z.discriminatedUnion('type', [
  // ... existing steps
  CustomStepSchema,
]);
```

3. Create executor in `src/executors/custom-executor.ts`:
```typescript
import { BaseExecutor } from './base-executor.js';
import { CustomStep } from '../types/demo-script.js';

export class CustomExecutor extends BaseExecutor<CustomStep> {
  async execute(step: CustomStep): Promise<void> {
    // Implementation
  }
}
```

4. Register in DemoPlayer:
```typescript
this.executors.set('custom', new CustomExecutor(this.page, this.effects));
```

### Adding a New Visual Effect

Add method to `VisualEffects` class:

```typescript
async customEffect(selector: string, options: CustomOptions): Promise<void> {
  await this.injectStyles(); // Ensure CSS is loaded

  await this.page.evaluate(
    ({ selector, options }) => {
      // DOM manipulation
    },
    { selector, options }
  );
}
```

### Adding a New Auth Type

1. Define schema:
```typescript
export const CustomAuthSchema = z.object({
  type: z.literal('custom'),
  // ... auth fields
});
```

2. Add to AuthSchema union:
```typescript
export const AuthSchema = z.discriminatedUnion('type', [
  FormAuthSchema,
  BasicAuthSchema,
  NoAuthSchema,
  CustomAuthSchema, // Add here
]);
```

3. Handle in `DemoPlayer.handleAuthentication()`:
```typescript
if (auth.type === 'custom') {
  // Custom auth logic
}
```

## Video Recording

Playwright's built-in video recording:
- Configured in `browser.newContext({ recordVideo: {...} })`
- Automatically saves on context close
- Format: WebM (VP9 codec)
- Resolution: Matches viewport size

## Best Practices

### Error Handling

- Executors catch errors and re-throw with context
- `screenshotOnError` captures visual state
- Zod validation provides detailed error messages
- Timeout errors include selector info

### Performance

- Lazy load effects CSS (only inject once)
- Parallel executor initialization
- Minimal page evaluation calls
- Efficient selector waiting with timeouts

### Reliability

- Use Playwright's built-in waiting mechanisms
- Retry logic in `safeClick()` and `safeType()`
- Explicit waits after state-changing actions
- `slowMo` option for timing control

### Maintainability

- Single Responsibility Principle per executor
- Type-safe throughout (no `any`)
- Declarative YAML scripts (not imperative code)
- Separation of concerns (effects vs execution)

## Testing Strategy

**Unit Tests**: Schema validation, individual executors
**Integration Tests**: Multi-step scenarios, auth flows
**E2E Tests**: Full demo playback with mock app

## Future Extensions

Potential additions:
- Multi-browser support (Firefox, Safari)
- Parallel step execution where safe
- Script recording mode (generate YAML from actions)
- Live editing during demo
- Template system for common patterns
- Analytics (track which steps fail most)
- Diff detection (alert on UI changes)
