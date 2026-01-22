'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, ShieldCheck } from 'lucide-react';

interface GlowingLine {
  id: number;
  isHorizontal: boolean;
  position: number;
  startFrom: 'left' | 'right' | 'top' | 'bottom';
  duration: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [glowingLines, setGlowingLines] = useState<GlowingLine[]>([]);

  const hints = [
    "What are you trying to escape from?",
    "Think about what this platform helps you escape...",
    "It's the name you're looking for 🚪",
  ];

  // Spawn glowing dots that travel along grid lines
  useEffect(() => {
    const spawnLine = () => {
      const isHorizontal = Math.random() > 0.5;
      const gridSize = 50;
      const maxLines = isHorizontal 
        ? Math.floor(window.innerHeight / gridSize)
        : Math.floor(window.innerWidth / gridSize);
      
      const lineIndex = Math.floor(Math.random() * maxLines);
      const position = lineIndex * gridSize;
      
      const startFrom = isHorizontal 
        ? (Math.random() > 0.5 ? 'left' : 'right')
        : (Math.random() > 0.5 ? 'top' : 'bottom');
      
      const newLine: GlowingLine = {
        id: Date.now() + Math.random(),
        isHorizontal,
        position,
        startFrom: startFrom as 'left' | 'right' | 'top' | 'bottom',
        duration: 1.6 + Math.random() * 0.8, // 1.6-2.4 seconds (slower)
      };

      setGlowingLines(prev => [...prev, newLine]);

      // Remove line after animation completes
      setTimeout(() => {
        setGlowingLines(prev => prev.filter(l => l.id !== newLine.id));
      }, newLine.duration * 1000 + 100);
    };

    // Spawn initial lines
    spawnLine();
    
    // Spawn new lines periodically
    const interval = setInterval(() => {
      spawnLine();
    }, 600 + Math.random() * 800); // Every 600-1400ms

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUnlocking(true);
        setTimeout(() => {
          router.push('/competitors');
        }, 1200);
      } else {
        setAttempts(prev => prev + 1);
        setError('Access denied. Try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid - plus pattern with dotted lines */}
      <div className="absolute inset-0 opacity-[0.15]">
        {/* Dotted grid lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="dotted-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              {/* Horizontal dotted line */}
              <line x1="0" y1="25" x2="50" y2="25" stroke="#F26522" strokeWidth="1" strokeDasharray="2,4" />
              {/* Vertical dotted line */}
              <line x1="25" y1="0" x2="25" y2="50" stroke="#F26522" strokeWidth="1" strokeDasharray="2,4" />
              {/* Plus sign at intersection */}
              <line x1="22" y1="25" x2="28" y2="25" stroke="#F26522" strokeWidth="1.5" />
              <line x1="25" y1="22" x2="25" y2="28" stroke="#F26522" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotted-grid)" />
        </svg>
      </div>
      
      {/* Glowing dots traveling along grid lines */}
      {glowingLines.map(line => (
        <div
          key={line.id}
          className="absolute pointer-events-none"
          style={{
            ...(line.isHorizontal ? {
              top: line.position,
              left: line.startFrom === 'left' ? '-20px' : 'auto',
              right: line.startFrom === 'right' ? '-20px' : 'auto',
              animation: `${line.startFrom === 'left' ? 'moveRight' : 'moveLeft'} ${line.duration}s linear forwards`,
            } : {
              left: line.position,
              top: line.startFrom === 'top' ? '-20px' : 'auto',
              bottom: line.startFrom === 'bottom' ? '-20px' : 'auto',
              animation: `${line.startFrom === 'top' ? 'moveDown' : 'moveUp'} ${line.duration}s linear forwards`,
            }),
          }}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{
              background: '#F26522',
              boxShadow: '0 0 20px 8px rgba(242, 101, 34, 0.6), 0 0 40px 16px rgba(242, 101, 34, 0.3), 0 0 60px 24px rgba(242, 101, 34, 0.1)',
            }}
          />
        </div>
      ))}

      <div className="w-full max-w-md relative z-10">
        {/* Vault Modal */}
        <div className={`relative transition-all duration-700 ${unlocking ? 'scale-95 opacity-0' : ''}`}>
          {/* Vault outer ring */}
          <div className="absolute -inset-4 rounded-[32px] border-2 border-[#333] opacity-50" />
          <div className="absolute -inset-2 rounded-[28px] border border-[#444] opacity-30" />
          
          {/* Main vault door */}
          <div className="bg-gradient-to-b from-[#1E1E1E] to-[#141414] rounded-2xl border-2 border-[#333] shadow-2xl overflow-hidden">
            {/* Vault door top bolts */}
            <div className="flex justify-between px-8 py-3 bg-[#1A1A1A] border-b border-[#333]">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
              </div>
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
              </div>
            </div>

            {/* Vault center - Logo and branding */}
            <div className="px-8 py-12 text-center flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Image
                  src="/logo-light.png"
                  alt="Escape Hatch"
                  width={160}
                  height={40}
                  className="h-9 w-auto"
                />
              </div>
              
              <p className="text-[#555] text-xs uppercase tracking-[0.25em]">
                Secure Access
              </p>
            </div>

            {/* Divider with vault handle aesthetic */}
            <div className="relative h-px bg-[#333] mx-6">
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 h-4 bg-[#1A1A1A] border border-[#333] rounded-full flex items-center justify-center">
                <div className="w-8 h-1 bg-[#333] rounded-full" />
              </div>
            </div>

            {/* Form section */}
            <div className="p-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#555] mb-3 font-medium">
                    Enter Access Code
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || unlocking}
                      className={`w-full px-4 py-4 bg-[#0D0D0D] border-2 rounded-lg text-white text-center text-lg tracking-[0.3em] placeholder:text-[#333] placeholder:tracking-[0.3em] focus:outline-none transition-all ${
                        error 
                          ? 'border-red-500/50 animate-shake' 
                          : 'border-[#333] focus:border-primary'
                      }`}
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    <Lock className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || unlocking || !password}
                  className={`w-full py-4 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    unlocking 
                      ? 'bg-green-500 text-white'
                      : 'bg-primary hover:bg-primary-hover text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {unlocking ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Vault Unlocked
                    </>
                  ) : loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Unlock Vault
                    </>
                  )}
                </button>
              </form>

              {/* Hint system */}
              {attempts >= 2 && hintLevel < hints.length && (
                <button
                  onClick={showHint}
                  className="w-full mt-4 text-sm text-[#555] hover:text-primary transition-colors"
                >
                  Need a hint? 🤔
                </button>
              )}
              
              {hintLevel > 0 && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-primary/80 text-center">
                    💡 {hints[hintLevel - 1]}
                  </p>
                </div>
              )}
            </div>

            {/* Vault door bottom bolts */}
            <div className="flex justify-between px-8 py-3 bg-[#1A1A1A] border-t border-[#333]">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
              </div>
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#2A2A2A] border border-[#444] shadow-inner" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#333] text-xs mt-8 uppercase tracking-widest">
          Authorized Access Only
        </p>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes moveRight {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100vw + 40px)); }
        }
        
        @keyframes moveLeft {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100vw - 40px)); }
        }
        
        @keyframes moveDown {
          from { transform: translateY(0); }
          to { transform: translateY(calc(100vh + 40px)); }
        }
        
        @keyframes moveUp {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-100vh - 40px)); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
