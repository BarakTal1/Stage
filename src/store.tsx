import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  CardColor, DEFAULT_CHOICE, DEF, ExId, INITIAL_EX, Lang, S, SeriesKey, Strings, THEMES, Theme, ThemeKey,
  WORKOUTS, WorkoutKey, fmt, workoutIds,
} from './data';

export type Screen = 'home' | 'log' | 'summary' | 'share' | 'progress' | 'board' | 'settings';
export const TAB_SCREENS: Screen[] = ['home', 'progress', 'board', 'settings'];

type Ctx = {
  lang: Lang; he: boolean; s: Strings; setLang: (l: Lang) => void;
  themeKey: ThemeKey; t: Theme; setTheme: (k: ThemeKey) => void;
  screen: Screen; go: (s: Screen) => void;
  frame: boolean;
  ex: Record<ExId, { w: number; r: number }>;
  bump: (id: ExId, key: 'w' | 'r', d: number) => void;
  wk: WorkoutKey; setWk: (w: WorkoutKey) => void; focus: string; prev: number; prevDate: string;
  choice: ExId; setChoice: (id: ExId) => void;
  ids: ExId[]; total: number; pct: number;
  prs: { id: ExId; name: string; w: string; delta: string }[];
  chartEx: SeriesKey; setChartEx: (k: SeriesKey) => void;
  hidden: boolean; toggleHidden: () => void;
  shareMode: 'full' | 'clear'; setShareMode: (m: 'full' | 'clear') => void;
  cardColor: CardColor; setCardColor: (c: CardColor) => void;
  cardLang: Lang; setCardLang: (l: Lang) => void;
  clearInk: 'light' | 'dark'; setClearInk: (i: 'light' | 'dark') => void;
  toast: string | null; showToast: (msg: string) => void;
};

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ frame, children }: { frame: boolean; children: React.ReactNode }) {
  const [lang, setLangRaw] = useState<Lang>('he');
  const [themeKey, setThemeRaw] = useState<ThemeKey>('red');
  const [screen, setScreen] = useState<Screen>('home');
  const [ex, setEx] = useState(INITIAL_EX);
  const [wk, setWk] = useState<WorkoutKey>('B');
  const [choices, setChoices] = useState(DEFAULT_CHOICE);
  const [chartEx, setChartEx] = useState<SeriesKey>('rdl');
  const [hidden, setHidden] = useState(false);
  const [shareMode, setShareMode] = useState<'full' | 'clear'>('full');
  const [cardColorRaw, setCardColor] = useState<CardColor | null>(null);
  const [cardLangRaw, setCardLang] = useState<Lang | null>(null);
  const [clearInk, setClearInk] = useState<'light' | 'dark'>('dark');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const he = lang === 'he';
  const s = S[lang];
  const t = THEMES[themeKey];

  const bump = useCallback((id: ExId, key: 'w' | 'r', d: number) => {
    setEx(cur => {
      const next = cur[id][key] + d;
      if (next < (key === 'w' ? 0 : 1)) return cur;
      return { ...cur, [id]: { ...cur[id], [key]: next } };
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo<Ctx>(() => {
    const choice = choices[wk];
    const { prev, prevDate } = WORKOUTS[wk];
    const ids = workoutIds(wk, choice);
    const total = ids.reduce((a, id) => a + ex[id].w * ex[id].r * 3, 0);
    const pct = Math.round((total / prev - 1) * 100);
    const prs = ids
      .filter(id => ex[id].w > DEF[id].lw)
      .sort((a, b) => ex[b].w / DEF[b].lw - ex[a].w / DEF[a].lw)
      .map(id => ({ id, name: DEF[id][lang], w: fmt(ex[id].w), delta: '+' + fmt(ex[id].w - DEF[id].lw) }));
    return {
      lang, he, s, t, themeKey, screen, frame, ex, bump, choice, ids, total, pct, prs,
      wk, setWk, focus: WORKOUTS[wk].focus[lang], prev, prevDate,
      setChoice: (id: ExId) => setChoices(c => ({ ...c, [wk]: id })),
      setLang: (l: Lang) => { setLangRaw(l); setCardLang(null); },
      setTheme: (k: ThemeKey) => { setThemeRaw(k); setCardColor(null); },
      go: setScreen,
      chartEx, setChartEx,
      hidden, toggleHidden: () => setHidden(h => !h),
      shareMode, setShareMode,
      cardColor: cardColorRaw ?? t.card, setCardColor,
      cardLang: cardLangRaw ?? lang, setCardLang,
      clearInk, setClearInk,
      toast, showToast,
    };
  }, [lang, he, s, t, themeKey, screen, frame, ex, bump, wk, choices, chartEx, hidden, shareMode,
      cardColorRaw, cardLangRaw, clearInk, toast, showToast]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
