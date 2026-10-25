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
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0f1d',
          color: '#f59e0b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Chakra Petch", sans-serif',
          padding: '24px',
          textAlign: 'center',
          zIndex: 99999,
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
            ⚠️ Terjadi Kesalahan Tampilan Game
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '480px', marginBottom: '20px' }}>
            {this.state.error?.message || 'Terjadi kesalahan sistem saat memuat antarmuka.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              backgroundColor: '#f59e0b',
              color: '#0a0f1d',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Muat Ulang Halaman
          </button>
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
        // SW aktif dan memantau aset untuk caching super cepat
        if (reg.installing) {
          console.log('[RadenWorld] Service Worker sedang menginstal cache aset game...');
        } else if (reg.active) {
          console.log('[RadenWorld] Cache aset game aktif (Hemat Data & Muat Super Cepat).');
        }
      })
      .catch((err) => {
        // Fallback aman jika browser dalam mode incognito/private tanpa SW support
        console.warn('[RadenWorld] Service Worker tidak dapat didaftarkan (mode direct aktif):', err);
      });
  });
}
