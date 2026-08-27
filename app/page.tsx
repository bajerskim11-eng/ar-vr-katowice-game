'use client';
import { FormEvent, useEffect, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; provider?: string };

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => { fetch('/api/chat').then(r => r.json()).then(setHealth).catch(() => null); }, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const d = await r.json();
      setMessages([...next, { role: 'assistant', content: d.text || d.error || 'Brak odpowiedzi.', provider: d.provider }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Nie udało się połączyć z agentem.' }]);
    } finally { setBusy(false); }
  }

  return <div className="shell">
    <header className="top"><div className="brand"><span className="orb"/>Bebok AI Agent</div><span className="status">● {health?.providers?.ollama ? 'Ollama' : health?.providers?.openrouter ? 'OpenRouter' : 'demo'}</span></header>
    <main className="main">
      <section className="hero"><div className="eyebrow">LOCAL-FIRST · AGENT HUB</div><h1>Jeden agent.<br/>Wiele modeli i narzędzi.</h1><p>Sam wybiera ścieżkę: lokalne Ollama bez tokenów API albo OpenRouter. Następne klocki to MCP, ComfyUI, video, pamięć i automatyzacja.</p><div className="features"><span className="pill">✓ Ollama</span><span className="pill">✓ OpenRouter</span><span className="pill">✓ Memory</span><span className="pill">→ MCP</span><span className="pill">→ ComfyUI</span></div></section>
      <section className="chat"><div className="messages">{messages.length === 0 ? <div className="empty"><div><strong>Agent jest gotowy.</strong><br/><span>Spróbuj: „Zapamiętaj, że Bebok ma czerwony kapelusz”</span><br/><span>albo: „Wymyśl scenę i przygotuj plan filmu”.</span></div></div> : messages.map((m, i) => <div key={i} className={m.role === 'user' ? 'bubbleRow user' : 'bubbleRow'}><div className="bubble"><div>{m.content}</div>{m.provider && <small>{m.provider}</small>}</div></div>)}</div><form className="composer" onSubmit={send}><input value={input} onChange={e => setInput(e.target.value)} placeholder={busy ? 'Agent pracuje…' : 'Napisz zadanie…'} disabled={busy}/><button disabled={busy}>{busy ? '…' : 'Wyślij'}</button></form></section>
      <div className="footer">Bebok AI · open-source orchestration · klucze pozostają poza repo</div>
    </main>
  </div>;
}
