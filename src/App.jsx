import React, { useState } from 'react';

const INSTALLER_URL = 'https://nevitondatastorage.s3.amazonaws.com/ElectronApp%20Setup%201.0.0.exe';
const HEALTH_URL = 'http://127.0.0.1:17654/health';
const PROTOCOL_URL = 'myprintapp://open';

const STARTUP_GRACE_MS = 8000;
const POLL_INTERVAL_MS = 300;

async function healthCheck() {
  try {
    const res = await fetch(HEALTH_URL, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [phase, setPhase] = useState('opening');
  const [busy, setBusy] = useState(false);

  const tryOpenApp = async () => {
    setModalOpen(true);
    setPhase('opening');
    setBusy(true);


    setTimeout(async () => {
      window.location.href = PROTOCOL_URL;

      const start = Date.now();
      while (Date.now() - start < STARTUP_GRACE_MS) {
        const ok = await healthCheck();
        if (ok) {
          setBusy(false);
          setPhase('success');
          
          setTimeout(() => setModalOpen(false), 1000);
          return;
        }
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      }
      setBusy(false);
      setPhase('failed');
    }, 50);
  };

  return (
    <div style={{ padding: 16, display: 'flex', gap: 10 }}>
      <button onClick={tryOpenApp}>Open Printer App</button>
      <a href={INSTALLER_URL}>
        <button>Install Printer  App</button>
      </a>

      {modalOpen && (
        <div style={styles.backdrop} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div style={styles.modal}>
            {phase === 'opening' && (
              <>
                <h3 style={styles.h3}>Opening…</h3>
                <p style={styles.p}>Waiting for the app to start.</p>
                <div style={styles.spinner} />
                <div style={styles.row}>
                  <button onClick={() => setModalOpen(false)} disabled={busy}>Hide</button>
                </div>
              </>
            )}

            {phase === 'success' && (
              <>
                <h3 style={styles.h3}>App Detected</h3>
                <p style={styles.p}>The desktop app responded.</p>
                <div style={styles.row}>
                  <button onClick={() => setModalOpen(false)}>Close</button>
                </div>
              </>
            )}

            {phase === 'failed' && (
              <>
                <h3 style={styles.h3}>App Not Detected</h3>
                <p style={styles.p}>Couldn’t start or reach the app. Please install it.</p>
                <div style={styles.row}>
                  <a href={INSTALLER_URL}>
                    <button style={styles.primary}>Install App</button>
                  </a>
                  <button onClick={tryOpenApp}>Try Again</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  modal: {
    width: 380, maxWidth: '90vw', background: '#fff', borderRadius: 10,
    padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  h3: { margin: '0 0 8px 0' },
  p: { margin: '0 0 16px 0', color: '#444' },
  row: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  primary: { background: '#2f6fed', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6 },
  spinner: {
    width: 20, height: 20, border: '3px solid #ddd', borderTopColor: '#2f6fed',
    borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '8px 0 16px 0'
  },
};

