# Bebok AI Agent

Self-hosted, local-first AI agent that combines local models, hosted model routing, memory and MCP tools.

## What works now

- Next.js web chat
- OpenRouter Agent SDK with multi-step tool loop
- `openrouter/free` as hosted fallback
- Ollama path for local inference without API token billing
- Agent memory tools (`remember` / `recall`)
- Provider health endpoint at `/api/chat`
- CI build workflow
- ComfyUI MCP configuration ready to attach

## Architecture

```text
Browser
  -> Next.js API
      -> Ollama (local, preferred when configured)
      -> OpenRouter Agent SDK
          -> memory tools
          -> MCP tools
              -> ComfyUI
                  -> image / video / audio
```

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

For zero hosted-token inference, install Ollama and set `OLLAMA_BASE_URL` and `OLLAMA_MODEL`. For hosted routing, set `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL`.

## ComfyUI

`mcp.example.json` contains the connector configuration for `comfyui-mcp`. The current Comfy MCP ecosystem can drive local or remote ComfyUI and expose generation/workflow tools to an agent. Keep ComfyUI outside the web server when it needs a GPU.

## Security

Never commit `.env.local`, API keys or private MCP credentials.
