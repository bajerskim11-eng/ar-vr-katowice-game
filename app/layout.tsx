import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Bebok AI Agent', description: 'Local-first AI agent hub' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}
