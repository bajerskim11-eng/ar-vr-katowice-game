# DeepSeek Harness bridge

The web app can use DeepSeek Harness as its agent runtime. The official Harness is currently a developer preview; its supported one-shot/headless mode runs a task and returns the assistant text. It requires a DeepSeek API credential.

## Local / NVIDIA / Colab runtime

1. Install Node.js 22.19+ and pnpm if running from source, or use the published package.
2. Set `DEEPSEEK_API_KEY` and a long random `DSH_BRIDGE_TOKEN`.
3. Start the bridge from this repository:

```bash
npm run dsh:bridge
```

The bridge listens on `127.0.0.1:4090` by default. To expose it to the web app, put it behind a private HTTPS tunnel/reverse proxy and set:

- `DSH_BRIDGE_URL=https://your-private-bridge.example`
- `DSH_BRIDGE_TOKEN=<same secret>`

The Vercel app will call `/run` and use the returned Harness response as the Bebok's brain. If `DSH_BRIDGE_URL` is not set, the app falls back to Ollama or OpenRouter.

## Important

Do not expose the bridge without authentication. The Harness can execute tools in its workspace. Never commit API keys or bridge tokens.

Official project: https://github.com/deepseek-ai/deepseek-harness
