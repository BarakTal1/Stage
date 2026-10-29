import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Gender, useAuth } from './auth';
import { useApp } from './store';
import { Btn, Page, Segmented, T } from './ui';

const toInt = (v: string, lo: number, hi: number): number | null | 'bad' => {
  const x = v.trim();
  if (!x) return null;
  const n = Number(x.replace(',', '.'));
  return Number.isFinite(n) && n >= lo && n <= hi ? n : 'bad';
};

/** The trainee's own details. `first` is the one-time form after the first sign-in: no back button, name and gender required. */
export function Details({ first = false }: { first?: boolean }) {
  const { s, t, he, go, showToast } = useApp();
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [year, setYear] = useState(profile?.birth_year?.toString() ?? '');
  const [height, setHeight] = useState(profile?.height_cm?.toString() ?? '');
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const input = {
    height: 50, borderWidth: 1.5, borderColor: t.ink, borderRadius: 12, paddingHorizontal: 14, color: t.ink,
    fontSize: 16, fontFamily: 'Heebo_400Regular', textAlign: he ? 'right' : 'left',
  } as const;

  const save = async () => {
    if (busy) return;
    const y = toInt(year, 1920, 2020), h = toInt(height, 100, 250), w = toInt(weight, 30, 300);
    if (!name.trim() || !gender || y === 'bad' || h === 'bad' || w === 'bad') { setMsg(s.badDetails); return; }
    setBusy(true); setMsg(null);
    const err = await updateProfile({ name: name.trim(), gender, birth_year: y, height_cm: h, weight_kg: w });
    setBusy(false);
    if (err) { setMsg(`${s.saveFailed}: ${err}`); return; }
    if (!first) { showToast(s.detailsSaved); go('settings'); }
  };

  const Label = ({ children, opt }: { children: string; opt?: boolean }) => (
    <T w={500} s={14} style={{ marginTop: 6 }}>{children}{opt ? ` (${s.optional})` : ''}</T>
  );

  return (
    <Page>
      {!first && (
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Btn onPress={() => go('settings')} style={{ height: 44, paddingHorizontal: 8, justifyContent: 'center' }}>
            <T w={500} s={16}>{s.back}</T>
          </Btn>
        </View>
      )}
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: first ? 'center' : 'flex-start', paddingTop: 10, paddingHorizontal: 24, paddingBottom: 24, gap: 8 }} keyboardShouldPersistTaps="handled">
        <T k="head" s={32} lh={1.1}>{first ? s.detailsTitle : s.myDetails}</T>
        <T s={13} lh={1.4}>{s.detailsNote}</T>
        <Label>{s.fName}</Label>
        <TextInput value={name} onChangeText={setName} style={input} placeholderTextColor={t.ink + '88'} />
        <Label>{s.gender}</Label>
        <Segmented
          value={gender ?? ('' as Gender)} onChange={setGender} ink={t.ink} bg={t.bg}
          options={[{ key: 'male', label: s.male }, { key: 'female', label: s.female }]}
        />
        <Label opt>{s.birthYear}</Label>
        <TextInput value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} style={input} />
        <Label opt>{s.heightCm}</Label>
        <TextInput value={height} onChangeText={setHeight} keyboardType="number-pad" maxLength={3} style={input} />
        <Label opt>{s.weightKg}</Label>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="decimal-pad" maxLength={5} style={input} />
        {msg && <T s={14} lh={1.4} c={t.accText}>{msg}</T>}
        <Btn onPress={save} style={{ marginTop: 10, height: 52, borderRadius: 14, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          <T w={700} s={17} c={t.onAcc}>{s.saveDetails}</T>
        </Btn>
      </ScrollView>
    </Page>
  );
}
