# Bebok AI Agent

Modular, local-first AI agent built from open-source components.

## Architecture

- Agent runtime: OpenAI-compatible tool-calling interface
- Model routing: OpenRouter (optional)
- Local models: Ollama (optional)
- Tools: MCP-compatible servers
- Generation: ComfyUI via `comfyui-mcp`
- Memory: pluggable local storage
- Frontend: Next.js

## First milestone

Run a web chat locally, connect an OpenAI-compatible model endpoint, and expose a health endpoint. External API keys are never committed to the repository.

## Planned integrations

1. OpenRouter
2. Ollama
3. MCP tool registry
4. ComfyUI / comfyui-mcp
5. Persistent memory
6. GitHub tools
7. Shopify tools

## Security

Keep secrets in `.env.local` or deployment environment variables. Never commit API keys.
