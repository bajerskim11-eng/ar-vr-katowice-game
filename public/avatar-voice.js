export function speakBebok(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pl-PL'; u.rate = 0.95; u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}
