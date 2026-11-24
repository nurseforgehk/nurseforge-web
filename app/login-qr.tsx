"use client";
import { useState } from 'react';

export function LoginQrTool({ onClose }: { onClose: () => void }) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [showSecond, setShowSecond] = useState(false);
  const [image, setImage] = useState('');
  const [madeFor, setMadeFor] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ready = first.trim() !== '' && second !== '';

  const generate = async () => {
    const name = first.trim();
    if (!name || second === '') {
      setError('請填兩段字');
      setImage('');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { toDataURL } = await import('qrcode');
      const url = await toDataURL(`${name}\t${second}\r`, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 800,
        color: { dark: '#000000', light: '#ffffff' }
      });
      setImage(url);
      setMadeFor(name);
    } catch {
      setImage('');
      setMadeFor('');
      setError('整唔到，請再試一次');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17,17,17,0.62)', zIndex: 2520, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '28px 12px', overflowY: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: '24px', padding: '20px 16px 16px', color: '#111', position: 'relative', border: '3px solid #111' }}>
        <button
          type="button"
          aria-label="關閉 QR code製作"
          onClick={onClose}
          style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #111', backgroundColor: '#fff', color: '#111', fontSize: '22px', fontWeight: '900', lineHeight: 1, cursor: 'pointer' }}
        >
          ×
        </button>
        <h3 style={{ margin: '0 40px 8px 0', fontSize: '18px', fontWeight: '900' }}>QR code製作</h3>
        <p style={{ margin: '0 0 6px', fontSize: '13px', lineHeight: 1.55, fontWeight: 700 }}>
          掃描器掃到之後，電腦會自動先打第一段，再撳 Tab，再打第二段，最後自動撳 Enter。
        </p>
        <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.55, fontWeight: 900 }}>
          Tab＝落下一行。
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          {['第一段', 'Tab＝落下一行', '第二段', 'Enter'].map((step, index) => (
            <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ backgroundColor: '#111', color: '#fff', borderRadius: '999px', padding: '4px 10px', fontSize: '13px', fontWeight: 900 }}>{step}</span>
              {index < 3 && <span style={{ fontWeight: 900 }}>→</span>}
            </span>
          ))}
        </div>
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) void generate();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 800 }}>
            第一段
            <input
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={first}
              onChange={(e) => { setFirst(e.target.value); setImage(''); }}
              style={{ fontSize: '16px', fontWeight: 700, padding: '12px', borderRadius: '12px', border: '2px solid #111' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontWeight: 800 }}>
            第二段
            <span style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showSecond ? 'text' : 'password'}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={second}
                onChange={(e) => { setSecond(e.target.value); setImage(''); }}
                style={{ flex: 1, minWidth: 0, fontSize: '16px', fontWeight: 700, padding: '12px', borderRadius: '12px', border: '2px solid #111' }}
              />
              <button
                type="button"
                onClick={() => setShowSecond((prev) => !prev)}
                style={{ flexShrink: 0, border: '2px solid #111', background: '#fff', borderRadius: '12px', fontWeight: 900, padding: '0 12px', cursor: 'pointer' }}
              >
                {showSecond ? '隱藏' : '顯示'}
              </button>
            </span>
          </label>
          <button
            type="submit"
            disabled={!ready || busy}
            style={{ marginTop: '4px', padding: '14px', border: 'none', borderRadius: '14px', backgroundColor: '#111', color: '#fff', fontSize: '16px', fontWeight: 900, cursor: ready && !busy ? 'pointer' : 'not-allowed', opacity: ready && !busy ? 1 : 0.4 }}
          >
            {busy ? '整緊…' : '整 QR code'}
          </button>
          {error && <div style={{ color: '#b91c1c', fontSize: '13px', fontWeight: 800 }}>{error}</div>}
        </form>
        {image && (
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <img src={image} alt="QR code" style={{ width: 'min(100%, 320px)', height: 'auto', border: '2px solid #111', borderRadius: '12px', backgroundColor: '#fff' }} />
            <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 900 }}>{madeFor}</div>
            <a
              href={image}
              download="qr-code.png"
              style={{ display: 'block', marginTop: '10px', padding: '12px', borderRadius: '14px', border: '2px solid #111', color: '#111', fontWeight: 900, textDecoration: 'none' }}
            >
              下載圖片
            </a>
          </div>
        )}
        <p style={{ margin: '14px 0 0', fontSize: '12px', lineHeight: 1.5, fontWeight: 700, color: '#444' }}>
          呢度唔會儲存任何嘢，只係一個 QR code製作器。泄露風險自負。
        </p>
      </div>
    </div>
  );
}
