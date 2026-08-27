import { callModel, stepCountIs, tool } from '@openrouter/agent';
import { z } from 'zod';

const memories: string[] = [];

const memoryTool = tool({
  name: 'remember',
  description: 'Zapisz trwałą w ramach procesu pamięć o użytkowniku, projekcie lub decyzji.',
  inputSchema: z.object({ note: z.string().min(1) }),
  execute: async ({ note }) => {
    memories.push(note);
    return { ok: true, saved: note, count: memories.length };
  },
});

const recallTool = tool({
  name: 'recall',
  description: 'Odczytaj zapisane informacje z pamięci agenta.',
  inputSchema: z.object({ query: z.string().optional() }),
  execute: async ({ query }) => {
    const q = (query ?? '').toLowerCase();
    const hits = memories.filter((m) => !q || m.toLowerCase().includes(q));
    return { memories: hits.slice(-20) };
  },
});

const system = `Jesteś Bebok AI — centralnym agentem orkiestrującym modele i narzędzia.
Odpowiadasz po polsku. Masz działać praktycznie: rozbijaj zadania na kroki i używaj narzędzi, gdy są potrzebne.
Masz pamięć przez narzędzia remember/recall. Nie twierdź, że wygenerowałeś plik lub film, jeśli nie wykonałeś narzędzia.
Architektura jest local-first: preferuj lokalne modele, gdy są dostępne, a OpenRouter traktuj jako router modeli zewnętrznych.
Docelowe integracje: MCP, ComfyUI, GitHub, web, Shopify i generowanie obrazu/video/audio.`;

export async function runAgent(input: string, history: { role: 'user' | 'assistant'; content: string }[] = []) {
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:4b';

  if (!process.env.OPENROUTER_API_KEY && ollamaUrl) {
    const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, stream: false, messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: input },
      ] }),
    });
    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    const data = await response.json();
    return { text: data.message?.content ?? 'Ollama nie zwróciło odpowiedzi.', provider: 'ollama', model: ollamaModel };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      text: 'Agent UI działa. Dodaj OPENROUTER_API_KEY albo uruchom Ollama i ustaw OLLAMA_BASE_URL, aby włączyć model. Nie potrzebujemy płatnego modelu: lokalne Ollama może działać bez tokenów API.',
      provider: 'demo', model: 'none',
    };
  }

  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  const result = await callModel({
    model,
    input: [
      ...history,
      { role: 'user', content: input },
    ],
    instructions: system,
    tools: [memoryTool, recallTool],
    stopWhen: stepCountIs(8),
  });

  return { text: await result.getText(), provider: 'openrouter', model };
}
