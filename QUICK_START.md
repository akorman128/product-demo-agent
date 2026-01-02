# Quick Start Guide

## Installation

```bash
npm install
npm run build
npx playwright install chromium
```

## Run Your First Demo

```bash
npm run demo play scripts/simple-demo.yaml
```

This will:
1. Open a browser window (headful mode)
2. Navigate to example.com
3. Apply visual effects (highlight, narration)
4. Record the demo as a video
5. Save to `./recordings/simple-demo.webm`

## Create Your Own Demo

1. Copy an example script:
```bash
cp scripts/simple-demo.yaml scripts/my-demo.yaml
```

2. Edit the script:
```yaml
demo:
  name: "My Product Demo"
  config:
    baseUrl: "https://your-app.com"
    videoPath: "./recordings/my-demo.webm"
    slowMo: 300

  auth:
    type: "form"
    url: "/login"
    credentials:
      username: "your-demo-user"
      password: "your-demo-pass"
    selectors:
      usernameField: "#email"
      passwordField: "#password"
      submitButton: "button[type='submit']"

  steps:
    - type: "navigate"
      url: "/dashboard"
      wait: "networkidle"

    - type: "highlight"
      selector: ".main-feature"
      color: "#4A90E2"
      duration: 2000

    - type: "narration"
      text: "Check out our amazing feature"
      position: "bottom"
      duration: 3000
```

3. Run your demo:
```bash
npm run demo play scripts/my-demo.yaml
```

## Tips

- Use browser DevTools to find selectors (right-click → Inspect)
- Start with `slowMo: 500` to debug timing issues
- Run `npm run demo validate <script>` to check syntax before recording
- Use `--screenshot-on-error` to debug failures

## Common Issues

**Browser doesn't launch?**
```bash
npx playwright install chromium
```

**Selectors not found?**
- Add explicit waits: `{ type: "wait", selector: ".element" }`
- Increase slowMo: `slowMo: 1000`

**Video not recording?**
- Check that output directory is writable
- Verify config.videoPath is correct

## Next Steps

- Read the [full README](./README.md) for all step types
- Check example scripts in `scripts/` directory
- Enable AI narration with ANTHROPIC_API_KEY
