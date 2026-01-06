# Product Demo Agent

AI-powered scripted browser automation system for creating polished product demo videos. Built with Playwright and TypeScript.

## Features

- **Scripted & Deterministic**: YAML-based demo scripts ensure consistent, reliable playback
- **Visual Effects**: Highlight, zoom, and spotlight effects for professional polish
- **Video Recording**: Built-in HD video recording (1920x1080)
- **AI Narration**: Optional AI-generated captions using Anthropic Claude
- **Type-Safe**: Full TypeScript support with Zod schema validation
- **Headful Mode**: Watch the demo run in real-time with visual feedback

## Installation

```bash
npm install
npm run build
```

## Quick Start

### 1. Create a Demo Script

Create a YAML file (e.g., `my-demo.yaml`):

```yaml
demo:
  name: "My Product Demo"
  description: "Showcase key features"

  config:
    baseUrl: "https://example.com"
    videoPath: "./recordings/my-demo.webm"
    slowMo: 300

  auth:
    type: "none"

  steps:
    - type: "navigate"
      url: "/"
      wait: "load"

    - type: "highlight"
      selector: "h1"
      color: "#4A90E2"
      duration: 2000

    - type: "narration"
      text: "Welcome to our product"
      position: "bottom"
      duration: 3000
```

### 2. Run the Demo

```bash
npm run demo play scripts/my-demo.yaml
```

### 3. Watch the Video

The recorded video will be saved to `./recordings/my-demo.webm`

## CLI Commands

### Play a Demo

```bash
npm run demo play <script-path> [options]

Options:
  --headless              Run browser in headless mode
  --slow-mo <ms>          Slow down operations by specified milliseconds
  --screenshot-on-error   Capture screenshot on error (default: true)
```

### Environment Variables (.env)

The CLI automatically loads a local `.env` file (if present) before running or validating scripts. This lets you safely use `${ENV_VAR}` in YAML without committing secrets.

```bash
cp env.example .env
# edit .env with your real values
npm run demo play scripts/fanfix-send-message.yaml
```

### Saving & Reusing Login Sessions (storage state)

For sites with complex login (SSO/2FA/bot checks), it’s usually more reliable to log in once manually and reuse the session:

```bash
# 1) capture session state (interactive)
npm run demo play scripts/fanfix-capture-session.yaml

# 2) then run demos that reference config.storageStatePath
npm run demo play scripts/fanfix-send-message.yaml
```

### Validate a Script

```bash
npm run demo validate <script-path>
```

## Demo Script Format

### Configuration

```yaml
demo:
  name: "Demo Name"
  description: "Optional description"

  config:
    baseUrl: "https://app.example.com"
    viewport:
      width: 1920
      height: 1080
    videoPath: "./recordings/demo.webm"
    slowMo: 300  # Optional: slow down for clarity
    headless: false
```

### Authentication

#### Form Authentication

```yaml
auth:
  type: "form"
  url: "/login"
  credentials:
    # Tip: use env vars so you don't commit secrets:
    username: "${APP_USERNAME}"
    password: "${APP_PASSWORD}"
  selectors:
    usernameField: "#email"
    passwordField: "#password"
    submitButton: "button[type='submit']"
```

#### Basic Auth

```yaml
auth:
  type: "basic"
  username: "${BASIC_AUTH_USERNAME}"
  password: "${BASIC_AUTH_PASSWORD}"
```

#### No Auth

```yaml
auth:
  type: "none"
```

### Available Step Types

#### Navigate

```yaml
- type: "navigate"
  url: "/dashboard"
  wait: "networkidle"  # or "load", "domcontentloaded"
```

#### Click

```yaml
- type: "click"
  selector: ".btn-primary"
  button: "left"  # optional: "left", "right", "middle"
  clickCount: 1   # optional: for double-click, etc.
```

#### Type

```yaml
- type: "type"
  selector: "#search-input"
  text: "Analytics Dashboard"
  speed: 100  # ms per character
  clear: false  # clear field first
```

#### Wait

```yaml
# Wait for duration
- type: "wait"
  duration: 2000

# Wait for element
- type: "wait"
  selector: ".loading-complete"
  timeout: 30000
```

#### Highlight

```yaml
- type: "highlight"
  selector: ".feature-card"
  color: "#4A90E2"
  duration: 2000
  style: "pulse"  # "pulse", "solid", or "glow"
  borderWidth: 3
```

#### Zoom

```yaml
- type: "zoom"
  selector: ".chart-widget"
  scale: 1.5
  duration: 3000
  padding: 20
```

#### Spotlight

```yaml
- type: "spotlight"
  selector: ".important-element"
  duration: 2500
  dimness: 0.7  # 0-1, how dark the overlay is
  borderRadius: 8
```

#### Scroll

```yaml
- type: "scroll"
  target: ".features-section"
  behavior: "smooth"  # or "auto"
  block: "center"  # "start", "center", "end", "nearest"
```

#### Screenshot

```yaml
# Full page screenshot
- type: "screenshot"
  path: "./screenshots/page.png"
  fullPage: true

# Element screenshot
- type: "screenshot"
  path: "./screenshots/element.png"
  selector: ".chart"
```

#### Narration

```yaml
- type: "narration"
  text: "Our analytics dashboard provides real-time insights"
  duration: 3000
  position: "bottom"  # "top", "bottom", or "center"
  fontSize: 24
  autoGenerate: false  # Use AI to generate narration
```

#### Pause

```yaml
- type: "pause"
  message: "Check the highlighted feature"
```

## Example Scripts

See the `scripts/` directory for complete examples:

- `saas-login-demo.yaml` - Login flow with authentication
- `feature-tour.yaml` - Multi-page feature walkthrough
- `e-commerce-checkout.yaml` - Complete checkout journey
- `simple-demo.yaml` - Basic demo for testing

## Programmatic Usage

```typescript
import { DemoPlayer } from 'product-demo-agent';

const player = new DemoPlayer();

await player.play('./scripts/my-demo.yaml', {
  headless: false,
  slowMo: 300,
  screenshotOnError: true,
});
```

## AI Narration

Enable AI-generated narration by setting the `ANTHROPIC_API_KEY` environment variable:

```bash
export ANTHROPIC_API_KEY='your-api-key'
```

Then use `autoGenerate: true` in narration steps:

```yaml
- type: "narration"
  text: "Fallback text if AI fails"
  autoGenerate: true
  duration: 3000
```

Or generate narrations for all steps programmatically:

```typescript
import { NarrationEngine } from 'product-demo-agent';

const engine = new NarrationEngine();
const narrations = await engine.generateForSteps('Demo Name', steps);
```

## Best Practices

### Selector Strategy

1. Use `data-testid` attributes when available:

   ```yaml
   selector: "[data-testid='submit-button']"
   ```

2. Fallback to stable CSS selectors:

   ```yaml
   selector: ".btn-primary.submit"
   ```

3. Avoid brittle selectors like nth-child or complex XPath

### Timing

- Use `slowMo` config for visual clarity (200-500ms recommended)
- Add explicit waits after clicks: `{ type: "wait", duration: 500 }`
- Use `wait: "networkidle"` after navigation for async content

### Visual Effects

- Highlight duration: 2000-3000ms for comfortable viewing
- Zoom scale: 1.3-1.6 for readability without distortion
- Spotlight dimness: 0.7-0.8 for good contrast
- Use consistent colors throughout your demo

### Error Handling

- Run with `--screenshot-on-error` to debug failures
- Use `validate` command to catch script errors before recording
- Test selectors in browser DevTools first

## Architecture

```text
src/
├── types/          # Zod schemas and TypeScript types
├── core/           # DemoPlayer and ScriptLoader
├── executors/      # Step-specific execution logic
├── effects/        # Visual effects and narration
└── utils/          # Logging and helpers
```

### Key Components

- **DemoPlayer**: Main orchestrator, manages browser lifecycle
- **ScriptLoader**: Validates and loads YAML/JSON scripts
- **StepExecutors**: Execute individual step types (click, type, etc.)
- **VisualEffects**: Injects CSS/DOM overlays for visual polish
- **NarrationEngine**: AI-powered narration generation

## Video Output

Videos are recorded in WebM format with:

- Resolution: 1920x1080 (configurable)
- Codec: VP9 (default Playwright codec)
- Location: Specified in `config.videoPath`

For production use, consider post-processing:

```bash
# Convert to MP4
ffmpeg -i demo.webm -c:v libx264 -preset slow -crf 22 demo.mp4

# Add intro/outro
ffmpeg -i intro.mp4 -i demo.mp4 -i outro.mp4 \
  -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1[outv]" \
  -map "[outv]" final.mp4
```

## Troubleshooting

### Browser doesn't launch

```bash
# Install Playwright browsers
npx playwright install chromium
```

### Selectors not found

- Verify selector in browser DevTools
- Add explicit waits: `{ type: "wait", selector: ".element" }`
- Check for iframes or shadow DOM
- Use `--slow-mo 1000` to watch step-by-step

### Video not saving

- Ensure output directory exists (created automatically)
- Check disk space
- Close browser properly (handled by DemoPlayer)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
