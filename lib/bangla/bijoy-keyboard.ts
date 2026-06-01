import {
  convertBijoyToUnicode,
  looksLikeBijoyText
} from "./bijoy-to-unicode";

type BijoyKeyEventLike = {
  altKey?: boolean;
  ctrlKey?: boolean;
  defaultPrevented?: boolean;
  isComposing?: boolean;
  key: string;
  metaKey?: boolean;
};

type PendingPreBaseSign = {
  anchor: number;
  sign: string;
  value: string;
};

type PendingReph = {
  anchor: number;
  value: string;
};

const virama = "\u09cd";
const reph = "\u09b0\u09cd";
const aaSign = "\u09be";
const eSign = "\u09c7";
const auLengthMark = "\u09d7";
const oSign = "\u09cb";
const auSign = "\u09cc";

const consonants: Record<string, string> = {
  K: "\u0995",
  L: "\u0996",
  M: "\u0997",
  N: "\u0998",
  O: "\u0999",
  P: "\u099a",
  Q: "\u09a2",
  R: "\u099c",
  S: "\u099d",
  T: "\u099e",
  U: "\u099f",
  V: "\u09a0",
  W: "\u09a1",
  X: "\u09a2",
  Y: "\u09a3",
  Z: "\u09a4",
  _: "\u09a5",
  "`": "\u09a6",
  a: "\u09a7",
  b: "\u09a8",
  c: "\u09aa",
  d: "\u09ab",
  e: "\u09ac",
  f: "\u09ad",
  g: "\u09ae",
  h: "\u09af",
  i: "\u09b0",
  j: "\u09b2",
  k: "\u09b6",
  l: "\u09b7",
  m: "\u09b8",
  n: "\u09b9",
  o: "\u09dc",
  p: "\u09dd",
  q: "\u09df",
  r: "\u09ce"
};

const independentVowels: Record<string, string> = {
  A: "\u0985",
  B: "\u0987",
  C: "\u0988",
  D: "\u0989",
  E: "\u098a",
  F: "\u098b",
  G: "\u098f",
  H: "\u0990",
  I: "\u0993",
  J: "\u0994"
};

const postBaseVowelSigns: Record<string, string> = {
  v: aaSign,
  x: "\u09c0",
  y: "\u09c1",
  z: "\u09c1",
  æ: "\u09c1",
  "“": "\u09c1",
  "–": "\u09c1",
  "~": "\u09c2",
  ƒ: "\u09c2",
  "‚": "\u09c2",
  "„": "\u09c3",
  "…": "\u09c3",
  Š: auLengthMark
};

const preBaseVowelSigns: Record<string, string> = {
  w: "\u09bf",
  "†": eSign,
  "‡": eSign,
  "ˆ": "\u09c8",
  "‰": "\u09c8"
};

const marks: Record<string, string> = {
  s: "\u0982",
  t: "\u0983",
  u: "\u0981"
};

const phalaSigns: Record<string, string> = {
  "^": `${virama}\u09ac`,
  "¡": `${virama}\u09ac`,
  "¦": `${virama}\u09ac`,
  Ÿ: `${virama}\u09ac`,
  "¢": `${virama}\u09ad`,
  "£": `${virama}\u09ad${virama}\u09b0`,
  "¤": `${virama}\u09ae`,
  "¥": `${virama}\u09ae`,
  "§": `${virama}\u09ae`,
  "¨": `${virama}\u09af`,
  "ª": `${virama}\u09b0`,
  "«": `${virama}\u09b0`,
  Ö: `${virama}\u09b0`,
  "¬": `${virama}\u09b2`,
  "­": `${virama}\u09b2`,
  ú: `${virama}\u09aa`,
  è: `${virama}\u09a8`
};

const punctuation: Record<string, string> = {
  "|": "\u0964"
};

const conjunctShortcuts: Record<string, string> = {
  ÿ: "\u0995\u09cd\u09b7"
};

const independentVowelWithAa: Record<string, string> = {
  "\u0985": "\u0986"
};

const vowelSigns = new Set([
  aaSign,
  "\u09bf",
  "\u09c0",
  "\u09c1",
  "\u09c2",
  "\u09c3",
  eSign,
  "\u09c8",
  oSign,
  auSign,
  auLengthMark
]);

const banglaStart = 0x0980;
const banglaEnd = 0x09ff;
const pendingState: {
  preBase: PendingPreBaseSign | null;
  reph: PendingReph | null;
} = {
  preBase: null,
  reph: null
};

function isBangla(character: string) {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && codePoint >= banglaStart && codePoint <= banglaEnd;
}

function isConsonant(character: string) {
  return Object.values(consonants).includes(character);
}

function isCombiningMark(character: string) {
  return vowelSigns.has(character) || character === "\u0981" || character === "\u0982" || character === "\u0983";
}

function resetPending() {
  pendingState.preBase = null;
  pendingState.reph = null;
}

export function resetBijoyKeyboardState() {
  resetPending();
}

export function shouldApplyBijoyKey(event: BijoyKeyEventLike) {
  return (
    event.key.length === 1 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.defaultPrevented &&
    !event.isComposing &&
    !event.metaKey
  );
}

function replaceRange(inputValue: string, start: number, end: number, replacement: string) {
  return {
    caret: start + replacement.length,
    value: `${inputValue.slice(0, start)}${replacement}${inputValue.slice(end)}`
  };
}

function insertAt(inputValue: string, caret: number, text: string) {
  return replaceRange(inputValue, caret, caret, text);
}

function findPreviousClusterStart(inputValue: string, caret: number) {
  let start = caret;

  while (start > 0 && isCombiningMark(inputValue[start - 1])) {
    start -= 1;
  }

  if (start > 0 && isBangla(inputValue[start - 1])) {
    start -= 1;
  }

  while (start >= 2 && inputValue[start - 1] === virama && isBangla(inputValue[start - 2])) {
    start -= 2;
  }

  if (start >= 2 && inputValue[start - 2] === "\u09b0" && inputValue[start - 1] === virama) {
    start -= 2;
  }

  return start;
}

function addOrReplaceVowelSign(inputValue: string, caret: number, sign: string) {
  const previous = inputValue[caret - 1];

  if (sign === aaSign && previous && independentVowelWithAa[previous]) {
    return replaceRange(inputValue, caret - 1, caret, independentVowelWithAa[previous]);
  }

  if (sign === aaSign && previous === eSign) {
    return replaceRange(inputValue, caret - 1, caret, oSign);
  }

  if (sign === auLengthMark && previous === eSign) {
    return replaceRange(inputValue, caret - 1, caret, auSign);
  }

  if (previous && vowelSigns.has(previous)) {
    return replaceRange(inputValue, caret - 1, caret, sign);
  }

  return insertAt(inputValue, caret, sign);
}

function insertBeforeTrailingVowels(inputValue: string, caret: number, text: string) {
  let insertionPoint = caret;

  while (insertionPoint > 0 && vowelSigns.has(inputValue[insertionPoint - 1])) {
    insertionPoint -= 1;
  }

  return {
    caret: caret + text.length,
    value: `${inputValue.slice(0, insertionPoint)}${text}${inputValue.slice(insertionPoint)}`
  };
}

function consumePendingPreBase(
  inputValue: string,
  key: string,
  selectionStart: number,
  selectionEnd: number
) {
  const pending = pendingState.preBase;
  if (
    !pending ||
    pending.value !== inputValue ||
    pending.anchor !== selectionStart ||
    selectionStart !== selectionEnd
  ) {
    pendingState.preBase = null;
    return null;
  }

  const consonant = consonants[key];
  if (!consonant) {
    pendingState.preBase = null;
    return null;
  }

  pendingState.preBase = null;
  const prefix = pendingState.reph ? reph : "";
  pendingState.reph = null;

  return insertAt(inputValue, selectionStart, `${prefix}${consonant}${pending.sign}`);
}

function consumePendingReph(inputValue: string, key: string, selectionStart: number) {
  const pending = pendingState.reph;
  if (!pending || pending.value !== inputValue || pending.anchor !== selectionStart) {
    pendingState.reph = null;
    return "";
  }

  if (!consonants[key]) {
    pendingState.reph = null;
    return "";
  }

  pendingState.reph = null;
  return reph;
}

function mappedPrintableKey(key: string) {
  return (
    conjunctShortcuts[key] ??
    consonants[key] ??
    independentVowels[key] ??
    marks[key] ??
    punctuation[key] ??
    null
  );
}

export function applyBijoyKey(
  inputValue: string,
  key: string,
  selectionStart: number,
  selectionEnd: number,
  event?: BijoyKeyEventLike
): { value: string; caret: number } | null {
  if (
    key.length !== 1 ||
    selectionStart < 0 ||
    selectionEnd < selectionStart ||
    (event && !shouldApplyBijoyKey(event))
  ) {
    resetPending();
    return null;
  }

  const pendingPreBaseResult = consumePendingPreBase(
    inputValue,
    key,
    selectionStart,
    selectionEnd
  );
  if (pendingPreBaseResult) return pendingPreBaseResult;

  if (selectionStart !== selectionEnd) {
    resetPending();
    const replacement = mappedPrintableKey(key) ?? postBaseVowelSigns[key] ?? phalaSigns[key] ?? key;
    return replaceRange(inputValue, selectionStart, selectionEnd, replacement);
  }

  const preBaseSign = preBaseVowelSigns[key];
  if (preBaseSign) {
    const previous = inputValue[selectionStart - 1];

    pendingState.reph = null;
    if (previous && isConsonant(previous)) {
      return addOrReplaceVowelSign(inputValue, selectionStart, preBaseSign);
    }

    pendingState.preBase = {
      anchor: selectionStart,
      sign: preBaseSign,
      value: inputValue
    };

    return { caret: selectionStart, value: inputValue };
  }

  if (key === "©") {
    pendingState.preBase = null;
    const clusterStart = findPreviousClusterStart(inputValue, selectionStart);

    if (clusterStart < selectionStart) {
      const cluster = inputValue.slice(clusterStart, selectionStart);
      return replaceRange(inputValue, clusterStart, selectionStart, `${reph}${cluster}`);
    }

    pendingState.reph = {
      anchor: selectionStart,
      value: inputValue
    };

    return { caret: selectionStart, value: inputValue };
  }

  const pendingRephPrefix = consumePendingReph(inputValue, key, selectionStart);
  const postBaseSign = postBaseVowelSigns[key];
  if (postBaseSign) {
    resetPending();
    return addOrReplaceVowelSign(inputValue, selectionStart, postBaseSign);
  }

  if (key === "&") {
    resetPending();
    return insertAt(inputValue, selectionStart, virama);
  }

  const phala = phalaSigns[key];
  if (phala) {
    resetPending();
    return insertBeforeTrailingVowels(inputValue, selectionStart, phala);
  }

  const mapped = mappedPrintableKey(key);
  if (mapped) {
    return insertAt(inputValue, selectionStart, `${pendingRephPrefix}${mapped}`);
  }

  resetPending();
  return insertAt(inputValue, selectionStart, key);
}

export function handleBijoyPaste(
  inputValue: string,
  pastedText: string,
  selectionStart: number,
  selectionEnd: number
) {
  resetPending();
  const converted = looksLikeBijoyText(pastedText) ? convertBijoyToUnicode(pastedText) : pastedText;
  return replaceRange(inputValue, selectionStart, selectionEnd, converted);
}

export function convertBijoyPaste(text: string) {
  return handleBijoyPaste("", text, 0, 0).value;
}
