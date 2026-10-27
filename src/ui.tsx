import React from 'react';
import { Platform, Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, Line, Pattern, Polyline, Rect } from 'react-native-svg';
import { useApp } from './store';
import type { Screen } from './store';

export const ICON_BLACK = require('../assets/brand/stage-icon-black.svg');
export const ICON_WHITE = require('../assets/brand/stage-icon-white.svg');
export const LOGO_BLACK = require('../assets/brand/stage-logo-black.svg');
export const LOGO_WHITE = require('../assets/brand/stage-logo-white.svg');
export const LOGO_RATIO = 1718.01 / 681.85;
export const ICON_RATIO = 507.99 / 221.35;

type Kind = 'body' | 'head' | 'num';

export function fam(k: Kind, he: boolean, w: number) {
  if (k === 'num') return w >= 800 ? 'Archivo-ExtraBold' : w >= 500 ? 'Archivo-Medium' : 'Archivo';
  if (k === 'head') return he ? 'NarkissBlock' : 'Archivo-ExtraBold';
  if (he) return w >= 700 ? 'Heebo_700Bold' : w >= 500 ? 'Heebo_500Medium' : 'Heebo_400Regular';
  return w >= 700 ? 'Archivo-ExtraBold' : w >= 500 ? 'Archivo-Medium' : 'Archivo';
}

type TProps = {
  k?: Kind; w?: number; s?: number; c?: string; lh?: number; ltr?: boolean;
  style?: StyleProp<TextStyle>; he?: boolean; children?: React.ReactNode; numberOfLines?: number;
};

/** Text. `k` picks the font family: body (Heebo/Archivo), head (Narkiss/Archivo), num (Archivo). */
export function T({ k = 'body', w = 400, s = 16, c, lh, ltr, style, he: heProp, children, numberOfLines }: TProps) {
  const app = useApp();
  const he = heProp ?? app.he;
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: fam(k, he, w), fontSize: s, color: c ?? app.t.ink },
        // On web, "auto" aligns by content (Latin text goes left in RTL). "start" follows the screen direction.
        Platform.OS === 'web' && ({ textAlign: 'start' } as TextStyle),
        lh != null && { lineHeight: s * lh },
        ltr && ({ direction: 'ltr', writingDirection: 'ltr' } as TextStyle),
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Btn({ onPress, style, children, label }: {
  onPress?: () => void; style?: StyleProp<ViewStyle>; children: React.ReactNode; label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, cursor: 'pointer' } as ViewStyle, style]}>
      {children}
    </Pressable>
  );
}

export function Chev({ color }: { color: string }) {
  const { he } = useApp();
  return (
    <Svg width={10} height={18} viewBox="0 0 10 18">
      <Polyline
        points={he ? '1.5,1.5 8.5,9 1.5,16.5' : '8.5,1.5 1.5,9 8.5,16.5'}
        fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseX({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Line x1={2} y1={2} x2={14} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={14} y1={2} x2={2} y2={14} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

/** Fake iOS status bar. Only shown inside the desktop phone frame. */
export function StatusBarFake({ ink }: { ink: string }) {
  const { frame } = useApp();
  if (!frame) return <View style={{ height: 8 }} />;
  const bars = [4, 6, 9, 12];
  return (
    <View style={{ height: 54, paddingTop: 6, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', direction: 'ltr' } as ViewStyle}>
      <T k="num" w={500} s={16} c={ink} he={false}>9:41</T>
      <View style={{ position: 'absolute', top: 11, left: 134, width: 125, height: 36, borderRadius: 20, backgroundColor: '#2B1111' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 12 }}>
          {bars.map(h => <View key={h} style={{ width: 3, height: h, backgroundColor: ink, borderRadius: 1 }} />)}
        </View>
        <View style={{ width: 25, height: 12, borderWidth: 1.5, borderColor: ink, borderRadius: 4, padding: 1.5 }}>
          <View style={{ width: '75%', height: '100%', backgroundColor: ink, borderRadius: 1.5 }} />
        </View>
      </View>
    </View>
  );
}

export function HomeIndicator({ ink }: { ink: string }) {
  const { frame } = useApp();
  if (!frame) return null;
  return <View pointerEvents="none" style={{ position: 'absolute', bottom: 8, left: 129, width: 135, height: 5, borderRadius: 3, backgroundColor: ink }} />;
}

export function TabBar() {
  const { s, t, screen, go, frame } = useApp();
  const tabs: [Screen, string][] = [
    ['home', s.tabHome], ['progress', s.tabProgress], ['board', s.tabBoard], ['settings', s.tabSettings],
  ];
  return (
    <View style={{ height: frame ? 84 : 72, borderTopWidth: 1, borderTopColor: t.ink, flexDirection: 'row', paddingHorizontal: 8 }}>
      {tabs.map(([key, label]) => {
        const on = screen === key;
        return (
          <Btn key={key} onPress={() => go(key)} style={{ flex: 1, alignItems: 'center', gap: 11 }} label={label}>
            <View style={{ width: 30, height: 3, backgroundColor: on ? t.acc : 'transparent' }} />
            <T w={on ? 700 : 500} s={14}>{label}</T>
          </Btn>
        );
      })}
    </View>
  );
}

/** Screen shell: background, reading direction, status bar, home indicator. */
export function Page({ bg, ink, children }: { bg?: string; ink?: string; children: React.ReactNode }) {
  const { t, he } = useApp();
  const b = bg ?? t.bg;
  const i = ink ?? t.ink;
  return (
    <View style={{ flex: 1, backgroundColor: b, direction: he ? 'rtl' : 'ltr' } as ViewStyle}>
      <StatusBarFake ink={i} />
      {children}
      <HomeIndicator ink={i} />
    </View>
  );
}

export function Segmented<K extends string>({ options, value, onChange, ink, bg, h = 44, size = 16, radius = 12, flex = true }: {
  options: { key: K; label: string; font?: Kind; he?: boolean }[]; value: K; onChange?: (k: K) => void;
  ink: string; bg: string; h?: number; size?: number; radius?: number; flex?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1.5, borderColor: ink, borderRadius: radius, padding: 3, gap: 3 }}>
      {options.map(o => {
        const on = o.key === value;
        return (
          <Btn key={o.key} onPress={() => onChange?.(o.key)}
            style={{ flex: flex ? 1 : undefined, height: h, paddingHorizontal: flex ? 0 : 12, borderRadius: radius - 3, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? ink : 'transparent' }}>
            <T w={on ? 700 : 500} s={size} c={on ? bg : ink} he={o.he}>{o.label}</T>
          </Btn>
        );
      })}
    </View>
  );
}

/** Checker or stripe background used to preview the transparent story card. */
export function PreviewBg({ kind, width, height }: { kind: 'checker' | 'stripes'; width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        {kind === 'checker' ? (
          <Pattern id="p" width={20} height={20} patternUnits="userSpaceOnUse">
            <Rect width={20} height={20} fill="#FFFFFF" />
            <Rect width={10} height={10} fill="#D8D5D0" />
            <Rect x={10} y={10} width={10} height={10} fill="#D8D5D0" />
          </Pattern>
        ) : (
          <Pattern id="p" width={28} height={28} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width={28} height={28} fill="#2B1111" />
            <Rect width={14} height={28} fill="#484341" />
          </Pattern>
        )}
      </Defs>
      <Rect width={width} height={height} fill="url(#p)" />
    </Svg>
  );
}

export { Image };
