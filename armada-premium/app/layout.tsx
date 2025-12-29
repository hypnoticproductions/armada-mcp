// app/layout.tsx

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'ARMADA Command Center',
  description: 'Hemispheric Cultural Control Grid - AI-Powered Song Generation & Cultural Intelligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ARMADA Command Center
                  </span>
                </div>
                <nav className="flex items-center gap-6">
                  <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Dashboard
                  </a>
                  <a href="/song-engine" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Song Engine
                  </a>
                  <a href="/reports" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Reports
                  </a>
                  <a href="/validation" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Validation
                  </a>
                </nav>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400">
                    v1.0.0
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800 bg-slate-950 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>ARMADA Premium System - Cultural Intelligence Platform</span>
                <span>© 2024 ARMADA Intelligence</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
