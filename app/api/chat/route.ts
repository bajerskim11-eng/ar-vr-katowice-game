import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: 'Brak wiadomości' }, { status: 400 });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ text: 'Interfejs działa. Aby uruchomić prawdziwy model, dodaj OPENROUTER_API_KEY w środowisku. Następnie agent będzie korzystał z openrouter/free, a później dołączymy Ollama i MCP.' });
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method:'POST', headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({model:'openrouter/free',messages:[{role:'system',content:'Jesteś centralnym agentem Bebok AI. Odpowiadaj po polsku. Planuj zadania i w kolejnych wersjach korzystaj z narzędzi MCP, pamięci, Ollama i ComfyUI.'},{role:'user',content:message}],temperature:.7})});
    if(!r.ok) return NextResponse.json({error:`OpenRouter HTTP ${r.status}`},{status:502});
    const d=await r.json(); return NextResponse.json({text:d.choices?.[0]?.message?.content||'Model nie zwrócił odpowiedzi.'});
  } catch { return NextResponse.json({error:'Błąd połączenia z modelem.'},{status:502}); }
}

export async function GET(){return NextResponse.json({ok:true,service:'bebok-ai-agent',openrouter:!!process.env.OPENROUTER_API_KEY,ollama:'planned',mcp:'planned',comfyui:'planned'});}
