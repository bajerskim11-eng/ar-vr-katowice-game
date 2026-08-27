# Integracje

## Model lokalny — Ollama

Ustaw `OLLAMA_BASE_URL` i `OLLAMA_MODEL`. Agent użyje Ollama przed OpenRouter, jeśli nie ma klucza OpenRouter. Dzięki temu inference może działać bez tokenów API.

## OpenRouter

Ustaw `OPENROUTER_API_KEY`. Domyślny model to `openrouter/free`.

## ComfyUI

Projekt jest przygotowany pod MCP. Oficjalny `Comfy-Org/comfy-mcp` oraz `comfyui-mcp` mogą sterować lokalnym lub zdalnym ComfyUI. Docelowo agent będzie mógł zlecać generowanie obrazu, video i audio.

## MCP

Konfiguracja przykładowa znajduje się w `mcp.example.json`. Nie wpisuj sekretów do repozytorium.
