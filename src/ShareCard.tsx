import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { CARD_STR, CardColor, Lang, DEF, MONTH, WORKOUTS, equivText, todayNum } from './data';
import { T, LOGO_BLACK, LOGO_RATIO, LOGO_WHITE } from './ui';
import { useApp } from './store';

const SHOW_MOCK_STATS = false;

const FULL = {
  red: { bg: '#CB0709', ink: '#FFFFFF', num: '#FFFFFF', chipBg: '#FFFFFF', chipFg: '#CB0709' },
  brown: { bg: '#2B1111', ink: '#FFFFFF', num: '#FF5826', chipBg: '#FF5826', chipFg: '#2B1111' },
  orange: { bg: '#FF5826', ink: '#2B1111', num: '#2B1111', chipBg: '#2B1111', chipFg: '#FFFFFF' },
};
const CLEAR = {
  light: { ink: '#FFFFFF', num: '#FFFFFF', white: true },
  dark: { ink: '#2B1111', num: '#CB0709', white: false },
};

/** Draws the 1080 x 1920 story card. `k` scales every size, so 0.25 gives the preview. */
export function ShareCard({ variant, ink, lang, k }: {
  variant: CardColor | 'clear'; ink: 'light' | 'dark'; lang: Lang; k: number;
}) {
  const { total: workoutTotal, pct: workoutPct, prs, hidden, wk, period, photo, equivFor } = useApp();
  const month = period === 'month';
  const total = month ? MONTH.total : workoutTotal;
  const pct = month ? MONTH.pct : workoutPct;
  const he = lang === 'he';
  const st = CARD_STR[lang];
  const z = (n: number) => n * k;

  // Content rules from the card spec: header + total, then at most two extra elements.
  // Order: records, progress, streak, rank. Rank is dropped when the trainee hides from the board.
  const cardPrs = (month ? [] : prs).slice(0, 2).map(p => ({ name: DEF[p.id][lang], w: p.w }));
  const extras: string[] = [];
  if (cardPrs.length) extras.push('prs');
  if (pct > 0) extras.push('progress');
  // The streak and the rank are mock values until the app saves real history. They stay off the card.
  if (SHOW_MOCK_STATS) {
    extras.push('streak');
    if (!hidden) extras.push('rank');
  }
  const show = extras.slice(0, 2);
  const showPRs = show.includes('prs'), showProgress = show.includes('progress');
  const showStreak = show.includes('streak'), showRank = show.includes('rank');

  const totalStr = Number(total).toLocaleString('en-US');
  const digits = totalStr.replace(/\D/g, '').length;
  const commas = (totalStr.match(/,/g) || []).length;
  const em = digits * 0.64 + commas * 0.28;
  const focus = WORKOUTS[wk].focus[lang];
  const date = todayNum();
  const totalLabel = month ? st.totalMonth : st.total;
  const fromLast = month ? st.fromLastMonth : st.fromLast;
  const equiv = equivText(total, equivFor(total), lang);

  const hf = (props: object) => ({ he, ...props });
  const Pill = (c: { children: React.ReactNode; style: ViewStyle }) => (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', borderRadius: 999 }, c.style]}>{c.children}</View>
  );

  const root: ViewStyle = { width: z(1080), height: z(1920), overflow: 'hidden', direction: he ? 'rtl' : 'ltr' } as ViewStyle;

  if (variant !== 'clear') {
    const c = FULL[variant];
    const numSize = Math.min(300, Math.floor(880 / em));
    return (
      <View style={[root, { backgroundColor: c.bg }]}>
        <View style={{ flex: 1, paddingTop: z(200), paddingBottom: z(240), paddingHorizontal: z(96) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: z(40) }}>
            <Image source={LOGO_WHITE} contentFit="contain" style={{ width: z(400), height: z(400) / LOGO_RATIO }} />
            {photo ? (
              <Image source={{ uri: photo }} contentFit="cover"
                style={{ width: z(190), height: z(190), borderRadius: z(95), borderWidth: z(6), borderColor: c.ink }} />
            ) : (
              <T k="num" w={500} s={z(40)} c={c.ink} style={{ paddingTop: z(8) }} he={false}>{date}</T>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: z(24), alignItems: 'baseline', marginTop: z(photo ? 36 : 72) }}>
            {month ? (
              <T {...hf({})} k="head" s={z(76)} c={c.ink}>{MONTH.name[lang]}</T>
            ) : (
              <>
                <T {...hf({})} k="head" s={z(76)} c={c.ink}>{st.workout} <T k="num" w={800} s={z(76)} c={c.ink}>{wk}</T></T>
                <T {...hf({})} k="head" s={z(76)} c={c.ink}>·</T>
                <T {...hf({})} k="head" s={z(76)} c={c.ink}>{focus}</T>
              </>
            )}
          </View>
          {photo && <T k="num" w={500} s={z(40)} c={c.ink} style={{ marginTop: z(12) }} he={false}>{date}</T>}
          <View style={{ flex: 1, justifyContent: 'center', gap: z(12) }}>
            <T {...hf({})} k="head" s={z(60)} c={c.ink}>{totalLabel}</T>
            <T k="num" w={800} s={z(numSize)} c={c.num} ltr lh={0.86}
              style={{ textAlign: he ? 'right' : 'left', letterSpacing: z(numSize) * -0.02 }}>{totalStr}</T>
            <T {...hf({})} k="head" s={z(110)} c={c.ink}>{st.kg}</T>
            <T {...hf({})} w={500} s={z(48)} c={c.ink}>{equiv}</T>
          </View>
          <View style={{ gap: z(36), alignItems: 'flex-start' }}>
            {showPRs && (
              <View style={{ alignSelf: 'stretch' }}>
                {cardPrs.map(pr => (
                  <View key={pr.name} style={{ flexDirection: 'row', alignItems: 'center', gap: z(28), paddingVertical: z(26), borderTopWidth: z(4), borderTopColor: c.ink }}>
                    <View style={{ backgroundColor: c.chipBg, paddingVertical: z(14), paddingHorizontal: z(24), borderRadius: 999 }}>
                      <T w={700} s={z(34)} c={c.chipFg} {...hf({})}>{st.pr}</T>
                    </View>
                    <T w={500} s={z(42)} c={c.ink} lh={1.2} {...hf({})} style={{ flex: 1 }}>{pr.name}</T>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: z(12) }}>
                      <T k="num" w={800} s={z(76)} c={c.ink}>{pr.w}</T>
                      <T k="head" s={z(40)} c={c.ink} {...hf({})}>{st.kg}</T>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {showProgress && (
              <Pill style={{ gap: z(18), backgroundColor: c.chipBg, paddingVertical: z(22), paddingHorizontal: z(40) }}>
                <T k="num" w={800} s={z(60)} c={c.chipFg} ltr>{'+' + pct + '%'}</T>
                <T w={700} s={z(42)} c={c.chipFg} {...hf({})}>{fromLast}</T>
              </Pill>
            )}
            {showStreak && (
              <Pill style={{ gap: z(18), borderWidth: z(4), borderColor: c.ink, paddingVertical: z(18), paddingHorizontal: z(36) }}>
                <T k="num" w={800} s={z(60)} c={c.ink}>5</T>
                <T w={700} s={z(42)} c={c.ink} {...hf({})}>{st.streak}</T>
              </Pill>
            )}
            {showRank && (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: z(16) }}>
                <T k="num" w={800} s={z(60)} c={c.ink} ltr>#2</T>
                <T w={500} s={z(44)} c={c.ink} {...hf({})}>{st.rank}</T>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Transparent card: no background, no blocks. Text floats on the photo.
  const c = CLEAR[ink];
  const numSize = Math.min(270, Math.floor(720 / em));
  const pill = { borderWidth: z(4), borderColor: c.ink, paddingVertical: z(18), paddingHorizontal: z(36), gap: z(18) };
  return (
    <View style={root}>
      <View style={{ flex: 1, paddingTop: z(200), paddingBottom: z(240), paddingHorizontal: z(88), alignItems: 'flex-start', gap: z(20) }}>
        <View style={{ gap: z(36), alignSelf: 'stretch' }}>
          <Image source={c.white ? LOGO_WHITE : LOGO_BLACK} contentFit="contain" style={{ width: z(380), height: z(380) / LOGO_RATIO }} />
          <View style={{ gap: z(14) }}>
            {month ? (
              <T {...hf({})} k="head" s={z(64)} c={c.ink} lh={1}>{MONTH.name[lang]}</T>
            ) : (
              <T {...hf({})} k="head" s={z(64)} c={c.ink} lh={1}>{st.workout} <T k="num" w={800} s={z(64)} c={c.ink}>{wk}</T> · {focus}</T>
            )}
            <T k="num" w={500} s={z(40)} c={c.ink} he={false}>{date}</T>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ gap: z(10), marginBottom: z(24) }}>
          <T {...hf({})} k="head" s={z(56)} c={c.ink}>{totalLabel}</T>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: z(24) }}>
            <T k="num" w={800} s={z(numSize)} c={c.num} ltr lh={0.86} style={{ letterSpacing: z(numSize) * -0.02 }}>{totalStr}</T>
            <T {...hf({})} k="head" s={z(80)} c={c.ink}>{st.kg}</T>
          </View>
          <T {...hf({})} w={500} s={z(44)} c={c.ink}>{equiv}</T>
        </View>
        {showPRs && (
          <View style={{ alignSelf: 'stretch' }}>
            {cardPrs.map(pr => (
              <View key={pr.name} style={{ flexDirection: 'row', alignItems: 'center', gap: z(24), paddingVertical: z(24), borderTopWidth: z(4), borderTopColor: c.ink }}>
                <View style={{ borderWidth: z(4), borderColor: c.ink, paddingVertical: z(10), paddingHorizontal: z(20), borderRadius: 999 }}>
                  <T w={700} s={z(32)} c={c.ink} {...hf({})}>{st.pr}</T>
                </View>
                <T w={500} s={z(40)} c={c.ink} lh={1.2} {...hf({})} style={{ flex: 1 }}>{pr.name}</T>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: z(10) }}>
                  <T k="num" w={800} s={z(68)} c={c.ink}>{pr.w}</T>
                  <T k="head" s={z(36)} c={c.ink} {...hf({})}>{st.kg}</T>
                </View>
              </View>
            ))}
          </View>
        )}
        {showProgress && (
          <Pill style={pill}>
            <T k="num" w={800} s={z(58)} c={c.ink} ltr>{'+' + pct + '%'}</T>
            <T w={700} s={z(40)} c={c.ink} {...hf({})}>{fromLast}</T>
          </Pill>
        )}
        {showStreak && (
          <Pill style={pill}>
            <T k="num" w={800} s={z(58)} c={c.ink}>5</T>
            <T w={700} s={z(40)} c={c.ink} {...hf({})}>{st.streak}</T>
          </Pill>
        )}
        {showRank && (
          <Pill style={pill}>
            <T k="num" w={800} s={z(58)} c={c.ink} ltr>#2</T>
            <T w={700} s={z(40)} c={c.ink} {...hf({})}>{st.rank}</T>
          </Pill>
        )}
      </View>
    </View>
  );
}

