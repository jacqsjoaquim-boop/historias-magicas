import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Home, Sparkles, Lock, X, Clock, BookOpen, ChevronRight, Star, TreePine, Rocket, Waves, Send, AlertTriangle, Castle, Bird, Sun, Snowflake, Volume2, VolumeX } from "lucide-react";

// ---------- Config ----------
const THEMES = [
  { id: "forest", label: "Floresta Encantada", icon: TreePine, glow: "#3DE29B", sky: "linear-gradient(180deg,#0f3d2e 0%,#12703f 55%,#22b06a 100%)" },
  { id: "space", label: "Viagem Espacial", icon: Rocket, glow: "#C08BFF", sky: "linear-gradient(180deg,#251258 0%,#4a1f9e 55%,#7d3ce0 100%)" },
  { id: "ocean", label: "Fundo do Mar", icon: Waves, glow: "#2FE0F0", sky: "linear-gradient(180deg,#062c47 0%,#0a5c85 55%,#0fa3c9 100%)" },
  { id: "castle", label: "Castelo Mágico", icon: Castle, glow: "#FF8FD6", sky: "linear-gradient(180deg,#3a0f4d 0%,#7a1f8c 55%,#c23ea3 100%)" },
  { id: "jungle", label: "Selva Perdida", icon: Bird, glow: "#C4E23D", sky: "linear-gradient(180deg,#1f3a12 0%,#3f6e1a 55%,#79a827 100%)" },
  { id: "desert", label: "Deserto Encantado", icon: Sun, glow: "#FFB23D", sky: "linear-gradient(180deg,#5c1f0f 0%,#a5401a 55%,#e07a2c 100%)" },
  { id: "arctic", label: "Polo Gelado", icon: Snowflake, glow: "#8FE8FF", sky: "linear-gradient(180deg,#0c2b45 0%,#1f6e8c 55%,#4fb8d6 100%)" },
];

// A geração da história agora acontece no backend (api/story.js), que guarda a chave da IA em segredo.

async function callNarrator({ themeLabel, history, action }) {
  const response = await fetch("/api/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ themeLabel, history, action }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Falha ao gerar a história");
  }
  const parsed = await response.json();
  if (!parsed.text || !Array.isArray(parsed.choices)) throw new Error("Formato inesperado");
  return parsed;
}

// ---------- Small components ----------
function StoryOrb({ active, glow }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: 72, height: 72,
          background: `radial-gradient(circle at 35% 30%, ${glow}cc, ${glow}33 60%, transparent 75%)`,
          filter: "blur(2px)",
          animation: active ? "pulseOrb 1.6s ease-in-out infinite" : "none",
        }}
      />
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 40, height: 40, background: `radial-gradient(circle at 35% 30%, #fff8ed, ${glow})`, boxShadow: `0 0 24px ${glow}aa` }}
      >
        <Sparkles size={18} color="#241F3D" />
      </div>
      <style>{`
        @keyframes pulseOrb {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.25); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function TopBar({ onHome, onParent, title }) {
  return (
    <div className="flex items-center justify-between px-4 pt-8 pb-2 text-[#FFF6E9]">
      <button onClick={onHome} className="p-2 rounded-full bg-white/10 active:scale-95 transition">
        <Home size={16} />
      </button>
      <span className="font-display text-base tracking-wide opacity-90">{title}</span>
      <button onClick={onParent} className="p-2 rounded-full bg-white/10 active:scale-95 transition">
        <Lock size={16} />
      </button>
    </div>
  );
}

function HomeScreen({ onNew, onParent, voiceEnabled }) {
  const { speak, stop } = useSpeechSynthesis();

  useEffect(() => {
    if (voiceEnabled) speak("Histórias Mágicas! Toque e escolha o rumo da aventura!");
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled]);

  return (
    <div className="w-full h-full flex flex-col justify-between px-6 pb-8 pt-10" style={{ background: "linear-gradient(160deg,#3A1466 0%,#7A1FA8 55%,#B8228F 100%)" }}>
      <div className="flex justify-end">
        <button onClick={onParent} className="p-2 rounded-full bg-white/15 active:scale-95 transition">
          <Lock size={16} className="text-[#FFF6E9]" />
        </button>
      </div>
      <div className="flex flex-col items-center gap-4 text-center">
        <StoryOrb active glow="#FFC93C" />
        <h1 className="font-display text-[#FFF6E9] text-5xl leading-[1.05] drop-shadow-[0_3px_0_rgba(0,0,0,0.25)]">
          Histórias<br /><span style={{ color: "#FFD84D" }}>Mágicas</span>
        </h1>
        <p className="text-[#FFF6E9]/80 font-nunito text-base font-bold px-4">
          Toque e escolha o rumo da aventura!
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => { stop(); onNew(); }}
          className="w-full py-5 rounded-2xl font-display text-xl flex items-center justify-center gap-2 active:scale-[0.98] transition text-[#241F3D] shadow-lg"
          style={{ background: "linear-gradient(135deg,#FFD84D,#FF5D73)" }}
        >
          <Sparkles size={22} /> Nova aventura
        </button>
      </div>
    </div>
  );
}

function ThemePicker({ onPick, onBack, voiceEnabled }) {
  const { speak, stop } = useSpeechSynthesis();

  useEffect(() => {
    if (voiceEnabled) speak("Escolha um mundo para sua aventura!");
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceEnabled]);

  return (
    <div className="w-full h-full flex flex-col px-5 pt-8 pb-8" style={{ background: "linear-gradient(160deg,#3A1466 0%,#7A1FA8 55%,#B8228F 100%)" }}>
      <TopBar onHome={() => { stop(); onBack(); }} onParent={() => {}} title="Escolha um mundo" />
      <div className="flex-1 flex flex-col gap-3 mt-2 overflow-y-auto pr-1">
        {THEMES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { stop(); onPick(t); }}
              className="w-full rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition text-left shadow-lg flex-shrink-0"
              style={{ background: t.sky, border: `2px solid ${t.glow}88` }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${t.glow}44` }}>
                <Icon size={22} color={t.glow} />
              </div>
              <div className="flex-1">
                <div className="font-display text-[#FFF6E9] text-xl">{t.label}</div>
                <div className="text-[#FFF6E9]/60 text-xs font-nunito font-bold">Toque para começar</div>
              </div>
              <ChevronRight size={20} color="#FFF6E9" className="opacity-70" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function useSpeechSynthesis() {
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);
  const utterRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const ptVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("pt"));
      voiceRef.current =
        ptVoices.find((v) => /female|mulher|luciana|maria|fernanda/i.test(v.name)) ||
        ptVoices[0] ||
        voices[0] ||
        null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }, [supported]);

  const speak = (text, { onBoundary, onEnd } = {}) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.lang = "pt-BR";
    utter.pitch = 1.35;
    utter.rate = 0.92;
    utter.volume = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => {
      setSpeaking(false);
      onEnd && onEnd();
    };
    utter.onerror = () => setSpeaking(false);
    if (onBoundary) {
      utter.onboundary = (e) => {
        if (e.name === "word" || e.name === undefined) {
          const end = e.charIndex + (e.charLength || 1);
          onBoundary(end);
        }
      };
    }
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { supported, speaking, speak, stop };
}

function NarrationScreen({ theme, node, loading, error, voiceEnabled, onToggleVoice, onHome, onParent, onChoicesReady }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);
  const { supported: ttsSupported, speaking, speak, stop } = useSpeechSynthesis();

  useEffect(() => {
    if (!node) return;
    setShown("");
    setDone(false);
    idxRef.current = 0;
    const text = node.text;

    if (voiceEnabled && ttsSupported) {
      speak(text, {
        onBoundary: (upTo) => setShown(text.slice(0, upTo)),
        onEnd: () => {
          setShown(text);
          setDone(true);
        },
      });
      return () => stop();
    }

    const interval = setInterval(() => {
      idxRef.current += 2;
      setShown(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, voiceEnabled]);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: theme.sky }}>
      <TopBar onHome={onHome} onParent={onParent} title={theme.label} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <StoryOrb active={loading || speaking || !done} glow={theme.glow} />
        {loading && (
          <p className="font-display text-[#FFF6E9]/80 text-lg text-center">A história está sendo tecida...</p>
        )}
        {error && (
          <div className="flex items-center gap-2 text-[#FFD84D] text-sm font-nunito font-bold text-center px-4">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {!loading && node && (
          <p className="font-display text-[#FFF6E9] text-2xl leading-snug text-center min-h-[100px] drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">
            {shown}
            {!done && <span className="opacity-50">▍</span>}
          </p>
        )}
      </div>

      <div className="px-6 pb-8 flex flex-col items-center gap-3">
        {!loading && done && node?.choices?.length > 0 && (
          <button
            onClick={onChoicesReady}
            className="w-full py-4 rounded-2xl font-display text-xl text-[#241F3D] flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg"
            style={{ background: `linear-gradient(135deg,#FFD84D,${theme.glow})` }}
          >
            O que vem agora? <ChevronRight size={20} />
          </button>
        )}
        {!loading && done && node?.chapterEnd && (
          <div className="text-[#FFF6E9]/60 text-xs font-nunito flex items-center gap-1">
            <Star size={12} /> capítulo concluído
          </div>
        )}
        <div className="flex items-center gap-3">
          {!loading && done && ttsSupported && (
            <button
              onClick={() => speak(node.text, { onBoundary: (upTo) => setShown(node.text.slice(0, upTo)), onEnd: () => setDone(true) })}
              className="p-2 rounded-full bg-white/15 active:scale-95 transition"
              title="Ouvir de novo"
            >
              <Volume2 size={16} className="text-[#FFF6E9]" />
            </button>
          )}
          <button
            onClick={onToggleVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 active:scale-95 transition"
          >
            {voiceEnabled ? <Volume2 size={14} className="text-[#FFF6E9]" /> : <VolumeX size={14} className="text-[#FFF6E9]/50" />}
            <span className="text-[#FFF6E9]/70 text-[11px] font-nunito font-bold">
              {!ttsSupported ? "Voz indisponível" : voiceEnabled ? "Voz ligada" : "Voz desligada"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function useSpeechRecognition(lang = "pt-BR") {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => rec.stop();
  }, [lang]);

  const start = () => {
    if (!recRef.current) return;
    setTranscript("");
    setListening(true);
    try {
      recRef.current.start();
    } catch (e) {
      /* already started */
    }
  };
  const stop = () => {
    if (!recRef.current) return;
    recRef.current.stop();
    setListening(false);
  };

  return { supported, listening, transcript, start, stop, setTranscript };
}

function ChoiceScreen({ theme, node, onChoose, voiceEnabled }) {
  const [freeOpen, setFreeOpen] = useState(false);
  const [freeText, setFreeText] = useState("");
  const { supported, listening, transcript, start, stop, setTranscript } = useSpeechRecognition();
  const { speak: ttsSpeak, stop: ttsStop } = useSpeechSynthesis();

  useEffect(() => {
    if (transcript) setFreeText(transcript);
  }, [transcript]);

  useEffect(() => {
    if (!freeOpen && voiceEnabled) {
      const optionsText = node.choices.map((c, i) => `Opção ${i + 1}: ${c.label}.`).join(" ");
      ttsSpeak(`O que acontece agora? ${optionsText}`);
    }
    if (freeOpen && voiceEnabled) {
      ttsSpeak("Conte sua ideia!");
    }
    return () => ttsStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeOpen, voiceEnabled]);

  if (freeOpen) {
    return (
      <div className="w-full h-full flex flex-col px-5 pt-10 pb-8" style={{ background: theme.sky }}>
        <p className="text-center font-display text-[#FFF6E9] text-2xl mb-4">Conte sua ideia</p>

        <div className="flex flex-col items-center gap-3 mb-4">
          <button
            onClick={() => { ttsStop(); listening ? stop() : start(); }}
            disabled={!supported}
            className="w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition disabled:opacity-30"
            style={{
              background: listening ? "#F2665E" : theme.glow,
              boxShadow: listening ? "0 0 0 10px rgba(242,102,94,0.25)" : `0 0 20px ${theme.glow}88`,
            }}
          >
            <Mic size={28} className="text-[#241F3D]" />
          </button>
          <span className="text-[#FFF6E9]/70 text-xs font-nunito">
            {!supported
              ? "Microfone não disponível neste navegador — pode digitar embaixo"
              : listening
              ? "Estou ouvindo... toque para parar"
              : "Toque no microfone e fale"}
          </span>
        </div>

        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="...ou digite aqui"
          className="flex-1 rounded-2xl p-4 bg-white/10 text-[#FFF6E9] font-nunito text-sm outline-none resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { stop(); setTranscript(""); setFreeText(""); setFreeOpen(false); }}
            className="flex-1 py-3 rounded-2xl font-baloo text-[#FFF6E9] bg-white/10"
          >
            Voltar
          </button>
          <button
            disabled={!freeText.trim()}
            onClick={() => { stop(); onChoose(freeText.trim()); }}
            className="flex-1 py-3 rounded-2xl font-baloo text-[#241F3D] flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: theme.glow }}
          >
            <Send size={16} /> Enviar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col px-5 pt-10 pb-8" style={{ background: theme.sky }}>
      <p className="text-center font-display text-[#FFF6E9] text-2xl mb-5">O que acontece agora?</p>
      <div className="flex-1 flex flex-col gap-3">
        {node.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => { ttsStop(); onChoose(c.label); }}
            className="w-full py-5 px-4 rounded-2xl font-display text-[#FFF6E9] text-xl text-left flex items-center gap-3 active:scale-[0.98] transition shadow-md"
            style={{ background: "rgba(255,255,255,0.16)", border: `2px solid ${theme.glow}88` }}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ background: theme.glow, color: "#241F3D" }}
            >
              {i + 1}
            </span>
            {c.label}
          </button>
        ))}
        <button
          className="w-full py-4 px-4 rounded-2xl font-display text-lg text-left flex items-center gap-3 active:scale-[0.98] transition mt-1"
          style={{ background: `${theme.glow}33`, border: `2px dashed ${theme.glow}aa`, color: "#FFF6E9" }}
          onClick={() => { ttsStop(); setFreeOpen(true); }}
        >
          <Sparkles size={20} color="#FFD84D" /> Ter minha própria ideia
        </button>
      </div>
    </div>
  );
}

function usePin() {
  const [pin, setPinState] = useState(() => {
    try {
      return localStorage.getItem("hm_parent_pin") || "1234";
    } catch (e) {
      return "1234";
    }
  });
  const setPin = (newPin) => {
    setPinState(newPin);
    try {
      localStorage.setItem("hm_parent_pin", newPin);
    } catch (e) {
      /* localStorage indisponível, PIN só dura a sessão */
    }
  };
  return [pin, setPin];
}

function ParentPanel({ onClose, voiceEnabled, onToggleVoice }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [correct, setCorrect] = usePin();
  const [loginError, setLoginError] = useState(false);

  const [changingPin, setChangingPin] = useState(false);
  const [currentPinField, setCurrentPinField] = useState("");
  const [newPinField, setNewPinField] = useState("");
  const [confirmPinField, setConfirmPinField] = useState("");
  const [pinChangeMsg, setPinChangeMsg] = useState("");

  const tryUnlock = () => {
    if (pinInput === correct) {
      setUnlocked(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const savePinChange = () => {
    setPinChangeMsg("");
    if (currentPinField !== correct) {
      setPinChangeMsg("PIN atual incorreto.");
      return;
    }
    if (!/^\d{4}$/.test(newPinField)) {
      setPinChangeMsg("O novo PIN precisa ter 4 números.");
      return;
    }
    if (newPinField !== confirmPinField) {
      setPinChangeMsg("Os PINs não coincidem.");
      return;
    }
    setCorrect(newPinField);
    setPinChangeMsg("PIN alterado com sucesso!");
    setChangingPin(false);
    setCurrentPinField("");
    setNewPinField("");
    setConfirmPinField("");
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: "#151225ee", backdropFilter: "blur(2px)" }}>
      <div className="flex justify-between items-center px-5 pt-8 pb-2">
        <span className="font-baloo text-[#FFF6E9] text-base">Área dos pais</span>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10">
          <X size={16} className="text-[#FFF6E9]" />
        </button>
      </div>

      {!unlocked ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
          <Lock size={28} className="text-[#F4B860]" />
          <p className="text-[#FFF6E9]/70 text-sm font-nunito text-center">Digite o PIN dos pais</p>
          <input
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setLoginError(false); }}
            maxLength={4}
            inputMode="numeric"
            placeholder="••••"
            className="w-28 text-center tracking-[0.5em] py-2 rounded-xl bg-white/10 text-[#FFF6E9] font-baloo text-lg outline-none"
          />
          {loginError && <span className="text-[#FF8FA0] text-xs font-nunito">PIN incorreto, tente de novo.</span>}
          <button
            onClick={tryUnlock}
            className="px-6 py-2 rounded-xl font-baloo text-[#241F3D]"
            style={{ background: "#F4B860" }}
          >
            Entrar
          </button>
        </div>
      ) : (
        <div className="flex-1 px-5 pb-6 flex flex-col gap-4 overflow-y-auto">
          <div className="rounded-2xl p-4 bg-white/5 flex items-center gap-3">
            <Clock size={18} className="text-[#6FB88A]" />
            <div>
              <div className="text-[#FFF6E9] font-baloo text-sm">18 min hoje</div>
              <div className="text-[#FFF6E9]/50 text-xs font-nunito">Limite diário: 30 min</div>
            </div>
          </div>
          <div className="rounded-2xl p-4 bg-white/5">
            <div className="text-[#FFF6E9] font-baloo text-sm mb-2">Preferências</div>
            <label className="flex items-center justify-between text-[#FFF6E9]/80 text-xs font-nunito py-1">
              Microfone da criança <input type="checkbox" defaultChecked disabled />
            </label>
            <label className="flex items-center justify-between text-[#FFF6E9]/80 text-xs font-nunito py-1">
              Narração por voz <input type="checkbox" checked={voiceEnabled} onChange={onToggleVoice} />
            </label>
          </div>

          <div className="rounded-2xl p-4 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[#FFF6E9] font-baloo text-sm">PIN dos pais</div>
              <button
                onClick={() => { setChangingPin((v) => !v); setPinChangeMsg(""); }}
                className="text-[#F4B860] text-xs font-nunito font-bold"
              >
                {changingPin ? "Cancelar" : "Alterar"}
              </button>
            </div>

            {changingPin && (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="password"
                  value={currentPinField}
                  onChange={(e) => setCurrentPinField(e.target.value)}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="PIN atual"
                  className="w-full text-center tracking-[0.3em] py-2 rounded-xl bg-white/10 text-[#FFF6E9] font-baloo text-sm outline-none"
                />
                <input
                  type="password"
                  value={newPinField}
                  onChange={(e) => setNewPinField(e.target.value)}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="Novo PIN (4 números)"
                  className="w-full text-center tracking-[0.3em] py-2 rounded-xl bg-white/10 text-[#FFF6E9] font-baloo text-sm outline-none"
                />
                <input
                  type="password"
                  value={confirmPinField}
                  onChange={(e) => setConfirmPinField(e.target.value)}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="Confirmar novo PIN"
                  className="w-full text-center tracking-[0.3em] py-2 rounded-xl bg-white/10 text-[#FFF6E9] font-baloo text-sm outline-none"
                />
                {pinChangeMsg && (
                  <span className="text-xs font-nunito text-center" style={{ color: pinChangeMsg.includes("sucesso") ? "#6FB88A" : "#FF8FA0" }}>
                    {pinChangeMsg}
                  </span>
                )}
                <button
                  onClick={savePinChange}
                  className="w-full py-2 rounded-xl font-baloo text-[#241F3D] text-sm"
                  style={{ background: "#F4B860" }}
                >
                  Salvar novo PIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- App root ----------
function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="relative w-full max-w-[420px] min-h-screen sm:min-h-[850px] sm:max-h-[850px] sm:rounded-[2.5rem] overflow-hidden bg-[#1a0f2e] shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home | themes | narration | choice
  const [theme, setTheme] = useState(THEMES[0]);
  const [history, setHistory] = useState([]);
  const [node, setNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showParent, setShowParent] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const fetchNext = useCallback(async (t, hist, action) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callNarrator({ themeLabel: t.label, history: hist, action });
      setNode(result);
      setHistory([...hist, result.text]);
    } catch (e) {
      setError("A história soneca por um instante. Tente de novo em breve.");
    } finally {
      setLoading(false);
    }
  }, []);

  const startTheme = (t) => {
    setTheme(t);
    setHistory([]);
    setNode(null);
    setScreen("narration");
    fetchNext(t, [], "Começar a aventura");
  };

  const goHome = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setScreen("home");
    setHistory([]);
    setNode(null);
    setError(null);
  };

  const handleChoose = (actionLabel) => {
    setNode(null);
    setScreen("narration");
    fetchNext(theme, history, actionLabel);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-10 px-4" style={{ background: "#1a0e33" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        .font-baloo { font-family: 'Baloo 2', cursive; }
        .font-nunito { font-family: 'Nunito', sans-serif; }
        .font-display { font-family: 'Fredoka', 'Baloo 2', cursive; font-weight: 600; }
      `}</style>

      <PhoneFrame>
        <div className="relative w-full h-full font-nunito">
          {screen === "home" && (
            <HomeScreen onNew={() => setScreen("themes")} onParent={() => setShowParent(true)} voiceEnabled={voiceEnabled} />
          )}
          {screen === "themes" && (
            <ThemePicker onBack={goHome} onPick={startTheme} voiceEnabled={voiceEnabled} />
          )}
          {screen === "narration" && (
            <NarrationScreen
              theme={theme}
              node={node}
              loading={loading}
              error={error}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled((v) => !v)}
              onHome={goHome}
              onParent={() => setShowParent(true)}
              onChoicesReady={() => setScreen("choice")}
            />
          )}
          {screen === "choice" && node && (
            <ChoiceScreen theme={theme} node={node} onChoose={handleChoose} voiceEnabled={voiceEnabled} />
          )}
          {showParent && <ParentPanel onClose={() => setShowParent(false)} voiceEnabled={voiceEnabled} onToggleVoice={() => setVoiceEnabled((v) => !v)} />}
 </div>
      </PhoneFrame>
    </div>
  );
}
