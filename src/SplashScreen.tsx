import React, { useEffect, useState } from 'react';
import splashBg from './assets/splash_bg.png';

type Phase = 'black' | 'imageReveal' | 'logoIn' | 'typing' | 'stats' | 'exit';

const SplashScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [phase, setPhase] = useState<Phase>('black');
  const [typedText, setTypedText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [statValues, setStatValues] = useState([0, 0, 0]);

  const fullText = 'Initializing Medical DSL Compiler...';

  useEffect(() => {
    // Phase timeline (ms)
    const t1 = setTimeout(() => setPhase('imageReveal'), 300);
    const t2 = setTimeout(() => setPhase('logoIn'),       1400);
    const t3 = setTimeout(() => setPhase('typing'),       2400);
    const t4 = setTimeout(() => setPhase('stats'),        4200);
    const t5 = setTimeout(() => setShowStats(true),       4300);
    const t6 = setTimeout(() => setPhase('exit'),         5800);
    const t7 = setTimeout(() => onDone(),                 6600);
    return () => [t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout);
  }, [onDone]);

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'typing') return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [phase]);

  // Counter effect for stats
  useEffect(() => {
    if (!showStats) return;
    const targets = [5, 10, 3];
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setStatValues(targets.map(t => Math.round(t * ease)));
      if (step >= steps) clearInterval(iv);
    }, interval);
    return () => clearInterval(iv);
  }, [showStats]);

  const isExiting = phase === 'exit';
  const imageVisible = phase !== 'black';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000',
      overflow: 'hidden',
      transition: isExiting ? 'opacity 0.8s ease' : undefined,
      opacity: isExiting ? 0 : 1,
      pointerEvents: isExiting ? 'none' : 'all',
    }}>

      {/* ── Background Image with Ken Burns zoom ───────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        transition: 'opacity 1.4s ease',
        opacity: imageVisible ? 1 : 0,
      }}>
        <img
          src={splashBg}
          alt=""
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            animation: 'kenBurns 7s ease-out forwards',
            filter: 'brightness(0.55) saturate(1.3)',
          }}
        />
      </div>

      {/* ── Deep gradient overlay ────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 100%), linear-gradient(to top, rgba(10,5,30,0.95) 0%, transparent 50%)',
      }} />

      {/* ── Animated scan line ──────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(108,71,255,0.8), rgba(79,142,247,0.8), transparent)',
        animation: 'scanLine 3s ease-in-out 1.2s infinite',
        boxShadow: '0 0 12px rgba(108,71,255,0.6)',
      }} />

      {/* ── Floating grid overlay ───────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(108,71,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,71,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridPan 10s linear infinite',
      }} />

      {/* ── ECG heartbeat line ──────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '18%', left: 0, right: 0,
        height: 70, overflow: 'visible',
        opacity: phase === 'logoIn' || phase === 'typing' || phase === 'stats' ? 1 : 0,
        transition: 'opacity 1s ease',
      }}>
        <svg viewBox="0 0 1200 70" preserveAspectRatio="none" style={{width:'100%',height:'100%'}}>
          <polyline
            points="0,35 100,35 140,8 170,62 200,15 230,58 260,35 380,35 420,8 450,62 480,15 510,58 540,35 660,35 700,8 730,62 760,15 790,58 820,35 940,35 980,8 1010,62 1040,15 1070,58 1100,35 1200,35"
            fill="none"
            stroke="rgba(16,185,129,0.7)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: phase === 'logoIn' || phase === 'typing' || phase === 'stats' ? 0 : 3000,
              transition: 'stroke-dashoffset 3s ease 0.5s',
            }}
          />
          {/* Glow duplicate */}
          <polyline
            points="0,35 100,35 140,8 170,62 200,15 230,58 260,35 380,35 420,8 450,62 480,15 510,58 540,35 660,35 700,8 730,62 760,15 790,58 820,35 940,35 980,8 1010,62 1040,15 1070,58 1100,35 1200,35"
            fill="none"
            stroke="rgba(16,185,129,0.3)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              strokeDasharray: 3000,
              strokeDashoffset: phase === 'logoIn' || phase === 'typing' || phase === 'stats' ? 0 : 3000,
              transition: 'stroke-dashoffset 3s ease 0.5s',
            }}
          />
          <defs>
            <filter id="glow" x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* ── Left side content panel ─────────────────────── */}
      <div style={{
        position: 'absolute', left: '6%', top: '50%',
        transform: 'translateY(-50%)',
        maxWidth: 520,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          marginBottom: 32,
          opacity: phase === 'logoIn' || phase === 'typing' || phase === 'stats' ? 1 : 0,
          transform: phase === 'logoIn' || phase === 'typing' || phase === 'stats' ? 'translateX(0)' : 'translateX(-60px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg,#6c47ff,#4f8ef7)',
            borderRadius: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(108,71,255,0.6), 0 0 80px rgba(108,71,255,0.25)',
            flexShrink: 0,
            animation: phase === 'logoIn' || phase === 'typing' || phase === 'stats' ? 'logoPulse 3s ease-in-out infinite' : undefined,
          }}>
            <svg width="44" height="44" viewBox="0 0 52 52" fill="none">
              <rect x="20" y="4"  width="12" height="44" rx="4" fill="white" fillOpacity="0.95"/>
              <rect x="4"  y="20" width="44" height="12" rx="4" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontSize: 52, fontWeight: 900, letterSpacing: '-2px',
              fontFamily: "'Inter',sans-serif", lineHeight: 1,
              background: 'linear-gradient(90deg,#ffffff,#c4b5fd,#93c5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>MediScript</div>
            <div style={{
              fontSize: 13, color: 'rgba(255,255,255,0.45)',
              fontFamily: "'Inter',sans-serif", fontWeight: 600,
              letterSpacing: 4, textTransform: 'uppercase', marginTop: 4,
            }}>Medical DSL Compiler</div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 18, color: 'rgba(255,255,255,0.7)',
          fontFamily: "'Inter',sans-serif", fontWeight: 400,
          lineHeight: 1.6, marginBottom: 32,
          opacity: phase === 'typing' || phase === 'stats' ? 1 : 0,
          transform: phase === 'typing' || phase === 'stats' ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
        }}>
          Transform medical diagnosis rules into<br/>
          <span style={{
            background: 'linear-gradient(90deg,#a78bfa,#60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}>native executable code</span> in milliseconds.
        </div>

        {/* Terminal typewriter */}
        <div style={{
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid rgba(108,71,255,0.35)',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 28,
          backdropFilter: 'blur(10px)',
          opacity: phase === 'typing' || phase === 'stats' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            {['#ef4444','#f59e0b','#10b981'].map((c,i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
            ))}
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginLeft: 6, fontFamily: 'monospace' }}>terminal</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: '#10b981' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>$&nbsp;</span>
            {typedText}
            <span style={{ animation: 'blink 1s step-end infinite' }}>▋</span>
          </div>
          {phase === 'stats' && (
            <div style={{ marginTop: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: '#a78bfa' }}>[✓]</span> Lexer loaded &nbsp;
              <span style={{ color: '#a78bfa' }}>[✓]</span> Parser ready &nbsp;
              <span style={{ color: '#a78bfa' }}>[✓]</span> IR Engine online
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 24,
          opacity: showStats ? 1 : 0,
          transform: showStats ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {[
            { label: 'Pipeline Stages', value: statValues[0], suffix: '' },
            { label: 'Sample Patients', value: statValues[1], suffix: '' },
            { label: 'Avg Compile Time', value: statValues[2], suffix: 'ms' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '14px 20px',
              backdropFilter: 'blur(8px)',
              minWidth: 130, textAlign: 'center',
            }}>
              <div style={{
                fontSize: 32, fontWeight: 900, fontFamily: "'Inter',sans-serif",
                background: 'linear-gradient(135deg,#6c47ff,#4f8ef7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.value}{s.suffix}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: floating pipeline pills ─────────────── */}
      <div style={{
        position: 'absolute', right: '5%', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 14,
        opacity: phase === 'stats' ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}>
        {['Lexer','Parser','Semantic Analyzer','IR Code Generator','Execution Engine'].map((stage, i) => (
          <div key={stage} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(108,71,255,0.3)',
            borderRadius: 12, padding: '12px 20px',
            backdropFilter: 'blur(10px)',
            animation: `slideInRight 0.5s ease ${i * 0.12}s both`,
            minWidth: 220,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#6c47ff,#4f8ef7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 13, fontWeight: 900, color: 'white',
              fontFamily: "'Inter',sans-serif",
            }}>{i + 1}</div>
            <div>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{stage}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>Stage {i + 1} / 5</div>
            </div>
            <div style={{
              marginLeft: 'auto',
              width: 8, height: 8, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'pulseDot 2s ease-in-out infinite',
              animationDelay: `${i * 0.3}s`,
            }} />
          </div>
        ))}
      </div>

      {/* ── Progress bar ────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '7%', left: '6%', right: '6%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' }}>Loading MediScript v1.0</span>
          <span style={{ color: '#6c47ff', fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}>
            {phase === 'exit' ? '100' : phase === 'stats' ? '85' : phase === 'typing' ? '55' : phase === 'logoIn' ? '30' : '5'}%
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg,#6c47ff,#4f8ef7,#10b981)',
            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            width: phase === 'exit' ? '100%' : phase === 'stats' ? '85%' : phase === 'typing' ? '55%' : phase === 'logoIn' ? '30%' : '5%',
            boxShadow: '0 0 12px rgba(108,71,255,0.6)',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.08); }
          to   { transform: scale(1); }
        }
        @keyframes scanLine {
          0%   { top: -4px; opacity: 1; }
          70%  { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes gridPan {
          from { background-position: 0 0; }
          to   { background-position: 60px 60px; }
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 40px rgba(108,71,255,0.6), 0 0 80px rgba(108,71,255,0.25); }
          50%     { box-shadow: 0 0 60px rgba(108,71,255,0.9), 0 0 120px rgba(108,71,255,0.4); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
