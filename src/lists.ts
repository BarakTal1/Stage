import { EquivItem, Rank, RuleKey } from './data';
import type { Gender } from './auth';
import { supabase } from './supabase';

type EquivRow = { id: string; he_one: string; he_many: string; en_one: string; en_many: string; kg: number; position: number };
type RankRow = { id: string; he: string; en: string; min_points: number; position: number; gender: Gender };
type RuleRow = { key: RuleKey; points: number };

const fromEquivRow = (r: EquivRow): EquivItem => ({ id: r.id, he: [r.he_one, r.he_many], en: [r.en_one, r.en_many], kg: Number(r.kg) });
const fromRankRow = (r: RankRow): Rank => ({ id: r.id, he: r.he, en: r.en, min: r.min_points });

/** Reads the three editable lists. A list that is empty or fails to load is returned as null, so the defaults stay. */
export async function loadLists(): Promise<{ equiv: EquivItem[] | null; ranks: Partial<Record<Gender, Rank[]>>; rules: Record<RuleKey, number> | null }> {
  const [e, r, p] = await Promise.all([
    supabase.from('equivalents').select('*').order('position'),
    supabase.from('ranks').select('*').order('position'),
    supabase.from('point_rules').select('*'),
  ]);
  const rules = p.data?.length
    ? (Object.fromEntries((p.data as RuleRow[]).map(x => [x.key, x.points])) as Record<RuleKey, number>)
    : null;
  return {
    equiv: e.data?.length ? (e.data as EquivRow[]).map(fromEquivRow) : null,
    ranks: Object.fromEntries(
      (['male', 'female'] as Gender[])
        .map(g => [g, (r.data as RankRow[] | null)?.filter(x => x.gender === g).map(fromRankRow) ?? []])
        .filter(([, list]) => (list as Rank[]).length),
    ) as Partial<Record<Gender, Rank[]>>,
    rules,
  };
}

// Ids come from the app (for example "hippo" or "n1730000000000"), never from free text.
async function deleteMissing(table: string, ids: string[], scope?: { column: string; value: string }) {
  let q = supabase.from(table).delete();
  if (scope) q = q.eq(scope.column, scope.value);
  return ids.length ? q.not('id', 'in', `(${ids.map(i => `"${i}"`).join(',')})`) : q.neq('id', '');
}

/** Each function writes the whole list and removes the rows that are gone. It returns an error text or null. */
export async function saveEquiv(items: EquivItem[]): Promise<string | null> {
  const rows: EquivRow[] = items.map((it, i) => ({
    id: it.id, he_one: it.he[0], he_many: it.he[1], en_one: it.en[0], en_many: it.en[1],
    kg: it.kg > 0 ? it.kg : 0.01, position: i,
  }));
  if (rows.length) {
    const { error } = await supabase.from('equivalents').upsert(rows);
    if (error) return error.message;
  }
  const { error } = await deleteMissing('equivalents', rows.map(r => r.id));
  return error ? error.message : null;
}

export async function saveRanks(gender: Gender, ranks: Rank[]): Promise<string | null> {
  const rows: RankRow[] = ranks.map((r, i) => ({ id: r.id, he: r.he, en: r.en, min_points: Math.max(0, Math.round(r.min)), position: i, gender }));
  if (rows.length) {
    const { error } = await supabase.from('ranks').upsert(rows);
    if (error) return error.message;
  }
  const { error } = await deleteMissing('ranks', rows.map(r => r.id), { column: 'gender', value: gender });
  return error ? error.message : null;
}

export async function saveRules(rules: Record<RuleKey, number>): Promise<string | null> {
  const rows: RuleRow[] = (Object.keys(rules) as RuleKey[]).map(key => ({ key, points: Math.max(0, Math.round(rules[key])) }));
  const { error } = await supabase.from('point_rules').upsert(rows);
  return error ? error.message : null;
}
