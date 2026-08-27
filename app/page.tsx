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
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history: messages }) });
      const d = await r.json();
      setMessages([...next, { role: 'assistant', content: d.text || d.error || 'Brak odpowiedzi.', provider: d.provider }]);
    } catch { setMessages([...next, { role: 'assistant', content: 'Nie udało się połączyć z agentem.' }]); }
    finally { setBusy(false); }
  }

  return <div className="shell">
    <header className="top"><div className="brand"><span className="orb"/>Bebok AI</div><span className="status">● {health?.providers?.ollama ? 'OLLAMA' : health?.providers?.openrouter ? 'OPENROUTER' : 'DEMO'}</span></header>
    <main className="main">
      <section className="hero"><div className="eyebrow">AI AGENT · LOCAL FIRST</div><h1>Twój własny<br/><em>agent AI.</em></h1><p>Jeden interfejs łączy modele, pamięć i narzędzia. Zaczynamy od darmowych modeli, a potem dokładamy obraz, video, głos i automatyzację.</p><div className="features"><span className="pill">✓ Modele lokalne</span><span className="pill">✓ OpenRouter</span><span className="pill">✓ Pamięć</span><span className="pill">→ MCP</span><span className="pill">→ Video</span></div></section>
      <section className="chat"><div className="chatHead"><div><strong>Agent</strong><small>Rozmawiaj i zlecaj zadania</small></div><span className="live">LIVE</span></div><div className="messages">{messages.length === 0 ? <div className="empty"><div className="emptyIcon">✦</div><strong>Agent jest gotowy.</strong><span>Spróbuj: „Zapamiętaj, że Bebok ma czerwony kapelusz”</span><span>albo: „Wymyśl scenę i przygotuj plan filmu”.</span></div> : messages.map((m, i) => <div key={i} className={m.role === 'user' ? 'bubbleRow user' : 'bubbleRow'}><div className="bubble"><div>{m.content}</div>{m.provider && <small>{m.provider}</small>}</div></div>)}</div><form className="composer" onSubmit={send}><input value={input} onChange={e => setInput(e.target.value)} placeholder={busy ? 'Agent pracuje…' : 'Napisz zadanie…'} disabled={busy}/><button disabled={busy}>{busy ? '…' : 'Wyślij →'}</button></form></section>
      <div className="footer">Bebok AI · open-source orchestration · klucze pozostają poza repo</div>
    </main>
  </div>;
}
