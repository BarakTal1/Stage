import { CyclePart, CycleWorkout, ExerciseRow, PartKind, Variant, WorkoutKey } from './data';
import { supabase } from './supabase';

export const WORKOUT_KEYS: WorkoutKey[] = ['A', 'B', 'F'];
/** The fixed structure of a workout, in order. The studio fills each part with exercises. */
export const PART_KINDS: PartKind[] = ['warmup', 'activation', 'project', 'superset', 'last', 'abs'];
/** Warm-up and abs list exercises with no weight tracking and no rep range. */
export const TRACKED: PartKind[] = ['activation', 'project', 'superset', 'last'];

/** An empty part. Tracked kinds start with a rep range. */
export const newPart = (kind: PartKind, position: number): CyclePart => ({
  kind, position, title_he: '', title_en: '',
  reps_min: TRACKED.includes(kind) ? 8 : null, reps_max: TRACKED.includes(kind) ? 12 : null, items: [],
});

export type CycleDetail = { id: string; name_he: string; name_en: string; active: boolean; workouts: CycleWorkout[] };
export type CycleListItem = { id: string; name_he: string; name_en: string; active: boolean };

type Raw = {
  id: string; name_he: string; name_en: string; active: boolean;
  cycle_workouts: { workout: WorkoutKey; focus_he: string; focus_en: string }[];
  cycle_parts: {
    workout: WorkoutKey; position: number; kind: PartKind; reps_min: number | null; reps_max: number | null; title_he: string; title_en: string;
    cycle_part_items: { variant: Variant | null; position: number; exercise_id: string }[];
  }[];
};

const SELECT = 'id, name_he, name_en, active, cycle_workouts(workout, focus_he, focus_en), cycle_parts(workout, position, kind, reps_min, reps_max, title_he, title_en, cycle_part_items(variant, position, exercise_id))';

/** Fills every workout and every part, so the editor always shows the full structure. */
function shape(r: Raw): CycleDetail {
  const workouts = WORKOUT_KEYS.map(key => {
    const w = r.cycle_workouts.find(x => x.workout === key);
    const rows = r.cycle_parts.filter(x => x.workout === key).sort((a, b) => a.position - b.position);
    // A workout with no parts starts with the standard structure.
    const parts: CyclePart[] = rows.length
      ? rows.map((p, position) => ({
        kind: p.kind, position, title_he: p.title_he, title_en: p.title_en,
        reps_min: p.reps_min ?? (TRACKED.includes(p.kind) ? 8 : null),
        reps_max: p.reps_max ?? (TRACKED.includes(p.kind) ? 12 : null),
        items: p.cycle_part_items.map(i => ({ variant: i.variant, position: i.position, exercise_id: i.exercise_id })),
      }))
      : PART_KINDS.map((kind, position) => newPart(kind, position));
    return { key, focus_he: w?.focus_he ?? '', focus_en: w?.focus_en ?? '', parts };
  });
  return { id: r.id, name_he: r.name_he, name_en: r.name_en, active: r.active, workouts };
}

export async function loadExercises(): Promise<ExerciseRow[]> {
  const { data } = await supabase.from('exercises').select('*').order('id');
  return (data as ExerciseRow[] | null) ?? [];
}

/** The cycle the trainees use. Null when the database has none or the call fails. */
export async function loadActiveCycle(): Promise<{ exercises: ExerciseRow[]; cycle: CycleDetail } | null> {
  const [ex, c] = await Promise.all([loadExercises(), supabase.from('cycles').select(SELECT).eq('active', true).maybeSingle()]);
  if (!c.data || !ex.length) return null;
  return { exercises: ex, cycle: shape(c.data as unknown as Raw) };
}

export async function loadCycle(id: string): Promise<CycleDetail | null> {
  const { data } = await supabase.from('cycles').select(SELECT).eq('id', id).maybeSingle();
  return data ? shape(data as unknown as Raw) : null;
}

export async function listCycles(): Promise<CycleListItem[]> {
  const { data } = await supabase.from('cycles').select('id, name_he, name_en, active').order('created_at', { ascending: false });
  return (data as CycleListItem[] | null) ?? [];
}

export async function saveCycle(c: CycleDetail): Promise<string | null> {
  const payload = {
    name_he: c.name_he, name_en: c.name_en,
    workouts: c.workouts.map(w => ({
      key: w.key, focus_he: w.focus_he, focus_en: w.focus_en,
      parts: w.parts.map(p => ({
        kind: p.kind, title_he: p.title_he, title_en: p.title_en,
        reps_min: TRACKED.includes(p.kind) ? p.reps_min : null,
        reps_max: TRACKED.includes(p.kind) ? p.reps_max : null,
        items: p.items.map(i => ({ variant: i.variant ?? '', exercise_id: i.exercise_id })),
      })),
    })),
  };
  const { error } = await supabase.rpc('save_cycle', { p_cycle: c.id, p: payload });
  return error ? error.message : null;
}

export async function cloneCycle(id: string): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('clone_cycle', { p_id: id });
  return { id: (data as string | null) ?? null, error: error ? error.message : null };
}

export async function activateCycle(id: string): Promise<string | null> {
  const { error } = await supabase.rpc('activate_cycle', { p_id: id });
  return error ? error.message : null;
}

export async function deleteCycle(id: string): Promise<string | null> {
  const { error } = await supabase.from('cycles').delete().eq('id', id);
  return error ? error.message : null;
}

export async function saveExercise(e: ExerciseRow): Promise<string | null> {
  const { error } = await supabase.from('exercises').upsert({
    id: e.id, he: e.he, en: e.en, video_url: e.video_url?.trim() || null, step: e.step > 0 ? e.step : 2.5,
  });
  return error ? error.message : null;
}

export async function deleteExercise(id: string): Promise<string | null> {
  const { error } = await supabase.from('exercises').delete().eq('id', id);
  return error ? error.message : null;
}

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/** Uploads an exercise video to storage and returns its public link. Staff only (the database enforces it). */
export async function uploadExerciseVideo(exId: string, uri: string, mime?: string | null): Promise<{ url: string | null; error: string | null }> {
  try {
    const blob = await (await fetch(uri)).blob();
    const type = mime || blob.type || 'video/mp4';
    const ext = type.includes('quicktime') ? 'mov' : type.includes('webm') ? 'webm' : type.includes('3gpp') ? '3gp' : 'mp4';
    const path = `${exId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('exercise-videos').upload(path, blob, { contentType: type });
    if (error) return { url: null, error: error.message };
    return { url: supabase.storage.from('exercise-videos').getPublicUrl(path).data.publicUrl, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : String(e) };
  }
}
