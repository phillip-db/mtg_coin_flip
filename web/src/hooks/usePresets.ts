import { useState, useCallback, useEffect } from "react";
import type { Preset, SimConfig } from "../types";

const STORAGE_KEY = "mtg_coin_flip_presets";

function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: Preset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export default function usePresets() {
  const [presets, setPresets] = useState<Preset[]>(loadPresets);

  useEffect(() => {
    savePresets(presets);
  }, [presets]);

  const addPreset = useCallback((name: string, config: SimConfig) => {
    setPresets((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, config },
    ]);
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { presets, addPreset, deletePreset };
}
