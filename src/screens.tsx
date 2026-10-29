import React from 'react';
import { Linking, Modal, Platform, ScrollView, Switch, TextInput, View, ViewStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import {
  BOARDS, BoardKey, CARD_COLORS, CardColor, DATES, DEF, ExId, INTENSITIES, Intensity, Lang, PART_NAME, Part, SERIES, SeriesKey,
  ALL_IDS, partTitle, EquivItem, Rank, RuleKey, TRAINEES, THEMES, Trainee, ThemeKey, VARIANT_NAME, Variant, WEEKS, WORKOUTS, WorkoutKey, fmt, partIds, rankFor, readyToRaise, todayFull, todayLong, todayShort, videoUrl,
} from './data';
import { useApp } from './store';
import { Gender, useAuth } from './auth';
import { ShareCard } from './ShareCard';
import { cardToPng, downloadPng, sharePng, shrinkImage } from './shareImage';
import {
  Btn, Chev, CloseX, ICON_BLACK, ICON_RATIO, ICON_WHITE, Image, Page, PreviewBg, Segmented, T, TabBar,
} from './ui';

const scrollStyle = (extra: object = {}) => ({ flex: 1 as const, ...extra });

// ---------------------------------------------------------------- Home
export function Home() {
  const { s, t, go, lang, wk, setWk, focus, points, ranks, cycleName } = useApp();
  const { profile } = useAuth();
  const firstName = profile?.name.trim().split(/\s+/)[0];
  const myRank = rankFor(points, ranks).rank;
  const names = (ids: ExId[]) => ids.map(id => DEF[id][lang]);
  // A part with no exercises does not show to the trainee.
  const parts = WORKOUTS[wk].parts
    .map(p => ({
      label: partTitle(p, lang),
      lines: (p.variants
        ? (['upper', 'lower'] as Variant[]).filter(v => p.variants![v].length > 0).map(v => `${VARIANT_NAME[v][lang]}: ${names(p.variants![v]).join(' · ')}`)
        : p.names ? [p.names.map(n => n[lang]).join(' · ')] : names(partIds(p, 'upper'))
      ).filter(l => l.trim()),
    }))
    .filter(p => p.lines.length > 0)
    .map((p, i, all) => ({ ...p, num: '0' + (i + 1), line: i < all.length - 1 }));
  const cycleTitle = cycleName[lang] || cycleName.he || cycleName.en;
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 16, gap: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <View style={{ gap: 4, flex: 1 }}>
            <T s={14} lh={1.3}>{todayLong(lang)}</T>
            <T k="head" s={30} lh={1.1}>{s.hello}{firstName ? `, ${firstName}` : ''}</T>
            <T s={13}>{s.rankLabel}: <T w={700} s={13} c={t.accText}>{myRank[lang]}</T> · <T k="num" w={800} s={13}>{points}</T> {s.pts}</T>
          </View>
          <Image source={t.icon === 'black' ? ICON_BLACK : ICON_WHITE} contentFit="contain" style={{ width: 58, height: 58 / ICON_RATIO, margin: 8 }} />
        </View>
        {/* The count of finished workouts comes back when the app saves real history. */}
        {!!cycleTitle && <T w={700} s={15}>{cycleTitle}</T>}
        <View style={{ gap: 8 }}>
          <T w={700} s={15}>{s.pickWorkout}</T>
          <Segmented
            value={wk} onChange={(k: WorkoutKey) => setWk(k)} ink={t.ink} bg={t.bg} h={44} size={16}
            options={(['A', 'B', 'F'] as WorkoutKey[]).map(k => ({ key: k, label: `${k} · ${WORKOUTS[k].focus[lang]}` }))}
          />
        </View>
        <View style={{ backgroundColor: t.block, borderRadius: 20, paddingTop: 20, paddingHorizontal: 22, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <View style={{ gap: 8, flex: 1 }}>
            <T w={500} s={14} c={t.onBlock}>{s.today}</T>
            <T k="head" s={46} c={t.onBlock} lh={1}>{focus}</T>
            <T s={14} c={t.onBlock}>{parts.length} {s.partsWord}</T>
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
                {p.lines.map(l => <T key={l} w={500} s={16} lh={1.35}>{l}</T>)}
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
function Stepper({ value, unit, onDec, onInc, flex, btnW, onType }: {
  value: string; unit: string; onDec: () => void; onInc: () => void; flex: number; btnW: number;
  onType?: (n: number) => void;
}) {
  const { t } = useApp();
  const [draft, setDraft] = React.useState<string | null>(null);
  return (
    <View style={{ flex, height: 48, borderWidth: 1.5, borderColor: t.ink, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
      <Btn onPress={onDec} style={{ width: btnW, height: '100%', alignItems: 'center', justifyContent: 'center' }} label="−">
        <T k="num" w={800} s={22}>−</T>
      </Btn>
      <View style={{ flex: 1, alignItems: 'center', gap: 1 }}>
        {onType ? (
          <TextInput
            value={draft ?? value}
            keyboardType="decimal-pad"
            selectTextOnFocus
            onFocus={() => setDraft(value)}
            onBlur={() => setDraft(null)}
            onChangeText={txt => {
              setDraft(txt);
              const n = parseFloat(txt.replace(',', '.'));
              if (!isNaN(n)) onType(n);
            }}
            style={{ fontFamily: 'Archivo-ExtraBold', fontSize: 22, lineHeight: 24, color: t.ink, textAlign: 'center', padding: 0, minWidth: 56 }}
          />
        ) : (
          <T k="num" w={800} s={22} lh={1.1}>{value}</T>
        )}
        <T s={11} lh={1}>{unit}</T>
      </View>
      <Btn onPress={onInc} style={{ width: btnW, height: '100%', alignItems: 'center', justifyContent: 'center' }} label="+">
        <T k="num" w={800} s={22}>+</T>
      </Btn>
    </View>
  );
}

function SwapSheet({ orig, onClose }: { orig: ExId; onClose: () => void }) {
  const { s, t, lang, ids, resolve, swapEx } = useApp();
  const options = ALL_IDS.filter(x => !ids.includes(x));
  const pick = (to: ExId | null) => { swapEx(orig, to); onClose(); };
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <View style={{ backgroundColor: t.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '75%', paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}>
          <T k="head" s={24} lh={1.15}>{s.swapTitle}</T>
          <T s={14} lh={1.35}>{s.swapNote}</T>
          <T w={700} s={15} lh={1.3}>{DEF[resolve(orig)][lang]}</T>
          <ScrollView style={{ flexGrow: 0 }}>
            {resolve(orig) !== orig && (
              <Btn onPress={() => pick(null)} style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: t.ink }}>
                <T w={700} s={15} c={t.accText}>{s.restore} · {DEF[orig][lang]}</T>
              </Btn>
            )}
            {options.map(o => (
              <Btn key={o} onPress={() => pick(o)} style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: t.ink }}>
                <T w={500} s={15} lh={1.3}>{DEF[o][lang]}</T>
              </Btn>
            ))}
          </ScrollView>
          <Btn onPress={onClose} style={{ height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
            <T w={700} s={16}>{s.close}</T>
          </Btn>
        </View>
      </View>
    </Modal>
  );
}

function ExCard({ orig }: { orig: ExId }) {
  const { s, t, lang, ex, bump, setWeight, resolve, rangeFor, role } = useApp();
  const [sheet, setSheet] = React.useState(false);
  const id = resolve(orig), swapped = id !== orig;
  const def = DEF[id], rows = ex[id];
  const [lo, hi] = rangeFor(id);
  const top = Math.max(...rows.map(r => r.w));
  return (
    <View style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 16, paddingTop: 14, paddingHorizontal: 14, paddingBottom: 12, gap: 10 }}>
      <T w={700} s={17} lh={1.3}>{def[lang]}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {videoUrl(id) ? (
          <Btn onPress={() => Linking.openURL(videoUrl(id) as string)} label={s.video}
            style={{ height: 34, paddingHorizontal: 12, borderRadius: 999, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
            <T w={700} s={13} c={t.bg}>▶ {s.video}</T>
          </Btn>
        ) : (
          <T s={13}>{s.noVideo}</T>
        )}
        {role === 'coach' && (
          <Btn onPress={() => setSheet(true)} label={s.swap}
            style={{ height: 34, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
            <T w={700} s={13}>{s.swap}</T>
          </Btn>
        )}
        {swapped && <T w={700} s={13} c={t.accText}>{s.swapped}</T>}
      </View>
      {sheet && <SwapSheet orig={orig} onClose={() => setSheet(false)} />}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        {def.lw > 0 ? (
          <T s={14}>
            {s.lastTime} <T k="num" w={500} s={14}>{`${fmt(def.lw)} ${s.kg} × ${def.lr}`}</T>
          </T>
        ) : <View />}
        <T s={14}>{s.repRange} <T k="num" w={500} s={14}>{`${lo}–${hi}`}</T></T>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <T w={500} s={14} style={{ width: 40 }}>{s.set} <T k="num" w={800} s={14}>{i + 1}</T></T>
          <Stepper flex={1.35} btnW={44} value={fmt(row.w)} unit={s.kg}
            onDec={() => bump(id, i, 'w', -def.step)} onInc={() => bump(id, i, 'w', def.step)} onType={n => setWeight(id, i, n)} />
          <Stepper flex={1} btnW={40} value={String(row.r)} unit={s.reps}
            onDec={() => bump(id, i, 'r', -1)} onInc={() => bump(id, i, 'r', 1)} />
        </View>
      ))}
      {def.lw > 0 && top > def.lw && (
        <T w={700} s={13} c={t.accText} style={{ alignSelf: 'flex-end' }}>
          {s.upPre} <T k="num" w={800} s={13} c={t.accText}>{fmt(top - def.lw)}</T> {s.kg}
        </T>
      )}
    </View>
  );
}

export function Log() {
  const { s, t, go, total, frame, wk, focus, lang, variant, setVariant, intensity, setIntensity, saveWorkout } = useApp();
  // Warm-up and abs have no tracking, so only the other parts get a weight section.
  const parts = WORKOUTS[wk].parts
    .map((p: Part, i) => ({ p, num: '0' + (i + 1), idx: i, ids: partIds(p, variant) }))
    .filter(x => x.ids.length > 0);
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
        <T s={15} style={{ marginTop: 6 }}>{s.workout} <T k="num" w={800} s={15}>{wk}</T> · {focus} · {todayShort()}</T>
        {parts.map(({ p, num, idx, ids }) => (
          <View key={num} style={{ gap: 10, marginTop: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <T k="num" w={800} s={20}>{num}</T>
              <T w={700} s={15}>{partTitle(p, lang)}</T>
            </View>
            {p.variants && (
              <Segmented
                value={variant} onChange={(v: Variant) => setVariant(v)} ink={t.ink} bg={t.bg} h={40} size={15}
                options={(['upper', 'lower'] as Variant[]).map(v => ({ key: v, label: VARIANT_NAME[v][lang] }))}
              />
            )}
            {ids.map(id => <ExCard key={id} orig={id} />)}
            <View style={{ gap: 6 }}>
              <T w={500} s={14}>{s.intensity}</T>
              <Segmented
                value={intensity[`${wk}:${idx}`] ?? 'right'} onChange={(v: Intensity) => setIntensity(idx, v)}
                ink={t.ink} bg={t.bg} h={40} size={15}
                options={INTENSITIES.map(o => ({ key: o.key, label: o[lang] }))}
              />
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ borderTopWidth: 1, borderTopColor: t.ink, paddingTop: 12, paddingHorizontal: 20, paddingBottom: frame ? 34 : 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ gap: 2 }}>
          <T s={13}>{s.totalShort}</T>
          <T><T k="num" w={800} s={24}>{fmt(total)}</T> <T s={14}>{s.kg}</T></T>
        </View>
        <Btn onPress={() => { saveWorkout(); go('summary'); }} style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={18} c={t.onAcc}>{s.save}</T>
        </Btn>
      </View>
    </Page>
  );
}

// ---------------------------------------------------------------- Summary
export function Summary() {
  const { s, t, go, lang, total, pct, prs, frame, setShareMode, wk, focus, prev, prevDate, earned, points, ranks } = useApp();
  const rk = rankFor(points, ranks);
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
        <T s={15} c={t.sumInk} style={{ marginTop: 6 }}>{todayFull(lang)}</T>
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
        {earned && (
          <View style={{ borderWidth: 1.5, borderColor: t.sumInk, borderRadius: 18, padding: 16, marginTop: 20, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <T w={700} s={16} c={t.sumInk}>{s.earnedTitle}</T>
              <T k="num" w={800} s={30} c={t.sumInk} ltr>{'+' + earned.total}</T>
            </View>
            {([['ruleWorkout', earned.workout], ['rulePr', earned.pr], ['ruleStreak', earned.streak], ['ruleShare', earned.share]] as const)
              .filter(([, v]) => v > 0).map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <T s={14} c={t.sumInk}>{s[k]}</T>
                  <T k="num" w={500} s={14} c={t.sumInk} ltr>{'+' + v}</T>
                </View>
              ))}
            <View style={{ borderTopWidth: 1, borderTopColor: t.sumInk, paddingTop: 10, gap: 6 }}>
              <T w={700} s={15} c={t.sumInk}>{s.rankLabel}: {rk.rank[lang]}</T>
              {rk.next ? (
                <>
                  <View style={{ height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: t.sumInk, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${Math.min(100, ((points - rk.rank.min) / (rk.next.min - rk.rank.min)) * 100)}%`, backgroundColor: t.sumInk }} />
                  </View>
                  <T s={13} c={t.sumInk}>{s.toNext.replace('{n}', String(rk.next.min - points))} · {rk.next[lang]}</T>
                </>
              ) : (
                <T s={13} c={t.sumInk}>{s.topRank}</T>
              )}
            </View>
          </View>
        )}
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
    clearInk, setClearInk, frame, showToast, period, setPeriod, photo, setPhoto, rollEquiv, roll, awardShare, bgPhoto, setBgPhoto, bgDim, setBgDim,
  } = useApp();
  const clear = shareMode === 'clear';
  const isWeb = Platform.OS === 'web';
  // The PNG is made before the tap, so the share sheet opens at once. Some phones refuse a share that starts late.
  const exportRef = React.useRef<React.ComponentRef<typeof View>>(null);
  const [png, setPng] = React.useState<Blob | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [tries, setTries] = React.useState(0);
  const cardKey = [shareMode, cardColor, cardLang, clearInk, period, photo, bgPhoto, bgDim, roll, tries].join('|');
  React.useEffect(() => {
    if (!isWeb) return;
    setPng(null);
    setFailed(false);
    let live = true;
    const timer = setTimeout(async () => {
      try {
        // Stop after 20 seconds, so the button never says "preparing" for ever.
        const blob = await Promise.race([
          cardToPng(exportRef.current as unknown as HTMLElement),
          new Promise<never>((_, fail) => setTimeout(() => fail(new Error('The card took too long to draw')), 20000)),
        ]);
        if (live) setPng(blob);
      } catch (e) {
        console.warn('The story card could not be drawn', e);
        if (live) { setPng(null); setFailed(true); }
      }
    }, 600);
    return () => { live = false; clearTimeout(timer); };
  }, [isWeb, cardKey]);
  const onShare = async () => {
    // A clear card needs a photo. Instagram shows a transparent picture as black.
    if (clear && !bgPhoto) { pickBgPhoto(); return; }
    if (failed) { setTries(n => n + 1); return; }
    if (!png) { showToast(s.sharePreparing); return; }
    if (busy) return;
    setBusy(true);
    try {
      const r = await sharePng(png, 'stage-story.png');
      // Points come only after the person finishes the share sheet.
      if (r === 'shared') { awardShare(); showToast(s.shareDone); }
      else if (r === 'downloaded') showToast(s.sharedSaved);
    } catch { showToast(s.shareFailed); }
    setBusy(false);
  };
  const onDownload = () => {
    if (!png) { showToast(s.sharePreparing); return; }
    downloadPng(png, 'stage-story.png');
    showToast(s.sharedSaved);
  };
  const pickImage = async (aspect: [number, number], set: (uri: string) => void) => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect });
    const uri = r.assets?.[0]?.uri;
    if (!uri) return;
    try { set(isWeb ? await shrinkImage(uri) : uri); } catch { set(uri); }
  };
  const pickPhoto = () => pickImage([1, 1], setPhoto);
  const pickBgPhoto = () => pickImage([9, 16], setBgPhoto);
  return (
    <Page>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 }}>
        <Btn onPress={() => go('summary')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 8 }}>
          <Chev color={t.ink} />
          <T w={500} s={16}>{s.summary}</T>
        </Btn>
        <T k="head" s={20} style={{ flex: 1, textAlign: 'center', marginEnd: 84 }}>{s.shareStory}</T>
      </View>
      <View style={{ paddingTop: 6, paddingHorizontal: 20, gap: 8 }}>
        <Segmented
          value={period} onChange={setPeriod} ink={t.ink} bg={t.bg} h={38} size={15}
          options={[{ key: 'workout', label: s.periodWorkout }, { key: 'month', label: s.periodMonth }]}
        />
        <Segmented
          value={shareMode} onChange={setShareMode} ink={t.ink} bg={t.bg} h={38} size={15}
          options={[{ key: 'full', label: s.fullBg }, { key: 'clear', label: s.clearBg }]}
        />
      </View>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 12 }}>
        <View style={{ width: PW, height: PH, borderRadius: 12, overflow: 'hidden', direction: 'ltr' } as ViewStyle}>
          {clear && !bgPhoto && <PreviewBg kind={clearInk === 'light' ? 'stripes' : 'checker'} width={PW} height={PH} />}
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
        <Btn onPress={rollEquiv} style={{ width: PW, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={14}>🎲 {s.rollAgain}</T>
        </Btn>
        {clear && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: PW, gap: 10 }}>
              <Btn onPress={pickBgPhoto} style={{ flex: 1, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
                <T w={700} s={14}>{bgPhoto ? s.changeBgPhoto : s.addBgPhoto}</T>
              </Btn>
              {bgPhoto && (
                <Btn onPress={() => setBgPhoto(null)} style={{ height: 38, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }}>
                  <T w={500} s={14}>{s.removePhoto}</T>
                </Btn>
              )}
            </View>
            {bgPhoto ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: PW, gap: 10 }}>
                <T w={500} s={13}>{s.dimPhoto}</T>
                <Segmented
                  value={bgDim ? 'on' : 'off'} onChange={(v: 'on' | 'off') => setBgDim(v === 'on')} ink={t.ink} bg={t.bg} h={30} size={13} radius={999} flex={false}
                  options={[{ key: 'off', label: s.dimOff }, { key: 'on', label: s.dimOn }]}
                />
              </View>
            ) : (
              <T s={12} lh={1.4} style={{ width: PW }}>{s.bgNeedHint}</T>
            )}
          </>
        )}
        {!clear && (
          <View style={{ flexDirection: 'row', alignItems: 'center', width: PW, gap: 10 }}>
            <Btn onPress={pickPhoto} style={{ flex: 1, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
              <T w={700} s={14}>{photo ? s.changePhoto : s.addPhoto}</T>
            </Btn>
            {photo && (
              <Btn onPress={() => setPhoto(null)} style={{ height: 38, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }}>
                <T w={500} s={14}>{s.removePhoto}</T>
              </Btn>
            )}
          </View>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: frame ? 34 : 16, gap: 10 }}>
        {/* On the web the card goes to the share sheet. The phone app comes later, so those buttons say soon. */}
        <Btn onPress={isWeb ? onShare : () => showToast(s.soonToast)} style={{ height: 56, borderRadius: 16, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center', opacity: isWeb && (png || failed || (clear && !bgPhoto)) && !busy ? 1 : 0.55 }}>
          <T w={700} s={18} c={t.onAcc}>{clear && !bgPhoto ? s.addBgPhoto : `${s.insta}${!isWeb ? ` · ${s.soon}` : failed ? ` · ${s.shareRetry}` : !png ? ` · ${s.sharePreparing}` : ''}`}</T>
        </Btn>
        {isWeb && png && !(clear && !bgPhoto) && <T s={12} style={{ textAlign: 'center' }}>{s.shareHint}</T>}
        <Btn onPress={isWeb ? onDownload : () => showToast(s.soonToast)} style={{ height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center', opacity: isWeb && png ? 1 : 0.55 }}>
          <T w={700} s={17}>{isWeb ? s.downloadImage : `${s.saveRoll} · ${s.soon}`}</T>
        </Btn>
        {isWeb && (
          // The off-screen position sits on the outer View. The drawn View has none, or the picture would be empty.
          <View pointerEvents="none" style={{ position: 'absolute', left: -5000, top: 0, width: 1080, height: 1920 }}>
            <View ref={exportRef} style={{ width: 1080, height: 1920 }}>
              <ShareCard variant={clear ? 'clear' : cardColor} ink={clearInk} lang={cardLang} k={1} />
            </View>
          </View>
        )}
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
  const { s, t, lang, hidden, toggleHidden } = useApp();
  const [key, setKey] = React.useState<BoardKey>('improved');
  const b = BOARDS[key];
  const myValue = b.rows[b.me - 1];
  const sharing = !hidden;
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.boardTitle}</T>
        <View style={{ marginTop: 14 }}>
          <Segmented
            value={key} onChange={setKey} ink={t.ink} bg={t.bg} h={40} size={14}
            options={(Object.keys(BOARDS) as BoardKey[]).map(k => ({ key: k, label: BOARDS[k].label[lang] }))}
          />
        </View>
        <T s={14} lh={1.4} style={{ marginTop: 10 }}>{b.sub[lang]}</T>
        <T w={500} s={15} style={{ marginTop: 26 }}>{s.yourPlace}</T>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginTop: 2 }}>
          <T k="num" w={800} s={132} lh={0.85} c={t.accBig} ltr style={{ letterSpacing: -4 }}>{'#' + b.me}</T>
          <View style={{ gap: 6, paddingBottom: 6, flex: 1 }}>
            <T s={15}>{s.of} <T k="num" w={800} s={15}>{b.of}</T> {s.members}</T>
            <T s={15}><T k="num" w={800} s={22} ltr>{myValue}</T> {b.unit[lang]}</T>
          </View>
        </View>
        {hidden && (
          <View style={{ marginTop: 18, borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
            <T s={14} lh={1.4}>{s.hiddenNote}</T>
          </View>
        )}
        <T w={700} s={15} style={{ marginTop: 28 }}>{s.top5}</T>
        <View style={{ gap: 6, marginTop: 10 }}>
          {b.rows.map((val, i) => {
            const me = i === b.me - 1;
            return (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 14, borderRadius: 12,
                backgroundColor: me ? t.acc : 'transparent', borderWidth: me ? 0 : 1.5, borderColor: t.ink,
              }}>
                <T k="num" w={800} s={18} c={me ? t.onAcc : t.ink} ltr style={{ width: 32 }}>{'#' + (i + 1)}</T>
                <T w={700} s={15} c={t.onAcc} style={{ flex: 1 }}>{me ? (hidden ? s.meHidden : s.me) : ''}</T>
                <T k="num" w={me ? 800 : 500} s={16} c={me ? t.onAcc : t.ink} ltr>{val}</T>
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
              backgroundColor: sharing ? t.acc : 'transparent', borderWidth: sharing ? 0 : 1.5, borderColor: t.ink,
            }}>
              <View style={{
                position: 'absolute', top: sharing ? 2 : 2.5, end: sharing ? 2 : undefined, start: sharing ? undefined : 2.5,
                width: sharing ? 27 : 23, height: sharing ? 27 : 23, borderRadius: 14, backgroundColor: sharing ? t.knob : t.ink,
              } as ViewStyle} />
            </View>
          </Btn>
        </View>
      </ScrollView>
      <TabBar />
    </Page>
  );
}

// ---------------------------------------------------------------- Coach
function Spark({ w, color }: { w: number[]; color: string }) {
  const W = 96, H = 30, lo = Math.min(...w), hi = Math.max(...w), span = hi - lo || 1;
  const pts = w.map((v, i) => `${(i / (w.length - 1)) * (W - 6) + 3},${H - 4 - ((v - lo) / span) * (H - 8)}`).join(' ');
  return (
    <Svg width={W} height={H} style={{ direction: 'ltr' } as ViewStyle}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

const attention = (tr: Trainee) => tr.lastDays >= 7 || tr.lifts.some(l => readyToRaise(l.w));
const daysText = (s: { daysAgo: string; today1: string }, n: number) => (n === 1 ? s.today1 : s.daysAgo.replace('{n}', String(n)));

export function Coach() {
  const { s, t, lang } = useApp();
  const [open, setOpen] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'attention'>('all');
  const tr = TRAINEES.find(x => x.id === open);

  if (tr) {
    return (
      <Page>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Btn onPress={() => setOpen(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 8 }}>
            <Chev color={t.ink} />
            <T w={500} s={16}>{s.back}</T>
          </Btn>
        </View>
        <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 20 }}>
          <T k="head" s={32} lh={1.1}>{tr.name[lang]}</T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {[
              { v: daysText(s, tr.lastDays), l: s.lastWorkout, small: true },
              { v: String(tr.perWeek), l: s.perWeek },
              { v: String(tr.streak), l: s.streakWeeks },
            ].map(c => (
              <View key={c.l} style={{ flex: 1, backgroundColor: t.block, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 12, gap: 4 }}>
                <T k="num" w={800} s={c.small ? 16 : 28} lh={c.small ? 1.3 : 1} c={t.onBlock}>{c.v}</T>
                <T s={12} lh={1.25} c={t.onBlock}>{c.l}</T>
              </View>
            ))}
          </View>
          <T k="head" s={20} style={{ marginTop: 28 }}>{s.weightsTitle}</T>
          <View style={{ gap: 10, marginTop: 12 }}>
            {tr.lifts.map(l => {
              const last = l.w[l.w.length - 1], gain = last - l.w[0], raise = readyToRaise(l.w);
              return (
                <View key={l.ex} style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 16, padding: 14, gap: 10 }}>
                  <T w={700} s={16} lh={1.3}>{DEF[l.ex][lang]}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <T><T k="num" w={800} s={30}>{fmt(last)}</T> <T s={14}>{s.kg} × {l.r}</T></T>
                    <Spark w={l.w} color={t.ink} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <T w={700} s={13} c={t.accText}>{gain > 0 ? '+' + fmt(gain) + ' ' + s.kg + ' ' + s.since : s.noChange}</T>
                    {raise && (
                      <View style={{ backgroundColor: t.acc, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 }}>
                        <T w={700} s={12} c={t.onAcc}>{s.raiseTag}</T>
                      </View>
                    )}
                  </View>
                  {raise && <T s={12} lh={1.35}>{s.raiseNote}</T>}
                </View>
              );
            })}
          </View>
        </ScrollView>
        <TabBar />
      </Page>
    );
  }

  const list = TRAINEES.filter(x => filter === 'all' || attention(x));
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.coachTitle}</T>
        <View style={{ marginTop: 14 }}>
          <Segmented
            value={filter} onChange={setFilter} ink={t.ink} bg={t.bg} h={40} size={14}
            options={[{ key: 'all', label: s.coachAll }, { key: 'attention', label: s.coachAttention }]}
          />
        </View>
        <View style={{ gap: 8, marginTop: 16 }}>
          {list.length === 0 && <T s={14}>{s.none}</T>}
          {list.map(x => {
            const raises = x.lifts.filter(l => readyToRaise(l.w)).length;
            return (
              <Btn key={x.id} onPress={() => setOpen(x.id)}
                style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <T w={700} s={16}>{x.name[lang]}</T>
                  <T s={13}>{daysText(s, x.lastDays)}</T>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <T s={13}>{s.perWeek}: <T k="num" w={800} s={13}>{x.perWeek}</T></T>
                  {x.lastDays >= 7 && (
                    <View style={{ backgroundColor: t.ink, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 9 }}>
                      <T w={700} s={12} c={t.bg}>{s.inactiveTag.replace('{n}', String(x.lastDays))}</T>
                    </View>
                  )}
                  {raises > 0 && (
                    <View style={{ backgroundColor: t.acc, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 9 }}>
                      <T w={700} s={12} c={t.onAcc}>{s.raiseTag} · {raises}</T>
                    </View>
                  )}
                </View>
              </Btn>
            );
          })}
        </View>
      </ScrollView>
      <TabBar />
    </Page>
  );
}

// ---------------------------------------------------------------- Rank-up notice
export function RankUp() {
  const { s, lang, rankUp, dismissRankUp, points } = useApp();
  if (!rankUp) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#CB0709', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
      <T k="head" s={26} c="#FFFFFF" style={{ textAlign: 'center' }}>{s.rankUpTitle}</T>
      <T s={15} c="#FFFFFF">{s.rankUpSub}</T>
      <T k="head" s={46} lh={1.1} c="#FFFFFF" style={{ textAlign: 'center' }}>{rankUp[lang]}</T>
      <T k="num" w={800} s={18} c="#FFFFFF">{points} {s.pts}</T>
      <Btn onPress={dismissRankUp} style={{ marginTop: 18, height: 56, paddingHorizontal: 36, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <T w={700} s={18} c="#2B1111">{s.rankUpCta}</T>
      </Btn>
    </View>
  );
}

// ---------------------------------------------------------------- Admin (lists the studio edits)
export function Field({ label, value, onChange, num, flex = 1 }: {
  label: string; value: string | number; onChange: (v: string) => void; num?: boolean; flex?: number;
}) {
  const { t } = useApp();
  const [draft, setDraft] = React.useState<string | null>(null);
  return (
    <View style={{ flex, gap: 3 }}>
      <T s={12}>{label}</T>
      <TextInput
        value={draft ?? String(value)}
        keyboardType={num ? 'decimal-pad' : 'default'}
        onFocus={() => setDraft(String(value))}
        onBlur={() => setDraft(null)}
        onChangeText={txt => { setDraft(txt); onChange(txt); }}
        style={{ height: 42, borderWidth: 1.5, borderColor: t.ink, borderRadius: 10, paddingHorizontal: 10, color: t.ink, fontSize: 15, fontFamily: num ? 'Archivo-Medium' : 'Heebo_400Regular' }}
      />
    </View>
  );
}

export function Admin() {
  const { s, t, go, equivItems, setEquivItems, rankLists, setRankList, rules, setRules } = useApp();
  const [tab, setTab] = React.useState<'equiv' | 'ranks' | 'rules'>('equiv');
  const [rg, setRg] = React.useState<Gender>('male');
  const ranks = rankLists[rg];
  const num = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? 0 : n; };
  const setItem = (id: string, fn: (it: EquivItem) => EquivItem) => setEquivItems(equivItems.map(it => (it.id === id ? fn(it) : it)));
  const setRanks = (v: Rank[]) => setRankList(rg, v);
  const setRank = (id: string, fn: (r: Rank) => Rank) => setRanks(ranks.map(r => (r.id === id ? fn(r) : r)));
  const Del = ({ onPress }: { onPress: () => void }) => (
    <Btn onPress={onPress} style={{ alignSelf: 'flex-end', height: 32, paddingHorizontal: 10, justifyContent: 'center' }}>
      <T w={700} s={13} c={t.accText}>{s.remove}</T>
    </Btn>
  );
  const AddBtn = ({ onPress }: { onPress: () => void }) => (
    <Btn onPress={onPress} style={{ height: 48, borderRadius: 14, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
      <T w={700} s={16} c={t.onAcc}>+ {s.add}</T>
    </Btn>
  );
  return (
    <Page>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
        <Btn onPress={() => go('settings')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 8 }}>
          <Chev color={t.ink} />
          <T w={500} s={16}>{s.back}</T>
        </Btn>
      </View>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 24, gap: 10 }} keyboardShouldPersistTaps="handled">
        <T k="head" s={32} lh={1.1}>{s.adminTitle}</T>
        <T s={13} lh={1.4}>{s.adminNote}</T>
        <Segmented
          value={tab} onChange={setTab} ink={t.ink} bg={t.bg} h={40} size={14}
          options={[{ key: 'equiv', label: s.adminEquiv }, { key: 'ranks', label: s.adminRanks }, { key: 'rules', label: s.adminRules }]}
        />
        {tab === 'equiv' && (
          <>
            <T s={13}>{s.equivHint}</T>
            {equivItems.map(it => (
              <View key={it.id} style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, padding: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Field label={s.fHeOne} value={it.he[0]} onChange={v => setItem(it.id, x => ({ ...x, he: [v, x.he[1]] }))} />
                  <Field label={s.fHeMany} value={it.he[1]} onChange={v => setItem(it.id, x => ({ ...x, he: [x.he[0], v] }))} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Field label={s.fEnOne} value={it.en[0]} onChange={v => setItem(it.id, x => ({ ...x, en: [v, x.en[1]] }))} />
                  <Field label={s.fEnMany} value={it.en[1]} onChange={v => setItem(it.id, x => ({ ...x, en: [x.en[0], v] }))} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                  <Field num label={s.fKg} value={it.kg} onChange={v => setItem(it.id, x => ({ ...x, kg: num(v) }))} />
                  <Del onPress={() => setEquivItems(equivItems.filter(x => x.id !== it.id))} />
                </View>
              </View>
            ))}
            <AddBtn onPress={() => setEquivItems([...equivItems, { id: 'n' + Date.now(), he: ['', ''], en: ['', ''], kg: 1 }])} />
          </>
        )}
        {tab === 'ranks' && (
          <>
            <Segmented
              value={rg} onChange={setRg} ink={t.ink} bg={t.bg}
              options={[{ key: 'male', label: s.ranksMale }, { key: 'female', label: s.ranksFemale }]}
            />
            {ranks.map(r => (
              <View key={r.id} style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, padding: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Field label={s.fNameHe} value={r.he} onChange={v => setRank(r.id, x => ({ ...x, he: v }))} />
                  <Field label={s.fNameEn} value={r.en} onChange={v => setRank(r.id, x => ({ ...x, en: v }))} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                  <Field num label={s.fMin} value={r.min} onChange={v => setRank(r.id, x => ({ ...x, min: num(v) }))} />
                  {ranks.length > 1 && <Del onPress={() => setRanks(ranks.filter(x => x.id !== r.id))} />}
                </View>
              </View>
            ))}
            <AddBtn onPress={() => setRanks([...ranks, { id: 'n' + Date.now(), he: '', en: '', min: (ranks.reduce((m, r) => Math.max(m, r.min), 0)) + 500 }])} />
          </>
        )}
        {tab === 'rules' && (
          <View style={{ borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, padding: 12, gap: 10 }}>
            {(['workout', 'pr', 'streak', 'share'] as RuleKey[]).map(k => (
              <Field key={k} num label={s[('rule' + k[0].toUpperCase() + k.slice(1)) as 'ruleWorkout']} value={rules[k]}
                onChange={v => setRules({ ...rules, [k]: num(v) })} />
            ))}
          </View>
        )}
      </ScrollView>
      <TabBar />
    </Page>
  );
}

// ---------------------------------------------------------------- Settings
export function Settings() {
  const { s, t, lang, setLang, themeKey, setTheme, role, isAdmin, canPreview, viewAsTrainee, setViewAsTrainee, go } = useApp();
  const { session, profile, signOut } = useAuth();
  return (
    <Page>
      <ScrollView style={scrollStyle()} contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <T k="head" s={32} lh={1.1}>{s.settings}</T>
        <T k="head" s={20} style={{ marginTop: 30 }}>{s.role}</T>
        <T s={16} style={{ marginTop: 10 }}>
          {isAdmin ? s.roleAdmin : role === 'coach' ? s.roleCoach : s.roleTrainee}
        </T>
        {canPreview && (
          <View style={{ marginTop: 14, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <T w={700} s={16} style={{ flex: 1 }}>{s.viewAsTrainee}</T>
              <View style={{ direction: 'ltr' } as ViewStyle}>
                <Switch value={viewAsTrainee} onValueChange={setViewAsTrainee} trackColor={{ true: t.acc, false: '#B8B2AC' }} />
              </View>
            </View>
            <T s={13} lh={1.4}>{s.viewAsTraineeNote}</T>
          </View>
        )}
        <T s={13} lh={1.4} style={{ marginTop: 4 }} he={false}>{s.signedInAs}{session?.user.email}</T>
        {isAdmin && (
          <Btn onPress={() => go('admin')} style={{ marginTop: 14, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
            <T w={700} s={16}>{s.admin}</T>
          </Btn>
        )}
        {role === 'coach' && (
          <Btn onPress={() => go('cycles')} style={{ marginTop: 10, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
            <T w={700} s={16}>{s.cycleBuilder}</T>
          </Btn>
        )}
        <Btn onPress={() => go('profile')} style={{ marginTop: 10, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={16}>{s.myDetails}</T>
        </Btn>
        <Btn onPress={signOut} style={{ marginTop: 10, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
          <T w={700} s={16}>{s.signOut}</T>
        </Btn>
        <T k="head" s={20} style={{ marginTop: 32 }}>{s.language}</T>
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
