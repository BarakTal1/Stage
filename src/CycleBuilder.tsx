import React, { useCallback, useEffect, useState } from 'react';
import { Modal, ScrollView, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from './store';
import { useAuth } from './auth';
import { Btn, Page, Segmented, T } from './ui';
import { Field } from './screens';
import { CyclePart, CycleWorkout, ExerciseRow, PART_NAME, PartKind, VARIANT_NAME, Variant, WorkoutKey } from './data';
import {
  CycleDetail, CycleListItem, MAX_VIDEO_BYTES, PART_KINDS, TRACKED, WORKOUT_KEYS, activateCycle, cloneCycle, deleteCycle, deleteExercise,
  listCycles, loadCycle, loadExerciseUsage, loadExercises, newPart, saveCycle, saveExercise, uploadExerciseVideo,
} from './cycle';

const num = (v: string) => { const n = parseFloat(v.replace(',', '.')); return isNaN(n) ? 0 : n; };

function useStyles() {
  const { t } = useApp();
  return {
    card: { borderWidth: 1.5, borderColor: t.ink, borderRadius: 14, padding: 12, gap: 8 } as const,
    wide: { height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' } as const,
    small: { height: 34, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1.5, borderColor: t.ink, alignItems: 'center', justifyContent: 'center' } as const,
  };
}

function Header({ onBack }: { onBack: () => void }) {
  const { s } = useApp();
  return (
    <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
      <Btn onPress={onBack} style={{ height: 44, paddingHorizontal: 8, justifyContent: 'center' }}>
        <T w={500} s={16}>{s.back}</T>
      </Btn>
    </View>
  );
}

/** The studio staff build cycles here: the exercises of each part, rep ranges, and the exercise library with video links. */
export function Cycles() {
  const { s, t, go } = useApp();
  const [tab, setTab] = useState<'cycles' | 'library'>('cycles');
  const [openId, setOpenId] = useState<string | null>(null);

  if (openId) return <CycleEditor id={openId} onBack={() => setOpenId(null)} />;
  return (
    <Page>
      <Header onBack={() => go('settings')} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 24, gap: 12 }} keyboardShouldPersistTaps="handled">
        <T k="head" s={30} lh={1.1}>{s.cycleBuilder}</T>
        <Segmented
          value={tab} onChange={setTab} ink={t.ink} bg={t.bg}
          options={[{ key: 'cycles', label: s.tabCycles }, { key: 'library', label: s.tabLibrary }]}
        />
        {tab === 'cycles' ? <CycleList onOpen={setOpenId} /> : <Library />}
      </ScrollView>
    </Page>
  );
}

function CycleList({ onOpen }: { onOpen: (id: string) => void }) {
  const { s, t, lang, showToast, reloadCycle } = useApp();
  const { profile } = useAuth();
  const st = useStyles();
  const isAdmin = profile?.role === 'admin';
  const [list, setList] = useState<CycleListItem[] | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(() => listCycles().then(setList), []);
  useEffect(() => { refresh(); }, [refresh]);

  const run = async (fn: () => Promise<string | null>, ok?: string) => {
    if (busy) return;
    setBusy(true);
    const err = await fn();
    setBusy(false);
    if (err) showToast(`${s.saveFailed}: ${err}`);
    else if (ok) showToast(ok);
    await refresh();
  };
  const active = list?.find(c => c.active);

  return (
    <View style={{ gap: 10 }}>
      {!list && <T s={14}>{s.loading}</T>}
      {list?.map(c => (
        <View key={c.id} style={st.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <T w={700} s={17} style={{ flex: 1 }}>{(lang === 'he' ? c.name_he : c.name_en) || '—'}</T>
            {c.active && <T w={700} s={13} c={t.accText}>{s.activeTag}</T>}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Btn onPress={() => onOpen(c.id)} style={st.small}><T w={700} s={14}>{s.editBtn}</T></Btn>
            <Btn
              onPress={() => run(async () => (await cloneCycle(c.id)).error)}
              style={st.small}><T w={700} s={14}>{s.duplicate}</T></Btn>
            {isAdmin && !c.active && (
              <Btn
                onPress={() => run(async () => { const e = await activateCycle(c.id); if (!e) await reloadCycle(); return e; }, s.cycleActivated)}
                style={st.small}><T w={700} s={14}>{s.activateBtn}</T></Btn>
            )}
            {isAdmin && !c.active && (
              <Btn
                onPress={() => (confirm === c.id ? (setConfirm(null), run(() => deleteCycle(c.id))) : setConfirm(c.id))}
                style={st.small}><T w={700} s={14} c={t.accText}>{confirm === c.id ? s.confirmDelete : s.deleteBtn}</T></Btn>
            )}
          </View>
        </View>
      ))}
      {active && (
        <Btn onPress={() => run(async () => (await cloneCycle(active.id)).error)} style={[st.wide, { backgroundColor: t.acc, borderColor: t.acc }]}>
          <T w={700} s={16} c={t.onAcc}>+ {s.newCycle}</T>
        </Btn>
      )}
    </View>
  );
}

function CycleEditor({ id, onBack }: { id: string; onBack: () => void }) {
  const { s, t, lang, showToast, reloadCycle } = useApp();
  const st = useStyles();
  const [draft, setDraft] = useState<CycleDetail | null>(null);
  const [exs, setExs] = useState<ExerciseRow[]>([]);
  const [wk, setWk] = useState<WorkoutKey>('B');
  const [pick, setPick] = useState<{ index: number; variant: Variant | null } | null>(null);
  const [addingPart, setAddingPart] = useState(false);
  const [confirmPart, setConfirmPart] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [freeHe, setFreeHe] = useState('');
  const [freeEn, setFreeEn] = useState('');
  // The id and the video are ready before the exercise exists, so the coach adds the video at the moment of creation.
  const [freeId, setFreeId] = useState(() => 'x' + Date.now().toString(36));
  const [freeVideo, setFreeVideo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [warnEmpty, setWarnEmpty] = useState(false);
  // Any edit takes the warning back, so the coach must confirm again.
  useEffect(() => { setWarnEmpty(false); }, [draft]);

  useEffect(() => { Promise.all([loadCycle(id), loadExercises()]).then(([c, e]) => { setDraft(c); setExs(e); }); }, [id]);
  if (!draft) return <Page><Header onBack={onBack} /><T s={14} style={{ padding: 20 }}>{s.loading}</T></Page>;

  const name = (exId: string) => exs.find(e => e.id === exId)?.[lang] ?? exId;
  const workout = draft.workouts.find(w => w.key === wk) as CycleWorkout;
  const patchWorkout = (fn: (w: CycleWorkout) => CycleWorkout) =>
    setDraft(d => (d ? { ...d, workouts: d.workouts.map(w => (w.key === wk ? fn(w) : w)) } : d));
  const patchPart = (index: number, fn: (p: CyclePart) => CyclePart) =>
    patchWorkout(w => ({ ...w, parts: w.parts.map((p, i) => (i === index ? fn(p) : p)) }));
  const moveItem = (index: number, d: number) =>
    patchWorkout(w => {
      const parts = [...w.parts];
      const j = index + d;
      if (j < 0 || j >= parts.length) return w;
      [parts[index], parts[j]] = [parts[j], parts[index]];
      return { ...w, parts };
    });

  const idsOf = (p: CyclePart, v: Variant | null) =>
    p.items.filter(i => i.variant === v).sort((a, b) => a.position - b.position).map(i => i.exercise_id);
  const setIds = (index: number, v: Variant | null, ids: string[]) =>
    patchPart(index, p => ({
      ...p,
      items: [...p.items.filter(i => i.variant !== v), ...ids.map((exercise_id, position) => ({ variant: v, position, exercise_id }))],
    }));
  const addToPart = (exId: string) => {
    if (!pick) return;
    const part = workout.parts[pick.index];
    setIds(pick.index, pick.variant, [...idsOf(part, pick.variant), exId]);
    setPick(null);
  };

  /** A free exercise is a new library exercise. It works like any other: weights, video, and reuse in later cycles. */
  const addFree = async () => {
    const he = freeHe.trim(), en = freeEn.trim();
    if (!he && !en) { showToast(s.badDetails); return; }
    const row: ExerciseRow = { id: freeId, he: he || en, en: en || he, video_url: freeVideo, step: 2.5 };
    const err = await saveExercise(row);
    if (err) { showToast(`${s.saveFailed}: ${err}`); return; }
    setExs(list => [...list, row]);
    setFreeHe(''); setFreeEn(''); setFreeVideo(null); setFreeId('x' + Date.now().toString(36));
    addToPart(row.id);
  };

  const save = async () => {
    if (busy) return;
    const badReps = draft.workouts.some(w => w.parts.some(p => TRACKED.includes(p.kind) && (!p.reps_min || !p.reps_max || p.reps_min < 1 || p.reps_max < p.reps_min)));
    if (badReps) { showToast(s.badDetails); return; }
    const hasEmpty = draft.workouts.some(w => w.parts.some(p => p.items.length === 0));
    if (hasEmpty && !warnEmpty) { setWarnEmpty(true); return; }
    setBusy(true);
    const err = await saveCycle(draft);
    if (!err && draft.active) await reloadCycle();
    setBusy(false);
    showToast(err ? `${s.saveFailed}: ${err}` : s.detailsSaved);
  };

  const group = (p: CyclePart, index: number, v: Variant | null) => {
    const ids = idsOf(p, v);
    const move = (i: number, d: number) => {
      const next = [...ids];
      const j = i + d;
      if (j < 0 || j >= next.length) return;
      [next[i], next[j]] = [next[j], next[i]];
      setIds(index, v, next);
    };
    return (
      <View key={String(v)} style={{ gap: 6 }}>
        {v && <T w={700} s={14}>{VARIANT_NAME[v][lang]}</T>}
        {ids.length === 0 && <T s={13}>{s.noExercises}</T>}
        {ids.map((exId, i) => (
          <View key={exId + i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <T s={14} lh={1.3} style={{ flex: 1 }}>{name(exId)}</T>
            <Btn onPress={() => move(i, -1)} style={st.small}><T w={700} s={14}>↑</T></Btn>
            <Btn onPress={() => move(i, 1)} style={st.small}><T w={700} s={14}>↓</T></Btn>
            <Btn onPress={() => setIds(index, v, ids.filter((_, k) => k !== i))} style={st.small}><T w={700} s={14} c={t.accText}>✕</T></Btn>
          </View>
        ))}
        <Btn onPress={() => { setQ(''); setPick({ index, variant: v }); }} style={st.small}>
          <T w={700} s={14}>+ {s.addExercise}</T>
        </Btn>
      </View>
    );
  };

  const shown = exs.filter(e => !q || e.he.includes(q) || e.en.toLowerCase().includes(q.toLowerCase()));

  return (
    <Page>
      <Header onBack={onBack} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 24, gap: 12 }} keyboardShouldPersistTaps="handled">
        {draft.active && <T s={13} lh={1.4} c={t.accText}>{s.liveNote}</T>}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Field label={s.fNameHe} value={draft.name_he} onChange={v => setDraft(d => d && { ...d, name_he: v })} />
          <Field label={s.fNameEn} value={draft.name_en} onChange={v => setDraft(d => d && { ...d, name_en: v })} />
        </View>
        <Segmented
          value={wk} onChange={setWk} ink={t.ink} bg={t.bg}
          options={WORKOUT_KEYS.map(k => ({ key: k, label: k }))}
        />
        <T w={700} s={15}>{s.focusLabel}</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Field label={s.fNameHe} value={workout.focus_he} onChange={v => patchWorkout(w => ({ ...w, focus_he: v }))} />
          <Field label={s.fNameEn} value={workout.focus_en} onChange={v => patchWorkout(w => ({ ...w, focus_en: v }))} />
        </View>
        {workout.parts.map((p, i) => (
          <View key={i} style={st.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T k="num" w={800} s={20}>{'0' + (i + 1)}</T>
              <T w={700} s={15} style={{ flex: 1 }}>{PART_NAME[p.kind][lang]}</T>
              <Btn onPress={() => moveItem(i, -1)} style={st.small}><T w={700} s={14}>↑</T></Btn>
              <Btn onPress={() => moveItem(i, 1)} style={st.small}><T w={700} s={14}>↓</T></Btn>
              <Btn
                onPress={() => {
                  if (confirmPart === i) { setConfirmPart(null); patchWorkout(w => ({ ...w, parts: w.parts.filter((_, k) => k !== i) })); }
                  else setConfirmPart(i);
                }}
                style={st.small}>
                <T w={700} s={13} c={t.accText}>{confirmPart === i ? s.confirmRemovePart : '✕'}</T>
              </Btn>
            </View>
            <T s={12}>{s.partNameNote}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Field label={s.fNameHe} value={p.title_he} onChange={v => patchPart(i, x => ({ ...x, title_he: v }))} />
              <Field label={s.fNameEn} value={p.title_en} onChange={v => patchPart(i, x => ({ ...x, title_en: v }))} />
            </View>
            {TRACKED.includes(p.kind) && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Field num label={s.repsFrom} value={p.reps_min ?? 0} onChange={v => patchPart(i, x => ({ ...x, reps_min: Math.round(num(v)) }))} />
                <Field num label={s.repsTo} value={p.reps_max ?? 0} onChange={v => patchPart(i, x => ({ ...x, reps_max: Math.round(num(v)) }))} />
              </View>
            )}
            {p.kind === 'last' ? (['upper', 'lower'] as Variant[]).map(v => group(p, i, v)) : group(p, i, null)}
          </View>
        ))}
        <Btn onPress={() => setAddingPart(true)} style={st.wide}><T w={700} s={16}>+ {s.addPart}</T></Btn>
        {warnEmpty && <T s={13} lh={1.4} c={t.accText}>{s.emptyPartsWarn}</T>}
        <Btn onPress={save} style={[st.wide, { backgroundColor: t.acc, borderColor: t.acc, opacity: busy ? 0.6 : 1 }]}>
          <T w={700} s={16} c={t.onAcc}>{s.saveCycle}</T>
        </Btn>
      </ScrollView>
      {addingPart && (
        <Modal transparent animationType="slide" onRequestClose={() => setAddingPart(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <View style={{ backgroundColor: t.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24, gap: 4 }}>
              <T k="head" s={22} lh={1.15}>{s.partKindTitle}</T>
              {PART_KINDS.map(kind => (
                <Btn
                  key={kind}
                  onPress={() => { patchWorkout(w => ({ ...w, parts: [...w.parts, newPart(kind, w.parts.length)] })); setAddingPart(false); }}
                  style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: t.ink }}>
                  <T w={500} s={15}>{PART_NAME[kind][lang]}</T>
                </Btn>
              ))}
              <Btn onPress={() => setAddingPart(false)} style={[st.wide, { marginTop: 8 }]}><T w={700} s={16}>{s.close}</T></Btn>
            </View>
          </View>
        </Modal>
      )}
      {pick && (
        <Modal transparent animationType="slide" onRequestClose={() => setPick(null)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <View style={{ backgroundColor: t.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '85%', paddingTop: 18, paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}>
              <T k="head" s={22} lh={1.15}>{s.addExercise}</T>
              <T w={700} s={14}>{s.freeExercise}</T>
              <T s={12} lh={1.3}>{s.freeHint}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Field label={s.fNameHe} value={freeHe} onChange={setFreeHe} />
                <Field label={s.fNameEn} value={freeEn} onChange={setFreeEn} />
              </View>
              <VideoButtons exId={freeId} hasVideo={!!freeVideo} onUrl={setFreeVideo} message={s.videoAttached} />
              <Btn onPress={addFree} style={[st.wide, { backgroundColor: t.acc, borderColor: t.acc }]}>
                <T w={700} s={16} c={t.onAcc}>+ {s.add}</T>
              </Btn>
              <T w={700} s={14} style={{ marginTop: 6 }}>{s.fromList}</T>
              <TextInput
                value={q} onChangeText={setQ} placeholder={s.searchEx} placeholderTextColor={t.ink + '88'}
                style={{ height: 44, borderWidth: 1.5, borderColor: t.ink, borderRadius: 10, paddingHorizontal: 10, color: t.ink, fontSize: 15, fontFamily: 'Heebo_400Regular' }}
              />
              <ScrollView style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled">
                {shown.map(e => (
                  <Btn key={e.id} onPress={() => addToPart(e.id)} style={{ paddingVertical: 14, borderTopWidth: 1, borderTopColor: t.ink }}>
                    <T w={500} s={15} lh={1.3}>{e[lang]}</T>
                  </Btn>
                ))}
              </ScrollView>
              <Btn onPress={() => setPick(null)} style={st.wide}><T w={700} s={16}>{s.close}</T></Btn>
            </View>
          </View>
        </Modal>
      )}
    </Page>
  );
}

/** Record a video with the camera, or pick one from the gallery. The file goes to storage and the link fills the field. */
function VideoButtons({ exId, hasVideo, onUrl, message }: { exId: string; hasVideo: boolean; onUrl: (url: string | null) => void; message?: string }) {
  const { s, t, showToast } = useApp();
  const st = useStyles();
  const [busy, setBusy] = useState(false);
  // The result shows here, under the buttons. A toast hides behind the window of the free exercise form.
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const say = (text: string, error = false) => { setStatus({ text, error }); showToast(text); };

  const send = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) { setStatus(null); return; }
    const a = result.assets[0];
    const mb = Math.round((a.fileSize ?? 0) / 1048576);
    if ((a.fileSize ?? 0) > MAX_VIDEO_BYTES) { say(`${s.videoTooBig} (${mb}MB)`, true); return; }
    setBusy(true); setStatus({ text: s.uploading, error: false });
    const r = await uploadExerciseVideo(exId, a.uri, a.mimeType, a.file);
    setBusy(false);
    if (r.error || !r.url) { say(`${s.saveFailed}: ${r.error}`, true); return; }
    onUrl(r.url);
    say(message ?? s.videoUploaded);
  };
  const run = async (open: () => Promise<ImagePicker.ImagePickerResult>) => {
    if (busy) return;
    try { await send(await open()); } catch (e) { say(`${s.saveFailed}: ${e instanceof Error ? e.message : String(e)}`, true); }
  };
  const record = () => run(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error(s.noCamera);
    return ImagePicker.launchCameraAsync({
      mediaTypes: 'videos', videoMaxDuration: 15, videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });
  });
  const pick = () => run(() => ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], videoMaxDuration: 15 }));

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Btn onPress={record} style={st.small}><T w={700} s={14}>{s.recordVideo}</T></Btn>
        <Btn onPress={pick} style={st.small}><T w={700} s={14}>{s.pickVideo}</T></Btn>
        {hasVideo && !busy && (
          <>
            <T w={500} s={13} c={t.accText}>{s.hasVideo}</T>
            <Btn onPress={() => { onUrl(null); setStatus(null); }} style={{ height: 34, justifyContent: 'center' }}><T w={700} s={13} c={t.accText}>{s.removeVideo}</T></Btn>
          </>
        )}
      </View>
      {status && <T s={13} lh={1.4} c={status.error ? t.accText : undefined}>{status.text}</T>}
    </View>
  );
}

function Library() {
  const { s, t, lang, showToast, reloadCycle } = useApp();
  const st = useStyles();
  const [rows, setRows] = useState<ExerciseRow[] | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [warnDup, setWarnDup] = useState<string[]>([]);
  useEffect(() => { loadExercises().then(setRows); loadExerciseUsage().then(setUsage); }, []);
  // Any edit takes the duplicate warning back, so the coach must confirm again.
  useEffect(() => { setWarnDup([]); }, [rows]);
  if (!rows) return <T s={14}>{s.loading}</T>;

  const patch = (id: string, fn: (e: ExerciseRow) => ExerciseRow) => setRows(rows.map(r => (r.id === id ? fn(r) : r)));
  const save = async () => {
    if (busy) return;
    if (rows.some(r => !r.he.trim() || !r.en.trim())) { showToast(s.badDetails); return; }
    const seen = new Set<string>(), dups = new Set<string>();
    for (const r of rows) { const k = r.he.trim(); if (seen.has(k)) dups.add(k); seen.add(k); }
    if (dups.size && warnDup.length === 0) { setWarnDup([...dups]); return; }
    setBusy(true);
    let err: string | null = null;
    for (const id of removed) { err = err ?? (await deleteExercise(id)); }
    for (const r of rows) { err = err ?? (await saveExercise(r)); }
    if (!err) { setRemoved([]); await reloadCycle(); loadExerciseUsage().then(setUsage); }
    setBusy(false);
    showToast(err ? `${s.saveFailed}: ${err}` : s.detailsSaved);
  };
  const shown = rows.filter(e => !q || e.he.includes(q) || e.en.toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={{ gap: 10 }}>
      <TextInput
        value={q} onChangeText={setQ} placeholder={s.searchEx} placeholderTextColor={t.ink + '88'}
        style={{ height: 44, borderWidth: 1.5, borderColor: t.ink, borderRadius: 10, paddingHorizontal: 10, color: t.ink, fontSize: 15, fontFamily: 'Heebo_400Regular' }}
      />
      {shown.map(e => (
        <View key={e.id} style={st.card}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field label={s.fNameHe} value={e.he} onChange={v => patch(e.id, x => ({ ...x, he: v }))} />
            <Field label={s.fNameEn} value={e.en} onChange={v => patch(e.id, x => ({ ...x, en: v }))} />
          </View>
          <Field label={s.videoLink} value={e.video_url ?? ''} onChange={v => patch(e.id, x => ({ ...x, video_url: v }))} />
          <VideoButtons exId={e.id} hasVideo={!!e.video_url} onUrl={url => patch(e.id, x => ({ ...x, video_url: url }))} />
          <T s={12} c={usage[e.id] ? undefined : t.accText}>{usage[e.id] ? s.usedIn.replace('{n}', String(usage[e.id])) : s.notUsed}</T>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <Field num label={s.stepKg} value={e.step} onChange={v => patch(e.id, x => ({ ...x, step: num(v) }))} />
            <Btn
              onPress={() => {
                if (usage[e.id]) { showToast(s.cannotDeleteUsed); return; }
                setRows(rows.filter(r => r.id !== e.id)); setRemoved(r => [...r, e.id]);
              }}
              style={{ height: 42, paddingHorizontal: 10, justifyContent: 'center' }}>
              <T w={700} s={13} c={t.accText}>{s.deleteBtn}</T>
            </Btn>
          </View>
        </View>
      ))}
      <Btn
        onPress={() => setRows([...rows, { id: 'x' + Date.now().toString(36), he: '', en: '', video_url: null, step: 2.5 }])}
        style={st.wide}>
        <T w={700} s={16}>+ {s.addExercise}</T>
      </Btn>
      {warnDup.length > 0 && <T s={13} lh={1.4} c={t.accText}>{s.dupWarn.replace('{names}', warnDup.join(', '))}</T>}
      <Btn onPress={save} style={[st.wide, { backgroundColor: t.acc, borderColor: t.acc, opacity: busy ? 0.6 : 1 }]}>
        <T w={700} s={16} c={t.onAcc}>{s.saveLib}</T>
      </Btn>
    </View>
  );
}
