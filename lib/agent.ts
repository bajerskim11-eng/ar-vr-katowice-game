import { OpenRouter, stepCountIs, tool } from '@openrouter/agent';
import { z } from 'zod';

const memories: string[] = [];
const memoryTool = tool({ name: 'remember', description: 'Zapisz pamięć o użytkowniku, projekcie lub decyzji.', inputSchema: z.object({ note: z.string().min(1) }), execute: async ({ note }) => { memories.push(note); return { ok: true, saved: note, count: memories.length }; } });
const recallTool = tool({ name: 'recall', description: 'Odczytaj zapisane informacje z pamięci agenta.', inputSchema: z.object({ query: z.string().optional() }), execute: async ({ query }) => { const q=(query??'').toLowerCase(); return { memories: memories.filter(m=>!q||m.toLowerCase().includes(q)).slice(-20) }; } });

const system = `Jesteś Bebok AI — centralnym agentem orkiestrującym modele i narzędzia. Odpowiadasz po polsku. Działaj praktycznie i rozbijaj zadania na kroki. Nie twierdź, że wykonałeś działanie, jeśli narzędzie go nie wykonało. Docelowe integracje: MCP, ComfyUI, GitHub, web, Shopify oraz generowanie obrazu/video/audio.`;
type HistoryMessage={role:'user'|'assistant';content:string};

async function runHarness(input:string, history:HistoryMessage[]){
  const base=process.env.DSH_BRIDGE_URL?.replace(/\/$/,'');
  const token=process.env.DSH_BRIDGE_TOKEN;
  if(!base||!token) return null;
  const task=[system, history.length?`Kontekst rozmowy:\n${history.map(m=>`${m.role}: ${m.content}`).join('\n')}`:'',`Nowe zadanie użytkownika:\n${input}`].filter(Boolean).join('\n\n');
  const r=await fetch(`${base}/run`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({task}),signal:AbortSignal.timeout(180000)});
  if(!r.ok) throw new Error(`DeepSeek Harness bridge HTTP ${r.status}`);
  return await r.json() as {text:string;provider:string;version:string};
}

export async function runAgent(input:string, history:HistoryMessage[]=[]){
  if(process.env.DSH_BRIDGE_URL){ const harness=await runHarness(input,history); if(harness) return harness; }
  const ollamaUrl=process.env.OLLAMA_BASE_URL; const ollamaModel=process.env.OLLAMA_MODEL||'qwen3:4b';
  if(!process.env.OPENROUTER_API_KEY&&ollamaUrl){const response=await fetch(`${ollamaUrl.replace(/\/$/,'')}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:ollamaModel,stream:false,messages:[{role:'system',content:system},...history,{role:'user',content:input}]})});if(!response.ok)throw new Error(`Ollama HTTP ${response.status}`);const data=await response.json();return{text:data.message?.content??'Ollama nie zwróciło odpowiedzi.',provider:'ollama',model:ollamaModel};}
  if(!process.env.OPENROUTER_API_KEY)return{text:'Agent działa, ale nie ma skonfigurowanego modelu. Podłącz DeepSeek Harness, OPENROUTER_API_KEY albo Ollama.',provider:'demo',model:'none'};
  const client=new OpenRouter({apiKey:process.env.OPENROUTER_API_KEY}); const model=process.env.OPENROUTER_MODEL||'openrouter/free'; const context=history.length?`Kontekst wcześniejszej rozmowy:\n${history.map(m=>`${m.role}: ${m.content}`).join('\n')}`:''; const result=client.callModel({model,instructions:system,input:context?`${context}\n\nNowa wiadomość użytkownika:\n${input}`:input,tools:[memoryTool,recallTool],stopWhen:[stepCountIs(8)]}); const getText=(result as unknown as {getText:()=>Promise<string>}).getText; return{text:await getText.call(result),provider:'openrouter',model};
}
