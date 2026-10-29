// Fake data and strings for the Stage mock. Copied from the v2 design file.

export type Lang = 'he' | 'en';
export type ThemeKey = 'red' | 'orange' | 'night' | 'nightRed';
export type CardColor = 'red' | 'brown' | 'orange';

export const fmt = (n: number) =>
  Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });

export type ExId =
  | 'e1' | 'e2' | 'e3' | 'e4' | 'e5a' | 'e5b' | 'e6'
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5a' | 'a5b' | 'a6'
  | 'g1' | 'g2' | 'l1' | 'l2' | 'l3' | 'l4';

export const DEF: Record<ExId, { he: string; en: string; lw: number; lr: number; step: number }> = {
  e1: { he: 'פולדאון בכבל באחיזה רחבה', en: 'Wide-grip cable lat pulldown', lw: 55, lr: 10, step: 2.5 },
  e2: { he: 'חתירה בכבל בישיבה', en: 'Seated cable row', lw: 52.5, lr: 10, step: 2.5 },
  e3: { he: 'דדליפט רומני עם מוט', en: 'Barbell Romanian deadlift', lw: 75, lr: 8, step: 2.5 },
  e4: {
    he: 'חתירה חד-ידית עם משקולת יד בתמיכה על ספסל משופע',
    en: 'Single-arm dumbbell row, chest-supported on an incline bench',
    lw: 24, lr: 10, step: 2,
  },
  e5a: { he: 'כפיפת מרפקים עם מוט EZ', en: 'EZ-bar biceps curl', lw: 30, lr: 12, step: 2.5 },
  e5b: { he: 'כפיפת פטישים עם משקולות יד', en: 'Dumbbell hammer curl', lw: 14, lr: 10, step: 2 },
  e6: { he: 'פייס-פול בכבל עם חבל', en: 'Cable face pull with rope', lw: 20, lr: 12, step: 2.5 },
  // Workout A (push). Placeholder exercises and weights. Replace with the real studio program.
  a1: { he: 'לחיצת חזה עם מוט', en: 'Barbell bench press', lw: 77.5, lr: 8, step: 2.5 },
  a2: { he: 'לחיצת כתפיים עם משקולות יד בישיבה', en: 'Seated dumbbell shoulder press', lw: 30, lr: 10, step: 2 },
  a3: { he: 'לחיצת חזה עליון עם משקולות יד', en: 'Incline dumbbell press', lw: 30, lr: 10, step: 2 },
  a4: { he: 'פרפר בכבלים', en: 'Cable chest fly', lw: 20, lr: 12, step: 2.5 },
  a5a: { he: 'פשיטת מרפקים בכבל עם חבל', en: 'Cable triceps pushdown with rope', lw: 32.5, lr: 12, step: 2.5 },
  a5b: { he: 'פשיטת מרפקים מעל הראש בכבל', en: 'Overhead cable triceps extension', lw: 25, lr: 12, step: 2.5 },
  a6: { he: 'הרמת כתפיים לצדדים עם משקולות יד', en: 'Dumbbell lateral raise', lw: 12, lr: 15, step: 1 },
  // Placeholders for activation (g) and lower-body (l) exercises. Replace with the real studio program.
  g1: { he: 'פתיחת גומיה לאחור', en: 'Band pull-apart', lw: 5, lr: 12, step: 2.5 },
  g2: { he: 'גשר ישבן עם משקולת', en: 'Weighted glute bridge', lw: 20, lr: 12, step: 2.5 },
  l1: { he: 'כפיפת ברכיים בשכיבה', en: 'Lying leg curl', lw: 30, lr: 12, step: 2.5 },
  l2: { he: 'לחיצת רגליים', en: 'Leg press', lw: 100, lr: 12, step: 5 },
  l3: { he: 'סקוואט בולגרי עם משקולות יד', en: 'Dumbbell Bulgarian split squat', lw: 16, lr: 10, step: 2 },
  l4: { he: 'הרמות תאומים בעמידה', en: 'Standing calf raise', lw: 40, lr: 15, step: 2.5 },
};

export const INITIAL_EX: Record<ExId, { w: number; r: number }> = {
  e1: { w: 57.5, r: 10 }, e2: { w: 52.5, r: 10 }, e3: { w: 80, r: 8 }, e4: { w: 26, r: 10 },
  e5a: { w: 30, r: 12 }, e5b: { w: 14, r: 12 }, e6: { w: 20, r: 15 },
  a1: { w: 80, r: 8 }, a2: { w: 30, r: 10 }, a3: { w: 32, r: 10 }, a4: { w: 20, r: 12 },
  a5a: { w: 35, r: 12 }, a5b: { w: 25, r: 12 }, a6: { w: 12, r: 15 },
  g1: { w: 5, r: 12 }, g2: { w: 22.5, r: 12 }, l1: { w: 32.5, r: 12 }, l2: { w: 110, r: 12 },
  l3: { w: 18, r: 10 }, l4: { w: 40, r: 15 },
};

/** Placeholder guidance video: a YouTube search for the exercise. Replace with the studio's own videos. */
export const videoUrl = (id: ExId) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(DEF[id].en + ' form');

export const ALL_IDS = Object.keys(DEF) as ExId[];

export const SETS = 3;
export type SetRow = { w: number; r: number };

/** Every exercise starts with the same weight and reps in all of its sets. */
export const initialSets = (): Record<ExId, SetRow[]> =>
  Object.fromEntries(
    (Object.keys(INITIAL_EX) as ExId[]).map(id => [id, Array.from({ length: SETS }, () => ({ ...INITIAL_EX[id] }))]),
  ) as Record<ExId, SetRow[]>;

export type WorkoutKey = 'A' | 'B' | 'F';
export type Variant = 'upper' | 'lower';
export type PartKind = 'warmup' | 'activation' | 'project' | 'superset' | 'last' | 'abs';
type Name = { he: string; en: string };

/**
 * One part of a workout. Warm-up and abs are plain lists with no tracking.
 * The last part has an upper and a lower variant, and the trainee picks one.
 * `reps` is the rep range the coach allows for the part.
 */
export type Part = {
  kind: PartKind;
  names?: Name[];
  slots?: [ExId, ExId];
  variants?: Record<Variant, [ExId, ExId]>;
  reps?: [number, number];
};

export const PART_NAME: Record<PartKind, Name> = {
  warmup: { he: 'חימום דינמי', en: 'Dynamic warm-up' },
  activation: { he: 'הפעלה', en: 'Activation' },
  project: { he: 'פרויקט · סופרסט', en: 'Project · superset' },
  superset: { he: 'סופרסט', en: 'Superset' },
  last: { he: 'סופרסט אחרון · עליון או תחתון', en: 'Last superset · upper or lower' },
  abs: { he: 'בטן · לפי המאמן', en: 'Abs · coach decides' },
};
export const VARIANT_NAME: Record<Variant, Name> = {
  upper: { he: 'פלג גוף עליון', en: 'Upper body' },
  lower: { he: 'פלג גוף תחתון', en: 'Lower body' },
};

const WARMUP: Name[] = [
  { he: 'סיבובי כתפיים', en: 'Shoulder circles' },
  { he: 'חתול־פרה', en: 'Cat-cow' },
  { he: 'סקוואט משקל גוף', en: 'Bodyweight squat' },
  { he: 'לאנג׳ הליכה', en: 'Walking lunge' },
  { he: 'סיבובי אגן', en: 'Hip circles' },
];
const ABS: Name[] = [
  { he: 'פלנק', en: 'Plank' },
  { he: 'הרמות רגליים בתלייה', en: 'Hanging leg raise' },
];
const bookends = (middle: Part[]): Part[] => [
  { kind: 'warmup', names: WARMUP },
  { kind: 'activation', slots: ['g1', 'g2'], reps: [10, 15] },
  ...middle,
  { kind: 'abs', names: ABS },
];

/** The workouts of a cycle. B is the one from the design. A and F are placeholder data. */
export const WORKOUTS: Record<WorkoutKey, {
  focus: Name; prev: number; prevDate: string; parts: Part[];
}> = {
  B: {
    focus: { he: 'משיכה', en: 'Pull' }, prev: 8500, prevDate: '20.10',
    parts: bookends([
      { kind: 'project', slots: ['e3', 'e4'], reps: [6, 12] },
      { kind: 'superset', slots: ['e1', 'e2'], reps: [8, 12] },
      { kind: 'last', variants: { upper: ['e5a', 'e6'], lower: ['l1', 'l2'] }, reps: [8, 15] },
    ]),
  },
  A: {
    focus: { he: 'דחיפה', en: 'Push' }, prev: 6900, prevDate: '23.10',
    parts: bookends([
      { kind: 'project', slots: ['a1', 'a2'], reps: [6, 12] },
      { kind: 'superset', slots: ['a3', 'a4'], reps: [8, 12] },
      { kind: 'last', variants: { upper: ['a5a', 'a6'], lower: ['l3', 'l4'] }, reps: [8, 15] },
    ]),
  },
  F: {
    focus: { he: 'גוף מלא', en: 'Full body' }, prev: 9300, prevDate: '21.10',
    parts: bookends([
      { kind: 'project', slots: ['a1', 'e1'], reps: [6, 12] },
      { kind: 'superset', slots: ['e3', 'a2'], reps: [8, 12] },
      { kind: 'last', variants: { upper: ['e5a', 'a5a'], lower: ['l1', 'l3'] }, reps: [8, 15] },
    ]),
  },
};

export const DEFAULT_VARIANT: Record<WorkoutKey, Variant> = { A: 'upper', B: 'upper', F: 'upper' };

/** The exercises of one part. Warm-up and abs have none. */
export const partIds = (p: Part, v: Variant): ExId[] => p.variants?.[v] ?? p.slots ?? [];

/** The tracked exercises of a workout, with the chosen variant in the last part. */
export function workoutIds(wk: WorkoutKey, v: Variant): ExId[] {
  return WORKOUTS[wk].parts.flatMap(p => partIds(p, v));
}

/** The rep range the coach allows for an exercise in a workout. */
export function repRange(wk: WorkoutKey, id: ExId): [number, number] {
  const part = WORKOUTS[wk].parts.find(p => [...(p.slots ?? []), ...Object.values(p.variants ?? {}).flat()].includes(id));
  return part?.reps ?? [1, 30];
}

export type Intensity = 'easy' | 'right' | 'hard';
export const INTENSITIES: { key: Intensity; he: string; en: string }[] = [
  { key: 'easy', he: 'קל', en: 'Easy' },
  { key: 'right', he: 'מתאים', en: 'Right' },
  { key: 'hard', he: 'קשה', en: 'Hard' },
];

export const S = {
  he: {
    kg: 'ק״ג', tabHome: 'בית', tabProgress: 'התקדמות', tabBoard: 'לוח', tabSettings: 'הגדרות', tabTrainees: 'מתאמנים',
    rankLabel: 'דרגה', pts: 'נק׳', earnedTitle: 'נקודות שהרווחת', toNext: '{n} נק׳ לדרגה הבאה', topRank: 'הגעת לדרגה הגבוהה ביותר',
    ruleWorkout: 'סיום אימון', rulePr: 'שיאים אישיים', ruleStreak: 'בונוס רצף שבועות', ruleShare: 'שיתוף סטורי',
    rankUpTitle: 'עלית דרגה!', rankUpSub: 'הדרגה החדשה שלך', rankUpCta: 'וואו, תודה', rollAgain: 'עוד השוואה',
    admin: 'ניהול תוכן', adminTitle: 'ניהול תוכן', adminEquiv: 'השוואות', adminRanks: 'דרגות', adminRules: 'נקודות',
    adminNote: 'כאן שקד ואתה משנים את הרשימות. כרגע השינויים נשמרים רק עד שהאפליקציה נטענת מחדש. בגרסה האמיתית הם יישמרו בשרת.',
    add: 'הוספה', remove: 'מחיקה', fHeOne: 'עברית, יחיד', fHeMany: 'עברית, רבים', fEnOne: 'אנגלית, יחיד', fEnMany: 'אנגלית, רבים',
    fKg: 'משקל של אחד (ק״ג)', fNameHe: 'שם בעברית', fNameEn: 'שם באנגלית', fMin: 'מינימום נקודות', equivHint: 'הרשימה בוחרת פריט אקראי בכל פעם.',
    role: 'תצוגה', roleTrainee: 'מתאמן', roleCoach: 'מאמן', roleNote: 'תצוגת מאמן מוסיפה את מסך המתאמנים ואת החלפת התרגילים.',
    coachTitle: 'המתאמנים שלי', coachAll: 'כולם', coachAttention: 'דורשים תשומת לב', lastWorkout: 'אימון אחרון', daysAgo: 'לפני {n} ימים', today1: 'אתמול', perWeek: 'אימונים בשבוע', streakWeeks: 'שבועות ברצף', inactiveTag: 'לא התאמן {n} ימים', raiseTag: 'כדאי להעלות', raiseNote: 'הצעה בלבד. המאמן מחליט. המשקל לא השתנה ב-3 אימונים.', weightsTitle: 'משקלים', since: 'מאז תחילת ספטמבר', back: 'חזרה', none: 'אין מתאמנים להצגה',
    dateLong: 'יום שלישי, 27 באוקטובר', hello: 'בוקר טוב, נועה', cycle: 'מחזור אוקטובר', cycleCount: 'מתוך 12 הושלמו',
    today: 'האימון של היום', focus: 'משיכה', meta: '6 חלקים · כ־50 דקות', workout: 'אימון',
    cta: 'סיימתי את האימון · רישום משקלים', logTitle: 'רישום משקלים', lastTime: 'בפעם הקודמת:', reps: 'חזרות', video: 'סרטון הדרכה', swap: 'החלפה', swapTitle: 'החלפת תרגיל', swapNote: 'המאמן מחליף תרגיל כשהמתאמן לא יכול לבצע אותו.', restore: 'חזרה לתרגיל המקורי', swapped: 'הוחלף', close: 'סגירה', set: 'סט', intensity: 'עצימות', repRange: 'טווח חזרות', noTrack: 'ללא מעקב',
    upPre: 'עלייה של', totalShort: 'נפח כולל', save: 'שמירת האימון',
    saved: 'האימון נשמר', dateFull: 'יום שלישי, 27.10.2026', totalLabel: 'נפח אימון כולל', vs1: 'לעומת אימון', vs2: 'הקודם',
    todayShort: 'היום', prs: 'שיאים אישיים', shareStory: 'שיתוף לסטורי', done: 'סיום',
    periodWorkout: 'האימון', periodMonth: 'סיכום חודשי', addPhoto: 'הוספת תמונה', changePhoto: 'החלפת תמונה', removePhoto: 'הסרה', summary: 'סיכום', fullBg: 'רקע מלא', clearBg: 'רקע שקוף', insta: 'סטורי באינסטגרם', saveRoll: 'שמירה לגלריה',
    textColor: 'צבע הטקסט', inkLight: 'לבן', inkDark: 'כהה',
    streak: 'שבועות ברצף', streakSub: 'שני אימונים בכל שבוע', byEx: 'משקלים לפי תרגיל', gain: 'ק״ג מתחילת ספטמבר',
    recent: 'אימונים אחרונים', noChange: 'ללא שינוי',
    boardTitle: 'לוח הסטודיו', boardSub: 'אוקטובר 2026 · דירוג לפי עלייה בנפח האימונים לעומת החודש הקודם',
    yourPlace: 'המקום שלך החודש', of: 'מתוך', members: 'מתאמנים', volMonth: 'נפח החודש',
    hiddenNote: 'הנתונים שלך לא משותפים. רק את/ה רואה את הדירוג, חברי הסטודיו לא.', top5: 'חמשת המקומות הראשונים',
    me: 'אני', meHidden: 'אני · מוסתר', hide: 'שיתוף בלוחות הדירוג', hideSub: 'כשהאפשרות כבויה, רק את/ה רואה את הדירוג שלך',
    settings: 'הגדרות', language: 'שפה', langNote: 'כל האפליקציה עוברת לשפה שבחרת, כולל כיוון הקריאה.',
    appColor: 'צבע האפליקציה', colorNote: 'הצבע חל על כל המסכים. כרטיס הסטורי נבחר בנפרד.',
    light: 'בהיר', dark: 'כהה', pickWorkout: 'בחירת אימון',
    toastInsta: 'באפליקציה האמיתית נפתח כאן אינסטגרם', toastSave: 'באפליקציה האמיתית הכרטיס נשמר בגלריה',
  },
  en: {
    kg: 'kg', tabHome: 'Home', tabProgress: 'Progress', tabBoard: 'Board', tabSettings: 'Settings', tabTrainees: 'Trainees',
    rankLabel: 'Rank', pts: 'pts', earnedTitle: 'Points earned', toNext: '{n} pts to the next rank', topRank: 'You reached the top rank',
    ruleWorkout: 'Finishing a workout', rulePr: 'Personal records', ruleStreak: 'Weekly streak bonus', ruleShare: 'Sharing a story',
    rankUpTitle: 'Rank up!', rankUpSub: 'Your new rank', rankUpCta: 'Wow, thanks', rollAgain: 'Another one',
    admin: 'Content admin', adminTitle: 'Content admin', adminEquiv: 'Comparisons', adminRanks: 'Ranks', adminRules: 'Points',
    adminNote: 'Shaked and you edit the lists here. For now the changes last only until the app reloads. In the real version they save on a server.',
    add: 'Add', remove: 'Delete', fHeOne: 'Hebrew, one', fHeMany: 'Hebrew, many', fEnOne: 'English, one', fEnMany: 'English, many',
    fKg: 'Weight of one (kg)', fNameHe: 'Hebrew name', fNameEn: 'English name', fMin: 'Minimum points', equivHint: 'The list picks a random item each time.',
    role: 'View', roleTrainee: 'Trainee', roleCoach: 'Coach', roleNote: 'Coach view adds the trainees screen and exercise swaps.',
    coachTitle: 'My trainees', coachAll: 'All', coachAttention: 'Needs attention', lastWorkout: 'Last workout', daysAgo: '{n} days ago', today1: 'Yesterday', perWeek: 'Workouts per week', streakWeeks: 'weeks in a row', inactiveTag: 'Away {n} days', raiseTag: 'Ready to raise', raiseNote: 'A suggestion only. The coach decides. The weight did not change for 3 sessions.', weightsTitle: 'Weights', since: 'since early September', back: 'Back', none: 'No trainees to show',
    dateLong: 'Tuesday, 27 October', hello: 'Good morning, Noa', cycle: 'October cycle', cycleCount: 'of 12 done',
    today: "Today's workout", focus: 'Pull', meta: '6 parts · about 50 min', workout: 'Workout',
    cta: 'Done training · log weights', logTitle: 'Log weights', lastTime: 'Last time:', reps: 'reps', video: 'Video guide', swap: 'Swap', swapTitle: 'Swap exercise', swapNote: 'The coach swaps an exercise when the trainee cannot do it.', restore: 'Restore original', swapped: 'Swapped', close: 'Close', set: 'Set', intensity: 'Intensity', repRange: 'Rep range', noTrack: 'Not tracked',
    upPre: 'Up', totalShort: 'Total volume', save: 'Save workout',
    saved: 'Workout saved', dateFull: 'Tuesday, 27.10.2026', totalLabel: 'Total volume', vs1: 'vs. last workout', vs2: '',
    todayShort: 'Today', prs: 'Personal records', shareStory: 'Share to story', done: 'Done',
    periodWorkout: 'Workout', periodMonth: 'Monthly summary', addPhoto: 'Add photo', changePhoto: 'Change photo', removePhoto: 'Remove', summary: 'Summary', fullBg: 'Full background', clearBg: 'Transparent', insta: 'Instagram story', saveRoll: 'Save to camera roll',
    textColor: 'Text color', inkLight: 'White', inkDark: 'Dark',
    streak: 'weeks in a row', streakSub: 'Two workouts every week', byEx: 'Weights by exercise', gain: 'kg since early September',
    recent: 'Recent sessions', noChange: 'No change',
    boardTitle: 'Studio board', boardSub: 'October 2026 · ranked by volume growth vs. last month',
    yourPlace: 'Your place this month', of: 'of', members: 'members', volMonth: 'volume this month',
    hiddenNote: 'Your data is not shared. Only you can see your rank.', top5: 'Top five',
    me: 'You', meHidden: 'You · hidden', hide: 'Share on the boards', hideSub: 'When this is off, only you see your rank',
    settings: 'Settings', language: 'Language', langNote: 'The whole app switches, including reading direction.',
    appColor: 'App color', colorNote: 'Applies to every screen. The story card color is picked separately.',
    light: 'Light', dark: 'Dark', pickWorkout: 'Choose workout',
    toastInsta: 'In the real app, Instagram opens here', toastSave: 'In the real app, the card saves to Photos',
  },
} as const;

export type Strings = (typeof S)['he'] | (typeof S)['en'];

const W = '#FFFFFF', R = '#CB0709', O = '#FF5826', B = '#2B1111';
export const BROWN = B;

export type Theme = {
  he: string; en: string; mode: 'light' | 'dark';
  bg: string; ink: string; acc: string; onAcc: string; accText: string; accBig: string;
  block: string; onBlock: string; knob: string; icon: 'black' | 'white';
  sumBg: string; sumInk: string; sumNum: string; sumBlock: string; sumOnBlock: string; sumBtn: string; sumOnBtn: string;
  card: CardColor;
};

export const THEMES: Record<ThemeKey, Theme> = {
  red: { he: 'אדום סטייג׳', en: 'Stage red', mode: 'light',
    bg: W, ink: B, acc: R, onAcc: W, accText: R, accBig: R, block: B, onBlock: W, knob: W, icon: 'black',
    sumBg: R, sumInk: W, sumNum: W, sumBlock: B, sumOnBlock: W, sumBtn: W, sumOnBtn: B, card: 'red' },
  orange: { he: 'כתום אנרגיה', en: 'Energy orange', mode: 'light',
    bg: W, ink: B, acc: O, onAcc: B, accText: B, accBig: O, block: B, onBlock: W, knob: W, icon: 'black',
    sumBg: O, sumInk: B, sumNum: B, sumBlock: B, sumOnBlock: W, sumBtn: B, sumOnBtn: W, card: 'orange' },
  night: { he: 'לילה כתום', en: 'Night orange', mode: 'dark',
    bg: B, ink: W, acc: O, onAcc: B, accText: O, accBig: O, block: W, onBlock: B, knob: B, icon: 'white',
    sumBg: B, sumInk: W, sumNum: O, sumBlock: W, sumOnBlock: B, sumBtn: O, sumOnBtn: B, card: 'brown' },
  nightRed: { he: 'לילה אדום', en: 'Night red', mode: 'dark',
    bg: B, ink: W, acc: R, onAcc: W, accText: W, accBig: W, block: W, onBlock: B, knob: W, icon: 'white',
    sumBg: R, sumInk: W, sumNum: W, sumBlock: B, sumOnBlock: W, sumBtn: W, sumOnBtn: B, card: 'red' },
};

export const CARD_COLORS: Record<CardColor, string> = { red: R, brown: B, orange: O };

export const DATES = ['08.09', '15.09', '22.09', '29.09', '06.10', '13.10', '20.10', '27.10'];

const SERIES_W = {
  rdl: [65, 67.5, 67.5, 70, 72.5, 72.5, 75, 80],
  pull: [47.5, 50, 50, 52.5, 52.5, 55, 55, 57.5],
  bench: [65, 67.5, 70, 72.5, 72.5, 75, 77.5, 80],
};

export const SERIES = {
  rdl: { he: 'דדליפט רומני', en: 'Romanian deadlift', ex: 'e3' as ExId, r: 8, w: [65, 67.5, 67.5, 70, 72.5, 72.5, 75, 80] },
  pull: { he: 'פולדאון בכבל', en: 'Lat pulldown', ex: 'e1' as ExId, r: 10, w: [47.5, 50, 50, 52.5, 52.5, 55, 55, 57.5] },
  row: { he: 'חתירה חד-ידית', en: 'Single-arm row', ex: 'e4' as ExId, r: 10, w: [20, 20, 22, 22, 22, 24, 24, 26] },
  bench: { he: 'לחיצת חזה', en: 'Bench press', ex: 'a1' as ExId, r: 8, w: [65, 67.5, 70, 72.5, 72.5, 75, 77.5, 80] },
  incline: { he: 'לחיצת חזה עליון', en: 'Incline press', ex: 'a3' as ExId, r: 10, w: [22, 24, 24, 26, 28, 28, 30, 32] },
};
export type SeriesKey = keyof typeof SERIES;

export const WEEKS = [1, 1, 0, 1, 1, 1, 1, 1];
export const BOARD_PCTS = ['+11%', '+9%', '+8%', '+7%', '+7%'];

// Card strings (from ShareCardV2)
export const CARD_STR = {
  he: { workout: 'אימון', total: 'נפח אימון כולל', totalMonth: 'נפח החודש', kg: 'ק״ג', pr: 'שיא אישי', fromLast: 'מהאימון הקודם', fromLastMonth: 'מהחודש הקודם', streak: 'שבועות ברצף', rank: 'בלוח הסטודיו החודש' },
  en: { workout: 'Workout', total: 'Total volume', totalMonth: 'Volume this month', kg: 'kg', pr: 'PR', fromLast: 'vs. last workout', fromLastMonth: 'vs. last month', streak: 'weeks in a row', rank: 'on the studio board this month' },
};

export type Period = 'workout' | 'month';
// Mock numbers for the monthly summary card.
export const MONTH = { name: { he: 'אוקטובר 2026', en: 'October 2026' }, total: 74200, pct: 9 };

const CAR_KG = 1500;
/** A funny thing to compare the lifted weight with. The studio edits this list in the admin screen. */
export type EquivItem = { id: string; he: [string, string]; en: [string, string]; kg: number };

export const EQUIV_DEFAULT: EquivItem[] = [
  { id: 'hippo', he: ['היפופוטם קטן', 'היפופוטמים קטנים'], en: ['small hippo', 'small hippos'], kg: 500 },
  { id: 'banana', he: ['בננה', 'בננות'], en: ['banana', 'bananas'], kg: 0.12 },
  { id: 'car', he: ['מכונית', 'מכוניות'], en: ['car', 'cars'], kg: 1500 },
  { id: 'fridge', he: ['מקרר', 'מקררים'], en: ['fridge', 'fridges'], kg: 80 },
  { id: 'bamba', he: ['שקית במבה', 'שקיות במבה'], en: ['bag of Bamba', 'bags of Bamba'], kg: 0.06 },
  { id: 'falafel', he: ['פיתה עם פלאפל', 'פיתות עם פלאפל'], en: ['falafel pita', 'falafel pitas'], kg: 0.45 },
  { id: 'cat', he: ['חתול רחוב', 'חתולי רחוב'], en: ['street cat', 'street cats'], kg: 4 },
  { id: 'piano', he: ['פסנתר כנף', 'פסנתרי כנף'], en: ['grand piano', 'grand pianos'], kg: 400 },
  { id: 'camel', he: ['גמל', 'גמלים'], en: ['camel', 'camels'], kg: 600 },
  { id: 'melon', he: ['אבטיח', 'אבטיחים'], en: ['watermelon', 'watermelons'], kg: 8 },
  { id: 'hummus', he: ['קופסת חומוס', 'קופסאות חומוס'], en: ['tub of hummus', 'tubs of hummus'], kg: 0.5 },
  { id: 'chihuahua', he: ['צ׳יוואווה', 'צ׳יוואוואים'], en: ['chihuahua', 'chihuahuas'], kg: 2.5 },
  { id: 'sheep', he: ['כבשה', 'כבשים'], en: ['sheep', 'sheep'], kg: 70 },
  { id: 'scooter', he: ['קורקינט חשמלי', 'קורקינטים חשמליים'], en: ['e-scooter', 'e-scooters'], kg: 15 },
  { id: 'tank', he: ['טנק מרכבה', 'טנקי מרכבה'], en: ['Merkava tank', 'Merkava tanks'], kg: 65000 },
  { id: 'avocado', he: ['אבוקדו', 'אבוקדואים'], en: ['avocado', 'avocados'], kg: 0.25 },
];

/**
 * Picks one item for the roll `r` (from 0 to 1). Only items with a count that reads well are eligible:
 * at least 2 and at most 50,000. The same roll gives the same item for the same total.
 */
export function pickEquiv(items: EquivItem[], total: number, r: number): EquivItem | null {
  const count = (it: EquivItem) => Math.round(total / it.kg);
  const good = items.filter(it => it.kg > 0 && count(it) >= 2 && count(it) <= 50000);
  const pool = good.length ? good : items.filter(it => it.kg > 0 && count(it) >= 1);
  return pool.length ? pool[Math.min(pool.length - 1, Math.floor(r * pool.length))] : null;
}

/** "like 3 small hippos". A count of 1 drops the number, so the Hebrew gender does not matter. */
export function equivText(total: number, item: EquivItem | null, lang: Lang) {
  if (!item) return '';
  const n = Math.max(1, Math.round(total / item.kg));
  const [one, many] = item[lang];
  const num = n.toLocaleString('en-US');
  if (lang === 'he') return n === 1 ? `כמו ${one}` : `כמו ${num} ${many}`;
  return n === 1 ? `like 1 ${one}` : `like ${num} ${many}`;
}

/** Points. The studio edits the values in the admin screen. */
export type RuleKey = 'workout' | 'pr' | 'streak' | 'share';
export const RULES_DEFAULT: Record<RuleKey, number> = { workout: 10, pr: 15, streak: 2, share: 5 };

export type Rank = { id: string; he: string; en: string; min: number };
export const RANKS_DEFAULT: Rank[] = [
  { id: 'r0', he: 'זרועות נודל', en: 'Noodle Arms', min: 0 },
  { id: 'r1', he: 'מחמם ספסל', en: 'Bench Warmer', min: 100 },
  { id: 'r2', he: 'סוחב שווארמה', en: 'Shawarma Hauler', min: 250 },
  { id: 'r3', he: 'מרים שולחנות', en: 'Table Flipper', min: 500 },
  { id: 'r4', he: 'היפו בהכשרה', en: 'Hippo in Training', min: 900 },
  { id: 'r5', he: 'סולטן הסופרסט', en: 'Superset Sultan', min: 1500 },
  { id: 'r6', he: 'מחסל פיתות', en: 'Pita Crusher', min: 2500 },
  { id: 'r7', he: 'אגדת הסטייג׳', en: 'Stage Legend', min: 4000 },
];
// Starts just under the Hippo rank, so the first saved workout shows the rank-up notice.
export const INITIAL_POINTS = 880;
export const MOCK_STREAK_WEEKS = 5;

/** The rank for a point total, and the next rank if there is one. */
export function rankFor(points: number, ranks: Rank[]) {
  const sorted = [...ranks].sort((a, b) => a.min - b.min);
  let idx = 0;
  sorted.forEach((r, i) => { if (points >= r.min) idx = i; });
  return { idx, rank: sorted[idx], next: sorted[idx + 1] ?? null };
}

export type Role = 'trainee' | 'coach';

type Lift = { ex: ExId; w: number[]; r: number };
export type Trainee = {
  id: string; name: { he: string; en: string };
  lastDays: number; perWeek: number; streak: number; lifts: Lift[];
};
/** Mock trainees for the coach view. `w` is the weight of each week, oldest first. */
export const TRAINEES: Trainee[] = [
  { id: 't1', name: { he: 'נועה כהן', en: 'Noa Cohen' }, lastDays: 1, perWeek: 2, streak: 5, lifts: [
    { ex: 'e3', w: SERIES_W.rdl, r: 8 }, { ex: 'e1', w: SERIES_W.pull, r: 10 }, { ex: 'a1', w: SERIES_W.bench, r: 8 }] },
  { id: 't2', name: { he: 'דניאל לוי', en: 'Daniel Levi' }, lastDays: 2, perWeek: 3, streak: 9, lifts: [
    { ex: 'e3', w: [80, 82.5, 82.5, 85, 87.5, 90, 90, 92.5], r: 8 }, { ex: 'e1', w: [60, 60, 62.5, 62.5, 65, 65, 67.5, 70], r: 10 }, { ex: 'a1', w: [90, 90, 92.5, 92.5, 95, 95, 97.5, 100], r: 6 }] },
  { id: 't3', name: { he: 'מיכל ברק', en: 'Michal Barak' }, lastDays: 3, perWeek: 2, streak: 3, lifts: [
    { ex: 'e3', w: [50, 52.5, 52.5, 55, 55, 55, 55, 55], r: 8 }, { ex: 'e1', w: [37.5, 40, 40, 40, 42.5, 42.5, 45, 45], r: 10 }, { ex: 'a1', w: [40, 40, 42.5, 42.5, 42.5, 45, 45, 45], r: 8 }] },
  { id: 't4', name: { he: 'אורי שפירא', en: 'Uri Shapira' }, lastDays: 11, perWeek: 1, streak: 0, lifts: [
    { ex: 'e3', w: [70, 72.5, 72.5, 75, 75, 75, 75, 75], r: 8 }, { ex: 'e1', w: [50, 52.5, 52.5, 55, 55, 55, 55, 55], r: 10 }, { ex: 'a1', w: [75, 77.5, 77.5, 80, 80, 80, 80, 80], r: 8 }] },
  { id: 't5', name: { he: 'תמר אביב', en: 'Tamar Aviv' }, lastDays: 1, perWeek: 3, streak: 7, lifts: [
    { ex: 'e3', w: [45, 47.5, 50, 50, 52.5, 55, 55, 57.5], r: 8 }, { ex: 'e1', w: [32.5, 35, 35, 37.5, 37.5, 40, 40, 42.5], r: 10 }, { ex: 'a1', w: [35, 35, 37.5, 37.5, 40, 40, 42.5, 42.5], r: 8 }] },
  { id: 't6', name: { he: 'יובל מזרחי', en: 'Yuval Mizrahi' }, lastDays: 8, perWeek: 2, streak: 1, lifts: [
    { ex: 'e3', w: [85, 87.5, 90, 90, 90, 90, 90, 90], r: 8 }, { ex: 'e1', w: [65, 67.5, 67.5, 70, 70, 70, 70, 70], r: 10 }, { ex: 'a1', w: [95, 97.5, 100, 100, 100, 100, 100, 100], r: 6 }] },
  { id: 't7', name: { he: 'ליאור דנן', en: 'Lior Danan' }, lastDays: 4, perWeek: 2, streak: 4, lifts: [
    { ex: 'e3', w: [60, 62.5, 62.5, 65, 67.5, 67.5, 70, 70], r: 8 }, { ex: 'e1', w: [45, 47.5, 47.5, 50, 50, 52.5, 52.5, 55], r: 10 }, { ex: 'a1', w: [55, 57.5, 57.5, 60, 60, 62.5, 62.5, 65], r: 8 }] },
  { id: 't8', name: { he: 'רוני גל', en: 'Roni Gal' }, lastDays: 2, perWeek: 3, streak: 6, lifts: [
    { ex: 'e3', w: [55, 55, 57.5, 60, 60, 62.5, 62.5, 65], r: 8 }, { ex: 'e1', w: [40, 42.5, 42.5, 45, 45, 47.5, 47.5, 50], r: 10 }, { ex: 'a1', w: [50, 52.5, 52.5, 55, 57.5, 57.5, 60, 60], r: 8 }] },
];

/** A suggestion only: the weight did not change for three sessions. The coach decides. */
export const readyToRaise = (w: number[]) => w.length >= 3 && w.slice(-3).every(x => x === w[w.length - 1]);

export type BoardKey = 'strong' | 'improved' | 'consistent';
/** Mock boards. `rows` are the top five values, and `me` is the place of the trainee. */
export const BOARDS: Record<BoardKey, {
  label: Name; sub: Name; unit: Name; me: number; of: number; rows: string[];
}> = {
  strong: {
    label: { he: 'החזק ביותר', en: 'Strongest' },
    sub: { he: 'אוקטובר 2026 · דירוג לפי נפח האימונים הכולל', en: 'October 2026 · ranked by total training volume' },
    unit: { he: 'ק״ג החודש', en: 'kg this month' },
    me: 3, of: 48, rows: ['91,500', '78,300', '74,200', '69,800', '66,100'],
  },
  improved: {
    label: { he: 'המשתפר ביותר', en: 'Most improved' },
    sub: { he: 'אוקטובר 2026 · דירוג לפי עלייה בנפח האימונים לעומת החודש הקודם', en: 'October 2026 · ranked by volume growth vs. last month' },
    unit: { he: 'נפח החודש', en: 'volume this month' },
    me: 2, of: 48, rows: BOARD_PCTS,
  },
  consistent: {
    label: { he: 'העקבי ביותר', en: 'Most consistent' },
    sub: { he: 'אוקטובר 2026 · דירוג לפי מספר האימונים החודש', en: 'October 2026 · ranked by workouts this month' },
    unit: { he: 'אימונים החודש', en: 'workouts this month' },
    me: 4, of: 48, rows: ['13', '12', '12', '11', '10'],
  },
};
