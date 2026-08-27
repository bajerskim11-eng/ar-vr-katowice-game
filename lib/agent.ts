import { OpenRouter, stepCountIs, tool } from '@openrouter/agent';
import { z } from 'zod';

const memories: string[] = [];

const memoryTool = tool({
  name: 'remember',
  description: 'Zapisz pamięć o użytkowniku, projekcie lub decyzji.',
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
    return { memories: memories.filter((m) => !q || m.toLowerCase().includes(q)).slice(-20) };
  },
});

const system = `Jesteś Bebok AI — centralnym agentem orkiestrującym modele i narzędzia.
Odpowiadasz po polsku. Działaj praktycznie i rozbijaj zadania na kroki.
Masz pamięć przez remember/recall. Nie twierdź, że wykonałeś działanie, jeśli narzędzie go nie wykonało.
Architektura local-first: preferuj lokalne modele, gdy są dostępne, a OpenRouter traktuj jako router modeli zewnętrznych.
Docelowe integracje: MCP, ComfyUI, GitHub, web, Shopify oraz generowanie obrazu/video/audio.`;

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

export async function runAgent(input: string, history: HistoryMessage[] = []) {
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:4b';

  if (!process.env.OPENROUTER_API_KEY && ollamaUrl) {
    const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: input }],
      }),
    });
    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    const data = await response.json();
    return { text: data.message?.content ?? 'Ollama nie zwróciło odpowiedzi.', provider: 'ollama', model: ollamaModel };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      text: 'Interfejs agenta działa. Dodaj OPENROUTER_API_KEY albo OLLAMA_BASE_URL, aby włączyć model.',
      provider: 'demo',
      model: 'none',
    };
  }

  const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  const context = history.length
    ? `Kontekst wcześniejszej rozmowy:\n${history.map((m) => `${m.role}: ${m.content}`).join('\n')}`
    : '';

  const result = client.callModel({
    model,
    instructions: system,
    input: context ? `${context}\n\nNowa wiadomość użytkownika:\n${input}` : input,
    tools: [memoryTool, recallTool],
    stopWhen: [stepCountIs(8)],
  });

  const getText = (result as unknown as { getText: () => Promise<string> }).getText;
  return { text: await getText.call(result), provider: 'openrouter', model };
}
