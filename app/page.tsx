"use client";

import React, { useState, useEffect, useRef } from "react";

interface Particle {
  id: number;
  left: string;
  delay: string;
  size: string;
  speedClass: string;
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [windActive, setWindActive] = useState(false);
  
  // Audio references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const windIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Zen Breath Guide State
  const [breathState, setBreathState] = useState<"吸う (Inhale)" | "止める (Hold)" | "吐く (Exhale)">("吸う (Inhale)");
  const [breathCycle, setBreathCycle] = useState(0); // 0 to 11

  // Mind's Mirror (Combat Simulator) State
  const [combatActive, setCombatActive] = useState(false);
  const [combatLogs, setCombatLogs] = useState<string[]>([
    "目の前に暗い池があり、水面に己の影が揺れている。",
    "影は静かに剣を構え、こちらを見つめている。"
  ]);
  const [playerFocus, setPlayerFocus] = useState(0);
  const [shadowDefeated, setShadowDefeated] = useState(false);
  const [combatSlashing, setCombatSlashing] = useState(false);

  // Zen Slash State (Intro slice)
  const [slashed, setSlashed] = useState(false);
  const [isSlashing, setIsSlashing] = useState(false);

  // Particles State
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize theme and particles
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");

      // Generate random particles positions/delays for natural look
      const generated: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: `${10 + Math.random() * 80}%`,
        delay: `${Math.random() * -15}s`,
        size: `${4 + Math.random() * 8}px`,
        speedClass: i % 3 === 0 ? "animate-particle-fast" : i % 3 === 1 ? "animate-particle-mid" : "animate-particle-slow"
      }));
      setParticles(generated);
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

  // Breathing Loop (12 second cycle: 4s inhale, 4s hold, 4s exhale)
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathCycle((prev) => {
        const next = (prev + 1) % 12;
        if (next < 4) {
          setBreathState("吸う (Inhale)");
        } else if (next < 8) {
          setBreathState("止める (Hold)");
        } else {
          setBreathState("吐く (Exhale)");
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (windIntervalRef.current) clearInterval(windIntervalRef.current);
      if (windSourceRef.current) {
        try {
          windSourceRef.current.stop();
        } catch(e){}
      }
    };
  }, []);

  // Audio Context lazy initializer
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Play Zen Bowl Bell Chime (Metallic resonance)
  const playZenBell = (customFreq?: number, customVolume?: number) => {
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
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + decay);
      };

      const freqFactor = customFreq || 220;
      const volFactor = customVolume || 0.4;

      // Perfect Zen bell chord: fundamental + rich harmonic overtones
      playTone(freqFactor, volFactor, 5.0);
      playTone(freqFactor * 2, volFactor * 0.5, 4.0);
      playTone(freqFactor * 3, volFactor * 0.35, 3.0);
      playTone(freqFactor * 4, volFactor * 0.25, 2.0);
      playTone(freqFactor * 6, volFactor * 0.1, 1.2);
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
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 0.3);
      
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

  // Procedural Wind Ambient (BGM) loop
  const toggleWindBGM = () => {
    if (windActive) {
      stopWindAmbient();
    } else {
      startWindAmbient();
    }
  };

  const startWindAmbient = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // Generate pink/brown noise
      const bufferSize = ctx.sampleRate * 4.0; // 4 seconds loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple lowpass for brown noise rumble
        data[i] = (lastOut + (0.015 * white)) / 1.015;
        lastOut = data[i];
        data[i] *= 4.5; // Gain multiplier
      }
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(200, now);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      // Soft fade-in
      gain.gain.linearRampToValueAtTime(0.08, now + 2.0);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      source.start();
      
      // Slow modulation of filter frequency to simulate natural gusts of wind
      const interval = setInterval(() => {
        const currentCtx = getAudioContext();
        const t = currentCtx.currentTime;
        const targetFreq = 160 + Math.random() * 240; // 160Hz to 400Hz
        const targetQ = 1.0 + Math.random() * 2.5; // Q factor
        filter.frequency.exponentialRampToValueAtTime(targetFreq, t + 3.5);
        filter.Q.exponentialRampToValueAtTime(targetQ, t + 3.5);
      }, 4000);
      
      windSourceRef.current = source;
      windGainRef.current = gain;
      windIntervalRef.current = interval;
      setWindActive(true);
      
      if (!soundEnabled) {
        setSoundEnabled(true);
      }
    } catch(e) {
      console.warn("Wind synthesis failed", e);
    }
  };

  const stopWindAmbient = () => {
    if (windIntervalRef.current) {
      clearInterval(windIntervalRef.current);
      windIntervalRef.current = null;
    }
    if (windGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      windGainRef.current.gain.cancelScheduledValues(now);
      windGainRef.current.gain.linearRampToValueAtTime(0, now + 1.2);
      setTimeout(() => {
        if (windSourceRef.current) {
          try {
            windSourceRef.current.stop();
          } catch(e){}
          windSourceRef.current = null;
        }
        setWindActive(false);
      }, 1300);
    } else {
      setWindActive(false);
    }
  };

  // Main CTA start adventure
  const handleStartAdventure = () => {
    playZenBell(180, 0.5); // Deeper tone for beginning
    setCombatActive(true); // Open the mind's mirror combat simulator
    
    // Add toast or scroll to combat
    setTimeout(() => {
      const target = document.getElementById("minds-mirror");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Main intro slash interaction
  const triggerSlash = () => {
    if (isSlashing) return;
    setIsSlashing(true);
    playSlashSound();
    
    setTimeout(() => {
      setSlashed(true);
      setIsSlashing(false);
      playZenBell(440, 0.15); // Clear confirmation tone
    }, 450);
  };

  const resetSlash = () => {
    setSlashed(false);
    playZenBell();
  };

  // Mind's Mirror Combat Logic
  const handleCombatAction = (action: "observe" | "breathe" | "strike") => {
    if (combatSlashing || shadowDefeated) return;

    if (action === "observe") {
      playZenBell(330, 0.15); // Light tone
      setPlayerFocus((prev) => {
        const next = Math.min(prev + 35, 100);
        const focusMsg = next >= 100 ? "【無心】の状態に達した。視界が澄み渡る。" : `集中が ${next}% に高まった。`;
        setCombatLogs((prevLogs) => [
          ...prevLogs,
          "影の剣筋を見つめ、己の心の揺れを観察する。",
          focusMsg
        ]);
        return next;
      });
    }

    if (action === "breathe") {
      playZenBell(275, 0.15); // Calming tone
      setPlayerFocus((prev) => {
        const next = Math.min(prev + 25, 100);
        const focusMsg = next >= 100 ? "【無心】の状態に達した。全身の余分な力が抜ける。" : `集中が ${next}% に高まった。`;
        setCombatLogs((prevLogs) => [
          ...prevLogs,
          "深く息を吸い、長く吐く。己の輪郭が世界に溶け込んでいく。",
          focusMsg
        ]);
        return next;
      });
    }

    if (action === "strike") {
      setCombatSlashing(true);
      playSlashSound();

      setTimeout(() => {
        if (playerFocus >= 100) {
          // Success
          setShadowDefeated(true);
          setCombatLogs((prevLogs) => [
            ...prevLogs,
            "――一撃。無心から放たれた刃が、影の核心を静かに切り裂いた。",
            "影は微笑むように揺らぎ、光の粒子となって霧散した。静寂だけが残る。"
          ]);
          playZenBell(110, 0.6); // Deep resonating bowel chime of victory
        } else {
          // Fail
          setPlayerFocus(0);
          setCombatLogs((prevLogs) => [
            ...prevLogs,
            "影に向けて斬りかかるが、心の迷いを見透かされ、軽くいなされた。",
            "影が囁く：『焦りは刃を鈍らせ、執着は視界を曇らせる。』",
            "集中が 0% に戻ってしまった。"
          ]);
          playZenBell(180, 0.2); // Low dull tone
        }
        setCombatSlashing(false);
      }, 500);
    }
  };

  const resetCombat = () => {
    setShadowDefeated(false);
    setPlayerFocus(0);
    setCombatLogs([
      "目の前に暗い池があり、水面に己の影が揺れている。",
      "影は静かに剣を構え、こちらを見つめている。"
    ]);
    playZenBell();
  };

  return (
    <div className="relative flex flex-col justify-between min-h-screen p-6 sm:p-12 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-700 select-none">
      
      {/* Floating Sumi-e Ink Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full bg-neutral-900/5 dark:bg-neutral-100/5 blur-[1px] ${p.speedClass}`}
            style={{
              left: p.left,
              animationDelay: p.delay,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Dynamic Zen Background Circle (Enso) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.02] transition-opacity duration-700 z-0">
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

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Procedural Wind Toggle */}
          <button
            onClick={toggleWindBGM}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${
              windActive
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-medium"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
            title="環境風音の再生/停止"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={windActive ? "animate-pulse" : ""}>
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
            </svg>
            <span className="font-serif-jp tracking-wider text-[10px]">風音 BGM</span>
          </button>

          {/* Sound Effect Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center justify-center p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
            title="おりん効果音の切り替え"
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

          {/* Yin-Yang Theme Toggle */}
          <button
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
              playZenBell(330, 0.15);
            }}
            className="flex items-center justify-center p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
            title="意匠（白黒）の反転"
          >
            <span className="text-[14px] leading-none">
              {theme === "light" ? "☯" : "○"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-grow max-w-4xl mx-auto w-full py-12 md:py-20 text-center gap-12 sm:gap-16">
        
        {/* Title & Catchphrase */}
        <div className="flex flex-col items-center gap-8">
          {/* Title Group */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="font-cinzel text-5xl md:text-8xl tracking-[0.25em] font-light text-neutral-900 dark:text-neutral-50 leading-none">
              SUNYATA
            </h1>
            <p className="font-serif-jp text-sm md:text-lg tracking-[0.4em] text-neutral-400 dark:text-neutral-500 font-extralight uppercase">
              — The Way of Emptiness —
            </p>
          </div>

          {/* Catchphrase */}
          <div>
            <p className="font-serif-jp text-lg md:text-2xl font-light tracking-[0.3em] leading-relaxed text-black dark:text-white">
              一撃で、すべてを削ぎ落とすRPG。
            </p>
          </div>
        </div>

        {/* Dynamic Zen Breath Guide Sub-Component */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Visual breathing ring */}
            <div 
              className={`absolute inset-0 rounded-full border border-neutral-200 dark:border-neutral-800/80 transition-all duration-[4000ms] ease-in-out ${
                breathState === "吸う (Inhale)" 
                  ? "scale-[1.3] border-neutral-400 dark:border-neutral-600" 
                  : breathState === "止める (Hold)" 
                  ? "scale-[1.3] border-black dark:border-white opacity-40 animate-pulse" 
                  : "scale-[0.85] border-neutral-200 dark:border-neutral-800"
              }`}
            />
            {/* Inner fixed core */}
            <div className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-serif-jp text-xs tracking-[0.25em] text-neutral-500 dark:text-neutral-400 font-light">
              呼吸の調律
            </span>
            <span className="font-serif-jp text-[10px] tracking-[0.2em] text-neutral-400 dark:text-neutral-600 font-light uppercase">
              {breathState}
            </span>
          </div>
        </div>

        {/* Game Overview & Intro Slash */}
        <div className="flex flex-col items-center gap-8 w-full max-w-lg">
          <div className="border-t border-b border-neutral-200/60 dark:border-neutral-800/60 py-6 px-4 w-full">
            <div className="font-serif-jp text-xs md:text-sm font-light leading-[2.2] tracking-[0.2em] text-neutral-600 dark:text-neutral-400 space-y-3">
              <p>広大な世界はない。語るべき言葉もない。</p>
              <p>ただ、目の前の敵と向き合い、心身を研ぎ澄ます。</p>
              <p>極限まで削ぎ落とされた、静寂と対話する旅。</p>
            </div>
          </div>

          {/* Interactive Element: Intro Slash */}
          <div className="relative w-full p-8 rounded-xl border border-neutral-100 dark:border-neutral-900/60 bg-neutral-50/50 dark:bg-neutral-950/20 backdrop-blur-sm transition-all overflow-hidden">
            {isSlashing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-[120%] h-[3px] bg-black dark:bg-white rotate-[-15deg] origin-left animate-slash" />
              </div>
            )}

            {!slashed ? (
              <div className={`transition-opacity duration-300 ${isSlashing ? "opacity-30" : "opacity-100"}`}>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <span className="px-3 py-1 text-xs font-mono tracking-widest text-neutral-400 dark:text-neutral-600 border border-neutral-200/80 dark:border-neutral-800 rounded bg-white dark:bg-black">
                    執着 (Attachment)
                  </span>
                  <span className="px-3 py-1 text-xs font-mono tracking-widest text-neutral-400 dark:text-neutral-600 border border-neutral-200/80 dark:border-neutral-800 rounded bg-white dark:bg-black">
                    雑念 (Noise)
                  </span>
                  <span className="px-3 py-1 text-xs font-mono tracking-widest text-neutral-400 dark:text-neutral-600 border border-neutral-200/80 dark:border-neutral-800 rounded bg-white dark:bg-black">
                    焦燥 (Impatience)
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
                <div className="font-serif-jp text-4xl font-light text-black dark:text-white tracking-[0.2em] mb-4 animate-pulse">
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
        </div>

        {/* Primary CTA Action Button */}
        <div>
          <button
            onClick={handleStartAdventure}
            className="group relative px-12 py-4.5 overflow-hidden rounded-md bg-black dark:bg-white text-white dark:text-black font-serif-jp text-base tracking-[0.35em] font-medium transition-all duration-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer shadow-sm hover:shadow-lg dark:hover:shadow-white/5"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-neutral-800 to-black dark:from-neutral-100 dark:to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            冒険を始める
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 tracking-widest">
            <span>SOUND {soundEnabled ? "ON" : "OFF"}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></span>
            <span>BGM {windActive ? "PLAYING" : "MUTED"}</span>
          </div>
        </div>

        {/* Mind's Mirror: Text-based Combat Simulator (Anchor target) */}
        {combatActive && (
          <section
            id="minds-mirror"
            className="animate-ink-spread w-full max-w-xl mx-auto p-6 md:p-8 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 backdrop-blur-md text-left"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 animate-ping"></span>
                <h3 className="font-serif-jp text-sm tracking-[0.2em] font-medium text-black dark:text-white">
                  試練：心象の鏡 (Trial: Mind's Mirror)
                </h3>
              </div>
              <button
                onClick={() => setCombatActive(false)}
                className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                CLOSE [X]
              </button>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 select-none font-mono text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex flex-col gap-1 border-r border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 tracking-wider">対峙者 (Opponent)</span>
                <span className="text-black dark:text-white tracking-widest">己の影 (Your Shadow)</span>
              </div>
              <div className="flex flex-col gap-1 pl-4">
                <span className="text-[10px] text-neutral-400 tracking-wider">心の集中度 (Focus)</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm tracking-wider font-semibold ${playerFocus >= 100 ? "text-black dark:text-white animate-pulse" : ""}`}>
                    {playerFocus}%
                  </span>
                  <div className="flex-grow h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden max-w-[80px]">
                    <div 
                      className="h-full bg-black dark:bg-white transition-all duration-500" 
                      style={{ width: `${playerFocus}%` }}
                    />
                  </div>
                  {playerFocus >= 100 && (
                    <span className="text-[8px] border border-neutral-300 dark:border-neutral-700 px-1 text-black dark:text-white tracking-widest">
                      無心 (EMPTY)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Simulated Terminal Screen */}
            <div className="relative min-h-[140px] p-4 bg-neutral-900 text-neutral-300 rounded font-mono text-xs leading-relaxed overflow-hidden">
              
              {/* Slice line flash in the terminal */}
              {combatSlashing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-[120%] h-[2px] bg-white rotate-[-8deg] origin-left animate-slash" />
                </div>
              )}

              <div className="space-y-2 h-[120px] overflow-y-auto pr-2 scrollbar">
                {combatLogs.map((log, index) => (
                  <p key={index} className="transition-opacity duration-300">
                    {index === combatLogs.length - 1 ? "> " : "  "}
                    {log}
                  </p>
                ))}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="mt-6 flex flex-wrap gap-3">
              {!shadowDefeated ? (
                <>
                  <button
                    onClick={() => handleCombatAction("observe")}
                    disabled={combatSlashing}
                    className="flex-1 min-w-[100px] px-4 py-2.5 rounded border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs tracking-wider font-serif-jp text-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-white dark:bg-black transition-all cursor-pointer disabled:opacity-30"
                  >
                    観照 [Observe] (+35%)
                  </button>
                  <button
                    onClick={() => handleCombatAction("breathe")}
                    disabled={combatSlashing}
                    className="flex-1 min-w-[100px] px-4 py-2.5 rounded border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs tracking-wider font-serif-jp text-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-white dark:bg-black transition-all cursor-pointer disabled:opacity-30"
                  >
                    呼吸 [Breathe] (+25%)
                  </button>
                  <button
                    onClick={() => handleCombatAction("strike")}
                    disabled={combatSlashing}
                    className="flex-grow min-w-[120px] px-6 py-2.5 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-xs tracking-[0.2em] font-serif-jp text-center transition-all cursor-pointer disabled:opacity-30 hover:scale-[1.02]"
                  >
                    一撃を放つ [Strike]
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-4">
                  <span className="font-serif-jp text-xs text-neutral-500 dark:text-neutral-400 tracking-wider">
                    試練を乗り越えました。あなたの心は穏やかです。
                  </span>
                  <button
                    onClick={resetCombat}
                    className="px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs tracking-wider font-mono text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-white dark:bg-black transition-all cursor-pointer"
                  >
                    再挑戦 (Reset Trial)
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

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
