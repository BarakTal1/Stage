import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Gender, useAuth } from './auth';
import { loadLists, saveEquiv, saveRanks, saveRules } from './lists';
import {
  EQUIV_DEFAULT, EquivItem, INITIAL_POINTS, MOCK_STREAK_WEEKS, RANKS_DEFAULT, RULES_DEFAULT, Rank, RuleKey, pickEquiv, rankFor,
  CardColor, DEFAULT_VARIANT, DEF, ExId, Intensity, Lang, S, SeriesKey, SetRow, Strings, THEMES, Theme, ThemeKey,
  Period, Role, Variant, WORKOUTS, WorkoutKey, fmt, initialSets, repRange, workoutIds,
} from './data';

export type Screen = 'home' | 'log' | 'summary' | 'share' | 'progress' | 'board' | 'settings' | 'coach' | 'admin' | 'profile';
export const TAB_SCREENS: Screen[] = ['home', 'progress', 'board', 'settings'];

type Ctx = {
  lang: Lang; he: boolean; s: Strings; setLang: (l: Lang) => void;
  themeKey: ThemeKey; t: Theme; setTheme: (k: ThemeKey) => void;
  screen: Screen; go: (s: Screen) => void;
  frame: boolean;
  ex: Record<ExId, SetRow[]>;
  bump: (id: ExId, set: number, key: 'w' | 'r', d: number) => void;
  setWeight: (id: ExId, set: number, w: number) => void;
  intensity: Record<string, Intensity>; setIntensity: (part: number, v: Intensity) => void;
  /** The exercise shown in the place of `orig`: the coach's swap, or `orig` itself. */
  resolve: (orig: ExId) => ExId;
  swapEx: (orig: ExId, to: ExId | null) => void;
  rangeFor: (id: ExId) => [number, number];
  wk: WorkoutKey; setWk: (w: WorkoutKey) => void; focus: string; prev: number; prevDate: string;
  variant: Variant; setVariant: (v: Variant) => void;
  ids: ExId[]; total: number; pct: number;
  prs: { id: ExId; name: string; w: string; delta: string }[];
  chartEx: SeriesKey; setChartEx: (k: SeriesKey) => void;
  hidden: boolean; toggleHidden: () => void;
  period: Period; setPeriod: (p: Period) => void;
  /** The screen role: coaches and admins both see the coach screens. */
  role: Role; isAdmin: boolean;
  // Editable lists: the studio changes them in the admin screen.
  equivItems: EquivItem[]; setEquivItems: (v: EquivItem[]) => void;
  /** The ranks for the signed-in user's gender. */
  ranks: Rank[]; rankLists: Record<Gender, Rank[]>; setRankList: (g: Gender, v: Rank[]) => void;
  rules: Record<RuleKey, number>; setRules: (v: Record<RuleKey, number>) => void;
  roll: number; rollEquiv: () => void; equivFor: (total: number) => EquivItem | null;
  points: number; earned: { workout: number; pr: number; streak: number; share: number; total: number } | null;
  saveWorkout: () => void; awardShare: () => void;
  rankUp: Rank | null; dismissRankUp: () => void;
  photo: string | null; setPhoto: (uri: string | null) => void;
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
  const [ex, setEx] = useState(initialSets);
  const [wk, setWk] = useState<WorkoutKey>('B');
  const [variants, setVariants] = useState(DEFAULT_VARIANT);
  const [swaps, setSwaps] = useState<Record<string, ExId>>({});
  const [intensity, setIntensityRaw] = useState<Record<string, Intensity>>({});
  const [chartEx, setChartEx] = useState<SeriesKey>('rdl');
  // Sharing on the boards is opt-in, so the trainee starts hidden.
  const [hidden, setHidden] = useState(true);
  const [period, setPeriod] = useState<Period>('workout');
  const { session, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const role: Role = profile && profile.role !== 'trainee' ? 'coach' : 'trainee';
  const [equivItems, setEquivRaw] = useState(EQUIV_DEFAULT);
  const [rankLists, setRankLists] = useState<Record<Gender, Rank[]>>({ male: RANKS_DEFAULT, female: RANKS_DEFAULT });
  const ranks = rankLists[profile?.gender ?? 'male'];
  const [rules, setRulesRaw] = useState(RULES_DEFAULT);
  const [roll, setRoll] = useState(Math.random);
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [earned, setEarned] = useState<Ctx['earned']>(null);
  const [rankUp, setRankUp] = useState<Rank | null>(null);
  const live = useRef({ points: INITIAL_POINTS, ranks: RANKS_DEFAULT, saved: false, shared: false });
  live.current.ranks = ranks;
  const [photo, setPhoto] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<'full' | 'clear'>('full');
  const [cardColorRaw, setCardColor] = useState<CardColor | null>(null);
  const [cardLangRaw, setCardLang] = useState<Lang | null>(null);
  const [clearInk, setClearInk] = useState<'light' | 'dark'>('dark');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const he = lang === 'he';
  const s = S[lang];
  const t = THEMES[themeKey];

  const patchSet = useCallback((id: ExId, set: number, fn: (row: SetRow) => SetRow | null) => {
    setEx(cur => {
      const row = fn(cur[id][set]);
      if (!row) return cur;
      return { ...cur, [id]: cur[id].map((r, i) => (i === set ? row : r)) };
    });
  }, []);

  const resolve = useCallback((orig: ExId) => swaps[`${wk}:${orig}`] ?? orig, [swaps, wk]);

  const swapEx = useCallback((orig: ExId, to: ExId | null) => {
    setSwaps(cur => {
      const next = { ...cur };
      if (to === null || to === orig) delete next[`${wk}:${orig}`];
      else next[`${wk}:${orig}`] = to;
      return next;
    });
  }, [wk]);

  // A swapped-in exercise keeps the rep range of the exercise it replaced.
  const rangeFor = useCallback((id: ExId): [number, number] => {
    const hit = Object.entries(swaps).find(([k, v]) => k.startsWith(`${wk}:`) && v === id);
    return repRange(wk, hit ? (hit[0].split(':')[1] as ExId) : id);
  }, [swaps, wk]);

  const bump = useCallback((id: ExId, set: number, key: 'w' | 'r', d: number) => {
    const [lo, hi] = rangeFor(id);
    patchSet(id, set, row => {
      const next = row[key] + d;
      if (key === 'w' ? next < 0 : next < lo || next > hi) return null;
      return { ...row, [key]: next };
    });
  }, [rangeFor, patchSet]);

  // The weight is free: any value from the keyboard is allowed.
  const setWeight = useCallback((id: ExId, set: number, w: number) => {
    patchSet(id, set, row => (w < 0 ? null : { ...row, w }));
  }, [patchSet]);

  // Adds points and shows the rank-up notice when the trainee reaches a higher rank.
  const award = useCallback((n: number) => {
    const before = live.current.points, after = before + n;
    live.current.points = after;
    setPoints(after);
    const a = rankFor(before, live.current.ranks), b = rankFor(after, live.current.ranks);
    if (b.idx > a.idx) setRankUp(b.rank);
  }, []);

  const setIntensity = useCallback((part: number, v: Intensity) => {
    setIntensityRaw(cur => ({ ...cur, [`${wk}:${part}`]: v }));
  }, [wk]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // Lists: load from the database after sign-in. The admin saves each change after a short pause.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) return;
    let live = true;
    loadLists().then(l => {
      if (!live) return;
      if (l.equiv) setEquivRaw(l.equiv);
      setRankLists(cur => ({ ...cur, ...l.ranks }));
      if (l.rules) setRulesRaw(l.rules);
    });
    return () => { live = false; };
  }, [userId]);

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const persist = useCallback((name: string, run: () => Promise<string | null>) => {
    if (!isAdmin) return;
    clearTimeout(timers.current[name]);
    timers.current[name] = setTimeout(async () => {
      const err = await run();
      if (err) showToast(`${S[lang].saveFailed}: ${err}`);
    }, 700);
  }, [isAdmin, lang, showToast]);
  const setEquivItems = useCallback((v: EquivItem[]) => { setEquivRaw(v); persist('equiv', () => saveEquiv(v)); }, [persist]);
  const setRankList = useCallback((g: Gender, v: Rank[]) => {
    setRankLists(cur => ({ ...cur, [g]: v }));
    persist('ranks-' + g, () => saveRanks(g, v));
  }, [persist]);
  const setRules = useCallback((v: Record<RuleKey, number>) => { setRulesRaw(v); persist('rules', () => saveRules(v)); }, [persist]);

  const value = useMemo<Ctx>(() => {
    const variant = variants[wk];
    const { prev, prevDate } = WORKOUTS[wk];
    const ids = workoutIds(wk, variant).map(resolve);
    const total = ids.reduce((a, id) => a + ex[id].reduce((b, row) => b + row.w * row.r, 0), 0);
    const pct = Math.round((total / prev - 1) * 100);
    const top = (id: ExId) => Math.max(...ex[id].map(row => row.w));
    const prs = ids
      .filter(id => top(id) > DEF[id].lw)
      .sort((a, b) => top(b) / DEF[b].lw - top(a) / DEF[a].lw)
      .map(id => ({ id, name: DEF[id][lang], w: fmt(top(id)), delta: '+' + fmt(top(id) - DEF[id].lw) }));
    return {
      lang, he, s, t, themeKey, screen, frame, ex, bump, setWeight, intensity, setIntensity, resolve, swapEx, rangeFor, variant, ids, total, pct, prs,
      wk, setWk, focus: WORKOUTS[wk].focus[lang], prev, prevDate,
      setVariant: (v: Variant) => setVariants(c => ({ ...c, [wk]: v })),
      setLang: (l: Lang) => { setLangRaw(l); setCardLang(null); },
      setTheme: (k: ThemeKey) => { setThemeRaw(k); setCardColor(null); },
      go: (sc: Screen) => { if (sc === 'home') live.current.saved = false; setScreen(sc); },
      chartEx, setChartEx,
      hidden, toggleHidden: () => setHidden(h => !h),
      period, setPeriod, role, isAdmin, photo, setPhoto,
      equivItems, setEquivItems, ranks, rankLists, setRankList, rules, setRules,
      roll, rollEquiv: () => setRoll(Math.random()), equivFor: (tot: number) => pickEquiv(equivItems, tot, roll),
      points, earned, rankUp, dismissRankUp: () => setRankUp(null),
      // Points come once for each saved workout. A new workout starts when the trainee goes home.
      saveWorkout: () => {
        if (live.current.saved) return;
        live.current.saved = true; live.current.shared = false;
        const e = { workout: rules.workout, pr: prs.length * rules.pr, streak: MOCK_STREAK_WEEKS * rules.streak, share: 0, total: 0 };
        e.total = e.workout + e.pr + e.streak;
        setEarned(e);
        award(e.total);
      },
      awardShare: () => {
        if (!live.current.saved || live.current.shared) return;
        live.current.shared = true;
        setEarned(e => (e ? { ...e, share: rules.share, total: e.total + rules.share } : e));
        award(rules.share);
      },
      shareMode, setShareMode,
      cardColor: cardColorRaw ?? t.card, setCardColor,
      cardLang: cardLangRaw ?? lang, setCardLang,
      clearInk, setClearInk,
      toast, showToast,
    };
  }, [lang, he, s, t, themeKey, screen, frame, ex, bump, setWeight, intensity, setIntensity, resolve, swapEx, rangeFor, wk, variants, chartEx, hidden, period, role, isAdmin, photo, equivItems, ranks, rankLists, rules, setEquivItems, setRankList, setRules, roll, points, earned, rankUp, award, shareMode,
      cardColorRaw, cardLangRaw, clearInk, toast, showToast]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
