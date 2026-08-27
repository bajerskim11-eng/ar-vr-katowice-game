import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body.history)
      ? body.history.filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string').slice(-12)
      : [];
    if (!message) return NextResponse.json({ error: 'Brak wiadomości' }, { status: 400 });
    const result = await runAgent(message, history);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Błąd agenta.' }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'bebok-ai-agent',
    providers: {
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      ollama: Boolean(process.env.OLLAMA_BASE_URL),
    },
    integrations: { mcp: 'ready-for-connector', comfyui: 'ready-for-mcp', memory: 'enabled' },
  });
}
