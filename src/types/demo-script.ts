import { z } from 'zod';

// Config schemas
export const ViewportSchema = z.object({
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
});

export const DemoConfigSchema = z.object({
  baseUrl: z.string().url(),
  viewport: ViewportSchema.optional(),
  videoPath: z.string().default('./recordings/demo.webm'),
  slowMo: z.number().int().min(0).optional(),
  headless: z.boolean().default(false),
  // Optional Playwright storage state (recommended for sites with complex login/2FA).
  storageStatePath: z.string().optional(),
  // If set, save storage state to this path at the end of the run.
  saveStorageStatePath: z.string().optional(),
});

// Auth schemas
export const FormAuthSchema = z.object({
  type: z.literal('form'),
  url: z.string(),
  credentials: z.object({
    username: z.string(),
    password: z.string(),
  }),
  selectors: z.object({
    usernameField: z.string(),
    passwordField: z.string(),
    submitButton: z.string(),
  }),
});

export const BasicAuthSchema = z.object({
  type: z.literal('basic'),
  username: z.string(),
  password: z.string(),
});

export const NoAuthSchema = z.object({
  type: z.literal('none'),
});

export const AuthSchema = z.discriminatedUnion('type', [
  FormAuthSchema,
  BasicAuthSchema,
  NoAuthSchema,
]);

// Step schemas
export const NavigateStepSchema = z.object({
  type: z.literal('navigate'),
  url: z.string(),
  wait: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
});

export const ClickStepSchema = z.object({
  type: z.literal('click'),
  selector: z.string(),
  button: z.enum(['left', 'right', 'middle']).optional(),
  clickCount: z.number().int().positive().optional(),
});

export const TypeStepSchema = z.object({
  type: z.literal('type'),
  selector: z.string(),
  text: z.string(),
  speed: z.number().int().positive().default(100),
  clear: z.boolean().default(false),
});

export const WaitStepSchema = z.object({
  type: z.literal('wait'),
  duration: z.number().int().positive().optional(),
  selector: z.string().optional(),
  timeout: z.number().int().positive().optional(),
});

export const HighlightStepSchema = z.object({
  type: z.literal('highlight'),
  selector: z.string(),
  color: z.string().default('#4A90E2'),
  duration: z.number().int().positive().default(2000),
  style: z.enum(['pulse', 'solid', 'glow']).default('pulse'),
  borderWidth: z.number().int().positive().default(3),
});

export const ZoomStepSchema = z.object({
  type: z.literal('zoom'),
  selector: z.string(),
  scale: z.number().positive().default(1.5),
  duration: z.number().int().positive().default(3000),
  padding: z.number().int().min(0).default(20),
});

export const SpotlightStepSchema = z.object({
  type: z.literal('spotlight'),
  selector: z.string(),
  duration: z.number().int().positive().default(2500),
  dimness: z.number().min(0).max(1).default(0.7),
  borderRadius: z.number().int().min(0).default(8),
});

export const ScrollStepSchema = z.object({
  type: z.literal('scroll'),
  target: z.string(),
  behavior: z.enum(['auto', 'smooth']).default('smooth'),
  block: z.enum(['start', 'center', 'end', 'nearest']).default('center'),
});

export const ScreenshotStepSchema = z.object({
  type: z.literal('screenshot'),
  path: z.string(),
  fullPage: z.boolean().default(false),
  selector: z.string().optional(),
});

export const NarrationStepSchema = z.object({
  type: z.literal('narration'),
  text: z.string(),
  duration: z.number().int().positive().default(3000),
  position: z.enum(['top', 'bottom', 'center']).default('bottom'),
  fontSize: z.number().int().positive().default(24),
  autoGenerate: z.boolean().default(false),
});

export const PauseStepSchema = z.object({
  type: z.literal('pause'),
  message: z.string().optional(),
});

// Union of all step types
export const StepSchema = z.discriminatedUnion('type', [
  NavigateStepSchema,
  ClickStepSchema,
  TypeStepSchema,
  WaitStepSchema,
  HighlightStepSchema,
  ZoomStepSchema,
  SpotlightStepSchema,
  ScrollStepSchema,
  ScreenshotStepSchema,
  NarrationStepSchema,
  PauseStepSchema,
]);

// Main demo script schema
export const DemoScriptSchema = z.object({
  demo: z.object({
    name: z.string(),
    description: z.string().optional(),
    config: DemoConfigSchema,
    auth: AuthSchema.optional(),
    steps: z.array(StepSchema).min(1),
  }),
});

// Type exports
export type Viewport = z.infer<typeof ViewportSchema>;
export type DemoConfig = z.infer<typeof DemoConfigSchema>;
export type FormAuth = z.infer<typeof FormAuthSchema>;
export type BasicAuth = z.infer<typeof BasicAuthSchema>;
export type NoAuth = z.infer<typeof NoAuthSchema>;
export type Auth = z.infer<typeof AuthSchema>;

export type NavigateStep = z.infer<typeof NavigateStepSchema>;
export type ClickStep = z.infer<typeof ClickStepSchema>;
export type TypeStep = z.infer<typeof TypeStepSchema>;
export type WaitStep = z.infer<typeof WaitStepSchema>;
export type HighlightStep = z.infer<typeof HighlightStepSchema>;
export type ZoomStep = z.infer<typeof ZoomStepSchema>;
export type SpotlightStep = z.infer<typeof SpotlightStepSchema>;
export type ScrollStep = z.infer<typeof ScrollStepSchema>;
export type ScreenshotStep = z.infer<typeof ScreenshotStepSchema>;
export type NarrationStep = z.infer<typeof NarrationStepSchema>;
export type PauseStep = z.infer<typeof PauseStepSchema>;

export type Step = z.infer<typeof StepSchema>;
export type DemoScript = z.infer<typeof DemoScriptSchema>;
