// Fake data and strings for the Stage mock. Copied from the v2 design file.

export type Lang = 'he' | 'en';
export type ThemeKey = 'red' | 'orange' | 'night' | 'nightRed';
export type CardColor = 'red' | 'brown' | 'orange';

export const fmt = (n: number) =>
  Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });

export type ExId = 'e1' | 'e2' | 'e3' | 'e4' | 'e5a' | 'e5b' | 'e6';

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
};

export const INITIAL_EX: Record<ExId, { w: number; r: number }> = {
  e1: { w: 57.5, r: 10 }, e2: { w: 52.5, r: 10 }, e3: { w: 80, r: 8 }, e4: { w: 26, r: 10 },
  e5a: { w: 30, r: 12 }, e5b: { w: 14, r: 12 }, e6: { w: 20, r: 15 },
};

export const S = {
  he: {
    kg: 'ק״ג', tabHome: 'בית', tabProgress: 'התקדמות', tabBoard: 'לוח', tabSettings: 'הגדרות',
    dateLong: 'יום שלישי, 27 באוקטובר', hello: 'בוקר טוב, נועה', cycle: 'מחזור אוקטובר', cycleCount: 'מתוך 12 הושלמו',
    today: 'האימון של היום', focus: 'משיכה', meta: '3 סופרסטים · כ־50 דקות', workout: 'אימון',
    superset: 'סופרסט', superset3: 'סופרסט · תרגיל ראשון לבחירה', part3a: 'כפיפת מרפקים עם מוט EZ או כפיפת פטישים',
    cta: 'סיימתי את האימון · רישום משקלים', logTitle: 'רישום משקלים', lastTime: 'בפעם הקודמת:', reps: 'חזרות', sets: '3 סטים',
    upPre: 'עלייה של', totalShort: 'נפח כולל', save: 'שמירת האימון',
    saved: 'האימון נשמר', dateFull: 'יום שלישי, 27.10.2026', totalLabel: 'נפח אימון כולל', vs1: 'לעומת אימון', vs2: 'הקודם',
    todayShort: 'היום', prs: 'שיאים אישיים', shareStory: 'שיתוף לסטורי', done: 'סיום',
    summary: 'סיכום', fullBg: 'רקע מלא', clearBg: 'רקע שקוף', insta: 'סטורי באינסטגרם', saveRoll: 'שמירה לגלריה',
    textColor: 'צבע הטקסט', inkLight: 'לבן', inkDark: 'כהה',
    streak: 'שבועות ברצף', streakSub: 'שני אימונים בכל שבוע', byEx: 'משקלים לפי תרגיל', gain: 'ק״ג מתחילת ספטמבר',
    recent: 'אימונים אחרונים', noChange: 'ללא שינוי',
    boardTitle: 'לוח הסטודיו', boardSub: 'אוקטובר 2026 · דירוג לפי עלייה בנפח האימונים לעומת החודש הקודם',
    yourPlace: 'המקום שלך החודש', of: 'מתוך', members: 'מתאמנים', volMonth: 'נפח החודש',
    hiddenNote: 'הדירוג מוסתר. רק את/ה רואה אותו, חברי הסטודיו לא.', top5: 'חמשת המקומות הראשונים',
    me: 'אני', meHidden: 'אני · מוסתר', hide: 'הסתרה מהלוח', hideSub: 'הדירוג שלך לא יוצג לחברי הסטודיו',
    settings: 'הגדרות', language: 'שפה', langNote: 'כל האפליקציה עוברת לשפה שבחרת, כולל כיוון הקריאה.',
    appColor: 'צבע האפליקציה', colorNote: 'הצבע חל על כל המסכים. כרטיס הסטורי נבחר בנפרד.',
    light: 'בהיר', dark: 'כהה',
    toastInsta: 'באפליקציה האמיתית נפתח כאן אינסטגרם', toastSave: 'באפליקציה האמיתית הכרטיס נשמר בגלריה',
  },
  en: {
    kg: 'kg', tabHome: 'Home', tabProgress: 'Progress', tabBoard: 'Board', tabSettings: 'Settings',
    dateLong: 'Tuesday, 27 October', hello: 'Good morning, Noa', cycle: 'October cycle', cycleCount: 'of 12 done',
    today: "Today's workout", focus: 'Pull', meta: '3 supersets · about 50 min', workout: 'Workout',
    superset: 'Superset', superset3: 'Superset · choose the first exercise', part3a: 'EZ-bar curl or hammer curl',
    cta: 'Done training · log weights', logTitle: 'Log weights', lastTime: 'Last time:', reps: 'reps', sets: '3 sets',
    upPre: 'Up', totalShort: 'Total volume', save: 'Save workout',
    saved: 'Workout saved', dateFull: 'Tuesday, 27.10.2026', totalLabel: 'Total volume', vs1: 'vs. last workout', vs2: '',
    todayShort: 'Today', prs: 'Personal records', shareStory: 'Share to story', done: 'Done',
    summary: 'Summary', fullBg: 'Full background', clearBg: 'Transparent', insta: 'Instagram story', saveRoll: 'Save to camera roll',
    textColor: 'Text color', inkLight: 'White', inkDark: 'Dark',
    streak: 'weeks in a row', streakSub: 'Two workouts every week', byEx: 'Weights by exercise', gain: 'kg since early September',
    recent: 'Recent sessions', noChange: 'No change',
    boardTitle: 'Studio board', boardSub: 'October 2026 · ranked by volume growth vs. last month',
    yourPlace: 'Your place this month', of: 'of', members: 'members', volMonth: 'volume this month',
    hiddenNote: 'Your rank is hidden. Only you can see it.', top5: 'Top five',
    me: 'You', meHidden: 'You · hidden', hide: 'Hide me from the board', hideSub: 'Other members won’t see your rank',
    settings: 'Settings', language: 'Language', langNote: 'The whole app switches, including reading direction.',
    appColor: 'App color', colorNote: 'Applies to every screen. The story card color is picked separately.',
    light: 'Light', dark: 'Dark',
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

export const PREV = 7530;
export const DATES = ['08.09', '15.09', '22.09', '29.09', '06.10', '13.10', '20.10', '27.10'];

export const SERIES = {
  rdl: { he: 'דדליפט רומני', en: 'Romanian deadlift', ex: 'e3' as ExId, r: 8, w: [65, 67.5, 67.5, 70, 72.5, 72.5, 75, 80] },
  pull: { he: 'פולדאון בכבל', en: 'Lat pulldown', ex: 'e1' as ExId, r: 10, w: [47.5, 50, 50, 52.5, 52.5, 55, 55, 57.5] },
  row: { he: 'חתירה חד-ידית', en: 'Single-arm row', ex: 'e4' as ExId, r: 10, w: [20, 20, 22, 22, 22, 24, 24, 26] },
};
export type SeriesKey = keyof typeof SERIES;

export const WEEKS = [1, 1, 0, 1, 1, 1, 1, 1];
export const BOARD_PCTS = ['+11%', '+9%', '+8%', '+7%', '+7%'];

// Card strings (from ShareCardV2)
export const CARD_STR = {
  he: { workout: 'אימון', total: 'נפח אימון כולל', kg: 'ק״ג', pr: 'שיא אישי', fromLast: 'מהאימון הקודם', streak: 'שבועות ברצף', rank: 'בלוח הסטודיו החודש' },
  en: { workout: 'Workout', total: 'Total volume', kg: 'kg', pr: 'PR', fromLast: 'vs. last workout', streak: 'weeks in a row', rank: 'on the studio board this month' },
};
