"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [slashed, setSlashed] = useState(false);
  const [isSlashing, setIsSlashing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize theme from system preference or default
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Audio Context lazy initializer
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Play Zen Bowl Bell Chime (Metallic resonance)
  const playZenBell = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      const playTone = (freq: number, volume: number, decay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(volume, now);
        // Exponential decay for beautiful resonance
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + decay);
      };

      // Perfect Zen bell chord: fundamental 220Hz (A3) + rich harmonic overtones
      playTone(220, 0.4, 5.0);
      playTone(440, 0.2, 4.0);
      playTone(660, 0.15, 3.0);
      playTone(880, 0.1, 2.0);
      playTone(1320, 0.05, 1.2);
    } catch (e) {
      console.warn("Audio Context failed to play", e);
    }
  };

  // Play Sword Slash Whoosh (Noise + filter sweep)
  const playSlashSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // Generate short noise buffer
      const bufferSize = ctx.sampleRate * 0.35; // 0.35 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Sweep bandpass filter from high to low to sound like a swift slice
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(4.0, now);
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(now);
    } catch (e) {
      console.warn("Audio Context failed to play slash", e);
    }
  };

  const handleStartAdventure = () => {
    playZenBell();
    // In a real game, this would transition or open a portal.
    // For prototype, we trigger a ripple or alert/toast.
    alert("「空（Sunyata）」の旅が、今始まります。静寂をお楽しみください。");
  };

  const triggerSlash = () => {
    if (isSlashing) return;
    setIsSlashing(true);
    playSlashSound();
    
    setTimeout(() => {
      setSlashed(true);
      setIsSlashing(false);
      // Play a soft high-pitched bell chime as a feedback of purity
      setTimeout(() => {
        if (soundEnabled) {
          try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.5);
          } catch(e){}
        }
      }, 300);
    }, 400); // Trigger slash state at the peak of the whoosh
  };

  const resetSlash = () => {
    setSlashed(false);
    playZenBell();
  };

  return (
    <div className="relative flex flex-col justify-between min-h-screen p-6 sm:p-12 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-700">
      
      {/* Dynamic Zen Background Circle (Enso) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] transition-opacity duration-700">
        <svg 
          className="w-[80vw] h-[80vw] max-w-[700px] max-h-[700px] animate-breathe" 
          viewBox="0 0 200 200" 
          fill="none" 
          stroke="currentColor"
        >
          <path 
            d="M 100,20 C 144,20 180,56 180,100 C 180,144 144,180 100,180 C 62,180 30,154 22,118 C 18,100 22,78 35,60 C 47,43 70,25 101,21" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeDasharray="500" 
            strokeDashoffset="0"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-xl tracking-[0.3em] font-medium text-black dark:text-white">
            ŚŪNYATĀ
          </span>
          <span className="h-[12px] w-[1px] bg-neutral-300 dark:bg-neutral-800"></span>
          <span className="font-serif-jp text-xs tracking-widest text-neutral-400 dark:text-neutral-500">
            空無
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // Instantly play sound to verify
                setTimeout(() => playZenBell(), 50);
              }
            }}
            className="flex items-center justify-center p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            title="音の切り替え"
          >
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="22" y1="9" x2="16" y2="15"></line>
                <line x1="16" y1="9" x2="22" y2="15"></line>
              </svg>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
              playZenBell();
            }}
            className="flex items-center justify-center p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            title="意匠（白黒）の反転"
          >
            <span className="text-[14px] leading-none select-none">
              {theme === "light" ? "☯" : "○"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-grow max-w-4xl mx-auto w-full py-12 md:py-24 text-center">
        
        {/* Title Group */}
        <div className="space-y-4 md:space-y-6 select-none">
          <h1 className="font-cinzel text-5xl md:text-8xl tracking-[0.25em] font-light text-neutral-900 dark:text-neutral-50 leading-none">
            SUNYATA
          </h1>
          <p className="font-serif-jp text-sm md:text-lg tracking-[0.4em] text-neutral-400 dark:text-neutral-500 font-extralight uppercase">
            — The Way of Emptiness —
          </p>
        </div>

        {/* Catchphrase */}
        <div className="mt-8 md:mt-12 select-none">
          <p className="font-serif-jp text-lg md:text-2xl font-light tracking-[0.3em] leading-relaxed text-black dark:text-white">
            一撃で、すべてを削ぎ落とすRPG。
          </p>
        </div>

        {/* Game Overview (Nintendo-style clean card) */}
        <div className="mt-8 md:mt-12 max-w-lg mx-auto select-none border-t border-b border-neutral-200/60 dark:border-neutral-800/60 py-6 px-4">
          <div className="font-serif-jp text-xs md:text-sm font-light leading-[2.2] tracking-[0.2em] text-neutral-600 dark:text-neutral-400 space-y-3">
            <p>広大な世界はない。語るべき言葉もない。</p>
            <p>ただ、目の前の敵と向き合い、心身を研ぎ澄ます。</p>
            <p>極限まで削ぎ落とされた、静寂と対話する旅。</p>
          </div>
        </div>

        {/* Interactive Element: Zen Slice Mini-Experience */}
        <div className="relative mt-12 w-full max-w-md mx-auto p-8 rounded-xl border border-neutral-100 dark:border-neutral-900/60 bg-neutral-50/50 dark:bg-neutral-950/20 backdrop-blur-sm transition-all overflow-hidden group">
          
          {/* Slice/Slash Flash */}
          {isSlashing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-[120%] h-[3px] bg-black dark:bg-white rotate-[-15deg] origin-left animate-slash" />
            </div>
          )}

          {!slashed ? (
            <div className={`transition-opacity duration-300 ${isSlashing ? "opacity-30" : "opacity-100"}`}>
              <div className="flex flex-wrap justify-center gap-3 mb-6 select-none">
                <span className="px-3 py-1 text-xs font-mono tracking-widest text-neutral-400 dark:text-neutral-600 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-black">
                  雑念 (Noise)
                </span>
                <span className="px-3 py-1 text-xs font-mono tracking-widest text-neutral-400 dark:text-neutral-600 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-black">
                  執着 (Attachment)
                </span>
                <span className="px-3 py-1 text-xs font-mono tracking-widest text-neutral-400 dark:text-neutral-600 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-black">
                  迷い (Doubt)
                </span>
              </div>
              <button
                onClick={triggerSlash}
                className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs tracking-[0.2em] font-serif-jp text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-white dark:bg-black transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                心を無にし、一撃を放つ
              </button>
            </div>
          ) : (
            <div className="animate-ink-spread flex flex-col items-center justify-center">
              {/* Emptiness / Void Symbol */}
              <div className="font-serif-jp text-4xl font-light text-black dark:text-white tracking-[0.2em] mb-4">
                空
              </div>
              <p className="font-serif-jp text-xs text-neutral-400 dark:text-neutral-500 tracking-wider mb-6">
                すべては消え去り、静寂だけが残った。
              </p>
              <button
                onClick={resetSlash}
                className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-4 cursor-pointer"
              >
                再び、呼吸を整える (Reset)
              </button>
            </div>
          )}
        </div>

        {/* Primary CTA Action Button */}
        <div className="mt-12 md:mt-16">
          <button
            onClick={handleStartAdventure}
            className="group relative px-10 py-4 overflow-hidden rounded-md bg-black dark:bg-white text-white dark:text-black font-serif-jp text-base tracking-[0.3em] font-medium transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer shadow-sm hover:shadow-lg dark:hover:shadow-white/5"
          >
            {/* Elegant hover highlight */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-neutral-800 to-black dark:from-neutral-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            冒険を始める
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 select-none text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest">
            <span>SOUND ENABLED</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
            <span>PLATFORM: BROWSER</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100 dark:border-neutral-900/60 pt-6 text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-600">
        <div>
          © 2026 SUNYATA PROJECT. ALL RIGHTS REMOVED.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">TWITTER (X)</a>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">DISCORD</a>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors">ZEN ARCHIVE</a>
        </div>
      </footer>
    </div>
  );
}
