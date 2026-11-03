import './bootstrap';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameApp } from './GameApp';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in RadenWorld React app:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#FFF8EA] text-black"
          style={{ fontFamily: "'Kenney Pixel Square', 'm5x7', 'Press Start 2P', monospace" }}
        >
          <div className="clay-panel w-full max-w-md p-6 text-center flex flex-col items-center gap-4">
            <div className="clay-badge-primary px-3 py-1 text-xs font-bold uppercase">
              Peringatan Sistem
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-black">
              Terjadi Kesalahan Tampilan Game
            </h2>
            <p className="text-xs sm:text-sm text-black leading-relaxed break-words max-w-full">
              {this.state.error?.message || 'Terjadi kesalahan sistem saat memuat antarmuka.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="clay-btn-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-black"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('raden-game-app');
if (container) {
  let root = (window as any).__raden_react_root;
  if (!root) {
    root = createRoot(container);
    (window as any).__raden_react_root = root;
  }
  root.render(
    <ErrorBoundary>
      <GameApp />
    </ErrorBoundary>
  );
}

// Daftarkan Service Worker untuk caching aset statis (gambar, audio, map, font)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (reg.installing) {
          console.log('[RadenWorld] Service Worker sedang menginstal cache aset game...');
        } else if (reg.active) {
          console.log('[RadenWorld] Cache aset game aktif (Hemat Data & Muat Super Cepat).');
        }
      })
      .catch((err) => {
        console.warn('[RadenWorld] Service Worker tidak dapat didaftarkan (mode direct aktif):', err);
      });
  });
}
