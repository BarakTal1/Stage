import React from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import {
  BOARD_PCTS, CARD_COLORS, CardColor, DATES, DEF, ExId, Lang, SERIES, SeriesKey, THEMES, ThemeKey, WEEKS, WORKOUTS, WorkoutKey, fmt,
} from './data';
import { useApp } from './store';
import { ShareCard } from './ShareCard';
import {
  Btn, Chev, CloseX, ICON_BLACK, ICON_RATIO, ICON_WHITE, Image, Page, PreviewBg, Segmented, T, TabBar,
} from './ui';

const scrollStyle = (extra: object = {}) => ({ flex: 1 as const, ...extra });

// ---------------------------------------------------------------- Home
export function Home() {
  const { s, t, go, lang, wk, setWk, focus } = useApp();
  const segs = Array.from({ length: 12 }, (_, i) => ({ l: i === 7 ? wk : i % 2 ? 'B' : 'A', done: i < 7, today: i === 7 }));
  const slotName = (sl: ExId | ExId[], choiceLabel?: { he: string; en: string }) =>
    Array.isArray(sl) ? (choiceLabel ?? { he: '', en: '' })[lang] : DEF[sl][lang];
  const parts = WORKOUTS[wk].parts.map((p, i) => ({
    num: '0' + (i + 1),
    label: i === 2 ? s.superset3 : s.superset,
    a: slotName(p.slots[0], p.choiceLabel),
    b: slotName(p.slots[1]),
    line: i < 2,
  }));
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 16, gap: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <View style={{ gap: 4, flex: 1 }}>
            <T s={14} lh={1.3}>{s.dateLong}</T>
            <T k="head" s={30} lh={1.1}>{s.hello}</T>
          </View>
          <Image source={t.icon === 'black' ? ICON_BLACK : ICON_WHITE} contentFit="contain" style={{ width: 58, height: 58 / ICON_RATIO, margin: 8 }} />
        </View>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <T w={700} s={15}>{s.cycle}</T>
            <T s={14}><T k="num" w={800} s={14}>7</T> {s.cycleCount}</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {segs.map((g, i) => (
              <View key={i} style={{
                flex: 1, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
                backgroundColor: g.done ? t.ink : g.today ? t.acc : 'transparent',
                borderWidth: g.done || g.today ? 0 : 1.5, borderColor: t.ink,
              }}>
                <T k="num" w={g.today ? 800 : 500} s={11} c={g.done ? t.bg : g.today ? t.onAcc : t.ink}>{g.l}</T>
              </View>
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <T w={700} s={15}>{s.pickWorkout}</T>
          <Segmented
            value={wk} onChange={(k: WorkoutKey) => setWk(k)} ink={t.ink} bg={t.bg} h={44} size={16}
            options={(['A', 'B'] as WorkoutKey[]).map(k => ({ key: k, label: `${k} · ${WORKOUTS[k].focus[lang]}` }))}
          />
        </View>
        <View style={{ backgroundColor: t.block, borderRadius: 20, paddingTop: 20, paddingHorizontal: 22, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <View style={{ gap: 8, flex: 1 }}>
            <T w={500} s={14} c={t.onBlock}>{s.today}</T>
            <T k="head" s={46} c={t.onBlock} lh={1}>{focus}</T>
            <T s={14} c={t.onBlock}>{s.meta}</T>
          </View>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <T w={500} s={14} c={t.onBlock}>{s.workout}</T>
            <T k="num" w={800} s={112} c={t.onBlock} lh={0.8}>{wk}</T>
          </View>
        </View>
        <View>
          {parts.map(p => (
            <View key={p.num} style={{ flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: p.line ? 1 : 0, borderBottomColor: t.ink }}>
              <T k="num" w={800} s={22} style={{ width: 34 }}>{p.num}</T>
              <View style={{ gap: 3, flex: 1 }}>
                <T s={13}>{p.label}</T>
                <T w={500} s={16} lh={1.35}>{p.a}</T>
                <T w={500} s={16} lh={1.35}>{p.b}</T>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 14 }}>
        <Btn onPress={() => go('log')} style={{ height: 60, borderRadius: 16, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={18} c={t.onAcc}>{s.cta}</T>
        </Btn>
      </View>
      <TabBar />
    </Page>
  );
}

// ---------------------------------------------------------------- Log weights
function Stepper({ value, unit, onDec, onInc, flex, btnW }: {
  value: string; unit: string; onDec: () => void; onInc: () => void; flex: number; btnW: number;
}) {
  const { t } = useApp();
  return (
    <View style={{ flex, height: 58, borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, flexDirection: 'row', alignItems: 'center' }}>
      <Btn onPress={onDec} style={{ width: btnW, height: '100%', alignItems: 'center', justifyContent: 'center' }} label="−">
        <T k="num" w={800} s={24}>−</T>
      </Btn>
      <View style={{ flex: 1, alignItems: 'center', gap: 1 }}>
        <T k="num" w={800} s={24} lh={1}>{value}</T>
        <T s={12} lh={1}>{unit}</T>
      </View>
      <Btn onPress={onInc} style={{ width: btnW, height: '100%', alignItems: 'center', justifyContent: 'center' }} label="+">
        <T k="num" w={800} s={24}>+</T>
      </Btn>
    </View>
  );
}

function ExCard({ id, choiceOf }: { id: ExId; choiceOf?: ExId[] }) {
  const { s, t, lang, ex, bump, choice, setChoice } = useApp();
  const def = DEF[id], v = ex[id];
  const up = v.w > def.lw;
  return (
    <View style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 16, paddingTop: 14, paddingHorizontal: 14, paddingBottom: 12, gap: 12 }}>
      {choiceOf ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {choiceOf.map(o => {
            const on = o === choice;
            return (
              <Btn key={o} onPress={() => setChoice(o)} style={{
                flex: 1, minHeight: 52, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, justifyContent: 'center',
                backgroundColor: on ? t.ink : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: t.ink,
              }}>
                <T w={on ? 700 : 500} s={14} lh={1.25} c={on ? t.bg : t.ink}>{DEF[o][lang]}</T>
              </Btn>
            );
          })}
        </View>
      ) : (
        <T w={700} s={17} lh={1.3}>{def[lang]}</T>
      )}
      <T s={14} style={{ marginTop: -6 }}>
        {s.lastTime} <T k="num" w={500} s={14}>{`${fmt(def.lw)} ${s.kg} × ${def.lr}`}</T>
      </T>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stepper flex={1.35} btnW={48} value={fmt(v.w)} unit={s.kg} onDec={() => bump(id, 'w', -def.step)} onInc={() => bump(id, 'w', def.step)} />
        <Stepper flex={1} btnW={44} value={String(v.r)} unit={s.reps} onDec={() => bump(id, 'r', -1)} onInc={() => bump(id, 'r', 1)} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 16 }}>
        <T s={13}>{s.sets}</T>
        {up && (
          <T w={700} s={13} c={t.accText}>{s.upPre} <T k="num" w={800} s={13} c={t.accText}>{fmt(v.w - def.lw)}</T> {s.kg}</T>
        )}
      </View>
    </View>
  );
}

export function Log() {
  const { s, t, go, choice, total, frame, wk, focus } = useApp();
  const parts = WORKOUTS[wk].parts.map((p, i) => ({
    num: '0' + (i + 1),
    title: i === 2 ? s.superset3 : s.superset,
    items: p.slots.map(sl => (Array.isArray(sl) ? { id: choice, choiceOf: sl } : { id: sl, choiceOf: undefined as ExId[] | undefined })),
  }));
  return (
    <Page>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Btn onPress={() => go('home')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 8 }}>
          <Chev color={t.ink} />
          <T w={500} s={16}>{s.tabHome}</T>
        </Btn>
      </View>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.logTitle}</T>
        <T s={15} style={{ marginTop: 6 }}>{s.workout} <T k="num" w={800} s={15}>{wk}</T> · {focus} · 27.10</T>
        {parts.map(p => (
          <View key={p.num} style={{ gap: 10, marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <T k="num" w={800} s={20}>{p.num}</T>
              <T w={700} s={15}>{p.title}</T>
            </View>
            {p.items.map(it => <ExCard key={it.id} id={it.id} choiceOf={it.choiceOf} />)}
          </View>
        ))}
      </ScrollView>
      <View style={{ borderTopWidth: 1, borderTopColor: t.ink, paddingTop: 12, paddingHorizontal: 20, paddingBottom: frame ? 34 : 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ gap: 2 }}>
          <T s={13}>{s.totalShort}</T>
          <T><T k="num" w={800} s={24}>{fmt(total)}</T> <T s={14}>{s.kg}</T></T>
        </View>
        <Btn onPress={() => go('summary')} style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={18} c={t.onAcc}>{s.save}</T>
        </Btn>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------- Summary
export function Summary() {
  const { s, t, go, total, pct, prs, frame, setShareMode, wk, focus, prev, prevDate } = useApp();
  const mx = Math.max(total, prev);
  const todayW = `${(total / mx) * 100}%` as const;
  const prevW = `${(prev / mx) * 100}%` as const;
  const pctStr = (pct >= 0 ? '+' : '−') + Math.abs(pct) + '%';
  return (
    <Page bg={t.sumBg} ink={t.sumInk}>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 10 }}>
        <T w={500} s={15} c={t.sumInk}>{s.saved}</T>
        <Btn onPress={() => go('home')} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }} label={s.done}>
          <CloseX color={t.sumInk} />
        </Btn>
      </View>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 16 }}>
        <T k="head" s={32} lh={1.1} c={t.sumInk}>{s.workout} <T k="num" w={800} s={32} c={t.sumInk}>{wk}</T> · {focus}</T>
        <T s={15} c={t.sumInk} style={{ marginTop: 6 }}>{s.dateFull}</T>
        <T w={500} s={16} c={t.sumInk} style={{ marginTop: 28 }}>{s.totalLabel}</T>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
          <T k="num" w={800} s={96} lh={0.95} c={t.sumNum} ltr style={{ letterSpacing: -1.9 }}>{fmt(total)}</T>
          <T k="head" s={30} c={t.sumInk}>{s.kg}</T>
        </View>
        <View style={{ backgroundColor: t.sumBlock, borderRadius: 18, paddingTop: 16, paddingHorizontal: 18, paddingBottom: 18, marginTop: 22, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <T w={500} s={15} c={t.sumOnBlock}>{s.vs1} <T k="num" w={800} s={15} c={t.sumOnBlock}>{wk}</T> {s.vs2}</T>
            <T k="num" w={800} s={30} lh={1} c={t.sumOnBlock} ltr>{pctStr}</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <T s={13} c={t.sumOnBlock} style={{ width: 42 }}>{s.todayShort}</T>
            <View style={{ flex: 1, height: 12 }}><View style={{ height: '100%', width: todayW, backgroundColor: t.sumOnBlock, borderRadius: 3 }} /></View>
            <T k="num" w={500} s={14} c={t.sumOnBlock} style={{ width: 50, textAlign: 'right' }}>{fmt(total)}</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <T k="num" w={500} s={13} c={t.sumOnBlock} style={{ width: 42 }}>{prevDate}</T>
            <View style={{ flex: 1, height: 12 }}><View style={{ height: '100%', width: prevW, borderWidth: 1.5, borderColor: t.sumOnBlock, borderRadius: 3 }} /></View>
            <T k="num" w={500} s={14} c={t.sumOnBlock} style={{ width: 50, textAlign: 'right' }}>{fmt(prev)}</T>
          </View>
        </View>
        {prs.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <T w={700} s={16} c={t.sumInk}>{s.prs}</T>
              <View style={{ backgroundColor: t.sumInk, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 9 }}>
                <T k="num" w={800} s={13} c={t.sumBg}>{prs.length}</T>
              </View>
            </View>
            {prs.map(pr => (
              <View key={pr.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: t.sumInk }}>
                <T w={500} s={15} lh={1.3} c={t.sumInk} style={{ flex: 1 }}>{pr.name}</T>
                <T k="num" w={500} s={13} c={t.sumInk} ltr>{pr.delta}</T>
                <T c={t.sumInk}><T k="num" w={800} s={22} c={t.sumInk}>{pr.w}</T> <T s={13} c={t.sumInk}>{s.kg}</T></T>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={{ paddingTop: 8, paddingHorizontal: 20, paddingBottom: frame ? 34 : 16, gap: 4 }}>
        <Btn onPress={() => { setShareMode('full'); go('share'); }} style={{ height: 60, borderRadius: 16, backgroundColor: t.sumBtn, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={18} c={t.sumOnBtn}>{s.shareStory}</T>
        </Btn>
        <Btn onPress={() => go('home')} style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <T w={500} s={16} c={t.sumInk}>{s.done}</T>
        </Btn>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------- Share
const PW = 270, PH = 480;

export function Share() {
  const {
    s, t, he, go, shareMode, setShareMode, cardColor, setCardColor, cardLang, setCardLang,
    clearInk, setClearInk, frame, showToast,
  } = useApp();
  const clear = shareMode === 'clear';
  return (
    <Page>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 }}>
        <Btn onPress={() => go('summary')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 8 }}>
          <Chev color={t.ink} />
          <T w={500} s={16}>{s.summary}</T>
        </Btn>
        <T k="head" s={20} style={{ flex: 1, textAlign: 'center', marginEnd: 84 }}>{s.shareStory}</T>
      </View>
      <View style={{ paddingTop: 6, paddingHorizontal: 20 }}>
        <Segmented
          value={shareMode} onChange={setShareMode} ink={t.ink} bg={t.bg} h={38} size={15}
          options={[{ key: 'full', label: s.fullBg }, { key: 'clear', label: s.clearBg }]}
        />
      </View>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 12 }}>
        <View style={{ width: PW, height: PH, borderRadius: 12, overflow: 'hidden', direction: 'ltr' } as ViewStyle}>
          {clear && <PreviewBg kind={clearInk === 'light' ? 'stripes' : 'checker'} width={PW} height={PH} />}
          <ShareCard variant={clear ? 'clear' : cardColor} ink={clearInk} lang={cardLang} k={PW / 1080} />
        </View>
        {clear ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: PW, gap: 10 }}>
            <T w={500} s={13}>{s.textColor}</T>
            <Segmented
              value={clearInk} onChange={setClearInk} ink={t.ink} bg={t.bg} h={30} size={13} radius={999} flex={false}
              options={[{ key: 'light', label: s.inkLight }, { key: 'dark', label: s.inkDark }]}
            />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: PW, gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {(Object.keys(CARD_COLORS) as CardColor[]).map(k => {
                const on = k === cardColor;
                return (
                  <Btn key={k} onPress={() => setCardColor(k)} label={k}
                    style={{
                      width: 30, height: 30, borderRadius: 15, backgroundColor: CARD_COLORS[k],
                      boxShadow: on ? `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.ink}` : CARD_COLORS[k] === t.bg ? `0 0 0 1.5px ${t.ink}` : 'none',
                    } as ViewStyle}><View /></Btn>
                );
              })}
            </View>
            <Segmented
              value={cardLang} onChange={(l: Lang) => setCardLang(l)} ink={t.ink} bg={t.bg} h={30} size={13} radius={999} flex={false}
              options={[{ key: 'he', label: 'עברית', he: true }, { key: 'en', label: 'English', he: false }]}
            />
          </View>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: frame ? 34 : 16, gap: 10 }}>
        <Btn onPress={() => showToast(s.toastInsta)} style={{ height: 56, borderRadius: 16, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={18} c={t.onAcc}>{s.insta}</T>
        </Btn>
        <Btn onPress={() => showToast(s.toastSave)} style={{ height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={17}>{s.saveRoll}</T>
        </Btn>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------- Progress
function Chart({ k }: { k: SeriesKey }) {
  const { t } = useApp();
  const ser = SERIES[k];
  const Wd = 353, H = 170, top = 30, bot = 30, px = 16;
  const v = ser.w, n = v.length;
  const mn = Math.min(...v), mx = Math.max(...v), rg = mx - mn || 1;
  // Charts read left to right in every language: oldest on the left, newest on the right.
  const xAt = (i: number) => px + (i * (Wd - 2 * px)) / (n - 1);
  const pts = v.map((x, i) => [xAt(i), top + ((mx - x) / rg) * (H - top - bot)]);
  const last = n - 1;
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${Wd} ${H}`} style={{ overflow: 'visible' }}>
      <Line x1={0} x2={Wd} y1={H - bot + 10} y2={H - bot + 10} stroke={t.ink} strokeWidth={1} />
      <Polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={t.acc} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <Circle key={i} cx={p[0]} cy={p[1]} r={i === last ? 6 : 4} fill={i === last ? t.acc : t.bg} stroke={i === last ? t.acc : t.ink} strokeWidth={2} />
      ))}
      {DATES.map((d, i) => (
        <SvgText key={d} x={pts[i][0]} y={H - 2} textAnchor="middle" fontFamily="Archivo-Medium" fontSize={11} fill={t.ink}>{d}</SvgText>
      ))}
      <SvgText x={pts[last][0]} y={pts[last][1] - 14} textAnchor="middle" fontFamily="Archivo-ExtraBold" fontSize={15} fill={t.accText}>{fmt(v[last])}</SvgText>
    </Svg>
  );
}

export function Progress() {
  const { s, t, lang, chartEx, setChartEx } = useApp();
  const ser = SERIES[chartEx];
  const hist = ser.w.map((w, i) => ({ d: DATES[i], w, diff: i ? w - ser.w[i - 1] : 0 })).slice(-4).reverse();
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.tabProgress}</T>
        <View style={{ backgroundColor: t.block, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 20, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
            <T k="num" w={800} s={60} lh={0.9} c={t.onBlock}>5</T>
            <View style={{ gap: 4, flex: 1 }}>
              <T k="head" s={20} lh={1} c={t.onBlock}>{s.streak}</T>
              <T s={13} c={t.onBlock}>{s.streakSub}</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {WEEKS.map((on, i) => (
              <View key={i} style={{ width: 11, height: 24, borderRadius: 3, backgroundColor: on ? t.onBlock : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: t.onBlock }} />
            ))}
          </View>
        </View>
        <T k="head" s={20} style={{ marginTop: 28 }}>{s.byEx}</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 12 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4, gap: 8 }}>
          {(Object.keys(SERIES) as SeriesKey[]).map(k => {
            const on = k === chartEx;
            return (
              <Btn key={k} onPress={() => setChartEx(k)} style={{
                height: 40, paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center',
                backgroundColor: on ? t.ink : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: t.ink,
              }}>
                <T w={on ? 700 : 500} s={14} c={on ? t.bg : t.ink}>{SERIES[k][lang]}</T>
              </Btn>
            );
          })}
        </ScrollView>
        <T w={500} s={15} lh={1.35} style={{ marginTop: 20 }}>{DEF[ser.ex][lang]}</T>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <T k="num" w={800} s={52} lh={1}>{fmt(ser.w[ser.w.length - 1])}</T>
            <T k="head" s={20}>{s.kg}</T>
          </View>
          <T w={700} s={15} c={t.accText}>
            <T k="num" w={800} s={15} c={t.accText} ltr>{'+' + fmt(ser.w[ser.w.length - 1] - ser.w[0])}</T> {s.gain}
          </T>
        </View>
        <View style={{ marginTop: 14, direction: 'ltr' } as ViewStyle}><Chart k={chartEx} /></View>
        <T w={700} s={15} style={{ marginTop: 22 }}>{s.recent}</T>
        {hist.map(h => (
          <View key={h.d} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: t.ink }}>
            <T k="num" w={500} s={14} style={{ width: 44 }}>{h.d}</T>
            <T s={15} style={{ flex: 1 }}><T k="num" w={800} s={15}>{fmt(h.w)}</T> {s.kg} × <T k="num" w={500} s={15}>{ser.r}</T></T>
            {h.diff > 0 ? <T k="num" w={800} s={14} c={t.accText} ltr>{'+' + fmt(h.diff)}</T> : <T s={13}>{s.noChange}</T>}
          </View>
        ))}
      </ScrollView>
      <TabBar />
    </Page>
  );
}

// ---------------------------------------------------------------- Board
export function Board() {
  const { s, t, hidden, toggleHidden } = useApp();
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.boardTitle}</T>
        <T s={14} lh={1.4} style={{ marginTop: 6 }}>{s.boardSub}</T>
        <T w={500} s={15} style={{ marginTop: 30 }}>{s.yourPlace}</T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginTop: 2 }}>
          <T k="num" w={800} s={132} lh={0.85} c={t.accBig} ltr style={{ letterSpacing: -4 }}>#2</T>
          <View style={{ gap: 6, paddingBottom: 6, flex: 1 }}>
            <T s={15}>{s.of} <T k="num" w={800} s={15}>48</T> {s.members}</T>
            <T s={15}><T k="num" w={800} s={22} ltr>+9%</T> {s.volMonth}</T>
          </View>
        </View>
        {hidden && (
          <View style={{ marginTop: 18, borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
            <T s={14} lh={1.4}>{s.hiddenNote}</T>
          </View>
        )}
        <T w={700} s={15} style={{ marginTop: 28 }}>{s.top5}</T>
        <View style={{ gap: 6, marginTop: 10 }}>
          {BOARD_PCTS.map((pct, i) => {
            const me = i === 1;
            return (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 14, borderRadius: 12,
                backgroundColor: me ? t.acc : 'transparent', borderWidth: me ? 0 : 1.5, borderColor: t.ink,
              }}>
                <T k="num" w={800} s={18} c={me ? t.onAcc : t.ink} ltr style={{ width: 32 }}>{'#' + (i + 1)}</T>
                <T w={700} s={15} c={t.onAcc} style={{ flex: 1 }}>{me ? (hidden ? s.meHidden : s.me) : ''}</T>
                <T k="num" w={me ? 800 : 500} s={16} c={me ? t.onAcc : t.ink} ltr>{pct}</T>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: t.ink }}>
          <View style={{ flex: 1, gap: 3 }}>
            <T w={700} s={16}>{s.hide}</T>
            <T s={13} lh={1.35}>{s.hideSub}</T>
          </View>
          <Btn onPress={toggleHidden} label={s.hide} style={{ width: 56, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
              width: 51, height: 31, borderRadius: 16, justifyContent: 'center',
              backgroundColor: hidden ? t.acc : 'transparent', borderWidth: hidden ? 0 : 1.5, borderColor: t.ink,
            }}>
              <View style={{
                position: 'absolute', top: hidden ? 2 : 2.5, end: hidden ? 2 : undefined, start: hidden ? undefined : 2.5,
                width: hidden ? 27 : 23, height: hidden ? 27 : 23, borderRadius: 14, backgroundColor: hidden ? t.knob : t.ink,
              } as ViewStyle} />
            </View>
          </Btn>
        </View>
      </ScrollView>
      <TabBar />
    </Page>
  );
}

// ---------------------------------------------------------------- Settings
export function Settings() {
  const { s, t, lang, setLang, themeKey, setTheme } = useApp();
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.settings}</T>
        <T k="head" s={20} style={{ marginTop: 30 }}>{s.language}</T>
        <View style={{ marginTop: 12 }}>
          <Segmented
            value={lang} onChange={setLang} ink={t.ink} bg={t.bg}
            options={[{ key: 'he', label: 'עברית', he: true }, { key: 'en', label: 'English', he: false }]}
          />
        </View>
        <T s={13} lh={1.4} style={{ marginTop: 8 }}>{s.langNote}</T>
        <T k="head" s={20} style={{ marginTop: 32 }}>{s.appColor}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
          {(Object.keys(THEMES) as ThemeKey[]).map(k => {
            const o = THEMES[k], on = k === themeKey;
            return (
              <Btn key={k} onPress={() => setTheme(k)} style={{ width: '48%', flexGrow: 1, padding: 6, borderRadius: 16, borderWidth: 2, borderColor: on ? t.ink : 'transparent', gap: 8 }}>
                <View style={{ height: 96, borderRadius: 11, backgroundColor: o.bg, borderWidth: 1, borderColor: o.bg === '#FFFFFF' ? '#2B1111' : o.bg, padding: 12, justifyContent: 'space-between' }}>
                  <View style={{ gap: 5 }}>
                    <View style={{ width: '60%', height: 7, borderRadius: 2, backgroundColor: o.ink }} />
                    <View style={{ width: '38%', height: 7, borderRadius: 2, backgroundColor: o.ink }} />
                  </View>
                  <View style={{ height: 22, borderRadius: 6, backgroundColor: o.acc }} />
                </View>
                <View style={{ gap: 1, paddingHorizontal: 4, paddingBottom: 4 }}>
                  <T w={700} s={15}>{o[lang]}</T>
                  <T s={13}>{s[o.mode]}</T>
                </View>
              </Btn>
            );
          })}
        </View>
        <T s={13} lh={1.4} style={{ marginTop: 10 }}>{s.colorNote}</T>
      </ScrollView>
      <TabBar />
    </Page>
  );
}
