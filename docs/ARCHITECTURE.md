# Agent architecture

## Core

The agent is a thin orchestration layer. It should not contain proprietary model implementations. Providers and tools are adapters.

## Provider order

1. Local Ollama when configured and capable.
2. OpenRouter free model when local inference is unavailable or a stronger model is requested.
3. Future NVIDIA NIM / other OpenAI-compatible endpoints.

## Tool layer

MCP is the common tool boundary. Each integration should be independently replaceable.

Planned MCP integrations:

- ComfyUI: image/video/audio generation
- GitHub: repositories and code
- Browser/web: research and navigation
- Files: project memory/assets
- Shopify: storefront and product operations

## Generation

Use `comfyui-mcp` rather than implementing a second ComfyUI integration. It can expose ComfyUI to local or hosted LLMs through MCP and supports image/video/audio workflows.

Reference: https://github.com/sandyup/comfyui-mcp

## Memory

Start with a local persistent store. Keep memory independent from the model provider so changing models does not erase the agent's knowledge.

## Security

- Never store provider keys in git.
- Require explicit confirmation before paid generation or destructive tool calls.
- Keep generation and filesystem tools sandboxed where possible.
