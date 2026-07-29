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
